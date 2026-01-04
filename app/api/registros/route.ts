import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const estado = searchParams.get('estado');

        let query;
        if (estado) {
            query = sql`
        SELECT * FROM registros_lavado 
        WHERE estado = ${estado}
        ORDER BY fecha_ingreso DESC
      `;
        } else {
            query = sql`
        SELECT * FROM registros_lavado 
        ORDER BY fecha_ingreso DESC
      `;
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

export async function POST(request: Request) {
    try {
        const { marca_modelo, patente, tipo_limpieza, nombre_cliente, celular, usuario_id } = await request.json();

        if (!marca_modelo || !patente || !tipo_limpieza || !nombre_cliente || !celular) {
            return NextResponse.json(
                { success: false, message: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        const result = await sql`
      INSERT INTO registros_lavado (
        marca_modelo, patente, tipo_limpieza, nombre_cliente, celular, usuario_id, estado
      ) VALUES (
        ${marca_modelo}, ${patente}, ${tipo_limpieza}, ${nombre_cliente}, ${celular}, ${usuario_id}, 'en_proceso'
      )
      RETURNING *
    `;

        return NextResponse.json({
            success: true,
            registro: result.rows[0],
        });
    } catch (error) {
        console.error('Error creando registro:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
