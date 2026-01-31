import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
export async function POST(
    request: Request,
    context: { params: Promise<{ token: string }> }
) {
    try {
        const params = await context.params;
        const token = params.token;
        const { rating, comment } = await request.json();

        // Validaciones
        if (!token) {
            return NextResponse.json(
                { error: 'Token inválido' },
                { status: 400 }
            );
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Rating debe ser entre 1 y 5' },
                { status: 400 }
            );
        }

        // Conectar a BD central
        const connectionString = process.env.DATABASE_URL;
        if (!connectionString) {
            throw new Error('DATABASE_URL no configurado');
        }

        const sql = neon(connectionString);

        // Verificar que la encuesta existe y no fue respondida
        const surveyResult = await sql`
            SELECT id, empresa_id, client_phone, responded_at
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

        if (survey.responded_at) {
            return NextResponse.json(
                { error: 'Esta encuesta ya fue respondida' },
                { status: 400 }
            );
        }

        // Iniciar transacción: guardar respuesta + generar beneficio + actualizar encuesta

        // 1. Guardar respuesta
        await sql`
            INSERT INTO survey_responses (survey_id, rating, comment)
            VALUES (${survey.id}, ${rating}, ${comment || null})
        `;

        // 2. Marcar encuesta como respondida
        await sql`
            UPDATE surveys
            SET responded_at = CURRENT_TIMESTAMP
            WHERE id = ${survey.id}
        `;

        // 3. Obtener config del tenant (descuento + Google Maps)
        const configResult = await sql`
            SELECT google_maps_url, discount_percentage
            FROM tenant_survey_config
            WHERE empresa_id = ${survey.empresa_id}
        `;

        const discountPercentage = configResult.length > 0 && configResult[0].discount_percentage
            ? configResult[0].discount_percentage
            : 10;

        const googleMapsUrl = configResult.length > 0
            ? configResult[0].google_maps_url
            : 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36';

        // 4. Generar beneficio con descuento configurable
        let benefitCreated = false;
        if (survey.client_phone) {
            await sql`
                INSERT INTO benefits (
                    empresa_id,
                    survey_id,
                    client_phone,
                    benefit_type,
                    discount_percentage,
                    status
                ) VALUES (
                    ${survey.empresa_id},
                    ${survey.id},
                    ${survey.client_phone},
                    '10_PERCENT_OFF',
                    ${discountPercentage},
                    'pending'
                )
            `;
            benefitCreated = true;
        }

        return NextResponse.json({
            success: true,
            message: 'Gracias por tu respuesta',
            benefit: benefitCreated ? {
                type: '10_PERCENT_OFF',
                description: `${discountPercentage}% de descuento en cualquier servicio`,
                discountPercentage: discountPercentage
            } : null,
            showGoogleMaps: rating >= 4,
            googleMapsUrl: rating >= 4 ? googleMapsUrl : null
        });

    } catch (error) {
        console.error('Error al enviar respuesta de encuesta:', error);
        return NextResponse.json(
            { error: 'Error al procesar la encuesta' },
            { status: 500 }
        );
    }
}
