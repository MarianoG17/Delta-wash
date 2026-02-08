nueimport { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { deleteBranch } from '@/lib/neon-api';

// GET: Obtener todas las empresas
export async function GET(request: Request) {
    try {
        if (!process.env.CENTRAL_DB_URL) {
            console.error('❌ CENTRAL_DB_URL no está configurada');
            return NextResponse.json(
                { error: 'Base de datos central no configurada' },
                { status: 500 }
            );
        }

        const sql = neon(process.env.CENTRAL_DB_URL);

        const empresas = await sql`
      SELECT
        id,
        nombre,
        email,
        neon_branch_id,
        created_at,
        trial_end_date,
        COALESCE(precio_mensual, 85000.00) as precio_mensual,
        COALESCE(descuento_porcentaje, 0) as descuento_porcentaje,
        COALESCE(precio_final, 85000.00) as precio_final,
        nota_descuento,
        telefono,
        contacto_nombre,
        direccion,
        COALESCE(estado, 'activo') as estado
      FROM empresas
      ORDER BY created_at DESC
    `;

        return NextResponse.json({ empresas });
    } catch (error) {
        console.error('Error fetching empresas:', error);
        return NextResponse.json(
            { error: 'Error al cargar empresas' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar precios, descuentos y datos de contacto de una empresa
export async function PUT(request: Request) {
    try {
        const {
            empresa_id,
            precio_mensual,
            descuento_porcentaje,
            nota_descuento,
            trial_end_date,
            telefono,
            contacto_nombre,
            direccion
        } = await request.json();

        if (!empresa_id) {
            return NextResponse.json(
                { error: 'empresa_id es requerido' },
                { status: 400 }
            );
        }

        if (!process.env.CENTRAL_DB_URL) {
            return NextResponse.json(
                { error: 'Base de datos central no configurada' },
                { status: 500 }
            );
        }

        const sql = neon(process.env.CENTRAL_DB_URL);

        // Calcular precio final
        const precio_final = precio_mensual * (1 - descuento_porcentaje / 100);

        await sql`
          UPDATE empresas
          SET precio_mensual = ${precio_mensual},
              descuento_porcentaje = ${descuento_porcentaje},
              precio_final = ${precio_final},
              nota_descuento = ${nota_descuento || null},
              trial_end_date = ${trial_end_date || null},
              telefono = ${telefono || null},
              contacto_nombre = ${contacto_nombre || null},
              direccion = ${direccion || null}
          WHERE id = ${empresa_id}
        `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating empresa:', error);
        return NextResponse.json(
            { error: 'Error al actualizar empresa' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar empresa y su branch de Neon
export async function DELETE(request: Request) {
    try {
        const { empresa_id } = await request.json();

        if (!empresa_id) {
            return NextResponse.json(
                { error: 'empresa_id es requerido' },
                { status: 400 }
            );
        }

        if (!process.env.CENTRAL_DB_URL) {
            return NextResponse.json(
                { error: 'Base de datos central no configurada' },
                { status: 500 }
            );
        }

        const sql = neon(process.env.CENTRAL_DB_URL);

        // Obtener información de la empresa antes de eliminar
        const empresasResult = await sql`
          SELECT neon_branch_id, nombre FROM empresas WHERE id = ${empresa_id}
        `;

        const empresa = empresasResult[0];

        if (!empresa) {
            return NextResponse.json(
                { error: 'Empresa no encontrada' },
                { status: 404 }
            );
        }

        // Eliminar branch de Neon si existe
        if (empresa.neon_branch_id) {
            try {
                await deleteBranch(empresa.neon_branch_id);
                console.log(`✓ Branch ${empresa.neon_branch_id} eliminado de Neon`);
            } catch (neonError) {
                console.error('Error eliminando branch de Neon:', neonError);
                // Continuar con la eliminación en DB incluso si falla Neon
            }
        }

        // Eliminar de la base de datos central
        await sql`
          DELETE FROM empresas WHERE id = ${empresa_id}
        `;

        console.log(`✓ Empresa "${empresa.nombre}" eliminada de DB central`);

        return NextResponse.json({
            success: true,
            message: `Empresa "${empresa.nombre}" eliminada correctamente`
        });
    } catch (error) {
        console.error('Error deleting empresa:', error);
        return NextResponse.json(
            { error: 'Error al eliminar empresa' },
            { status: 500 }
        );
    }
}

// PATCH: Archivar o reactivar empresa
export async function PATCH(request: Request) {
    try {
        const { empresa_id, accion, admin_email } = await request.json();

        if (!process.env.CENTRAL_DB_URL) {
            return NextResponse.json({ error: 'DB no configurada' }, { status: 500 });
        }

        const sql = neon(process.env.CENTRAL_DB_URL);

        if (accion === 'archivar') {
            // 1. Obtener empresa
            const empresaResult = await sql`SELECT * FROM empresas WHERE id = ${empresa_id}`;
            const empresa = empresaResult[0];

            if (!empresa) {
                return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
            }

            // 2. Eliminar branch de Neon
            if (empresa.neon_branch_id) {
                try {
                    await deleteBranch(empresa.neon_branch_id);
                    console.log(`✓ Branch ${empresa.neon_branch_id} eliminado`);
                } catch (err) {
                    console.error('Error eliminando branch:', err);
                }
            }

            // 3. Actualizar estado a archivado y limpiar branch info
            await sql`
        UPDATE empresas
        SET estado = 'archivado',
            branch_url = NULL,
            neon_branch_id = NULL,
            updated_at = NOW()
        WHERE id = ${empresa_id}
      `;

            // 4. Log de auditoría
            await sql`
        INSERT INTO empresa_logs (empresa_id, empresa_nombre, accion, detalles, realizado_por)
        VALUES (${empresa_id}, ${empresa.nombre}, 'archivado',
                'Branch eliminado de Neon para liberar espacio', ${admin_email})
      `;

            return NextResponse.json({
                success: true,
                message: 'Empresa archivada y branch eliminado'
            });
        }

        if (accion === 'reactivar') {
            // TODO: Implementar reactivación (crear nuevo branch)
            return NextResponse.json({
                error: 'Reactivación aún no implementada'
            }, { status: 501 });
        }

        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

    } catch (error) {
        console.error('Error en PATCH empresas:', error);
        return NextResponse.json({ error: 'Error en la operación' }, { status: 500 });
    }
}
