import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

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
        await db`
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
