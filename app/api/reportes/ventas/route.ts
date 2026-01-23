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

        // Traer TODOS los registros entregados en el rango (sin agrupar en SQL)
        // Convertir fechaHasta a final del día para incluir todo el día completo
        const fechaHastaFin = `${fechaHasta} 23:59:59`;

        const result = await db`
            SELECT
                fecha_entregado,
                precio,
                patente
            FROM registros_lavado
            WHERE estado = 'entregado'
              AND fecha_entregado IS NOT NULL
              AND fecha_entregado >= ${fechaDesde}
              AND fecha_entregado <= ${fechaHastaFin}
              AND (anulado IS NULL OR anulado = FALSE)
            ORDER BY fecha_entregado DESC
        `;

        // Manejar diferencia entre pg (rows) y neon (array directo)
        const registros = Array.isArray(result) ? result : result.rows || [];

        // Agrupar en JavaScript por fecha (mismo formato que el historial)
        const reportePorDia: { [key: string]: { cantidad: number; facturacion: number } } = {};

        registros.forEach((registro: any) => {
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

        // Calcular frecuencia promedio de visitas por auto (patente)
        const visitasPorAuto: { [key: string]: Date[] } = {};

        registros.forEach((registro: any) => {
            const patente = registro.patente?.toUpperCase().trim();
            if (patente) {
                if (!visitasPorAuto[patente]) {
                    visitasPorAuto[patente] = [];
                }
                visitasPorAuto[patente].push(new Date(registro.fecha_entregado));
            }
        });

        // Calcular frecuencia promedio solo de autos con más de 1 visita
        let totalDiasEntrVisitas = 0;
        let totalIntervalos = 0;

        Object.values(visitasPorAuto).forEach(fechas => {
            if (fechas.length > 1) {
                // Ordenar fechas de más antigua a más reciente
                fechas.sort((a, b) => a.getTime() - b.getTime());

                // Calcular días entre primera y última visita
                const primeraVisita = fechas[0];
                const ultimaVisita = fechas[fechas.length - 1];
                const diasTotal = (ultimaVisita.getTime() - primeraVisita.getTime()) / (1000 * 60 * 60 * 24);

                // Promedio entre visitas = días total / (cantidad de visitas - 1)
                const intervaloPromedio = diasTotal / (fechas.length - 1);

                totalDiasEntrVisitas += intervaloPromedio;
                totalIntervalos++;
            }
        });

        const frecuenciaPromedioAutos = totalIntervalos > 0
            ? Math.round((totalDiasEntrVisitas / totalIntervalos) * 10) / 10
            : null;

        // Calcular totales
        const totales = {
            cantidad_total: reporte.reduce((sum, row) => sum + row.cantidad, 0),
            facturacion_total: reporte.reduce((sum, row) => sum + row.facturacion, 0),
            frecuencia_promedio_autos: frecuenciaPromedioAutos
        };

        return NextResponse.json({
            success: true,
            reporte: reporte,
            totales: totales,
            debug: {
                total_registros: registros.length,
                fecha_desde: fechaDesde,
                fecha_hasta: fechaHasta,
                autos_con_multiples_visitas: totalIntervalos
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
