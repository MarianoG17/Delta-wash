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

        // Conectar a BD central (usamos connectionString directamente)
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL no configurado');
        }

        const sql = neon(connectionString);

        // Obtener datos de la encuesta
        const surveyResult = await sql`
            SELECT 
                s.id,
                s.survey_token,
                s.empresa_id,
                s.visit_id,
                s.responded_at,
                r.marca_modelo,
                r.patente,
                r.tipo_limpieza,
                r.fecha_entregado
            FROM surveys s
            LEFT JOIN registros_lavado r ON r.id = s.visit_id
            WHERE s.survey_token = ${token}
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
                    marca: survey.marca_modelo,
                    patente: survey.patente,
                    servicio: survey.tipo_limpieza
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
