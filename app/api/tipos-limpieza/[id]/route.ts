import { NextRequest, NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// PUT - Editar tipo de limpieza
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

        // Verificar que el tipo existe
        const tipo = await sql`
            SELECT id FROM tipos_limpieza
            WHERE id = ${tipoId}
        `;

        if (tipo.length === 0) {
            return NextResponse.json(
                { error: 'Tipo no encontrado' },
                { status: 404 }
            );
        }

        // Verificar unicidad del nombre
        const existe = await sql`
            SELECT id FROM tipos_limpieza
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
            UPDATE tipos_limpieza
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
        console.error('[API tipos-limpieza PUT] Error:', error);
        return NextResponse.json(
            { error: 'Error al actualizar tipo' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar tipo de limpieza
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const params = await context.params;

        const tipoId = parseInt(params.id);
        const sql = await getDBConnection(empresaId);

        // Verificar que no tenga precios asociados
        const preciosAsociados = await sql`
            SELECT COUNT(*) as count
            FROM precios
            WHERE tipo_limpieza_id = ${tipoId}
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
            DELETE FROM tipos_limpieza
            WHERE id = ${tipoId}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API tipos-limpieza DELETE] Error:', error);
        return NextResponse.json(
            { error: 'Error al eliminar tipo' },
            { status: 500 }
        );
    }
}
