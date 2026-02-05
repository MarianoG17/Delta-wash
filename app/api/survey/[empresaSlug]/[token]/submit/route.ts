import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// Esta API es PÚBLICA - no requiere autenticación
export async function POST(
    request: Request,
    context: { params: Promise<{ empresaSlug: string; token: string }> }
) {
    try {
        const params = await context.params;
        const { empresaSlug, token } = params;
        const { rating, comment } = await request.json();

        if (!token || !empresaSlug) {
            return NextResponse.json(
                { error: 'Token o empresa inválidos' },
                { status: 400 }
            );
        }

        if (!rating || rating < 1 || rating > 5) {
            return NextResponse.json(
                { error: 'Calificación inválida (debe ser 1-5)' },
                { status: 400 }
            );
        }

        // Conectar a BD central para obtener branch URL
        const centralConnectionString = process.env.CENTRAL_DB_URL;
        if (!centralConnectionString) {
            console.error('[Survey Submit] CENTRAL_DB_URL no configurada');
            return NextResponse.json(
                { error: 'Configuración de base de datos no disponible' },
                { status: 500 }
            );
        }

        const centralSql = neon(centralConnectionString);

        // Obtener datos de la empresa
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
            console.error(`[Survey Submit] Empresa ${empresaSlug} sin branch_url`);
            return NextResponse.json(
                { error: 'Configuración de empresa incompleta' },
                { status: 500 }
            );
        }

        // Conectar al branch de la empresa
        const branchSql = neon(empresa.branch_url);

        // Verificar que la encuesta existe y no fue respondida
        const surveyResult = await branchSql`
            SELECT id, responded_at, client_phone
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

        // Insertar respuesta
        await branchSql`
            INSERT INTO survey_responses (survey_id, rating, comment)
            VALUES (${survey.id}, ${rating}, ${comment || null})
        `;

        // Actualizar timestamp de respuesta
        await branchSql`
            UPDATE surveys
            SET responded_at = CURRENT_TIMESTAMP
            WHERE id = ${survey.id}
        `;

        // Si rating >= 4, generar beneficio
        if (rating >= 4 && survey.client_phone) {
            try {
                await branchSql`
                    INSERT INTO benefits (
                        survey_id,
                        client_phone,
                        benefit_type,
                        status
                    ) VALUES (
                        ${survey.id},
                        ${survey.client_phone},
                        '10_PERCENT_OFF',
                        'pending'
                    )
                `;
            } catch (error) {
                console.error('[Survey Submit] Error al crear beneficio:', error);
                // No fallar la respuesta si el beneficio falla
            }
        }

        // Obtener configuración para saber si mostrar Google Maps
        let shouldRedirectToGoogle = false;
        let googleMapsUrl = null;

        try {
            const configResult = await branchSql`
                SELECT 
                    google_maps_link,
                    requiere_calificacion_minima
                FROM configuracion_encuestas
                LIMIT 1
            `;

            if (configResult.length > 0) {
                const config = configResult[0];
                const minRating = config.requiere_calificacion_minima || 4;
                
                if (rating >= minRating && config.google_maps_link) {
                    shouldRedirectToGoogle = true;
                    googleMapsUrl = config.google_maps_link;
                }
            }
        } catch (error) {
            console.error('[Survey Submit] Error al obtener config:', error);
        }

        return NextResponse.json({
            success: true,
            message: '¡Gracias por tu respuesta!',
            benefitGenerated: rating >= 4,
            redirectToGoogle: shouldRedirectToGoogle,
            googleMapsUrl: googleMapsUrl
        });

    } catch (error) {
        console.error('[Survey Submit] Error al procesar respuesta:', error);
        return NextResponse.json(
            { error: 'Error al procesar respuesta' },
            { status: 500 }
        );
    }
}
