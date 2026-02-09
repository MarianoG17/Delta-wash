import { NextRequest, NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// PUT - Editar tipo de vehículo
export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const params = await context.params;

        const { nombre } = await request.json();
        const tipoId = parseInt(params.id);

        if (!nombre || nombre.trim() === '') {
            return NextResponse.json(
                { error: 'Nombre es requerido' },
                { status: 400 }
            );
        }

        const sql = await getDBConnection(empresaId);

        // Verificar que el tipo existe y obtener el nombre actual
        const tipo = await sql`
            SELECT id, nombre FROM tipos_vehiculo
            WHERE id = ${tipoId}
        `;

        if (tipo.length === 0) {
            return NextResponse.json(
                { error: 'Tipo no encontrado' },
                { status: 404 }
            );
        }

        // PROTECCIÓN: Verificar si el tipo ya se usó en registros REALES de lavados
        // NO bloqueamos por precios, solo por registros históricos
        const enUsoRegistros = await sql`
            SELECT COUNT(*) as count
            FROM registros
            WHERE tipo_vehiculo = ${tipo[0].nombre}
        `;

        const totalRegistros = parseInt(enUsoRegistros[0]?.count || '0');

        if (totalRegistros > 0) {
            return NextResponse.json(
                {
                    error: 'No se puede editar: Este tipo ya se usó en registros históricos',
                    detalles: `Hay ${totalRegistros} registro(s) de lavados usando este tipo. Editar el nombre rompería el historial.`,
                    sugerencia: 'Puedes agregar un nuevo tipo en lugar de editar este.'
                },
                { status: 400 }
            );
        }

        // Verificar unicidad del nombre
        const existe = await sql`
            SELECT id FROM tipos_vehiculo
            WHERE LOWER(nombre) = LOWER(${nombre.trim()})
            AND id != ${tipoId}
        `;

        if (existe.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe un tipo con ese nombre' },
                { status: 400 }
            );
        }

        // Actualizar
        const resultado = await sql`
            UPDATE tipos_vehiculo
            SET nombre = ${nombre.trim()},
                updated_at = NOW()
            WHERE id = ${tipoId}
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            tipo: resultado[0]
        });
    } catch (error: any) {
        console.error('[API tipos-vehiculo PUT] Error:', error);
        return NextResponse.json(
            { error: 'Error al actualizar tipo' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar tipo de vehículo
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const params = await context.params;

        const tipoId = parseInt(params.id);
        const sql = await getDBConnection(empresaId);

        // Obtener el nombre del tipo
        const tipo = await sql`
            SELECT nombre FROM tipos_vehiculo
            WHERE id = ${tipoId}
        `;

        if (tipo.length === 0) {
            return NextResponse.json(
                { error: 'Tipo no encontrado' },
                { status: 404 }
            );
        }

        // CRÍTICO: Verificar que no tenga registros históricos
        const registrosAsociados = await sql`
            SELECT COUNT(*) as count
            FROM registros_lavado
            WHERE tipo_vehiculo = ${tipo[0].nombre}
        `;

        const totalRegistros = parseInt(registrosAsociados[0]?.count || '0');

        if (totalRegistros > 0) {
            return NextResponse.json(
                {
                    error: 'No se puede eliminar: Este tipo ya se usó en registros históricos',
                    detalles: `Hay ${totalRegistros} registro(s) de lavados usando este tipo. Eliminar el tipo borraría la información del historial.`,
                    sugerencia: 'No se puede eliminar tipos con historial. Considera inactivarlo o crear un nuevo tipo diferente.'
                },
                { status: 400 }
            );
        }

        // Verificar que no tenga precios asociados
        const preciosAsociados = await sql`
            SELECT COUNT(*) as count
            FROM precios
            WHERE tipo_vehiculo_id = ${tipoId}
        `;

        if (parseInt(preciosAsociados[0]?.count || '0') > 0) {
            return NextResponse.json(
                {
                    error: 'No se puede eliminar: tiene precios asociados',
                    detalles: `Hay ${preciosAsociados[0].count} precio(s) usando este tipo`
                },
                { status: 400 }
            );
        }

        // Eliminar
        await sql`
            DELETE FROM tipos_vehiculo
            WHERE id = ${tipoId}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API tipos-vehiculo DELETE] Error:', error);
        return NextResponse.json(
            { error: 'Error al eliminar tipo' },
            { status: 500 }
        );
    }
}
