import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { celular } = await request.json();

        if (!celular) {
            return NextResponse.json(
                { success: false, message: 'Celular es requerido' },
                { status: 400 }
            );
        }

        // Obtener configuración de upselling
        const configResult = await db`
            SELECT *
            FROM upselling_configuracion
            WHERE ${empresaId ? db`empresa_id = ${empresaId}` : db`empresa_id IS NULL`}
            LIMIT 1
        `;

        const configData = Array.isArray(configResult) ? configResult : configResult.rows || [];

        // Si no hay configuración o está desactivada, no mostrar upselling
        if (configData.length === 0 || !configData[0].activo) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'sistema_desactivado'
            });
        }

        const config = configData[0];
        const percentilObjetivo = config.percentil_clientes || 80;
        const periodoRechazo = config.periodo_rechazado_dias || 30;
        const serviciosPremium = JSON.parse(config.servicios_premium || '["chasis", "motor", "pulido"]');
        const topPorcentaje = 100 - percentilObjetivo; // Top 20% si percentil es 80

        // 1. Obtener estadísticas del cliente actual
        const clienteStatsResult = await db`
            SELECT 
                COUNT(*) as total_visitas,
                COUNT(DISTINCT DATE(fecha_ingreso)) as dias_diferentes
            FROM registros_lavado
            WHERE celular = ${celular}
            AND (anulado IS NULL OR anulado = FALSE)
        `;

        const clienteStatsData = Array.isArray(clienteStatsResult) ? clienteStatsResult : clienteStatsResult.rows || [];

        if (clienteStatsData.length === 0 || parseInt(clienteStatsData[0].total_visitas) === 0) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'cliente_nuevo'
            });
        }

        const totalVisitasCliente = parseInt(clienteStatsData[0].total_visitas);

        // 2. Calcular percentil del cliente según configuración
        const percentilDecimal = percentilObjetivo / 100; // 80 -> 0.80
        const percentilResult = await db`
            WITH cliente_visitas AS (
                SELECT
                    celular,
                    COUNT(*) as visitas
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular
            ),
            percentiles AS (
                SELECT
                    PERCENTILE_CONT(${percentilDecimal}) WITHIN GROUP (ORDER BY visitas) as percentil_calculado
                FROM cliente_visitas
            )
            SELECT
                (SELECT visitas FROM cliente_visitas WHERE celular = ${celular}) as visitas_cliente,
                percentil_calculado
            FROM percentiles
        `;

        const percentilData = Array.isArray(percentilResult) ? percentilResult : percentilResult.rows || [];

        if (percentilData.length === 0) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'error_calculo'
            });
        }

        const percentilCalculado = parseFloat(percentilData[0].percentil_calculado || '0');
        const visitasCliente = parseInt(percentilData[0].visitas_cliente || '0');

        // Verificar si está en el percentil objetivo
        if (visitasCliente < percentilCalculado) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: `no_top_${topPorcentaje}`,
                debug: {
                    visitas_cliente: visitasCliente,
                    minimo_requerido: Math.ceil(percentilCalculado),
                    percentil_configurado: percentilObjetivo
                }
            });
        }

        // 3. Verificar si ya usó servicios premium (según configuración)
        // Construir condiciones dinámicas basadas en servicios configurados
        const condicionesPremium = serviciosPremium.map((servicio: string) =>
            `LOWER(tipo_limpieza) LIKE '%${servicio.toLowerCase()}%'`
        ).join(' OR ');

        const serviciosPremiumResult = await db.unsafe(`
            SELECT COUNT(*) as tiene_premium
            FROM registros_lavado
            WHERE celular = '${celular}'
            AND (anulado IS NULL OR anulado = FALSE)
            AND (${condicionesPremium})
        `);

        const serviciosPremiumData = Array.isArray(serviciosPremiumResult) ? serviciosPremiumResult : serviciosPremiumResult.rows || [];
        const tienePremium = parseInt(serviciosPremiumData[0]?.tiene_premium || '0');

        if (tienePremium > 0) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'ya_uso_premium'
            });
        }

        // 4. Verificar si ya rechazó la oferta recientemente (según configuración)
        const interaccionRecienteResult = await db`
            SELECT accion, fecha_interaccion
            FROM upselling_interacciones
            WHERE cliente_celular = ${celular}
            ${empresaId ? db`AND empresa_id = ${empresaId}` : db`AND empresa_id IS NULL`}
            AND fecha_interaccion > NOW() - INTERVAL '${periodoRechazo} days'
            ORDER BY fecha_interaccion DESC
            LIMIT 1
        `;

        const interaccionRecienteData = Array.isArray(interaccionRecienteResult) ? interaccionRecienteResult : interaccionRecienteResult.rows || [];

        if (interaccionRecienteData.length > 0) {
            const ultimaAccion = interaccionRecienteData[0].accion;
            if (ultimaAccion === 'rechazado') {
                return NextResponse.json({
                    success: true,
                    elegible: false,
                    razon: 'rechazado_recientemente',
                    ultima_interaccion: interaccionRecienteData[0].fecha_interaccion
                });
            }
        }

        // 5. Obtener promoción activa
        const promocionResult = await db`
            SELECT *
            FROM promociones_upselling
            WHERE activa = true
            ${empresaId ? db`AND (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`AND empresa_id IS NULL`}
            AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
            AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
            ORDER BY empresa_id DESC NULLS LAST
            LIMIT 1
        `;

        const promocionData = Array.isArray(promocionResult) ? promocionResult : promocionResult.rows || [];

        if (promocionData.length === 0) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'sin_promocion_activa'
            });
        }

        const promocion = promocionData[0];

        // 6. Cliente es elegible!
        return NextResponse.json({
            success: true,
            elegible: true,
            cliente: {
                total_visitas: totalVisitasCliente,
                percentil: `top_${topPorcentaje}`,
                umbral_minimo: Math.ceil(percentilCalculado),
                percentil_configurado: percentilObjetivo
            },
            promocion: {
                id: promocion.id,
                nombre: promocion.nombre,
                descripcion: promocion.descripcion,
                descuento_porcentaje: promocion.descuento_porcentaje,
                descuento_fijo: promocion.descuento_fijo,
                servicios_objetivo: JSON.parse(promocion.servicios_objetivo)
            },
            configuracion: {
                percentil: percentilObjetivo,
                periodo_rechazo_dias: periodoRechazo,
                servicios_premium: serviciosPremium
            }
        });

    } catch (error) {
        console.error('Error detectando upselling:', error);
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
