import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
// SMART ROUTING: Detecta si el parámetro es un slug (SaaS) o un token UUID (DeltaWash)
export async function GET(
    request: Request,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const params = await context.params;
        const tokenOrSlug = params.token;

        if (!tokenOrSlug) {
            return NextResponse.json(
                { error: 'Parámetro inválido' },
                { status: 400 }
            );
        }

        // Detectar si es un UUID (token) o un slug (empresa)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(tokenOrSlug);
        
        if (!isUUID) {
            // Es un slug de empresa → redirigir a mensaje de error
            // (la ruta correcta debería ser /survey/[empresaSlug]/[token])
            return NextResponse.json(
                { error: 'URL inválida. El formato correcto es /survey/[empresa]/[token]' },
                { status: 400 }
            );
        }

        // Es un token UUID → DeltaWash Legacy
        const token = tokenOrSlug;

        // Conectar a BD (DeltaWash Legacy DATABASE_URL)
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            console.error('[Survey Legacy] DATABASE_URL no configurada');
            return NextResponse.json(
                { error: 'Configuración de base de datos no disponible' },
                { status: 500 }
            );
        }

        const sql = neon(connectionString);

        // Obtener datos de la encuesta (detectar si tiene empresa_id o no)
        let surveyResult;
        let empresaId = null;
        
        try {
            // Intentar primero con empresa_id (SaaS)
            surveyResult = await sql`
                SELECT
                    id,
                    survey_token,
                    empresa_id,
                    visit_id,
                    responded_at,
                    vehicle_marca,
                    vehicle_patente,
                    vehicle_servicio
                FROM surveys
                WHERE survey_token = ${token}
            `;
            empresaId = surveyResult[0]?.empresa_id;
        } catch (error: any) {
            // Si falla (columna no existe), intentar sin empresa_id (DeltaWash Legacy)
            if (error?.code === '42703') {
                surveyResult = await sql`
                    SELECT
                        id,
                        survey_token,
                        visit_id,
                        responded_at,
                        vehicle_marca,
                        vehicle_patente,
                        vehicle_servicio
                    FROM surveys
                    WHERE survey_token = ${token}
                `;
            } else {
                throw error;
            }
        }

        if (surveyResult.length === 0) {
            return NextResponse.json(
                { error: 'Encuesta no encontrada' },
                { status: 404 }
            );
        }

        const survey = surveyResult[0];

        // Si ya fue respondida, retornar el estado
        if (survey.responded_at) {
            return NextResponse.json({
                survey: {
                    token: survey.survey_token,
                    alreadyResponded: true,
                    respondedAt: survey.responded_at
                }
            });
        }

        // Obtener configuración (tenant_survey_config para SaaS, survey_config para DeltaWash)
        let config;
        if (empresaId) {
            // SaaS: usar tenant_survey_config
            const configResult = await sql`
                SELECT brand_name, logo_url, google_maps_url
                FROM tenant_survey_config
                WHERE empresa_id = ${empresaId}
            `;
            config = configResult.length > 0 ? configResult[0] : {
                brand_name: 'DeltaWash',
                logo_url: null,
                google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
            };
        } else {
            // DeltaWash Legacy: usar survey_config (id=1)
            try {
                const configResult = await sql`
                    SELECT brand_name, logo_url, google_maps_url
                    FROM survey_config
                    WHERE id = 1
                `;
                config = configResult.length > 0 ? configResult[0] : {
                    brand_name: 'DeltaWash',
                    logo_url: null,
                    google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
                };
            } catch (error) {
                // Si no existe survey_config, usar defaults
                config = {
                    brand_name: 'DeltaWash',
                    logo_url: null,
                    google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
                };
            }
        }

        return NextResponse.json({
            survey: {
                token: survey.survey_token,
                alreadyResponded: false,
                vehicle: {
                    marca: survey.vehicle_marca || 'Vehículo',
                    patente: survey.vehicle_patente || '',
                    servicio: survey.vehicle_servicio || 'Servicio'
                },
                tenant: {
                    name: config.brand_name,
                    logoUrl: config.logo_url,
                    googleMapsUrl: config.google_maps_url
                }
            }
        });

    } catch (error) {
        console.error('Error al obtener encuesta pública:', error);
        return NextResponse.json(
            { error: 'Error al cargar encuesta' },
            { status: 500 }
        );
    }
}
