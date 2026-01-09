import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID de registro requerido' },
                { status: 400 }
            );
        }

        // Primero obtener el registro para verificar si usó cuenta corriente
        const registroResult = await sql`
            SELECT r.*, cc.id as cuenta_corriente_id, cc.saldo_actual
            FROM registros_lavado r
            LEFT JOIN cuentas_corrientes cc ON r.cuenta_corriente_id = cc.id
            WHERE r.id = ${id}
        `;

        if (registroResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registroResult.rows[0];

        // Si el registro usó cuenta corriente, revertir el movimiento
        if (registro.cuenta_corriente_id && registro.precio) {
            // Devolver el monto a la cuenta corriente
            await sql`
                UPDATE cuentas_corrientes
                SET saldo_actual = saldo_actual + ${registro.precio},
                    fecha_actualizacion = NOW()
                WHERE id = ${registro.cuenta_corriente_id}
            `;

            // Eliminar el movimiento de cuenta corriente asociado
            await sql`
                DELETE FROM movimientos_cuenta
                WHERE registro_id = ${id}
            `;
        }

        // Eliminar el registro
        await sql`
            DELETE FROM registros_lavado
            WHERE id = ${id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Registro eliminado exitosamente',
            cuenta_corriente_revertida: !!registro.cuenta_corriente_id
        });

    } catch (error) {
        console.error('Error eliminando registro:', error);
        return NextResponse.json(
            { success: false, message: 'Error al eliminar el registro' },
            { status: 500 }
        );
    }
}
