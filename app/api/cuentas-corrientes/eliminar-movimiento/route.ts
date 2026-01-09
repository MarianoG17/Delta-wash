import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { movimiento_id } = await request.json();

        if (!movimiento_id) {
            return NextResponse.json(
                { success: false, message: 'ID de movimiento requerido' },
                { status: 400 }
            );
        }

        // Obtener el movimiento para revertir el saldo
        const movimientoResult = await sql`
            SELECT * FROM movimientos_cuenta
            WHERE id = ${movimiento_id}
        `;

        if (movimientoResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Movimiento no encontrado' },
                { status: 404 }
            );
        }

        const movimiento = movimientoResult.rows[0];

        // Revertir el saldo de la cuenta corriente
        // Si era una carga, restamos el monto
        // Si era un descuento, sumamos el monto
        const ajuste = movimiento.tipo === 'carga' ? -movimiento.monto : movimiento.monto;

        await sql`
            UPDATE cuentas_corrientes
            SET saldo_actual = saldo_actual + ${ajuste},
                fecha_actualizacion = NOW()
            WHERE id = ${movimiento.cuenta_id}
        `;

        // Eliminar el movimiento
        await sql`
            DELETE FROM movimientos_cuenta
            WHERE id = ${movimiento_id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Movimiento eliminado y saldo revertido',
            movimiento_eliminado: {
                tipo: movimiento.tipo,
                monto: movimiento.monto,
                ajuste_aplicado: ajuste
            }
        });

    } catch (error) {
        console.error('Error eliminando movimiento:', error);
        return NextResponse.json(
            { success: false, message: 'Error al eliminar el movimiento' },
            { status: 500 }
        );
    }
}
