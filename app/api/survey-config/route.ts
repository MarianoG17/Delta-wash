import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: Obtener configuración de encuestas
// Compatible con SaaS (tenant_survey_config) y DeltaWash legacy (survey_config)
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        let configResult;

        if (empresaId) {
            // SaaS: Usar tenant_survey_config con empresa_id
            configResult = await db`
                SELECT
                    brand_name,
                    logo_url,
                    google_maps_url,
                    whatsapp_message,
                    discount_percentage
                FROM tenant_survey_config
                WHERE empresa_id = ${empresaId}
            `;
        } else {
            // DeltaWash Legacy: Usar survey_config (tabla global, id=1)
            configResult = await db`
                SELECT
                    brand_name,
                    logo_url,
                    google_maps_url,
                    whatsapp_message,
                    discount_percentage
                FROM survey_config
                WHERE id = 1
            `;
        }

        const configs = Array.isArray(configResult) ? configResult : configResult.rows || [];

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
        return NextResponse.json(
            { error: 'Error al obtener configuración' },
            { status: 500 }
        );
    }
}

// POST: Guardar/actualizar configuración de encuestas
// Compatible con SaaS (tenant_survey_config) y DeltaWash legacy (survey_config)
export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const {
            brand_name,
            logo_url,
            google_maps_url,
            whatsapp_message,
            discount_percentage
        } = await request.json();

        // Validar porcentaje
        if (discount_percentage < 0 || discount_percentage > 100) {
            return NextResponse.json(
                { error: 'El porcentaje debe estar entre 0 y 100' },
                { status: 400 }
            );
        }

        if (empresaId) {
            // SaaS: Usar tenant_survey_config con empresa_id
            // Verificar si ya existe configuración
            const existingConfig = await db`
                SELECT empresa_id FROM tenant_survey_config WHERE empresa_id = ${empresaId}
            `;

            const hasConfig = Array.isArray(existingConfig) ? existingConfig.length > 0 : (existingConfig.rows || []).length > 0;

            if (hasConfig) {
                // Actualizar
                await db`
                    UPDATE tenant_survey_config
                    SET brand_name = ${brand_name || 'DeltaWash'},
                        logo_url = ${logo_url || null},
                        google_maps_url = ${google_maps_url || 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'},
                        whatsapp_message = ${whatsapp_message || 'Gracias por confiar en nosotros'},
                        discount_percentage = ${discount_percentage || 10},
                        updated_at = NOW()
                    WHERE empresa_id = ${empresaId}
                `;
            } else {
                // Insertar
                await db`
                    INSERT INTO tenant_survey_config (
                        empresa_id,
                        brand_name,
                        logo_url,
                        google_maps_url,
                        whatsapp_message,
                        discount_percentage
                    ) VALUES (
                        ${empresaId},
                        ${brand_name || 'DeltaWash'},
                        ${logo_url || null},
                        ${google_maps_url || 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'},
                        ${whatsapp_message || 'Gracias por confiar en nosotros'},
                        ${discount_percentage || 10}
                    )
                `;
            }
        } else {
            // DeltaWash Legacy: Actualizar survey_config (siempre UPDATE, id=1)
            await db`
                UPDATE survey_config
                SET brand_name = ${brand_name || 'DeltaWash'},
                    logo_url = ${logo_url || null},
                    google_maps_url = ${google_maps_url || 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'},
                    whatsapp_message = ${whatsapp_message || 'Gracias por confiar en nosotros'},
                    discount_percentage = ${discount_percentage || 10}
                WHERE id = 1
            `;
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
