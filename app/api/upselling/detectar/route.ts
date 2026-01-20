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

        // 2. Calcular percentil del cliente (top 20%)
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
                    PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY visitas) as percentil_80
                FROM cliente_visitas
            )
            SELECT 
                (SELECT visitas FROM cliente_visitas WHERE celular = ${celular}) as visitas_cliente,
                percentil_80
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

        const percentil80 = parseFloat(percentilData[0].percentil_80 || '0');
        const visitasCliente = parseInt(percentilData[0].visitas_cliente || '0');

        // Verificar si está en el top 20%
        if (visitasCliente < percentil80) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'no_top_20',
                debug: {
                    visitas_cliente: visitasCliente,
                    minimo_requerido: Math.ceil(percentil80)
                }
            });
        }

        // 3. Verificar si ya usó servicios premium
        const serviciosPremiumResult = await db`
            SELECT COUNT(*) as tiene_premium
            FROM registros_lavado
            WHERE celular = ${celular}
            AND (anulado IS NULL OR anulado = FALSE)
            AND (
                LOWER(tipo_limpieza) LIKE '%chasis%'
                OR LOWER(tipo_limpieza) LIKE '%motor%'
                OR LOWER(tipo_limpieza) LIKE '%pulido%'
            )
        `;

        const serviciosPremiumData = Array.isArray(serviciosPremiumResult) ? serviciosPremiumResult : serviciosPremiumResult.rows || [];
        const tienePremium = parseInt(serviciosPremiumData[0]?.tiene_premium || '0');

        if (tienePremium > 0) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'ya_uso_premium'
            });
        }

        // 4. Verificar si ya rechazó la oferta recientemente (últimos 30 días)
        const interaccionRecienteResult = await db`
            SELECT accion, fecha_interaccion
            FROM upselling_interacciones
            WHERE cliente_celular = ${celular}
            ${empresaId ? db`AND empresa_id = ${empresaId}` : db`AND empresa_id IS NULL`}
            AND fecha_interaccion > NOW() - INTERVAL '30 days'
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
                percentil: 'top_20'
            },
            promocion: {
                id: promocion.id,
                nombre: promocion.nombre,
                descripcion: promocion.descripcion,
                descuento_porcentaje: promocion.descuento_porcentaje,
                descuento_fijo: promocion.descuento_fijo,
                servicios_objetivo: JSON.parse(promocion.servicios_objetivo)
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
