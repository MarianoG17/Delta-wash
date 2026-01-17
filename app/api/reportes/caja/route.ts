import { NextRequest, NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const searchParams = request.nextUrl.searchParams;
        const fechaDesde = searchParams.get('fecha_desde');
        const fechaHasta = searchParams.get('fecha_hasta');

        if (!fechaDesde || !fechaHasta) {
            return NextResponse.json({
                success: false,
                message: 'Faltan parámetros de fecha'
            }, { status: 400 });
        }

        // Query para obtener el reporte de caja diaria
        const result = await db`
            SELECT 
                DATE(fecha_entregado) as fecha,
                
                -- Efectivo
                SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio ELSE 0 END) as efectivo,
                COUNT(CASE WHEN metodo_pago = 'efectivo' THEN 1 END) as cantidad_efectivo,
                
                -- Transferencia
                SUM(CASE WHEN metodo_pago = 'transferencia' THEN precio ELSE 0 END) as transferencia,
                COUNT(CASE WHEN metodo_pago = 'transferencia' THEN 1 END) as cantidad_transferencia,
                
                -- Cuenta Corriente
                SUM(CASE WHEN usa_cuenta_corriente = true THEN precio ELSE 0 END) as cuenta_corriente,
                COUNT(CASE WHEN usa_cuenta_corriente = true THEN 1 END) as cantidad_cuenta_corriente,
                
                -- Cancelados
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as cantidad_cancelados,
                
                -- Totales
                SUM(CASE WHEN estado != 'cancelado' AND anulado IS NOT true THEN precio ELSE 0 END) as total_dia,
                COUNT(CASE WHEN estado = 'entregado' AND anulado IS NOT true THEN 1 END) as total_entregados
                
            FROM registros_lavado
            WHERE fecha_entregado IS NOT NULL
                AND DATE(fecha_entregado) >= ${fechaDesde}
                AND DATE(fecha_entregado) <= ${fechaHasta}
            GROUP BY DATE(fecha_entregado)
            ORDER BY fecha DESC
        `;

        // Calcular totales generales
        const totalesResultQuery = await db`
            SELECT
                SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio ELSE 0 END) as total_efectivo,
                COUNT(CASE WHEN metodo_pago = 'efectivo' THEN 1 END) as total_cantidad_efectivo,
                
                SUM(CASE WHEN metodo_pago = 'transferencia' THEN precio ELSE 0 END) as total_transferencia,
                COUNT(CASE WHEN metodo_pago = 'transferencia' THEN 1 END) as total_cantidad_transferencia,
                
                SUM(CASE WHEN usa_cuenta_corriente = true THEN precio ELSE 0 END) as total_cuenta_corriente,
                COUNT(CASE WHEN usa_cuenta_corriente = true THEN 1 END) as total_cantidad_cuenta_corriente,
                
                COUNT(CASE WHEN estado = 'cancelado' THEN 1 END) as total_cancelados,
                
                SUM(CASE WHEN estado != 'cancelado' AND anulado IS NOT true THEN precio ELSE 0 END) as total_general,
                COUNT(CASE WHEN estado = 'entregado' AND anulado IS NOT true THEN 1 END) as total_lavados
                
            FROM registros_lavado
            WHERE fecha_entregado IS NOT NULL
                AND DATE(fecha_entregado) >= ${fechaDesde}
                AND DATE(fecha_entregado) <= ${fechaHasta}
        `;

        // Manejar diferencia entre pg (rows) y neon (array directo)
        const reporte = Array.isArray(result) ? result : result.rows || [];
        const totalesResult = Array.isArray(totalesResultQuery) ? totalesResultQuery : totalesResultQuery.rows || [];

        return NextResponse.json({
            success: true,
            reporte: reporte,
            totales: totalesResult[0]
        });

    } catch (error) {
        console.error('Error en reporte de caja:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al generar reporte de caja'
        }, { status: 500 });
    }
}
