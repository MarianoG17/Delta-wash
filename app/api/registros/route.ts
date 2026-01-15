import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const estado = searchParams.get('estado');
        const incluirAnulados = searchParams.get('incluir_anulados') === 'true';

        let query;
        if (estado) {
            if (incluirAnulados) {
                query = db`
                    SELECT * FROM registros_lavado
                    WHERE estado = ${estado}
                    ORDER BY fecha_ingreso DESC
                `;
            } else {
                query = db`
                    SELECT * FROM registros_lavado
                    WHERE estado = ${estado} AND (anulado IS NULL OR anulado = FALSE)
                    ORDER BY fecha_ingreso DESC
                `;
            }
        } else {
            if (incluirAnulados) {
                query = db`
                    SELECT * FROM registros_lavado
                    ORDER BY fecha_ingreso DESC
                `;
            } else {
                query = db`
                    SELECT * FROM registros_lavado
                    WHERE (anulado IS NULL OR anulado = FALSE)
                    ORDER BY fecha_ingreso DESC
                `;
            }
        }

        const result = await query;

        return NextResponse.json({
            success: true,
            registros: result.rows,
        });
    } catch (error) {
        console.error('Error obteniendo registros:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}

// Función para capitalizar nombres (primera letra de cada palabra en mayúscula)
function capitalizarNombre(nombre: string): string {
    return nombre
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, extras, extras_valor, precio, usuario_id, usa_cuenta_corriente, cuenta_corriente_id, pagado, metodo_pago } = await request.json();

        if (!marca_modelo || !patente || !tipo_limpieza || !nombre_cliente || !celular) {
            return NextResponse.json(
                { success: false, message: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Normalizar nombre del cliente (capitalizar)
        const nombreNormalizado = capitalizarNombre(nombre_cliente.trim());

        // Si usa cuenta corriente, verificar saldo y descontar
        if (usa_cuenta_corriente && cuenta_corriente_id) {
            // Obtener cuenta
            const cuentaResult = await db`
                SELECT * FROM cuentas_corrientes WHERE id = ${cuenta_corriente_id}
            `;

            if (cuentaResult.rows.length === 0) {
                return NextResponse.json(
                    { success: false, message: 'Cuenta corriente no encontrada' },
                    { status: 404 }
                );
            }

            const cuenta = cuentaResult.rows[0];
            const saldoActual = parseFloat(cuenta.saldo_actual);
            const precioServicio = parseFloat(precio) || 0;

            if (saldoActual < precioServicio) {
                return NextResponse.json(
                    { success: false, message: `Saldo insuficiente. Saldo actual: $${saldoActual.toLocaleString('es-AR')}` },
                    { status: 400 }
                );
            }

            const nuevoSaldo = saldoActual - precioServicio;

            // Crear el registro (cuenta corriente siempre se considera pagado)
            const result = await db`
                INSERT INTO registros_lavado (
                    marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, extras, extras_valor, precio, usuario_id, estado, usa_cuenta_corriente, cuenta_corriente_id, pagado, metodo_pago, fecha_pago, monto_pagado
                ) VALUES (
                    ${marca_modelo}, ${patente.toUpperCase()}, ${tipo_vehiculo || 'auto'}, ${tipo_limpieza}, ${nombreNormalizado}, ${celular}, ${extras || null}, ${extras_valor || 0}, ${precio || 0}, ${usuario_id}, 'en_proceso', true, ${cuenta_corriente_id}, true, 'cuenta_corriente', NOW(), ${precio || 0}
                )
                RETURNING *
            `;

            const registroId = result.rows[0].id;

            // Actualizar saldo de cuenta corriente
            await db`
                UPDATE cuentas_corrientes
                SET saldo_actual = ${nuevoSaldo},
                    activa = ${nuevoSaldo > 0}
                WHERE id = ${cuenta_corriente_id}
            `;

            // Registrar movimiento
            await db`
                INSERT INTO movimientos_cuenta (
                    cuenta_id, registro_id, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, usuario_id
                ) VALUES (
                    ${cuenta_corriente_id}, ${registroId}, 'descuento', ${precioServicio}, ${saldoActual}, ${nuevoSaldo}, ${`Lavado ${tipo_limpieza} - ${patente.toUpperCase()}`}, ${usuario_id}
                )
            `;

            return NextResponse.json({
                success: true,
                registro: result.rows[0],
                cuenta_corriente: {
                    saldo_anterior: saldoActual,
                    saldo_nuevo: nuevoSaldo,
                    monto_descontado: precioServicio
                }
            });
        } else {
            // Registro normal sin cuenta corriente
            let result;
            if (pagado && metodo_pago) {
                result = await db`
                    INSERT INTO registros_lavado (
                        marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, extras, extras_valor, precio, usuario_id, estado, usa_cuenta_corriente, pagado, metodo_pago, fecha_pago, monto_pagado
                    ) VALUES (
                        ${marca_modelo}, ${patente.toUpperCase()}, ${tipo_vehiculo || 'auto'}, ${tipo_limpieza}, ${nombreNormalizado}, ${celular}, ${extras || null}, ${extras_valor || 0}, ${precio || 0}, ${usuario_id}, 'en_proceso', false, true, ${metodo_pago}, NOW(), ${precio || 0}
                    )
                    RETURNING *
                `;
            } else {
                result = await db`
                    INSERT INTO registros_lavado (
                        marca_modelo, patente, tipo_vehiculo, tipo_limpieza, nombre_cliente, celular, extras, extras_valor, precio, usuario_id, estado, usa_cuenta_corriente, pagado
                    ) VALUES (
                        ${marca_modelo}, ${patente.toUpperCase()}, ${tipo_vehiculo || 'auto'}, ${tipo_limpieza}, ${nombreNormalizado}, ${celular}, ${extras || null}, ${extras_valor || 0}, ${precio || 0}, ${usuario_id}, 'en_proceso', false, false
                    )
                    RETURNING *
                `;
            }

            return NextResponse.json({
                success: true,
                registro: result.rows[0],
            });
        }
    } catch (error) {
        console.error('Error creando registro:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
