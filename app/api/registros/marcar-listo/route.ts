import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';
import { notificarFidelizacion } from '@/lib/fidelizacion-webhook';

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

        // Actualizar el estado a listo
        await db`
      UPDATE registros_lavado
      SET estado = 'listo',
          fecha_listo = CURRENT_TIMESTAMP
      WHERE id = ${id}
    `;

        // Obtener datos del registro para notificar a Fidelización
        const registroResult = await db`
      SELECT celular, patente, marca_modelo
      FROM registros_lavado
      WHERE id = ${id}
    `;

        const registroData = Array.isArray(registroResult) ? registroResult : registroResult.rows || [];

        // 🔔 Notificar a Fidelización (fire-and-forget, no bloquea)
        if (registroData.length > 0) {
            const { celular, patente, marca_modelo } = registroData[0];
            notificarFidelizacion(celular, patente, 'listo', marca_modelo)
                .catch(() => { }); // Silenciar errores para no afectar el flujo
        }

        return NextResponse.json({
            success: true,
            message: 'Auto marcado como listo'
        });

    } catch (error) {
        console.error('Error al marcar como listo:', error);
        return NextResponse.json(
            { error: 'Error al marcar como listo' },
            { status: 500 }
        );
    }
}
