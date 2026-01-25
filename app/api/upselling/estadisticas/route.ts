import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // 1. Obtener configuración global para servicios premium
        const configResult = await db`
            SELECT servicios_premium
            FROM upselling_configuracion
            WHERE ${empresaId ? db`empresa_id = ${empresaId}` : db`empresa_id IS NULL`}
            LIMIT 1
        `;

        const configData = Array.isArray(configResult) ? configResult : configResult.rows || [];
        const serviciosPremium = configData.length > 0
            ? JSON.parse(configData[0].servicios_premium || '["chasis", "motor", "pulido"]')
            : ["chasis", "motor", "pulido"];

        // 2. Obtener promoción activa para saber el percentil a usar
        const promocionResult = await db`
            SELECT percentil_clientes
            FROM promociones_upselling
            WHERE activa = true
            ${empresaId ? db`AND (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`AND empresa_id IS NULL`}
            AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
            AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
            ORDER BY empresa_id DESC NULLS LAST
            LIMIT 1
        `;

        const promocionData = Array.isArray(promocionResult) ? promocionResult : promocionResult.rows || [];
        const percentilObjetivo = promocionData.length > 0
            ? (promocionData[0].percentil_clientes || 80)
            : 80;

        const percentilDecimal = percentilObjetivo / 100; // 80 -> 0.80

        // 3. Calcular el percentil según la promoción activa
        const percentilResult = await db`
            WITH cliente_visitas AS (
                SELECT
                    celular,
                    COUNT(*) as visitas
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular
            ),
            percentil_calc AS (
                SELECT
                    PERCENTILE_CONT(${percentilDecimal}) WITHIN GROUP (ORDER BY visitas) as percentil_calculado
                FROM cliente_visitas
            )
            SELECT
                p.percentil_calculado,
                COUNT(*) as total_clientes
            FROM cliente_visitas cv
            CROSS JOIN percentil_calc p
            GROUP BY p.percentil_calculado
        `;

        const percentilData = Array.isArray(percentilResult) ? percentilResult : percentilResult.rows || [];

        if (percentilData.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No hay datos suficientes'
            });
        }

        const percentilCalculado = parseFloat(percentilData[0].percentil_calculado || '0');
        const totalClientes = parseInt(percentilData[0].total_clientes || '0');

        // 4. Construir condiciones dinámicas para servicios premium
        const condicionesPremium = serviciosPremium.map((servicio: string) =>
            `LOWER(tipo_limpieza) LIKE '%${servicio.toLowerCase()}%'`
        ).join(' OR ');

        // 5. Contar clientes elegibles que nunca usaron premium
        const clientesElegiblesResult = await db.unsafe(`
            WITH cliente_visitas AS (
                SELECT
                    celular,
                    nombre_cliente,
                    COUNT(*) as total_visitas
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular, nombre_cliente
                HAVING COUNT(*) >= ${Math.ceil(percentilCalculado)}
            ),
            clientes_con_premium AS (
                SELECT DISTINCT celular
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                AND (${condicionesPremium})
            )
            SELECT
                cv.celular,
                cv.nombre_cliente,
                cv.total_visitas
            FROM cliente_visitas cv
            LEFT JOIN clientes_con_premium cp ON cv.celular = cp.celular
            WHERE cp.celular IS NULL
            ORDER BY cv.total_visitas DESC
        `);

        const clientesElegiblesData = Array.isArray(clientesElegiblesResult)
            ? clientesElegiblesResult
            : clientesElegiblesResult.rows || [];

        // 6. Contar interacciones recientes
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

        // 7. Obtener TODAS las interacciones con detalles
        const todasInteraccionesResult = await db`
            SELECT
                ui.cliente_nombre,
                ui.cliente_celular,
                ui.accion,
                ui.descuento_aplicado,
                ui.fecha_interaccion,
                ui.notas,
                p.nombre as promocion_nombre,
                p.descuento_porcentaje,
                p.descuento_fijo
            FROM upselling_interacciones ui
            LEFT JOIN promociones_upselling p ON ui.promocion_id = p.id
            ${empresaId ? db`WHERE ui.empresa_id = ${empresaId}` : db`WHERE ui.empresa_id IS NULL`}
            ORDER BY ui.fecha_interaccion DESC
            LIMIT 100
        `;

        const todasInteraccionesData = Array.isArray(todasInteraccionesResult)
            ? todasInteraccionesResult
            : todasInteraccionesResult.rows || [];

        return NextResponse.json({
            success: true,
            estadisticas: {
                umbral_minimo: Math.ceil(percentilCalculado),
                percentil_configurado: percentilObjetivo,
                total_clientes: totalClientes,
                clientes_elegibles: clientesElegiblesData.length,
                top_clientes_elegibles: clientesElegiblesData.slice(0, 10),
                interacciones_30_dias: interacciones,
                todas_interacciones: todasInteraccionesData
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
