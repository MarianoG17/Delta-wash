import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fechaDesde = searchParams.get('fecha_desde');
        const fechaHasta = searchParams.get('fecha_hasta');

        if (!fechaDesde || !fechaHasta) {
            return NextResponse.json({
                success: false,
                message: 'Debes proporcionar fecha_desde y fecha_hasta'
            }, { status: 400 });
        }

        // Traer TODOS los registros entregados en el rango (sin agrupar en SQL)
        // Convertir fechaHasta a final del día para incluir todo el día completo
        const fechaHastaFin = `${fechaHasta} 23:59:59`;

        const registros = await sql`
            SELECT
                fecha_entregado,
                precio
            FROM registros_lavado
            WHERE estado = 'entregado'
              AND fecha_entregado IS NOT NULL
              AND fecha_entregado >= ${fechaDesde}
              AND fecha_entregado <= ${fechaHastaFin}
              AND (anulado IS NULL OR anulado = FALSE)
            ORDER BY fecha_entregado DESC
        `;

        // Agrupar en JavaScript por fecha (mismo formato que el historial)
        const reportePorDia: { [key: string]: { cantidad: number; facturacion: number } } = {};

        registros.rows.forEach((registro) => {
            // Usar el mismo formato de fecha que el historial
            const fecha = new Date(registro.fecha_entregado);
            const fechaStr = fecha.toISOString().split('T')[0]; // YYYY-MM-DD

            if (!reportePorDia[fechaStr]) {
                reportePorDia[fechaStr] = {
                    cantidad: 0,
                    facturacion: 0
                };
            }

            reportePorDia[fechaStr].cantidad++;
            reportePorDia[fechaStr].facturacion += parseFloat(registro.precio) || 0;
        });

        // Convertir a array y ordenar por fecha descendente
        const reporte = Object.entries(reportePorDia)
            .map(([fecha, datos]) => ({
                fecha,
                cantidad: datos.cantidad,
                facturacion: datos.facturacion
            }))
            .sort((a, b) => b.fecha.localeCompare(a.fecha));

        // Calcular totales
        const totales = {
            cantidad_total: reporte.reduce((sum, row) => sum + row.cantidad, 0),
            facturacion_total: reporte.reduce((sum, row) => sum + row.facturacion, 0)
        };

        return NextResponse.json({
            success: true,
            reporte: reporte,
            totales: totales,
            debug: {
                total_registros: registros.rows.length,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
            }
        });

    } catch (error) {
        console.error('Error obteniendo reporte de ventas:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener reporte de ventas',
            error: String(error)
        }, { status: 500 });
    }
}
