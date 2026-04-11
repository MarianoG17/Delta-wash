import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { caja_id, notas_cierre, usuario_id, efectivo_contado, saldo_esperado } = await request.json();

        if (!caja_id) {
            return NextResponse.json({ success: false, message: 'caja_id requerido' }, { status: 400 });
        }

        const diferencia = efectivo_contado != null && saldo_esperado != null
            ? parseFloat(efectivo_contado) - parseFloat(saldo_esperado)
            : null;

        const result = await db`
            UPDATE cajas
            SET estado = 'cerrada',
                notas_cierre = ${notas_cierre || null},
                usuario_cierre = ${usuario_id || null},
                closed_at = NOW(),
                efectivo_contado = ${efectivo_contado != null ? parseFloat(efectivo_contado) : null},
                diferencia_cierre = ${diferencia}
            WHERE id = ${caja_id} AND estado = 'abierta'
            RETURNING *
        `;
        const caja = Array.isArray(result) ? result[0] : result.rows?.[0];

        if (!caja) {
            return NextResponse.json({ success: false, message: 'Caja no encontrada o ya cerrada' }, { status: 404 });
        }

        return NextResponse.json({ success: true, caja });
    } catch (error) {
        console.error('Error cerrando caja:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}
