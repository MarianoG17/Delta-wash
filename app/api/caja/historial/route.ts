import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '30');

        // Cajas pasadas con ingresos calculados via JOIN
        const result = await db`
            SELECT
                c.id,
                c.fecha,
                c.saldo_inicial,
                c.estado,
                c.notas_cierre,
                c.closed_at,
                c.diferencia_cierre,
                COALESCE(SUM(CASE WHEN r.metodo_pago = 'efectivo' THEN r.precio ELSE 0 END), 0) AS ingresos_efectivo,
                COUNT(CASE WHEN r.metodo_pago = 'efectivo' THEN 1 END)::int AS cant_efectivo,
                COALESCE(SUM(CASE WHEN r.metodo_pago = 'transferencia' THEN r.precio ELSE 0 END), 0) AS ingresos_transferencia,
                COUNT(CASE WHEN r.metodo_pago = 'transferencia' THEN 1 END)::int AS cant_transferencia
            FROM cajas c
            LEFT JOIN registros_lavado r
                ON r.pagado = true
                AND (r.anulado IS NULL OR r.anulado = FALSE)
                AND DATE(COALESCE(r.fecha_pago, r.fecha_entregado)) = c.fecha
                AND r.metodo_pago IN ('efectivo', 'transferencia')
            WHERE c.fecha < CURRENT_DATE
            GROUP BY c.id, c.fecha, c.saldo_inicial, c.estado, c.notas_cierre, c.closed_at, c.diferencia_cierre
            ORDER BY c.fecha DESC
            LIMIT ${limit}
        `;
        const cajas = Array.isArray(result) ? result : result.rows || [];

        // Egresos por caja
        const cajaIds = cajas.map((c: any) => c.id);
        let egresosMap: Record<number, number> = {};

        if (cajaIds.length > 0) {
            const egresosResult = await db`
                SELECT caja_id, COALESCE(SUM(monto), 0) AS total
                FROM movimientos_caja
                WHERE caja_id = ANY(${cajaIds})
                GROUP BY caja_id
            `;
            const egresos = Array.isArray(egresosResult) ? egresosResult : egresosResult.rows || [];
            egresos.forEach((e: any) => {
                egresosMap[e.caja_id] = parseFloat(e.total) || 0;
            });
        }

        const cajasConResumen = cajas.map((c: any) => ({
            ...c,
            saldo_inicial: parseFloat(c.saldo_inicial) || 0,
            ingresos_efectivo: parseFloat(c.ingresos_efectivo) || 0,
            ingresos_transferencia: parseFloat(c.ingresos_transferencia) || 0,
            total_egresos: egresosMap[c.id] || 0,
            diferencia_cierre: c.diferencia_cierre != null ? parseFloat(c.diferencia_cierre) : null,
        }));

        return NextResponse.json({ success: true, cajas: cajasConResumen });
    } catch (error) {
        console.error('Error obteniendo historial de caja:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}
