import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'ID es requerido' },
                { status: 400 }
            );
        }

        // Actualizar el estado a entregado
        await sql`
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
