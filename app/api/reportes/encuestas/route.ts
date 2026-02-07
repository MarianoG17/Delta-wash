import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        let result;

        try {
            // Obtener encuestas con respuestas y datos del registro
            // SaaS: cada branch = una empresa (sin empresa_id)
            // Legacy: tabla global (sin empresa_id)
            result = await db`
                SELECT
                    s.id,
                    s.survey_token,
                    s.created_at,
                    s.sent_at,
                    s.responded_at,
                    s.client_phone,
                    sr.rating,
                    sr.comment,
                    sr.created_at as submitted_at,
                    r.marca_modelo,
                    r.patente,
                    r.nombre_cliente,
                    sb.estado as beneficio_estado,
                    sb.fecha_canje as beneficio_fecha_canje
                FROM surveys s
                LEFT JOIN survey_responses sr ON sr.survey_id = s.id
                LEFT JOIN registros_lavado r ON r.id = s.visit_id
                LEFT JOIN survey_benefits sb ON sb.survey_id = s.id
                ORDER BY s.created_at DESC
            `;
        } catch (queryError: any) {
            // Manejar error de tabla no existente
            if (queryError.message && queryError.message.includes('relation "surveys" does not exist')) {
                return NextResponse.json({
                    success: true,
                    error: 'TABLES_NOT_CREATED',
                    message: 'Las tablas del sistema de encuestas no existen aún. Por favor ejecuta la migración migration-sistema-encuestas-deltawash.sql en la base de datos.',
                    estadisticas: {
                        totalEncuestas: 0,
                        encuestasRespondidas: 0,
                        encuestasEnviadas: 0,
                        promedioRating: 0,
                        tasaRespuesta: 0,
                        distribucionRatings: { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }
                    },
                    encuestas: []
                });
            }
            throw queryError;
        }

        const surveys = Array.isArray(result) ? result : result.rows || [];

        // Calcular estadísticas
        const totalEncuestas = surveys.length;
        const encuestasRespondidas = surveys.filter((s: any) => s.responded_at).length;
        const encuestasEnviadas = surveys.filter((s: any) => s.sent_at).length;

        const ratingsArray = surveys
            .filter((s: any) => s.rating !== null)
            .map((s: any) => s.rating);

        const promedioRating = ratingsArray.length > 0
            ? ratingsArray.reduce((a: number, b: number) => a + b, 0) / ratingsArray.length
            : 0;

        // Distribución de ratings
        const distribucionRatings = {
            '5': surveys.filter((s: any) => s.rating === 5).length,
            '4': surveys.filter((s: any) => s.rating === 4).length,
            '3': surveys.filter((s: any) => s.rating === 3).length,
            '2': surveys.filter((s: any) => s.rating === 2).length,
            '1': surveys.filter((s: any) => s.rating === 1).length,
        };

        return NextResponse.json({
            success: true,
            estadisticas: {
                totalEncuestas,
                encuestasRespondidas,
                encuestasEnviadas,
                promedioRating: Math.round(promedioRating * 10) / 10,
                tasaRespuesta: totalEncuestas > 0
                    ? Math.round((encuestasRespondidas / totalEncuestas) * 100)
                    : 0,
                distribucionRatings
            },
            encuestas: surveys.map((s: any) => ({
                id: s.id,
                token: s.survey_token,
                createdAt: s.created_at,
                sentAt: s.sent_at,
                respondedAt: s.responded_at,
                clientPhone: s.client_phone,
                clientName: s.nombre_cliente,
                vehicle: s.marca_modelo,
                patente: s.patente,
                rating: s.rating,
                comment: s.comment,
                status: s.responded_at ? 'respondida' : (s.sent_at ? 'disparada' : 'creada'),
                beneficioEstado: s.beneficio_estado,
                beneficioFechaCanje: s.beneficio_fecha_canje
            }))
        });

    } catch (error) {
        console.error('Error al obtener reporte de encuestas:', error);
        return NextResponse.json(
            { error: 'Error al obtener reporte de encuestas' },
            { status: 500 }
        );
    }
}
