import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
  try {
    const { id, motivo } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Actualizar el estado a cancelado
    await sql`
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
