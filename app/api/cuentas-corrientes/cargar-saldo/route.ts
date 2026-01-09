import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { cuenta_id, monto, descripcion, usuario_id } = await request.json();

        if (!cuenta_id || !monto) {
            return NextResponse.json(
                { success: false, message: 'Cuenta ID y monto son requeridos' },
                { status: 400 }
            );
        }

        if (monto <= 0) {
            return NextResponse.json(
                { success: false, message: 'El monto debe ser mayor a 0' },
                { status: 400 }
            );
        }

        // Obtener cuenta actual
        const cuentaResult = await sql`
            SELECT * FROM cuentas_corrientes WHERE id = ${cuenta_id}
        `;

        if (cuentaResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Cuenta no encontrada' },
                { status: 404 }
            );
        }

        const cuenta = cuentaResult.rows[0];
        const saldoAnterior = parseFloat(cuenta.saldo_actual);
        const saldoNuevo = saldoAnterior + parseFloat(monto);

        // Actualizar saldo de la cuenta
        await sql`
            UPDATE cuentas_corrientes 
            SET saldo_actual = ${saldoNuevo},
                activa = true
            WHERE id = ${cuenta_id}
        `;

        // Registrar movimiento
        await sql`
            INSERT INTO movimientos_cuenta (
                cuenta_id, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, usuario_id
            ) VALUES (
                ${cuenta_id}, 'carga', ${monto}, ${saldoAnterior}, ${saldoNuevo}, ${descripcion || 'Carga de saldo'}, ${usuario_id}
            )
        `;

        return NextResponse.json({
            success: true,
            saldo_anterior: saldoAnterior,
            saldo_nuevo: saldoNuevo,
            monto_cargado: parseFloat(monto),
        });
    } catch (error) {
        console.error('Error cargando saldo:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
