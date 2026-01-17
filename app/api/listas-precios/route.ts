import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: Obtener todas las listas de precios con sus precios
export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const listasResult = await db`
            SELECT * FROM listas_precios
            ORDER BY es_default DESC, nombre ASC
        `;
        const listas = Array.isArray(listasResult) ? listasResult : listasResult.rows || [];

        // Para cada lista, obtener sus precios
        const listasConPrecios = await Promise.all(
            listas.map(async (lista: any) => {
                const preciosResult = await db`
                    SELECT * FROM precios
                    WHERE lista_id = ${lista.id}
                    ORDER BY tipo_vehiculo, tipo_servicio
                `;
                const precios = Array.isArray(preciosResult) ? preciosResult : preciosResult.rows || [];
                return {
                    ...lista,
                    precios: precios
                };
            })
        );

        return NextResponse.json({
            success: true,
            listas: listasConPrecios
        });
    } catch (error: any) {
        console.error('Error obteniendo listas de precios:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error del servidor',
                error: error.message || 'Error desconocido',
                details: error.toString()
            },
            { status: 500 }
        );
    }
}

// POST: Crear nueva lista de precios
export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { nombre, descripcion, copiar_de_lista_id } = await request.json();

        if (!nombre) {
            return NextResponse.json(
                { success: false, message: 'El nombre es requerido' },
                { status: 400 }
            );
        }

        // Crear la lista
        const nuevaListaResult = await db`
            INSERT INTO listas_precios (nombre, descripcion, activa, es_default)
            VALUES (${nombre}, ${descripcion || null}, true, false)
            RETURNING *
        `;
        const nuevaLista = Array.isArray(nuevaListaResult) ? nuevaListaResult : nuevaListaResult.rows || [];

        const listaId = nuevaLista[0].id;

        // Si se especifica copiar de otra lista, copiar los precios
        if (copiar_de_lista_id) {
            await db`
                INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
                SELECT ${listaId}, tipo_vehiculo, tipo_servicio, precio
                FROM precios
                WHERE lista_id = ${copiar_de_lista_id}
            `;
        } else {
            // Copiar de la lista por defecto
            await db`
                INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
                SELECT ${listaId}, tipo_vehiculo, tipo_servicio, precio
                FROM precios
                WHERE lista_id = (SELECT id FROM listas_precios WHERE es_default = true LIMIT 1)
            `;
        }

        return NextResponse.json({
            success: true,
            lista: nuevaLista[0]
        });
    } catch (error: any) {
        console.error('Error creando lista de precios:', error);
        if (error.message && error.message.includes('unique')) {
            return NextResponse.json(
                { success: false, message: 'Ya existe una lista con ese nombre' },
                { status: 400 }
            );
        }
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar lista de precios
export async function PUT(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { id, nombre, descripcion, activa } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID de lista requerido' },
                { status: 400 }
            );
        }

        await db`
            UPDATE listas_precios
            SET nombre = ${nombre},
                descripcion = ${descripcion || null},
                activa = ${activa},
                fecha_actualizacion = NOW()
            WHERE id = ${id}
        `;

        return NextResponse.json({
            success: true,
            message: 'Lista actualizada correctamente'
        });
    } catch (error) {
        console.error('Error actualizando lista:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar lista de precios
export async function DELETE(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID de lista requerido' },
                { status: 400 }
            );
        }

        // Verificar que no sea la lista por defecto
        const listaResult = await db`
            SELECT es_default FROM listas_precios WHERE id = ${id}
        `;
        const lista = Array.isArray(listaResult) ? listaResult : listaResult.rows || [];

        if (lista.length > 0 && lista[0].es_default) {
            return NextResponse.json(
                { success: false, message: 'No se puede eliminar la lista por defecto' },
                { status: 400 }
            );
        }

        // Verificar que no haya clientes usando esta lista
        const clientesResult = await db`
            SELECT COUNT(*) as total FROM cuentas_corrientes WHERE lista_precio_id = ${id}
        `;
        const clientes = Array.isArray(clientesResult) ? clientesResult : clientesResult.rows || [];

        if (parseInt(clientes[0].total) > 0) {
            return NextResponse.json(
                { success: false, message: `No se puede eliminar. Hay ${clientes[0].total} cliente(s) usando esta lista` },
                { status: 400 }
            );
        }

        await db`DELETE FROM listas_precios WHERE id = ${id}`;

        return NextResponse.json({
            success: true,
            message: 'Lista eliminada correctamente'
        });
    } catch (error) {
        console.error('Error eliminando lista:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
