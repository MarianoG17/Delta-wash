import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const visitId = searchParams.get('visitId');

        if (!visitId) {
            return NextResponse.json(
                { error: 'visitId es requerido' },
                { status: 400 }
            );
        }

        // Obtener encuesta con respuesta si existe
        const surveyResult = await db`
            SELECT 
                s.id,
                s.survey_token,
                s.created_at,
                s.sent_at,
                s.responded_at,
                sr.rating,
                sr.comment
            FROM surveys s
            LEFT JOIN survey_responses sr ON sr.survey_id = s.id
            WHERE s.visit_id = ${visitId} 
            AND s.empresa_id = ${empresaId}
        `;

        const surveys = Array.isArray(surveyResult) ? surveyResult : surveyResult.rows || [];

        if (surveys.length === 0) {
            return NextResponse.json({ survey: null });
        }

        const survey = surveys[0];

        // Generar URL de WhatsApp
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const surveyUrl = `${baseUrl}/survey/${survey.survey_token}`;

        const whatsappMessage = `Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)\n👉 ${surveyUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

        return NextResponse.json({
            survey: {
                id: survey.id,
                token: survey.survey_token,
                createdAt: survey.created_at,
                sentAt: survey.sent_at,
                respondedAt: survey.responded_at,
                rating: survey.rating,
                comment: survey.comment,
                surveyUrl,
                whatsappUrl
            }
        });

    } catch (error) {
        console.error('Error al obtener encuesta:', error);
        return NextResponse.json(
            { error: 'Error al obtener encuesta' },
            { status: 500 }
        );
    }
}
