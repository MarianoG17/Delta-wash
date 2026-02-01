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

        // Conectar a BD (priorizar DATABASE_URL, sino POSTGRES_URL)
        const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
        if (!connectionString) {
            throw new Error('No database connection string configured');
        }

        const sql = neon(connectionString);

        // Verificar que la encuesta existe (detectar SaaS vs DeltaWash)
        let surveyResult;
        let empresaId = null;
        
        try {
            // Intentar con empresa_id (SaaS)
            surveyResult = await sql`
                SELECT id, empresa_id, client_phone, responded_at
                FROM surveys
                WHERE survey_token = ${token}
            `;
            empresaId = surveyResult[0]?.empresa_id;
        } catch (error: any) {
            // Si falla (columna no existe), intentar sin empresa_id (DeltaWash Legacy)
            if (error?.code === '42703') {
                surveyResult = await sql`
                    SELECT id, client_phone, responded_at
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

        // 3. Obtener config (tenant_survey_config para SaaS, survey_config para DeltaWash)
        let discountPercentage = 10;
        let googleMapsUrl = 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36';

        if (empresaId) {
            // SaaS: usar tenant_survey_config
            const configResult = await sql`
                SELECT google_maps_url, discount_percentage
                FROM tenant_survey_config
                WHERE empresa_id = ${empresaId}
            `;
            if (configResult.length > 0) {
                discountPercentage = configResult[0].discount_percentage || 10;
                googleMapsUrl = configResult[0].google_maps_url || googleMapsUrl;
            }
        } else {
            // DeltaWash Legacy: usar survey_config (id=1)
            try {
                const configResult = await sql`
                    SELECT google_maps_url, discount_percentage
                    FROM survey_config
                    WHERE id = 1
                `;
                if (configResult.length > 0) {
                    discountPercentage = configResult[0].discount_percentage || 10;
                    googleMapsUrl = configResult[0].google_maps_url || googleMapsUrl;
                }
            } catch (error) {
                // Si no existe survey_config, usar defaults
            }
        }

        // 4. Generar beneficio con descuento configurable
        let benefitCreated = false;
        if (survey.client_phone) {
            if (empresaId) {
                // SaaS: incluir empresa_id
                await sql`
                    INSERT INTO benefits (
                        empresa_id,
                        survey_id,
                        client_phone,
                        benefit_type,
                        discount_percentage,
                        status
                    ) VALUES (
                        ${empresaId},
                        ${survey.id},
                        ${survey.client_phone},
                        '10_PERCENT_OFF',
                        ${discountPercentage},
                        'pending'
                    )
                `;
            } else {
                // DeltaWash Legacy: sin empresa_id
                await sql`
                    INSERT INTO benefits (
                        survey_id,
                        client_phone,
                        benefit_type,
                        discount_percentage,
                        status
                    ) VALUES (
                        ${survey.id},
                        ${survey.client_phone},
                        '10_PERCENT_OFF',
                        ${discountPercentage},
                        'pending'
                    )
                `;
            }
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
