import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
// HYBRID ROUTING: Soporta Legacy (DATABASE_URL) y SaaS (survey_lookup)
// Usa IS_SAAS_PROJECT env var para decidir el flujo
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

        // Detectar modo: SaaS (lavapp) o Legacy (deltawash-app)
        const isSaasProject = process.env.IS_SAAS_PROJECT === 'true';

        // ========== MODO SAAS: Usar survey_lookup ==========
        if (isSaasProject) {
            const centralDbUrl = process.env.CENTRAL_DB_URL;
            if (!centralDbUrl) {
                console.error('[Survey Submit SaaS] CENTRAL_DB_URL no configurada');
                return NextResponse.json(
                    { error: 'Configuración de base de datos no disponible' },
                    { status: 500 }
                );
            }

            try {
                const centralSql = neon(centralDbUrl);
                
                // Buscar en survey_lookup
                const lookupResult = await centralSql`
                    SELECT sl.branch_url, sl.empresa_id
                    FROM survey_lookup sl
                    WHERE sl.survey_token = ${token}
                `;

                if (lookupResult.length === 0) {
                    console.error(`[Survey Submit SaaS] Token not found in survey_lookup: ${token}`);
                    return NextResponse.json(
                        { error: 'Encuesta no encontrada' },
                        { status: 404 }
                    );
                }

                const lookup = lookupResult[0];
                const branchUrl = lookup.branch_url;
                const empresaId = lookup.empresa_id;

                // Conectar al branch específico del cliente
                const sql = neon(branchUrl);
                
                // Verificar que la encuesta existe
                const surveyResult = await sql`
                    SELECT id, client_phone, responded_at
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

                // 3. Obtener config (opcional, usar defaults si no existe)
                let discountPercentage = 10;
                let googleMapsUrl = 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36';

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
                    // Si no existe survey_config, usar defaults (tabla opcional)
                    console.log('[Survey Submit SaaS] survey_config not found, using defaults');
                }

                // 4. Generar beneficio con descuento configurable
                let benefitCreated = false;
                if (survey.client_phone) {
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
                console.error('[Survey Submit SaaS] Error:', error);
                return NextResponse.json(
                    { error: 'Error al procesar la encuesta' },
                    { status: 500 }
                );
            }
        }

        // ========== MODO LEGACY: Usar DATABASE_URL directamente ==========
        else {
            const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
            if (!connectionString) {
                throw new Error('No database connection string configured');
            }

            const sql = neon(connectionString);

            // Verificar que la encuesta existe (sin empresa_id)
            const surveyResult = await sql`
                SELECT id, client_phone, responded_at
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

            // 3. Obtener config (DeltaWash Legacy)
            let discountPercentage = 10;
            let googleMapsUrl = 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36';

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

            // 4. Generar beneficio
            let benefitCreated = false;
            if (survey.client_phone) {
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
        }

    } catch (error) {
        console.error('Error al enviar respuesta de encuesta:', error);
        return NextResponse.json(
            { error: 'Error al procesar la encuesta' },
            { status: 500 }
        );
    }
}
