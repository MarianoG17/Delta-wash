import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // Obtener beneficios con datos relacionados
        const result = await db`
            SELECT 
                b.id,
                b.benefit_type,
                b.status,
                b.created_at,
                b.redeemed_at,
                b.client_phone,
                b.notes,
                s.survey_token,
                sr.rating,
                r.marca_modelo,
                r.patente,
                r.nombre_cliente,
                u.nombre as redeemed_by_user_name
            FROM benefits b
            INNER JOIN surveys s ON s.id = b.survey_id
            LEFT JOIN survey_responses sr ON sr.survey_id = s.id
            LEFT JOIN registros_lavado r ON r.id = s.visit_id
            LEFT JOIN usuarios u ON u.id = b.redeemed_by_user_id
            WHERE b.empresa_id = ${empresaId}
            ORDER BY b.created_at DESC
        `;

        const benefits = Array.isArray(result) ? result : result.rows || [];

        // Calcular estadísticas
        const totalBeneficios = benefits.length;
        const beneficiosPendientes = benefits.filter((b: any) => b.status === 'pending').length;
        const beneficiosCanjeados = benefits.filter((b: any) => b.status === 'redeemed').length;
        const tasaCanje = totalBeneficios > 0
            ? Math.round((beneficiosCanjeados / totalBeneficios) * 100)
            : 0;

        return NextResponse.json({
            success: true,
            estadisticas: {
                totalBeneficios,
                beneficiosPendientes,
                beneficiosCanjeados,
                tasaCanje
            },
            beneficios: benefits.map((b: any) => ({
                id: b.id,
                type: b.benefit_type,
                description: b.benefit_type === '10_PERCENT_OFF' ? '10% de descuento' : 'Beneficio',
                status: b.status,
                createdAt: b.created_at,
                redeemedAt: b.redeemed_at,
                clientPhone: b.client_phone,
                clientName: b.nombre_cliente,
                vehicle: b.marca_modelo,
                patente: b.patente,
                rating: b.rating,
                notes: b.notes,
                redeemedBy: b.redeemed_by_user_name
            }))
        });

    } catch (error) {
        console.error('Error al obtener reporte de beneficios:', error);
        return NextResponse.json(
            { error: 'Error al obtener reporte de beneficios' },
            { status: 500 }
        );
    }
}
