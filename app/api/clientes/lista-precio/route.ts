import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: obtener lista_precio_id para una lista de celulares
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const result = await db`
            SELECT celular, lista_precio_id, id as cuenta_id
            FROM cuentas_corrientes
            WHERE lista_precio_id IS NOT NULL
        `;

        const data = Array.isArray(result) ? result : result.rows || [];

        return NextResponse.json({ success: true, asignaciones: data });
    } catch (error) {
        console.error('Error obteniendo listas por cliente:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}

// PUT: asignar lista de precios a un cliente por celular (upsert)
export async function PUT(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { celular, nombre_cliente, lista_precio_id } = await request.json();

        if (!celular) {
            return NextResponse.json(
                { success: false, message: 'celular es requerido' },
                { status: 400 }
            );
        }

        // Verificar si ya existe una cuenta corriente para este celular
        const existente = await db`
            SELECT id FROM cuentas_corrientes WHERE celular = ${celular}
        `;
        const existenteData = Array.isArray(existente) ? existente : existente.rows || [];

        if (existenteData.length > 0) {
            // Actualizar la lista en la cuenta existente
            await db`
                UPDATE cuentas_corrientes
                SET lista_precio_id = ${lista_precio_id || null}
                WHERE celular = ${celular}
            `;
        } else {
            // Crear entrada mínima solo para asignar la lista (saldo 0)
            await db`
                INSERT INTO cuentas_corrientes (nombre_cliente, celular, saldo_inicial, saldo_actual, lista_precio_id, activa)
                VALUES (${nombre_cliente || celular}, ${celular}, 0, 0, ${lista_precio_id || null}, true)
            `;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error asignando lista de precios:', error);
        return NextResponse.json({ success: false, message: 'Error del servidor' }, { status: 500 });
    }
}
