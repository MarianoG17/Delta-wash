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

        // Obtener configuración de upselling (solo para verificar si está activo)
        const configResult = await db`
            SELECT activo, servicios_premium
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

        const serviciosPremium = JSON.parse(configData[0].servicios_premium || '["chasis", "motor", "pulido"]');

        // 1. Obtener promoción activa primero
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
        const frecuenciaMaxDias = promocion.frecuencia_dias_max || promocion.percentil_clientes || 15;
        const periodoRechazo = promocion.periodo_rechazado_dias || 30;

        // 2. Calcular frecuencia de visitas del cliente
        const clienteStatsResult = await db`
            SELECT
                COUNT(*) as total_visitas,
                MIN(fecha_ingreso) as primera_visita,
                MAX(fecha_ingreso) as ultima_visita,
                EXTRACT(DAY FROM MAX(fecha_ingreso) - MIN(fecha_ingreso)) as dias_totales
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
        const diasTotales = parseFloat(clienteStatsData[0].dias_totales || '0');

        // Calcular frecuencia promedio (días entre visitas)
        // Si solo tiene 1 visita, no podemos calcular frecuencia
        if (totalVisitasCliente < 2) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'cliente_nuevo'
            });
        }

        const frecuenciaPromedio = diasTotales / (totalVisitasCliente - 1);

        // 3. Verificar si cumple con la frecuencia objetivo
        if (frecuenciaPromedio > frecuenciaMaxDias) {
            return NextResponse.json({
                success: true,
                elegible: false,
                razon: 'frecuencia_insuficiente',
                debug: {
                    frecuencia_cliente: Math.round(frecuenciaPromedio),
                    frecuencia_requerida: frecuenciaMaxDias,
                    total_visitas: totalVisitasCliente,
                    promocion: promocion.nombre
                }
            });
        }

        // 4. Verificar si ya usó servicios premium (según configuración)
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

        // 5. Verificar si ya rechazó la oferta recientemente (según configuración)
        let interaccionRecienteResult;
        if (empresaId) {
            // SaaS: filtrar por empresa_id
            interaccionRecienteResult = await db`
                SELECT accion, fecha_interaccion
                FROM upselling_interacciones
                WHERE cliente_celular = ${celular}
                AND empresa_id = ${empresaId}
                AND fecha_interaccion > NOW() - INTERVAL '${periodoRechazo} days'
                ORDER BY fecha_interaccion DESC
                LIMIT 1
            `;
        } else {
            // DeltaWash Legacy: sin empresa_id (single-tenant, no filtra)
            interaccionRecienteResult = await db`
                SELECT accion, fecha_interaccion
                FROM upselling_interacciones
                WHERE cliente_celular = ${celular}
                AND fecha_interaccion > NOW() - INTERVAL '${periodoRechazo} days'
                ORDER BY fecha_interaccion DESC
                LIMIT 1
            `;
        }

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

        // 6. Cliente es elegible!
        return NextResponse.json({
            success: true,
            elegible: true,
            cliente: {
                total_visitas: totalVisitasCliente,
                frecuencia_promedio: Math.round(frecuenciaPromedio),
                frecuencia_requerida: frecuenciaMaxDias
            },
            promocion: {
                id: promocion.id,
                nombre: promocion.nombre,
                descripcion: promocion.descripcion,
                descuento_porcentaje: promocion.descuento_porcentaje,
                descuento_fijo: promocion.descuento_fijo,
                servicios_objetivo: JSON.parse(promocion.servicios_objetivo)
            },
            promocion_config: {
                frecuencia_max_dias: frecuenciaMaxDias,
                periodo_rechazo_dias: periodoRechazo
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
