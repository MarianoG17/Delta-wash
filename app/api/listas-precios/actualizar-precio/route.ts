import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { lista_id, tipo_vehiculo, tipo_servicio, precio } = await request.json();

        if (!lista_id || !tipo_vehiculo || !tipo_servicio || precio === undefined) {
            return NextResponse.json(
                { success: false, message: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        if (precio < 0) {
            return NextResponse.json(
                { success: false, message: 'El precio no puede ser negativo' },
                { status: 400 }
            );
        }

        // Actualizar o insertar el precio
        await sql`
            INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio, fecha_actualizacion)
            VALUES (${lista_id}, ${tipo_vehiculo}, ${tipo_servicio}, ${precio}, NOW())
            ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio)
            DO UPDATE SET precio = ${precio}, fecha_actualizacion = NOW()
        `;

        return NextResponse.json({
            success: true,
            message: 'Precio actualizado correctamente'
        });
    } catch (error) {
        console.error('Error actualizando precio:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
