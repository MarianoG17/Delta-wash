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

        // Obtener los datos del registro
        const result = await db`
      SELECT nombre_cliente, celular, marca_modelo, patente
      FROM registros_lavado
      WHERE id = ${id}
    `;

        // Acceso correcto - driver neon retorna array directo
        const registros = Array.isArray(result) ? result : [];
        
        if (registros.length === 0) {
            return NextResponse.json(
                { error: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registros[0];

        // Validar que el registro tenga celular
        if (!registro.celular) {
            return NextResponse.json(
                { error: 'El registro no tiene número de celular' },
                { status: 400 }
            );
        }

        // Formatear el número de teléfono para WhatsApp
        let numeroFormateado = registro.celular.replace(/\D/g, '');

        // Formato correcto para Argentina:
        // Si viene como 1164812804 (11 + número sin 15) → 5491164812804
        // Si viene como 91164812804 (ya tiene el 9) → 5491164812804

        // Remover el 15 si está presente
        if (numeroFormateado.startsWith('1115')) {
            numeroFormateado = '11' + numeroFormateado.substring(4);
        }

        // Si empieza con 11 (Buenos Aires), agregar prefijo 549
        if (numeroFormateado.startsWith('11')) {
            numeroFormateado = `549${numeroFormateado}`;
        }
        // Si empieza con 9 y luego 11, agregar solo 54
        else if (numeroFormateado.startsWith('911')) {
            numeroFormateado = `54${numeroFormateado}`;
        }
        // Si ya tiene 549, dejarlo como está
        else if (!numeroFormateado.startsWith('549')) {
            // Para otros códigos de área
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
