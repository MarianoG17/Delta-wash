import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const phone = searchParams.get('phone');

        if (!phone) {
            return NextResponse.json(
                { error: 'Teléfono es requerido' },
                { status: 400 }
            );
        }

        // Buscar beneficios pendientes para este teléfono en esta empresa
        const benefitsResult = await db`
            SELECT 
                b.id,
                b.benefit_type,
                b.created_at,
                s.visit_id,
                r.marca_modelo,
                r.patente,
                r.fecha_entregado
            FROM benefits b
            INNER JOIN surveys s ON s.id = b.survey_id
            LEFT JOIN registros_lavado r ON r.id = s.visit_id
            WHERE b.client_phone = ${phone}
            AND b.empresa_id = ${empresaId}
            AND b.status = 'pending'
            ORDER BY b.created_at DESC
        `;

        const benefits = Array.isArray(benefitsResult) ? benefitsResult : benefitsResult.rows || [];

        return NextResponse.json({
            hasBenefits: benefits.length > 0,
            totalPending: benefits.length,
            benefits: benefits.map((b: any) => ({
                id: b.id,
                type: b.benefit_type,
                description: b.benefit_type === '10_PERCENT_OFF' ? '10% de descuento' : 'Beneficio',
                createdAt: b.created_at,
                fromVisit: {
                    vehiculo: b.marca_modelo,
                    patente: b.patente,
                    fecha: b.fecha_entregado
                }
            }))
        });

    } catch (error) {
        console.error('Error al verificar beneficios:', error);
        return NextResponse.json(
            { error: 'Error al verificar beneficios' },
            { status: 500 }
        );
    }
}
