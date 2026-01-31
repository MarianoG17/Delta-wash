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

        // 2. Obtener promoción activa para saber la frecuencia objetivo
        const promocionResult = await db`
            SELECT frecuencia_dias_max, percentil_clientes
            FROM promociones_upselling
            WHERE activa = true
            ${empresaId ? db`AND (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`AND empresa_id IS NULL`}
            AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
            AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
            ORDER BY empresa_id DESC NULLS LAST
            LIMIT 1
        `;

        const promocionData = Array.isArray(promocionResult) ? promocionResult : promocionResult.rows || [];
        const frecuenciaMaxDias = promocionData.length > 0
            ? (promocionData[0].frecuencia_dias_max || promocionData[0].percentil_clientes || 15)
            : 15;

        // 3. Calcular frecuencias de visita de todos los clientes
        const frecuenciasResult = await db`
            WITH cliente_datos AS (
                SELECT
                    celular,
                    nombre_cliente,
                    COUNT(*) as total_visitas,
                    MIN(fecha_ingreso) as primera_visita,
                    MAX(fecha_ingreso) as ultima_visita,
                    EXTRACT(DAY FROM MAX(fecha_ingreso) - MIN(fecha_ingreso)) as dias_totales
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular, nombre_cliente
                HAVING COUNT(*) >= 2
            )
            SELECT
                celular,
                nombre_cliente,
                total_visitas,
                dias_totales,
                CASE
                    WHEN total_visitas > 1 THEN dias_totales / (total_visitas - 1)
                    ELSE NULL
                END as frecuencia_promedio
            FROM cliente_datos
        `;

        const frecuenciasData = Array.isArray(frecuenciasResult) ? frecuenciasResult : frecuenciasResult.rows || [];

        if (frecuenciasData.length === 0) {
            return NextResponse.json({
                success: false,
                message: 'No hay datos suficientes'
            });
        }

        const totalClientes = frecuenciasData.length;

        // 4. Construir condiciones dinámicas para servicios premium
        const condicionesPremium = serviciosPremium.map((servicio: string) =>
            `LOWER(tipo_limpieza) LIKE '%${servicio.toLowerCase()}%'`
        ).join(' OR ');

        // 5. Filtrar clientes elegibles (frecuencia <= max) que nunca usaron premium
        const clientesElegiblesResult = await db.unsafe(`
            WITH cliente_frecuencias AS (
                SELECT
                    celular,
                    nombre_cliente,
                    COUNT(*) as total_visitas,
                    EXTRACT(DAY FROM MAX(fecha_ingreso) - MIN(fecha_ingreso)) as dias_totales,
                    CASE
                        WHEN COUNT(*) > 1 THEN EXTRACT(DAY FROM MAX(fecha_ingreso) - MIN(fecha_ingreso)) / (COUNT(*) - 1)
                        ELSE NULL
                    END as frecuencia_promedio
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular, nombre_cliente
                HAVING COUNT(*) >= 2
            ),
            clientes_con_premium AS (
                SELECT DISTINCT celular
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                AND (${condicionesPremium})
            )
            SELECT
                cf.celular,
                cf.nombre_cliente,
                cf.total_visitas,
                ROUND(cf.frecuencia_promedio) as frecuencia_dias
            FROM cliente_frecuencias cf
            LEFT JOIN clientes_con_premium cp ON cf.celular = cp.celular
            WHERE cp.celular IS NULL
            AND cf.frecuencia_promedio <= ${frecuenciaMaxDias}
            ORDER BY cf.frecuencia_promedio ASC, cf.total_visitas DESC
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
                frecuencia_max_dias: frecuenciaMaxDias,
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
