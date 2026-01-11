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

        // Traer TODOS los registros entregados en el rango con fecha_ingreso
        const registros = await sql`
            SELECT 
                fecha_ingreso,
                fecha_entregado
            FROM registros_lavado
            WHERE estado = 'entregado'
              AND fecha_ingreso IS NOT NULL
              AND fecha_entregado IS NOT NULL
              AND fecha_entregado >= ${fechaDesde}
              AND fecha_entregado <= ${fechaHasta}
              AND (anulado IS NULL OR anulado = FALSE)
        `;

        // Estructura: reportePorHora[hora][diaSemana] = cantidad
        // hora: 0-23
        // diaSemana: 0=Domingo, 1=Lunes, ..., 6=Sábado
        const reportePorHora: { [hora: number]: { [dia: number]: number } } = {};
        
        // Inicializar estructura
        for (let h = 0; h < 24; h++) {
            reportePorHora[h] = {};
            for (let d = 0; d <= 6; d++) {
                reportePorHora[h][d] = 0;
            }
        }

        // Procesar registros en JavaScript
        registros.rows.forEach((registro) => {
            const fechaIngreso = new Date(registro.fecha_ingreso);
            const hora = fechaIngreso.getHours(); // 0-23
            const diaSemana = fechaIngreso.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
            
            reportePorHora[hora][diaSemana]++;
        });

        // Convertir a array para el frontend
        // Solo incluir horarios que tengan al menos 1 auto
        const reporte = [];
        for (let hora = 0; hora < 24; hora++) {
            const totalHora = Object.values(reportePorHora[hora]).reduce((sum, val) => sum + val, 0);
            
            if (totalHora > 0) {
                reporte.push({
                    hora: hora,
                    horario: `${hora.toString().padStart(2, '0')}:00 - ${(hora + 1).toString().padStart(2, '0')}:00`,
                    domingo: reportePorHora[hora][0],
                    lunes: reportePorHora[hora][1],
                    martes: reportePorHora[hora][2],
                    miercoles: reportePorHora[hora][3],
                    jueves: reportePorHora[hora][4],
                    viernes: reportePorHora[hora][5],
                    sabado: reportePorHora[hora][6],
                    total: totalHora
                });
            }
        }

        return NextResponse.json({
            success: true,
            reporte: reporte,
            debug: {
                total_registros: registros.rows.length,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta
            }
        });

    } catch (error) {
        console.error('Error obteniendo reporte de horarios:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener reporte de horarios',
            error: String(error)
        }, { status: 500 });
    }
}
