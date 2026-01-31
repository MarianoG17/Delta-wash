import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
export async function GET(
    request: Request,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const params = await context.params;
        const token = params.token;

        if (!token) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 400 }
            );
        }

        // Conectar a BD (primero intentar DATABASE_URL, sino POSTGRES_URL de Neon)
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            console.error('No database connection string found');
            return NextResponse.json(
                { error: 'Configuración de base de datos no disponible' },
                { status: 500 }
            );
        }

        const sql = neon(connectionString);

        // Obtener datos de la encuesta (ahora con datos del vehículo guardados en surveys)
        const surveyResult = await sql`
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

        // Obtener configuración del tenant (o usar defaults)
        const configResult = await sql`
            SELECT brand_name, logo_url, google_maps_url
            FROM tenant_survey_config
            WHERE empresa_id = ${survey.empresa_id}
        `;

        const config = configResult.length > 0 ? configResult[0] : {
            brand_name: 'DeltaWash',
            logo_url: null,
            google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
        };

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
