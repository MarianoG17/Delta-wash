import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
  try {
    // Obtener conexión apropiada (DeltaWash o empresa específica)
    const empresaId = await getEmpresaIdFromToken(request);
    const db = await getDBConnection(empresaId);

    const { id, motivo } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Actualizar el estado a cancelado
    await db`
      UPDATE registros_lavado 
      SET estado = 'cancelado',
          fecha_cancelado = CURRENT_TIMESTAMP,
          motivo_cancelacion = ${motivo || 'Sin motivo especificado'}
      WHERE id = ${id}
    `;

    return NextResponse.json({ 
      success: true,
      message: 'Registro cancelado'
    });

  } catch (error) {
    console.error('Error al cancelar registro:', error);
    return NextResponse.json(
      { error: 'Error al cancelar registro' },
      { status: 500 }
    );
  }
}
