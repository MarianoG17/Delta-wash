import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: obtener caja del día + ingresos calculados + sugerencia saldo inicial
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const hoy = new Date().toISOString().split('T')[0];

        // Caja de hoy
        const cajaResult = await db`
            SELECT * FROM cajas WHERE fecha = ${hoy}
        `;
        const cajas = Array.isArray(cajaResult) ? cajaResult : cajaResult.rows || [];
        let caja = cajas[0] || null;

        // Si no hay caja de hoy, usar la última caja abierta de días anteriores
        if (!caja) {
            const cajaAnteriorResult = await db`
                SELECT * FROM cajas WHERE estado = 'abierta' AND fecha < ${hoy}
                ORDER BY fecha DESC LIMIT 1
            `;
            const cajaAnterior = Array.isArray(cajaAnteriorResult) ? cajaAnteriorResult : cajaAnteriorResult.rows || [];
            caja = cajaAnterior[0] || null;
        }

        // Usar la fecha de la caja activa (puede ser de otro día)
        const cajaFecha = caja
            ? (caja.fecha instanceof Date ? caja.fecha.toISOString().split('T')[0] : String(caja.fecha).split('T')[0])
            : hoy;

        // Ingresos del día desde registros_lavado (efectivo y transferencia por separado)
        const ingresosResult = await db`
            SELECT
                metodo_pago,
                COUNT(*) as cantidad,
                COALESCE(SUM(precio), 0) as total
            FROM registros_lavado
            WHERE pagado = true
                AND (anulado IS NULL OR anulado = FALSE)
                AND DATE(COALESCE(fecha_pago, fecha_entregado)) = ${cajaFecha}
                AND metodo_pago IN ('efectivo', 'transferencia')
            GROUP BY metodo_pago
        `;
        const ingresos = Array.isArray(ingresosResult) ? ingresosResult : ingresosResult.rows || [];

        const ingresos_efectivo = ingresos.find((i: any) => i.metodo_pago === 'efectivo');
        const ingresos_transferencia = ingresos.find((i: any) => i.metodo_pago === 'transferencia');

        // Detalle de lavados del día
        const lavadosResult = await db`
            SELECT id, nombre_cliente, patente, tipo_limpieza, precio, metodo_pago, fecha_pago, fecha_entregado
            FROM registros_lavado
            WHERE pagado = true
                AND (anulado IS NULL OR anulado = FALSE)
                AND DATE(COALESCE(fecha_pago, fecha_entregado)) = ${cajaFecha}
                AND metodo_pago IN ('efectivo', 'transferencia')
            ORDER BY COALESCE(fecha_pago, fecha_entregado) DESC
        `;
        const lavados = Array.isArray(lavadosResult) ? lavadosResult : lavadosResult.rows || [];

        // Egresos del día
        let egresos: any[] = [];
        if (caja) {
            const egresosResult = await db`
                SELECT * FROM movimientos_caja
                WHERE caja_id = ${caja.id}
                ORDER BY created_at ASC
            `;
            egresos = Array.isArray(egresosResult) ? egresosResult : egresosResult.rows || [];
        }

        // Sugerencia de saldo inicial = saldo efectivo del cierre de ayer
        const ayerResult = await db`
            SELECT fecha, saldo_inicial FROM cajas
            WHERE fecha < ${hoy} AND estado = 'cerrada'
            ORDER BY fecha DESC
            LIMIT 1
        `;
        const ayer = Array.isArray(ayerResult) ? ayerResult : ayerResult.rows || [];

        // Para sugerir: saldo_inicial_ayer + ingresos_efectivo_ayer - egresos_efectivo_ayer
        let sugerencia_saldo_inicial = 0;
        if (ayer.length > 0) {
            const fechaAyer = ayer[0].fecha instanceof Date
                ? ayer[0].fecha.toISOString().split('T')[0]
                : String(ayer[0].fecha).split('T')[0];

            const ingresosAyerResult = await db`
                SELECT COALESCE(SUM(precio), 0) as total
                FROM registros_lavado
                WHERE pagado = true
                    AND (anulado IS NULL OR anulado = FALSE)
                    AND DATE(COALESCE(fecha_pago, fecha_entregado)) = ${fechaAyer}
                    AND metodo_pago = 'efectivo'
            `;
            const ingresosAyer = Array.isArray(ingresosAyerResult) ? ingresosAyerResult : ingresosAyerResult.rows || [];

            const egresosAyerResult = await db`
                SELECT COALESCE(SUM(m.monto), 0) as total
                FROM movimientos_caja m
                JOIN cajas c ON c.id = m.caja_id
                WHERE c.fecha = ${fechaAyer}
                    AND (m.metodo_pago = 'efectivo' OR m.metodo_pago IS NULL)
            `;
            const egresosAyer = Array.isArray(egresosAyerResult) ? egresosAyerResult : egresosAyerResult.rows || [];

            const saldoInicialAyer = parseFloat(ayer[0].saldo_inicial) || 0;
            const totalIngresosAyer = parseFloat(ingresosAyer[0]?.total) || 0;
            const totalEgresosAyer = parseFloat(egresosAyer[0]?.total) || 0;
            sugerencia_saldo_inicial = saldoInicialAyer + totalIngresosAyer - totalEgresosAyer;
        }

        return NextResponse.json({
            success: true,
            caja,
            resumen: {
                ingresos_efectivo: {
                    cantidad: parseInt(ingresos_efectivo?.cantidad) || 0,
                    total: parseFloat(ingresos_efectivo?.total) || 0,
                },
                ingresos_transferencia: {
                    cantidad: parseInt(ingresos_transferencia?.cantidad) || 0,
                    total: parseFloat(ingresos_transferencia?.total) || 0,
                },
                total_egresos: egresos.reduce((s: number, e: any) => s + parseFloat(e.monto), 0),
            },
            lavados,
            egresos,
            sugerencia_saldo_inicial: Math.max(0, sugerencia_saldo_inicial),
        });
    } catch (error) {
        console.error('Error obteniendo caja:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}

// POST: abrir caja del día
export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { saldo_inicial, usuario_id } = await request.json();
        const hoy = new Date().toISOString().split('T')[0];

        // Verificar que no exista ya
        const existente = await db`SELECT id FROM cajas WHERE fecha = ${hoy}`;
        const existenteData = Array.isArray(existente) ? existente : existente.rows || [];
        if (existenteData.length > 0) {
            return NextResponse.json({ success: false, message: 'Ya existe una caja para hoy' }, { status: 400 });
        }

        const result = await db`
            INSERT INTO cajas (fecha, saldo_inicial, estado, usuario_apertura)
            VALUES (${hoy}, ${saldo_inicial || 0}, 'abierta', ${usuario_id || null})
            RETURNING *
        `;
        const caja = Array.isArray(result) ? result[0] : result.rows?.[0];

        return NextResponse.json({ success: true, caja });
    } catch (error) {
        console.error('Error abriendo caja:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}
