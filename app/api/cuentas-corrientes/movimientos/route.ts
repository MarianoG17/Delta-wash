import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const cuentaId = searchParams.get('cuenta_id');

        if (!cuentaId) {
            return NextResponse.json(
                { success: false, message: 'ID de cuenta corriente requerido' },
                { status: 400 }
            );
        }

        // Obtener información de la cuenta
        const cuentaResult = await sql`
            SELECT cc.*, c.nombre, c.celular
            FROM cuentas_corrientes cc
            JOIN clientes c ON cc.cliente_id = c.id
            WHERE cc.id = ${cuentaId}
        `;

        if (cuentaResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Cuenta corriente no encontrada' },
                { status: 404 }
            );
        }

        const cuenta = cuentaResult.rows[0];

        // Obtener todos los movimientos de la cuenta
        const movimientosResult = await sql`
            SELECT
                mc.id,
                mc.tipo,
                mc.monto,
                mc.saldo_anterior,
                mc.saldo_nuevo,
                mc.descripcion,
                mc.fecha as fecha_movimiento,
                mc.registro_id,
                r.patente,
                r.marca_modelo,
                r.tipo_limpieza,
                u.nombre as usuario_nombre
            FROM movimientos_cuenta mc
            LEFT JOIN registros r ON mc.registro_id = r.id
            LEFT JOIN usuarios u ON mc.usuario_id = u.id
            WHERE mc.cuenta_id = ${cuentaId}
            ORDER BY mc.fecha DESC
        `;

        return NextResponse.json({
            success: true,
            cuenta: {
                id: cuenta.id,
                cliente_nombre: cuenta.nombre,
                celular: cuenta.celular,
                saldo_actual: cuenta.saldo_actual,
                fecha_creacion: cuenta.fecha_creacion,
                fecha_actualizacion: cuenta.fecha_actualizacion
            },
            movimientos: movimientosResult.rows
        });

    } catch (error) {
        console.error('Error obteniendo movimientos:', error);
        return NextResponse.json(
            { success: false, message: 'Error al obtener movimientos' },
            { status: 500 }
        );
    }
}
