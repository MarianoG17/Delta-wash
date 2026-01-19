import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID de registro requerido' },
                { status: 400 }
            );
        }

        // Primero obtener el registro para verificar si usó cuenta corriente
        const result = await db`
            SELECT r.*, cc.id as cuenta_corriente_id, cc.saldo_actual
            FROM registros_lavado r
            LEFT JOIN cuentas_corrientes cc ON r.cuenta_corriente_id = cc.id
            WHERE r.id = ${id}
        `;

        // Fix: Compatible con ambos drivers (neon retorna array, vercel postgres retorna .rows)
        const registros = Array.isArray(result) ? result : (result.rows || []);

        if (registros.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registros[0];

        // Si el registro usó cuenta corriente, revertir el movimiento
        if (registro.cuenta_corriente_id && registro.precio) {
            // Devolver el monto a la cuenta corriente
            await db`
                UPDATE cuentas_corrientes
                SET saldo_actual = saldo_actual + ${registro.precio},
                    fecha_actualizacion = NOW()
                WHERE id = ${registro.cuenta_corriente_id}
            `;

            // Eliminar el movimiento de cuenta corriente asociado
            await db`
                DELETE FROM movimientos_cuenta
                WHERE registro_id = ${id}
            `;
        }

        // Eliminar el registro
        await db`
            DELETE FROM registros_lavado
            WHERE id = ${id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Registro eliminado exitosamente',
            cuenta_corriente_revertida: !!registro.cuenta_corriente_id
        });

    } catch (error) {
        console.error('Error eliminando registro:', error);
        return NextResponse.json(
            { success: false, message: 'Error al eliminar el registro' },
            { status: 500 }
        );
    }
}
