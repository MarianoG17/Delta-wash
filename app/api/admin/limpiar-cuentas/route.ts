import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

/**
 * API para limpiar cuentas de prueba de la BD Central
 * 
 * ADVERTENCIA: Este endpoint es solo para desarrollo/testing
 * En producción debería estar protegido con autenticación de superadmin
 */
export async function POST(request: Request) {
  try {
    const { confirmacion, empresaSlug } = await request.json();

    // Seguridad básica - requiere confirmación
    if (confirmacion !== 'ELIMINAR_CUENTA') {
      return NextResponse.json(
        { success: false, message: 'Confirmación incorrecta' },
        { status: 400 }
      );
    }

    if (!empresaSlug) {
      return NextResponse.json(
        { success: false, message: 'Debe proporcionar el slug de la empresa' },
        { status: 400 }
      );
    }

    // Conectar a BD Central
    const centralDB = createPool({ 
      connectionString: process.env.CENTRAL_DB_URL 
    });

    // Buscar la empresa
    const empresaResult = await centralDB.sql`
      SELECT id, slug, branch_name FROM empresas WHERE slug = ${empresaSlug}
    `;

    if (empresaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Empresa con slug "${empresaSlug}" no encontrada` },
        { status: 404 }
      );
    }

    const empresa = empresaResult.rows[0];

    // Eliminar registros de actividad
    await centralDB.sql`
      DELETE FROM actividad_sistema WHERE empresa_id = ${empresa.id}
    `;

    // Eliminar usuarios de la empresa
    const usuariosResult = await centralDB.sql`
      DELETE FROM usuarios_sistema WHERE empresa_id = ${empresa.id}
      RETURNING id, email
    `;

    // Eliminar invitaciones (si existen)
    try {
      await centralDB.sql`
        DELETE FROM invitaciones WHERE empresa_id = ${empresa.id}
      `;
    } catch (e) {
      // Tabla invitaciones puede no existir aún
    }

    // Eliminar la empresa
    await centralDB.sql`
      DELETE FROM empresas WHERE id = ${empresa.id}
    `;

    return NextResponse.json({
      success: true,
      message: `Empresa "${empresaSlug}" eliminada exitosamente`,
      detalles: {
        empresaId: empresa.id,
        slug: empresa.slug,
        branchName: empresa.branch_name,
        usuariosEliminados: usuariosResult.rows.length,
        emails: usuariosResult.rows.map(u => u.email)
      },
      advertencia: '⚠️ IMPORTANTE: El branch en Neon NO fue eliminado. Deberás eliminarlo manualmente desde Neon Console si lo deseas.'
    });

  } catch (error) {
    console.error('Error al limpiar cuenta:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al eliminar cuenta',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Listar todas las empresas registradas
 */
export async function GET() {
  try {
    const centralDB = createPool({ 
      connectionString: process.env.CENTRAL_DB_URL 
    });

    const empresas = await centralDB.sql`
      SELECT 
        e.id,
        e.nombre,
        e.slug,
        e.branch_name,
        e.plan,
        e.estado,
        e.fecha_expiracion,
        e.created_at,
        COUNT(u.id) as total_usuarios
      FROM empresas e
      LEFT JOIN usuarios_sistema u ON u.empresa_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;

    return NextResponse.json({
      success: true,
      total: empresas.rows.length,
      empresas: empresas.rows
    });

  } catch (error) {
    console.error('Error al listar empresas:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al listar empresas',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
