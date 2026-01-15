import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const cuentaId = searchParams.get('cuenta_id');

        if (!cuentaId) {
            return NextResponse.json(
                { success: false, message: 'ID de cuenta corriente requerido' },
                { status: 400 }
            );
        }

        // Obtener información de la cuenta (sin JOIN con clientes)
        const cuentaResult = await db`
            SELECT *
            FROM cuentas_corrientes
            WHERE id = ${cuentaId}
        `;

        if (cuentaResult.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Cuenta corriente no encontrada' },
                { status: 404 }
            );
        }

        const cuenta = cuentaResult.rows[0];

        // Intentar obtener movimientos (puede fallar si la tabla no existe)
        let movimientos = [];
        try {
            const movimientosResult = await db`
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
                LEFT JOIN registros_lavado r ON mc.registro_id = r.id
                LEFT JOIN usuarios u ON mc.usuario_id = u.id
                WHERE mc.cuenta_id = ${cuentaId}
                ORDER BY mc.id DESC
            `;
            movimientos = movimientosResult.rows;
        } catch (movError: any) {
            console.error('Error obteniendo movimientos:', movError);
            // Si la tabla no existe, devolver array vacío con mensaje
            if (movError.message && movError.message.includes('does not exist')) {
                return NextResponse.json({
                    success: false,
                    message: 'La tabla movimientos_cuenta no existe. Ejecuta la migración en Neon.',
                    error_detail: movError.message
                }, { status: 500 });
            }
            throw movError;
        }

        return NextResponse.json({
            success: true,
            cuenta: {
                id: cuenta.id,
                cliente_nombre: cuenta.nombre_cliente,
                celular: cuenta.celular,
                saldo_actual: cuenta.saldo_actual,
                fecha_creacion: cuenta.fecha_creacion,
                fecha_actualizacion: cuenta.fecha_actualizacion
            },
            movimientos: movimientos
        });

    } catch (error: any) {
        console.error('Error obteniendo movimientos:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error al obtener movimientos',
                error_detail: error.message || 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
