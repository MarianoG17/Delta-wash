import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken, getTokenPayload } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // Obtener ID del usuario que está canjeando
        const tokenPayload = await getTokenPayload(request);
        const userId = tokenPayload?.userId;

        const { benefitId, notes } = await request.json();

        if (!benefitId) {
            return NextResponse.json(
                { error: 'benefitId es requerido' },
                { status: 400 }
            );
        }

        // Verificar que el beneficio existe y está pendiente
        // Para SaaS: verificar empresa_id si existe
        // Para DeltaWash: no hay empresa_id (cada branch es una empresa)
        const benefitResult = await db`
            SELECT id, status
            FROM benefits
            WHERE id = ${benefitId}
        `;

        const benefits = Array.isArray(benefitResult) ? benefitResult : benefitResult.rows || [];

        if (benefits.length === 0) {
            return NextResponse.json(
                { error: 'Beneficio no encontrado' },
                { status: 404 }
            );
        }

        const benefit = benefits[0];

        // Verificar que está pendiente
        if (benefit.status !== 'pending') {
            return NextResponse.json(
                { error: 'Este beneficio ya fue canjeado' },
                { status: 400 }
            );
        }

        // Canjear el beneficio
        await db`
            UPDATE benefits
            SET status = 'redeemed',
                redeemed_at = CURRENT_TIMESTAMP,
                redeemed_by_user_id = ${userId || null},
                notes = ${notes || null}
            WHERE id = ${benefitId}
        `;

        return NextResponse.json({
            success: true,
            message: 'Beneficio canjeado exitosamente'
        });

    } catch (error) {
        console.error('Error al canjear beneficio:', error);
        return NextResponse.json(
            { error: 'Error al canjear beneficio' },
            { status: 500 }
        );
    }
}
