import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const fechaDesde = searchParams.get('fecha_desde');
        const fechaHasta = searchParams.get('fecha_hasta');
        const tipoHorario = searchParams.get('tipo_horario') || 'entrega'; // 'entrega' o 'ingreso'

        // Validar fechas
        if (!fechaDesde || !fechaHasta) {
            return NextResponse.json({
                success: false,
                message: 'Debes proporcionar fecha_desde y fecha_hasta'
            }, { status: 400 });
        }

        // Reporte por día - comparar con timestamps completos para incluir todo el día
        const reporteDiario = await sql`
            SELECT
                fecha_entregado::date as fecha,
                COUNT(*) as cantidad_lavados,
                COALESCE(SUM(CASE WHEN precio > 0 THEN precio ELSE 0 END), 0) as importe_total,
                COALESCE(SUM(CASE WHEN metodo_pago = 'efectivo' AND precio > 0 THEN precio ELSE 0 END), 0) as pago_efectivo,
                COALESCE(SUM(CASE WHEN metodo_pago = 'transferencia' AND precio > 0 THEN precio ELSE 0 END), 0) as pago_transferencia,
                COALESCE(SUM(CASE WHEN metodo_pago = 'cuenta_corriente' AND precio > 0 THEN precio ELSE 0 END), 0) as pago_cuenta_corriente,
                COUNT(CASE WHEN precio IS NULL OR precio = 0 THEN 1 END) as registros_sin_precio
            FROM registros_lavado
            WHERE fecha_entregado >= ${fechaDesde}::date
              AND fecha_entregado < (${fechaHasta}::date + INTERVAL '1 day')
              AND estado = 'entregado'
              AND fecha_entregado IS NOT NULL
              AND (anulado IS NULL OR anulado = FALSE)
            GROUP BY fecha_entregado::date
            ORDER BY fecha DESC
        `;

        // Reporte por horario y día de semana (matriz) - usar timestamps completos
        let reporteHorarioDiaSemana;
        if (tipoHorario === 'ingreso') {
            reporteHorarioDiaSemana = await sql`
                SELECT
                    EXTRACT(HOUR FROM fecha_ingreso) as hora,
                    EXTRACT(DOW FROM fecha_entregado) as dia_semana,
                    COUNT(*) as cantidad_lavados,
                    COALESCE(SUM(CASE WHEN precio > 0 THEN precio ELSE 0 END), 0) as importe_total
                FROM registros_lavado
                WHERE fecha_entregado >= ${fechaDesde}::date
                  AND fecha_entregado < (${fechaHasta}::date + INTERVAL '1 day')
                  AND estado = 'entregado'
                  AND fecha_ingreso IS NOT NULL
                  AND fecha_entregado IS NOT NULL
                  AND (anulado IS NULL OR anulado = FALSE)
                GROUP BY
                    EXTRACT(HOUR FROM fecha_ingreso),
                    EXTRACT(DOW FROM fecha_entregado)
                ORDER BY hora, dia_semana
            `;
        } else {
            // Usar fecha_listo (cuando se completa el lavado, no cuando se entrega)
            reporteHorarioDiaSemana = await sql`
                SELECT
                    EXTRACT(HOUR FROM fecha_listo) as hora,
                    EXTRACT(DOW FROM fecha_entregado) as dia_semana,
                    COUNT(*) as cantidad_lavados,
                    COALESCE(SUM(CASE WHEN precio > 0 THEN precio ELSE 0 END), 0) as importe_total
                FROM registros_lavado
                WHERE fecha_entregado >= ${fechaDesde}::date
                  AND fecha_entregado < (${fechaHasta}::date + INTERVAL '1 day')
                  AND estado = 'entregado'
                  AND fecha_listo IS NOT NULL
                  AND fecha_entregado IS NOT NULL
                  AND (anulado IS NULL OR anulado = FALSE)
                GROUP BY
                    EXTRACT(HOUR FROM fecha_listo),
                    EXTRACT(DOW FROM fecha_entregado)
                ORDER BY hora, dia_semana
            `;
        }

        // Formatear datos en matriz: horarios x días de semana
        // DOW: 0=Domingo, 1=Lunes, 2=Martes, 3=Miércoles, 4=Jueves, 5=Viernes, 6=Sábado
        const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const diasLaborables = [1, 2, 3, 4, 5, 6]; // Lunes a Sábado
        
        const horarios = Array.from({ length: 24 }, (_, i) => i); // 0 a 23
        const reporteHorarioFormateado = horarios.map(hora => {
            const fila: any = {
                horario: `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`,
                hora: hora
            };
            
            // Agregar datos para cada día de la semana (Lunes a Sábado)
            let totalHora = 0;
            diasLaborables.forEach(dia => {
                const datos = reporteHorarioDiaSemana.rows.find(
                    r => parseInt(r.hora) === hora && parseInt(r.dia_semana) === dia
                );
                const cantidad = datos ? parseInt(datos.cantidad_lavados) : 0;
                fila[diasSemana[dia].toLowerCase()] = cantidad;
                totalHora += cantidad;
            });
            
            fila.total = totalHora;
            return fila;
        }).filter(h => h.total > 0); // Solo mostrar horarios con actividad

        return NextResponse.json({
            success: true,
            reporte_diario: reporteDiario.rows.map(row => ({
                fecha: row.fecha,
                cantidad_lavados: parseInt(row.cantidad_lavados),
                importe_total: parseFloat(row.importe_total) || 0,
                pago_efectivo: parseFloat(row.pago_efectivo) || 0,
                pago_transferencia: parseFloat(row.pago_transferencia) || 0,
                pago_cuenta_corriente: parseFloat(row.pago_cuenta_corriente) || 0,
                registros_sin_precio: parseInt(row.registros_sin_precio) || 0
            })),
            reporte_horario: reporteHorarioFormateado,
            totales: {
                cantidad_total: reporteDiario.rows.reduce((sum, row) => sum + parseInt(row.cantidad_lavados), 0),
                importe_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.importe_total || 0), 0),
                efectivo_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.pago_efectivo || 0), 0),
                transferencia_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.pago_transferencia || 0), 0),
                cuenta_corriente_total: reporteDiario.rows.reduce((sum, row) => sum + parseFloat(row.pago_cuenta_corriente || 0), 0),
                registros_sin_precio_total: reporteDiario.rows.reduce((sum, row) => sum + parseInt(row.registros_sin_precio || 0), 0)
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
