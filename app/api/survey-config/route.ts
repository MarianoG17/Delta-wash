import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: Obtener configuración de encuestas
// Compatible con SaaS (configuracion_encuestas) y DeltaWash legacy (survey_config)
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        let configs = [];

        // Intentar primero configuracion_encuestas (SaaS branches nuevos)
        try {
            let configResult = await db`
                SELECT
                    nombre_negocio as brand_name,
                    google_maps_link as google_maps_url,
                    mensaje_agradecimiento as whatsapp_message,
                    dias_para_responder,
                    requiere_calificacion_minima
                FROM configuracion_encuestas
                LIMIT 1
            `;
            configs = Array.isArray(configResult) ? configResult : configResult.rows || [];
        } catch (error: any) {
            // Si configuracion_encuestas no existe, intentar survey_config (Legacy DeltaWash)
            if (error?.code === '42P01') {
                try {
                    let configResult = await db`
                        SELECT
                            brand_name,
                            google_maps_url,
                            discount_percentage
                        FROM survey_config
                        WHERE id = 1
                        LIMIT 1
                    `;
                    const legacyConfigs = Array.isArray(configResult) ? configResult : configResult.rows || [];
                    if (legacyConfigs.length > 0) {
                        // Mapear formato Legacy al formato esperado
                        configs = [{
                            brand_name: legacyConfigs[0].brand_name || 'DeltaWash',
                            google_maps_url: legacyConfigs[0].google_maps_url,
                            whatsapp_message: 'Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)',
                            dias_para_responder: 7,
                            requiere_calificacion_minima: false
                        }];
                    }
                } catch (legacyError) {
                    console.log('[Survey Config] Ni configuracion_encuestas ni survey_config existen, usando defaults');
                }
            } else {
                throw error;
            }
        }

        if (configs.length === 0) {
            // Retornar configuración por defecto
            return NextResponse.json({
                success: true,
                config: {
                    brand_name: 'DeltaWash',
                    logo_url: null,
                    google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36',
                    whatsapp_message: 'Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)',
                    discount_percentage: 10
                }
            });
        }

        return NextResponse.json({
            success: true,
            config: configs[0]
        });

    } catch (error) {
        console.error('Error al obtener configuración de encuestas:', error);
        // En caso de error, retornar defaults en lugar de fallar
        return NextResponse.json({
            success: true,
            config: {
                brand_name: 'DeltaWash',
                logo_url: null,
                google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36',
                whatsapp_message: 'Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)',
                discount_percentage: 10
            }
        });
    }
}

// POST: Guardar/actualizar configuración de encuestas
export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const {
            brand_name,
            google_maps_url,
            whatsapp_message
        } = await request.json();

        // Intentar primero configuracion_encuestas (SaaS)
        try {
            await db`
                UPDATE configuracion_encuestas
                SET nombre_negocio = ${brand_name || 'Mi Lavadero'},
                    google_maps_link = ${google_maps_url || null},
                    mensaje_agradecimiento = ${whatsapp_message || 'Gracias por tu opinión, nos ayuda a mejorar'},
                    updated_at = NOW()
            `;
        } catch (error: any) {
            // Si configuracion_encuestas no existe, intentar survey_config (Legacy)
            if (error?.code === '42P01') {
                await db`
                    UPDATE survey_config
                    SET brand_name = ${brand_name || 'DeltaWash'},
                        google_maps_url = ${google_maps_url || null}
                    WHERE id = 1
                `;
            } else {
                throw error;
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Configuración guardada exitosamente'
        });

    } catch (error) {
        console.error('Error al guardar configuración de encuestas:', error);
        return NextResponse.json(
            { error: 'Error al guardar configuración' },
            { status: 500 }
        );
    }
}
