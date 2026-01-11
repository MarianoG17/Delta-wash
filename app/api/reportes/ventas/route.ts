import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fechaDesde = searchParams.get('fecha_desde');
        const fechaHasta = searchParams.get('fecha_hasta');

        // Validar fechas
        if (!fechaDesde || !fechaHasta) {
            return NextResponse.json({
                success: false,
                message: 'Debes proporcionar fecha_desde y fecha_hasta'
            }, { status: 400 });
        }

        // Reporte por día (usando fecha_entregado)
        const reporteDiario = await sql`
            SELECT
                DATE(fecha_entregado) as fecha,
                COUNT(*) as cantidad_lavados,
                SUM(precio) as importe_total,
                SUM(CASE WHEN metodo_pago = 'efectivo' THEN precio ELSE 0 END) as pago_efectivo,
                SUM(CASE WHEN metodo_pago = 'transferencia' THEN precio ELSE 0 END) as pago_transferencia,
                SUM(CASE WHEN metodo_pago = 'cuenta_corriente' THEN precio ELSE 0 END) as pago_cuenta_corriente
            FROM registros_lavado
            WHERE DATE(fecha_entregado) >= ${fechaDesde}
              AND DATE(fecha_entregado) <= ${fechaHasta}
              AND estado = 'entregado'
              AND fecha_entregado IS NOT NULL
              AND (anulado IS NULL OR anulado = FALSE)
            GROUP BY DATE(fecha_entregado)
            ORDER BY fecha DESC
        `;

        // Reporte por horario (usando fecha_entregado)
        const reporteHorario = await sql`
            SELECT
                EXTRACT(HOUR FROM fecha_entregado) as hora,
                COUNT(*) as cantidad_lavados,
                SUM(precio) as importe_total
            FROM registros_lavado
            WHERE DATE(fecha_entregado) >= ${fechaDesde}
              AND DATE(fecha_entregado) <= ${fechaHasta}
              AND estado = 'entregado'
              AND fecha_entregado IS NOT NULL
              AND (anulado IS NULL OR anulado = FALSE)
            GROUP BY EXTRACT(HOUR FROM fecha_entregado)
            ORDER BY hora
        `;

        // Formatear datos de horario en rangos (0-23 horas completas)
        const horarios = Array.from({ length: 24 }, (_, i) => i); // 0 a 23
        const reporteHorarioFormateado = horarios.map(hora => {
            const datos = reporteHorario.rows.find(r => parseInt(r.hora) === hora);
            return {
                horario: `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`,
                cantidad_lavados: datos ? parseInt(datos.cantidad_lavados) : 0,
                importe_total: datos ? parseFloat(datos.importe_total) : 0
            };
        }).filter(h => h.cantidad_lavados > 0); // Solo mostrar horarios con actividad

        return NextResponse.json({
            success: true,
            reporte_diario: reporteDiario.rows.map(row => ({
                fecha: row.fecha,
                cantidad_lavados: parseInt(row.cantidad_lavados),
                importe_total: parseFloat(row.importe_total) || 0,
                pago_efectivo: parseFloat(row.pago_efectivo) || 0,
                pago_transferencia: parseFloat(row.pago_transferencia) || 0,
                pago_cuenta_corriente: parseFloat(row.pago_cuenta_corriente) || 0
            })),
            reporte_horario: reporteHorarioFormateado,
            totales: {
                cantidad_total: reporteDiario.rows.reduce((sum, row) => sum + parseInt(row.cantidad_lavados), 0),
                importe_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.importe_total || 0), 0),
                efectivo_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.pago_efectivo || 0), 0),
                transferencia_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.pago_transferencia || 0), 0),
                cuenta_corriente_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.pago_cuenta_corriente || 0), 0)
            }
        });

    } catch (error) {
        console.error('Error obteniendo reporte de ventas:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener reporte de ventas'
        }, { status: 500 });
    }
}
