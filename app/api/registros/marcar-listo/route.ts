import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: Request) {
    try {
        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID requerido' },
                { status: 400 }
            );
        }

        // Obtener el registro
        const registro = await sql`
      SELECT * FROM registros_lavado WHERE id = ${id}
    `;

        if (registro.rows.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const auto = registro.rows[0];

        // Actualizar estado a listo
        await sql`
      UPDATE registros_lavado 
      SET estado = 'listo', 
          fecha_listo = CURRENT_TIMESTAMP,
          mensaje_enviado = true
      WHERE id = ${id}
    `;

        // Crear mensaje de WhatsApp
        const mensaje = `Hola ${auto.nombre_cliente}! Tu ${auto.marca_modelo} ya está listo. ¡Gracias por confiar en nosotros!`;
        const mensajeCodificado = encodeURIComponent(mensaje);
        const whatsappUrl = `https://wa.me/${auto.celular}?text=${mensajeCodificado}`;

        return NextResponse.json({
            success: true,
            whatsappUrl: whatsappUrl,
            message: 'Auto marcado como listo',
        });
    } catch (error) {
        console.error('Error marcando como listo:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
