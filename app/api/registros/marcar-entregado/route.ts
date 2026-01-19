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
                { error: 'ID es requerido' },
                { status: 400 }
            );
        }

        // VALIDAR PAGO ANTES DE MARCAR ENTREGADO
        const registroCheck = await db`
            SELECT pagado, usa_cuenta_corriente
            FROM registros_lavado
            WHERE id = ${id}
        `;

        const registros = Array.isArray(registroCheck) ? registroCheck : registroCheck.rows || [];
        
        if (registros.length === 0) {
            return NextResponse.json(
                { error: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registros[0];

        // Si NO está pagado Y NO usa cuenta corriente → ERROR
        if (!registro.pagado && !registro.usa_cuenta_corriente) {
            return NextResponse.json({
                success: false,
                error: 'pago_pendiente',
                message: 'El cliente no ha pagado. Debe registrar el pago antes de entregar el vehículo.'
            }, { status: 400 });
        }

        // Actualizar el estado a entregado
        await db`
      UPDATE registros_lavado
      SET estado = 'entregado',
          fecha_entregado = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

        return NextResponse.json({
            success: true,
            message: 'Auto marcado como entregado'
        });

    } catch (error) {
        console.error('Error al marcar como entregado:', error);
        return NextResponse.json(
            { error: 'Error al marcar como entregado' },
            { status: 500 }
        );
    }
}
