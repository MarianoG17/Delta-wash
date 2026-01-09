import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Obtener todas las cuentas corrientes o buscar por celular
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const celular = searchParams.get('celular');
        const activas = searchParams.get('activas');

        let query;
        if (celular) {
            query = sql`
                SELECT * FROM cuentas_corrientes 
                WHERE celular = ${celular}
                LIMIT 1
            `;
        } else if (activas === 'true') {
            query = sql`
                SELECT * FROM cuentas_corrientes 
                WHERE activa = true AND saldo_actual > 0
                ORDER BY nombre_cliente ASC
            `;
        } else {
            query = sql`
                SELECT * FROM cuentas_corrientes 
                ORDER BY fecha_creacion DESC
            `;
        }

        const result = await query;

        if (celular) {
            return NextResponse.json({
                success: true,
                cuenta: result.rows[0] || null,
                found: result.rows.length > 0,
            });
        }

        return NextResponse.json({
            success: true,
            cuentas: result.rows,
        });
    } catch (error) {
        console.error('Error obteniendo cuentas corrientes:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}

// Crear nueva cuenta corriente
export async function POST(request: Request) {
    try {
        const { nombre_cliente, celular, saldo_inicial, notas } = await request.json();

        if (!nombre_cliente || !celular || !saldo_inicial) {
            return NextResponse.json(
                { success: false, message: 'Nombre, celular y saldo inicial son requeridos' },
                { status: 400 }
            );
        }

        if (saldo_inicial <= 0) {
            return NextResponse.json(
                { success: false, message: 'El saldo inicial debe ser mayor a 0' },
                { status: 400 }
            );
        }

        // Verificar si ya existe una cuenta con ese celular
        const existente = await sql`
            SELECT id FROM cuentas_corrientes WHERE celular = ${celular}
        `;

        if (existente.rows.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Ya existe una cuenta corriente para este celular' },
                { status: 400 }
            );
        }

        // Crear la cuenta
        const result = await sql`
            INSERT INTO cuentas_corrientes (
                nombre_cliente, celular, saldo_inicial, saldo_actual, notas, activa
            ) VALUES (
                ${nombre_cliente}, ${celular}, ${saldo_inicial}, ${saldo_inicial}, ${notas || null}, true
            )
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            cuenta: result.rows[0],
        });
    } catch (error) {
        console.error('Error creando cuenta corriente:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
