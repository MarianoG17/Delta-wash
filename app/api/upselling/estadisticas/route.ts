import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // 1. Calcular el percentil 80 (umbral para top 20%)
        const percentilResult = await db`
            WITH cliente_visitas AS (
                SELECT 
                    celular,
                    COUNT(*) as visitas
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular
            )
            SELECT 
                PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY visitas) as percentil_80,
                COUNT(*) as total_clientes,
                COUNT(*) FILTER (WHERE visitas >= PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY visitas)) as clientes_top_20
            FROM cliente_visitas
        `;

        const percentilData = Array.isArray(percentilResult) ? percentilResult : percentilResult.rows || [];

        if (percentilData.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No hay datos suficientes'
            });
        }

        const percentil80 = parseFloat(percentilData[0].percentil_80 || '0');
        const totalClientes = parseInt(percentilData[0].total_clientes || '0');

        // 2. Contar clientes top 20% que nunca usaron premium
        const clientesElegiblesResult = await db`
            WITH cliente_visitas AS (
                SELECT 
                    celular,
                    nombre_cliente,
                    COUNT(*) as total_visitas
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular, nombre_cliente
                HAVING COUNT(*) >= ${Math.ceil(percentil80)}
            ),
            clientes_con_premium AS (
                SELECT DISTINCT celular
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                AND (
                    LOWER(tipo_limpieza) LIKE '%chasis%'
                    OR LOWER(tipo_limpieza) LIKE '%motor%'
                    OR LOWER(tipo_limpieza) LIKE '%pulido%'
                )
            )
            SELECT 
                cv.celular,
                cv.nombre_cliente,
                cv.total_visitas
            FROM cliente_visitas cv
            LEFT JOIN clientes_con_premium cp ON cv.celular = cp.celular
            WHERE cp.celular IS NULL
            ORDER BY cv.total_visitas DESC
        `;

        const clientesElegiblesData = Array.isArray(clientesElegiblesResult)
            ? clientesElegiblesResult
            : clientesElegiblesResult.rows || [];

        // 3. Contar interacciones recientes
        const interaccionesResult = await db`
            SELECT 
                accion,
                COUNT(*) as cantidad
            FROM upselling_interacciones
            ${empresaId ? db`WHERE empresa_id = ${empresaId}` : db`WHERE empresa_id IS NULL`}
            AND fecha_interaccion > NOW() - INTERVAL '30 days'
            GROUP BY accion
        `;

        const interaccionesData = Array.isArray(interaccionesResult)
            ? interaccionesResult
            : interaccionesResult.rows || [];

        const interacciones = {
            aceptado: 0,
            rechazado: 0,
            interes_futuro: 0
        };

        interaccionesData.forEach((row: any) => {
            if (row.accion === 'aceptado') interacciones.aceptado = parseInt(row.cantidad);
            if (row.accion === 'rechazado') interacciones.rechazado = parseInt(row.cantidad);
            if (row.accion === 'interes_futuro') interacciones.interes_futuro = parseInt(row.cantidad);
        });

        return NextResponse.json({
            success: true,
            estadisticas: {
                umbral_minimo: Math.ceil(percentil80),
                total_clientes: totalClientes,
                clientes_elegibles: clientesElegiblesData.length,
                top_clientes_elegibles: clientesElegiblesData.slice(0, 10),
                interacciones_30_dias: interacciones
            }
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error del servidor',
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
