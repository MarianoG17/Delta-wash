import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

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
        // Convertir fechaHasta a final del día para incluir todo el día completo
        const fechaHastaFin = `${fechaHasta} 23:59:59`;

        const registros = await db`
            SELECT
                fecha_ingreso,
                fecha_entregado
            FROM registros_lavado
            WHERE estado = 'entregado'
              AND fecha_ingreso IS NOT NULL
              AND fecha_entregado IS NOT NULL
              AND fecha_entregado >= ${fechaDesde}
              AND fecha_entregado <= ${fechaHastaFin}
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

            // Obtener hora y día en zona horaria Argentina (UTC-3)
            const partes = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                hour12: false,
                weekday: 'short',
                timeZone: 'America/Argentina/Buenos_Aires'
            }).formatToParts(fechaIngreso);

            const hora = parseInt(partes.find(p => p.type === 'hour')?.value || '0');
            const diaNombre = partes.find(p => p.type === 'weekday')?.value || 'Sun';

            // Mapear nombre de día a número: 0=Domingo, 1=Lunes, ..., 6=Sábado
            const diasMap: { [key: string]: number } = {
                'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6
            };
            const diaSemana = diasMap[diaNombre] || 0;

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
