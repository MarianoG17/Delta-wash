import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
// HYBRID ROUTING: Soporta Legacy (DATABASE_URL) y SaaS (survey_lookup)
// Usa IS_SAAS_PROJECT env var para decidir el flujo
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
            return NextResponse.json(
                { error: 'URL inválida. Debe ser un UUID válido' },
                { status: 400 }
            );
        }

        const token = tokenOrSlug;

        // Detectar modo: SaaS (lavapp) o Legacy (deltawash-app)
        const isSaasProject = process.env.IS_SAAS_PROJECT === 'true';

        // ========== MODO SAAS: Usar survey_lookup ==========
        if (isSaasProject) {
            const centralDbUrl = process.env.CENTRAL_DB_URL;
            if (!centralDbUrl) {
                console.error('[Survey SaaS] CENTRAL_DB_URL no configurada');
                return NextResponse.json(
                    { error: 'Configuración de base de datos no disponible' },
                    { status: 500 }
                );
            }

            try {
                const centralSql = neon(centralDbUrl);
                
                // Buscar en survey_lookup
                const lookupResult = await centralSql`
                    SELECT sl.branch_url, sl.empresa_id, e.nombre as empresa_nombre
                    FROM survey_lookup sl
                    LEFT JOIN empresas e ON e.id = sl.empresa_id
                    WHERE sl.survey_token = ${token}
                `;

                if (lookupResult.length === 0) {
                    console.error(`[Survey SaaS] Token not found in survey_lookup: ${token}`);
                    return NextResponse.json(
                        { error: 'Encuesta no encontrada' },
                        { status: 404 }
                    );
                }

                const lookup = lookupResult[0];
                const branchUrl = lookup.branch_url;

                // Conectar al branch específico del cliente
                const branchSql = neon(branchUrl);
                
                // Obtener datos de la encuesta en el branch
                const surveyResult = await branchSql`
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

                if (surveyResult.length === 0) {
                    console.error(`[Survey SaaS] Token not found in branch: ${token}`);
                    return NextResponse.json(
                        { error: 'Encuesta no encontrada' },
                        { status: 404 }
                    );
                }

                const survey = surveyResult[0];

                // Si ya fue respondida
                if (survey.responded_at) {
                    return NextResponse.json({
                        survey: {
                            token: survey.survey_token,
                            alreadyResponded: true,
                            respondedAt: survey.responded_at
                        }
                    });
                }

                // Obtener config desde el branch
                let config;
                try {
                    const configResult = await branchSql`
                        SELECT brand_name, logo_url, google_maps_url
                        FROM survey_config
                        WHERE id = 1
                    `;
                    config = configResult.length > 0 ? configResult[0] : {
                        brand_name: lookup.empresa_nombre || 'Lavadero',
                        logo_url: null,
                        google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
                    };
                } catch (error) {
                    config = {
                        brand_name: lookup.empresa_nombre || 'Lavadero',
                        logo_url: null,
                        google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
                    };
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
                console.error('[Survey SaaS] Error:', error);
                return NextResponse.json(
                    { error: 'Error al cargar encuesta' },
                    { status: 500 }
                );
            }
        }

        // ========== MODO LEGACY: Usar DATABASE_URL directo ==========
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
            // Intentar primero con empresa_id (por si acaso)
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
            console.error(`[Survey Legacy] Token not found: ${token}`);
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
