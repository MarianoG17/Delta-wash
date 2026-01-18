import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// Obtener todas las cuentas corrientes o buscar por celular
export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const celular = searchParams.get('celular');
        const activas = searchParams.get('activas');

        let query;
        if (celular) {
            query = db`
                SELECT * FROM cuentas_corrientes 
                WHERE celular = ${celular}
                LIMIT 1
            `;
        } else if (activas === 'true') {
            query = db`
                SELECT * FROM cuentas_corrientes 
                WHERE activa = true AND saldo_actual > 0
                ORDER BY nombre_cliente ASC
            `;
        } else {
            query = db`
                SELECT * FROM cuentas_corrientes 
                ORDER BY fecha_creacion DESC
            `;
        }

        const result = await query;

        // Manejar diferencias entre drivers (pg vs neon)
        const data = Array.isArray(result) ? result : result.rows || [];

        if (celular) {
            return NextResponse.json({
                success: true,
                cuenta: data[0] || null,
                found: data.length > 0,
            });
        }

        return NextResponse.json({
            success: true,
            cuentas: data,
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
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

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
        const existente = await db`
            SELECT id FROM cuentas_corrientes WHERE celular = ${celular}
        `;

        const existenteData = Array.isArray(existente) ? existente : existente.rows || [];

        if (existenteData.length > 0) {
            return NextResponse.json(
                { success: false, message: 'Ya existe una cuenta corriente para este celular' },
                { status: 400 }
            );
        }

        // Crear la cuenta
        const result = await db`
            INSERT INTO cuentas_corrientes (
                nombre_cliente, celular, saldo_inicial, saldo_actual, notas, activa
            ) VALUES (
                ${nombre_cliente}, ${celular}, ${saldo_inicial}, ${saldo_inicial}, ${notas || null}, true
            )
            RETURNING *
        `;

        const resultData = Array.isArray(result) ? result : result.rows || [];

        return NextResponse.json({
            success: true,
            cuenta: resultData[0],
        });
    } catch (error) {
        console.error('Error creando cuenta corriente:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
