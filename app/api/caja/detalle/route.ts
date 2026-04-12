import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const cajaId = parseInt(searchParams.get('id') || '0');
        if (!cajaId) {
            return NextResponse.json({ success: false, message: 'id requerido' }, { status: 400 });
        }

        const cajaResult = await db`SELECT * FROM cajas WHERE id = ${cajaId}`;
        const cajas = Array.isArray(cajaResult) ? cajaResult : cajaResult.rows || [];
        const caja = cajas[0];
        if (!caja) {
            return NextResponse.json({ success: false, message: 'Caja no encontrada' }, { status: 404 });
        }

        const cajaFecha = caja.fecha instanceof Date
            ? caja.fecha.toISOString().split('T')[0]
            : String(caja.fecha).split('T')[0];

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

        const egresosResult = await db`
            SELECT * FROM movimientos_caja WHERE caja_id = ${cajaId} ORDER BY created_at ASC
        `;
        const egresos = Array.isArray(egresosResult) ? egresosResult : egresosResult.rows || [];

        return NextResponse.json({ success: true, lavados, egresos });
    } catch (error) {
        console.error('Error obteniendo detalle de caja:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}
