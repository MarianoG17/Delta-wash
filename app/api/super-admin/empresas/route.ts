import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { deleteBranch } from '@/lib/neon-api';

// GET: Obtener todas las empresas
export async function GET(request: Request) {
    try {
        const db = await getDBConnection();

        const empresas = await db.all(`
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
        nota_descuento
      FROM empresas
      ORDER BY created_at DESC
    `);

        return NextResponse.json({ empresas });
    } catch (error) {
        console.error('Error fetching empresas:', error);
        return NextResponse.json(
            { error: 'Error al cargar empresas' },
            { status: 500 }
        );
    }
}

// PUT: Actualizar precios y descuentos de una empresa
export async function PUT(request: Request) {
    try {
        const {
            empresa_id,
            precio_mensual,
            descuento_porcentaje,
            nota_descuento,
            trial_end_date
        } = await request.json();

        if (!empresa_id) {
            return NextResponse.json(
                { error: 'empresa_id es requerido' },
                { status: 400 }
            );
        }

        const db = await getDBConnection();

        // Primero verificar si las columnas existen
        const tableInfo = await db.all(`PRAGMA table_info(empresas)`);
        const columns = tableInfo.map((col: any) => col.name);

        const hasPrecioColumns = columns.includes('precio_mensual');

        if (!hasPrecioColumns) {
            // Las columnas no existen, solo actualizar trial_end_date
            if (trial_end_date) {
                await db.run(
                    `UPDATE empresas 
           SET trial_end_date = ? 
           WHERE id = ?`,
                    [trial_end_date, empresa_id]
                );
            }

            return NextResponse.json({
                success: true,
                message: 'Trial actualizado (columnas de precio pendientes de migración)'
            });
        }

        // Calcular precio final
        const precio_final = precio_mensual * (1 - descuento_porcentaje / 100);

        await db.run(
            `UPDATE empresas 
       SET precio_mensual = ?,
           descuento_porcentaje = ?,
           precio_final = ?,
           nota_descuento = ?,
           trial_end_date = ?
       WHERE id = ?`,
            [
                precio_mensual,
                descuento_porcentaje,
                precio_final,
                nota_descuento || null,
                trial_end_date || null,
                empresa_id
            ]
        );

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

        const db = await getDBConnection();

        // Obtener información de la empresa antes de eliminar
        const empresa = await db.get(
            `SELECT neon_branch_id, nombre FROM empresas WHERE id = ?`,
            [empresa_id]
        );

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
        await db.run(
            `DELETE FROM empresas WHERE id = ?`,
            [empresa_id]
        );

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
