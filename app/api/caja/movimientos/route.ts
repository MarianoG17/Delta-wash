import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// POST: agregar egreso/retiro a la caja
export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { caja_id, tipo, categoria, descripcion, monto, usuario_id, metodo_pago } = await request.json();

        if (!caja_id || !tipo || !monto) {
            return NextResponse.json({ success: false, message: 'caja_id, tipo y monto son requeridos' }, { status: 400 });
        }

        if (parseFloat(monto) <= 0) {
            return NextResponse.json({ success: false, message: 'El monto debe ser mayor a cero' }, { status: 400 });
        }

        // Verificar que la caja esté abierta
        const cajaResult = await db`SELECT id, estado FROM cajas WHERE id = ${caja_id}`;
        const cajas = Array.isArray(cajaResult) ? cajaResult : cajaResult.rows || [];
        if (cajas.length === 0 || cajas[0].estado !== 'abierta') {
            return NextResponse.json({ success: false, message: 'La caja no está abierta' }, { status: 400 });
        }

        const result = await db`
            INSERT INTO movimientos_caja (caja_id, tipo, categoria, descripcion, monto, usuario_id, metodo_pago)
            VALUES (${caja_id}, ${tipo}, ${categoria || null}, ${descripcion || null}, ${monto}, ${usuario_id || null}, ${metodo_pago || 'efectivo'})
            RETURNING *
        `;
        const movimiento = Array.isArray(result) ? result[0] : result.rows?.[0];

        return NextResponse.json({ success: true, movimiento });
    } catch (error) {
        console.error('Error agregando movimiento:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}

// DELETE: eliminar movimiento por id (query param)
export async function DELETE(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ success: false, message: 'id requerido' }, { status: 400 });
        }

        await db`DELETE FROM movimientos_caja WHERE id = ${id}`;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error eliminando movimiento:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}
