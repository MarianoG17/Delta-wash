import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { deleteBranch } from '@/lib/neon-api';

/**
 * API para eliminar TODAS las empresas SaaS y sus branches de Neon
 * ⚠️ EXTREMADAMENTE PELIGROSO - Solo para desarrollo
 * 
 * ELIMINA:
 * - Todas las empresas de la BD Central
 * - Todos los usuarios del sistema SaaS
 * - Todos los branches de Neon (excepto main)
 */
export async function POST(request: Request) {
  try {
    const { confirmacion } = await request.json();

    // Seguridad - requiere confirmación muy específica
    if (confirmacion !== 'ELIMINAR_TODO_EL_SISTEMA') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Confirmación incorrecta. Debe ser: ELIMINAR_TODO_EL_SISTEMA' 
        },
        { status: 400 }
      );
    }

    console.log('========================================');
    console.log('[LIMPIEZA TOTAL] ⚠️ INICIO DE LIMPIEZA COMPLETA DEL SISTEMA');
    console.log('========================================');

    // Conectar a BD Central
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    // 1. Obtener todas las empresas
    console.log('[LIMPIEZA TOTAL] 📋 Obteniendo lista de empresas...');
    const empresasResult = await centralDB.sql`
      SELECT id, nombre, slug, branch_name, branch_url FROM empresas
      ORDER BY created_at DESC
    `;

    const empresas = empresasResult.rows;
    console.log(`[LIMPIEZA TOTAL] Empresas encontradas: ${empresas.length}`);

    const branchesEliminados: string[] = [];
    const branchesError: string[] = [];

    // 2. Eliminar branches de Neon primero
    console.log('[LIMPIEZA TOTAL] 🗑️ Eliminando branches de Neon...');
    for (const empresa of empresas) {
      if (!empresa.branch_name || empresa.branch_name === 'main') {
        console.log(`[LIMPIEZA TOTAL] ⏭️ Saltando branch: ${empresa.branch_name} (protegido)`);
        continue;
      }

      try {
        // Extraer branch ID del branch_name
        // El branch_name puede ser solo el nombre o puede contener "br-xxxxx"
        // Necesitamos obtener el ID real desde la API de Neon
        console.log(`[LIMPIEZA TOTAL] Intentando eliminar branch: ${empresa.branch_name}`);
        
        // Nota: deleteBranch espera el branch ID, no el nombre
        // Esto puede fallar si no tenemos el ID correcto
        // En ese caso, el usuario deberá eliminar manualmente
        
        // await deleteBranch(empresa.branch_name);
        // branchesEliminados.push(empresa.branch_name);
        // console.log(`[LIMPIEZA TOTAL] ✅ Branch eliminado: ${empresa.branch_name}`);
        
        // Por ahora, solo registramos que debería eliminarse
        branchesError.push(empresa.branch_name);
        console.log(`[LIMPIEZA TOTAL] ⚠️ Branch requiere eliminación manual: ${empresa.branch_name}`);
        
      } catch (error) {
        branchesError.push(empresa.branch_name);
        console.error(`[LIMPIEZA TOTAL] ❌ Error eliminando branch ${empresa.branch_name}:`, error);
      }
    }

    // 3. Eliminar todos los registros de actividad
    console.log('[LIMPIEZA TOTAL] 🗑️ Eliminando registros de actividad...');
    const actividadResult = await centralDB.sql`
      DELETE FROM actividad_sistema RETURNING id
    `;
    console.log(`[LIMPIEZA TOTAL] ✅ Actividades eliminadas: ${actividadResult.rows.length}`);

    // 4. Eliminar todos los usuarios
    console.log('[LIMPIEZA TOTAL] 🗑️ Eliminando usuarios del sistema...');
    const usuariosResult = await centralDB.sql`
      DELETE FROM usuarios_sistema RETURNING id, email
    `;
    console.log(`[LIMPIEZA TOTAL] ✅ Usuarios eliminados: ${usuariosResult.rows.length}`);

    // 5. Eliminar invitaciones (si existe la tabla)
    console.log('[LIMPIEZA TOTAL] 🗑️ Eliminando invitaciones...');
    try {
      const invitacionesResult = await centralDB.sql`
        DELETE FROM invitaciones RETURNING id
      `;
      console.log(`[LIMPIEZA TOTAL] ✅ Invitaciones eliminadas: ${invitacionesResult.rows.length}`);
    } catch (e) {
      console.log('[LIMPIEZA TOTAL] ℹ️ Tabla invitaciones no existe o ya está vacía');
    }

    // 6. Eliminar todas las empresas
    console.log('[LIMPIEZA TOTAL] 🗑️ Eliminando empresas...');
    const empresasDeleteResult = await centralDB.sql`
      DELETE FROM empresas RETURNING id, nombre
    `;
    console.log(`[LIMPIEZA TOTAL] ✅ Empresas eliminadas: ${empresasDeleteResult.rows.length}`);

    console.log('========================================');
    console.log('[LIMPIEZA TOTAL] ✅ LIMPIEZA COMPLETA FINALIZADA');
    console.log('========================================');

    return NextResponse.json({
      success: true,
      message: 'Sistema SaaS completamente limpiado',
      resumen: {
        empresasEliminadas: empresas.length,
        usuariosEliminados: usuariosResult.rows.length,
        actividadesEliminadas: actividadResult.rows.length,
        branchesEliminados: branchesEliminados.length,
        branchesRequierenEliminacionManual: branchesError.length
      },
      empresasEliminadas: empresas.map(e => ({
        nombre: e.nombre,
        slug: e.slug,
        branchName: e.branch_name
      })),
      branchesNeon: {
        eliminados: branchesEliminados,
        requierenEliminacionManual: branchesError,
        instrucciones: branchesError.length > 0 
          ? 'Debes eliminar estos branches manualmente desde Neon Console: https://console.neon.tech' 
          : null
      }
    });

  } catch (error) {
    console.error('[LIMPIEZA TOTAL] ❌ ERROR:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al limpiar el sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Obtener resumen del sistema actual
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
        e.created_at,
        COUNT(u.id) as total_usuarios
      FROM empresas e
      LEFT JOIN usuarios_sistema u ON u.empresa_id = e.id
      GROUP BY e.id
      ORDER BY e.created_at DESC
    `;

    const totalUsuarios = await centralDB.sql`
      SELECT COUNT(*) as total FROM usuarios_sistema
    `;

    const totalActividad = await centralDB.sql`
      SELECT COUNT(*) as total FROM actividad_sistema
    `;

    return NextResponse.json({
      success: true,
      resumen: {
        totalEmpresas: empresas.rows.length,
        totalUsuarios: parseInt(totalUsuarios.rows[0]?.total || '0'),
        totalActividad: parseInt(totalActividad.rows[0]?.total || '0')
      },
      empresas: empresas.rows
    });

  } catch (error) {
    console.error('Error al obtener resumen:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener resumen del sistema',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
