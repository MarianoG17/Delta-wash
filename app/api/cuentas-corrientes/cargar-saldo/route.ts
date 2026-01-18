import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

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
        const cuentaResult = await db`
            SELECT * FROM cuentas_corrientes WHERE id = ${cuenta_id}
        `;

        const cuentaData = Array.isArray(cuentaResult) ? cuentaResult : cuentaResult.rows || [];

        if (cuentaData.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Cuenta no encontrada' },
                { status: 404 }
            );
        }

        const cuenta = cuentaData[0];
        const saldoAnterior = parseFloat(cuenta.saldo_actual);
        const saldoNuevo = saldoAnterior + parseFloat(monto);

        // Actualizar saldo de la cuenta
        await db`
            UPDATE cuentas_corrientes 
            SET saldo_actual = ${saldoNuevo},
                activa = true
            WHERE id = ${cuenta_id}
        `;

        // Registrar movimiento
        await db`
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
