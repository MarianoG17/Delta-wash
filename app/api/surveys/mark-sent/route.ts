import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { surveyId } = await request.json();

        if (!surveyId) {
            return NextResponse.json(
                { error: 'surveyId es requerido' },
                { status: 400 }
            );
        }

        // Buscar la encuesta por ID directo (más eficiente y correcto)
        const surveyResult = await db`
            SELECT id, responded_at
            FROM surveys
            WHERE id = ${surveyId}
        `;

        const surveys = Array.isArray(surveyResult) ? surveyResult : surveyResult.rows || [];

        if (surveys.length === 0) {
            return NextResponse.json(
                { error: 'Encuesta no encontrada' },
                { status: 404 }
            );
        }

        const survey = surveys[0];

        // Si ya está respondida, no permitir marcar como enviada nuevamente
        if (survey.responded_at) {
            return NextResponse.json({
                success: false,
                message: 'La encuesta ya fue respondida'
            });
        }

        // Marcar como enviada (disparada)
        await db`
            UPDATE surveys
            SET sent_at = CURRENT_TIMESTAMP
            WHERE id = ${survey.id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Encuesta marcada como disparada'
        });

    } catch (error) {
        console.error('Error al marcar encuesta como enviada:', error);
        return NextResponse.json(
            { error: 'Error al marcar encuesta como enviada' },
            { status: 500 }
        );
    }
}
