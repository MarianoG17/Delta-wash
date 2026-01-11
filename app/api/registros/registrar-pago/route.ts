import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { id, metodo_pago } = await request.json();

        if (!id || !metodo_pago) {
            return NextResponse.json(
                { success: false, message: 'ID y método de pago son requeridos' },
                { status: 400 }
            );
        }

        // Obtener el registro
        const registro = await sql`
            SELECT * FROM registros_lavado WHERE id = ${id}
        `;

        if (registro.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const reg = registro.rows[0];

        // Verificar que no esté ya pagado
        if (reg.pagado) {
            return NextResponse.json(
                { success: false, message: 'Este registro ya está marcado como pagado' },
                { status: 400 }
            );
        }

        // Registrar el pago
        await sql`
            UPDATE registros_lavado
            SET pagado = true,
                metodo_pago = ${metodo_pago},
                fecha_pago = NOW(),
                monto_pagado = precio
            WHERE id = ${id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Pago registrado exitosamente'
        });
    } catch (error) {
        console.error('Error registrando pago:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
