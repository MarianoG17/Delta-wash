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

        // Obtener los datos del registro
        const result = await sql`
      SELECT nombre_cliente, celular, marca_modelo, patente
      FROM registros_lavado
      WHERE id = ${id}
    `;

        if (result.rows.length === 0) {
            return NextResponse.json(
                { error: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = result.rows[0];

        // Formatear el número de teléfono para WhatsApp
        let numeroFormateado = registro.celular.replace(/\D/g, '');

        // Si el número empieza con 11 (Buenos Aires), agregar el prefijo de Argentina
        if (numeroFormateado.startsWith('11')) {
            numeroFormateado = `5491${numeroFormateado.substring(2)}`;
        } else if (!numeroFormateado.startsWith('549')) {
            // Si no tiene el prefijo de Argentina, agregarlo
            numeroFormateado = `549${numeroFormateado}`;
        }

        // Crear el mensaje de WhatsApp
        const mensaje = `Hola ${registro.nombre_cliente}! Tu ${registro.marca_modelo} (${registro.patente}) ya está listo. Podés pasar a retirarlo cuando quieras. Gracias!`;
        const mensajeCodificado = encodeURIComponent(mensaje);
        const whatsappUrl = `https://wa.me/${numeroFormateado}?text=${mensajeCodificado}`;

        return NextResponse.json({
            success: true,
            whatsappUrl
        });

    } catch (error) {
        console.error('Error al generar link de WhatsApp:', error);
        return NextResponse.json(
            { error: 'Error al generar link de WhatsApp' },
            { status: 500 }
        );
    }
}
