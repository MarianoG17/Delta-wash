import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { id, motivo, usuario_id } = await request.json();

        if (!id || !usuario_id) {
            return NextResponse.json(
                { success: false, message: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        // Obtener el registro para verificar si existe y si usó cuenta corriente
        const registroResult = await sql`
            SELECT * FROM registros_lavado 
            WHERE id = ${id}
        `;

        if (registroResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registroResult.rows[0];

        // Verificar si ya está anulado
        if (registro.anulado) {
            return NextResponse.json(
                { success: false, message: 'Este registro ya está anulado' },
                { status: 400 }
            );
        }

        // Si el registro usó cuenta corriente, revertir el saldo
        if (registro.cuenta_corriente_id && registro.precio) {
            // Revertir el saldo (devolver el dinero)
            await sql`
                UPDATE cuentas_corrientes 
                SET saldo_actual = saldo_actual + ${registro.precio}
                WHERE id = ${registro.cuenta_corriente_id}
            `;

            // Marcar el movimiento como anulado (si existe)
            await sql`
                UPDATE movimientos_cuenta
                SET descripcion = CONCAT(descripcion, ' [ANULADO]')
                WHERE registro_id = ${id}
            `;
        }

        // Marcar el registro como anulado (NO eliminarlo)
        await sql`
            UPDATE registros_lavado 
            SET 
                anulado = TRUE,
                fecha_anulacion = NOW(),
                motivo_anulacion = ${motivo || 'Sin motivo especificado'},
                usuario_anulacion_id = ${usuario_id}
            WHERE id = ${id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Registro anulado correctamente',
            saldo_revertido: registro.cuenta_corriente_id ? registro.precio : null
        });

    } catch (error) {
        console.error('Error al anular registro:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error al anular registro',
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
