import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
// Usa el slug de la empresa para conectarse al branch correcto
export async function GET(
    request: Request,
    context: { params: Promise<{ empresaSlug: string; token: string }> }
) {
    try {
        const params = await context.params;
        const { empresaSlug, token } = params;

        if (!token || !empresaSlug) {
            return NextResponse.json(
                { error: 'Token o empresa inválidos' },
                { status: 400 }
            );
        }

        // Conectar a BD central para obtener branch URL
        const centralConnectionString = process.env.CENTRAL_DB_URL;
        if (!centralConnectionString) {
            console.error('[Survey API] CENTRAL_DB_URL no configurada');
            return NextResponse.json(
                { error: 'Configuración de base de datos no disponible' },
                { status: 500 }
            );
        }

        const centralSql = neon(centralConnectionString);

        // Obtener datos de la empresa por slug
        const empresaResult = await centralSql`
            SELECT id, nombre, slug, branch_url, estado
            FROM empresas
            WHERE slug = ${empresaSlug}
            AND estado = 'activo'
        `;

        if (empresaResult.length === 0) {
            return NextResponse.json(
                { error: 'Empresa no encontrada o inactiva' },
                { status: 404 }
            );
        }

        const empresa = empresaResult[0];

        if (!empresa.branch_url) {
            console.error(`[Survey API] Empresa ${empresaSlug} sin branch_url`);
            return NextResponse.json(
                { error: 'Configuración de empresa incompleta' },
                { status: 500 }
            );
        }

        // Conectar al branch de la empresa
        const branchSql = neon(empresa.branch_url);

        // Obtener datos de la encuesta
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

        // Obtener configuración de encuestas
        let config;
        try {
            const configResult = await branchSql`
                SELECT 
                    nombre_negocio as brand_name,
                    google_maps_link as google_maps_url
                FROM configuracion_encuestas
                LIMIT 1
            `;
            config = configResult.length > 0 ? configResult[0] : {
                brand_name: empresa.nombre,
                google_maps_url: null
            };
        } catch (error) {
            // Si no existe configuracion_encuestas, usar defaults
            config = {
                brand_name: empresa.nombre,
                google_maps_url: null
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
                    logoUrl: null,
                    googleMapsUrl: config.google_maps_url
                }
            }
        });

    } catch (error) {
        console.error('[Survey API] Error al obtener encuesta pública:', error);
        return NextResponse.json(
            { error: 'Error al cargar encuesta' },
            { status: 500 }
        );
    }
}
