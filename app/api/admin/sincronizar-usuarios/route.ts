import { NextResponse } from 'next/server';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

/**
 * Endpoint administrativo para sincronizar usuarios de BD Central a branches de empresas
 * Soluciona el problema de foreign key cuando usuarios existen en Central pero no en branch
 */
export async function POST(request: Request) {
  try {
    // Verificar autenticación y obtener empresa ID
    const empresaId = await getEmpresaIdFromToken(request);
    
    if (!empresaId) {
      return NextResponse.json(
        { success: false, message: 'No autenticado o empresa no identificada' },
        { status: 401 }
      );
    }

    console.log(`[Sincronizar Usuarios] Iniciando para empresa ${empresaId}...`);

    // Obtener conexión a la BD Central
    const centralSql = (await import('@/lib/db')).sql;

    // Obtener todos los usuarios de esta empresa en BD Central
    const resultCentral = await centralSql`
      SELECT id, email, password_hash, nombre, rol, activo, fecha_creacion
      FROM usuarios_sistema
      WHERE empresa_id = ${empresaId}
      ORDER BY id ASC
    `;

    // Manejar resultado de QueryResult
    const usuariosCentral = Array.isArray(resultCentral) ? resultCentral : resultCentral.rows || [];

    if (usuariosCentral.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No se encontraron usuarios en BD Central'
      });
    }

    console.log(`[Sincronizar Usuarios] Encontrados ${usuariosCentral.length} usuarios en BD Central`);

    // Obtener conexión al branch de la empresa
    const branchSql = await getDBConnection(empresaId);
    if (!branchSql) {
      return NextResponse.json(
        { success: false, message: 'No se pudo conectar al branch de la empresa' },
        { status: 500 }
      );
    }

    // Obtener usuarios actuales en el branch
    const resultBranch = await branchSql`
      SELECT id FROM usuarios
    `;
    
    const usuariosBranch = Array.isArray(resultBranch) ? resultBranch : resultBranch.rows || [];
    const idsExistentes = new Set(usuariosBranch.map((u: any) => u.id));

    console.log(`[Sincronizar Usuarios] ${usuariosBranch.length} usuarios ya existen en el branch`);

    // Sincronizar cada usuario que NO existe en el branch
    let usuariosCreados = 0;
    const errores: Array<{ usuario_id: number; email: string; error: string }> = [];

    for (const usuario of usuariosCentral) {
      if (idsExistentes.has(usuario.id)) {
        console.log(`[Sincronizar Usuarios] Usuario ${usuario.id} (${usuario.email}) ya existe, saltando...`);
        continue;
      }

      try {
        await branchSql`
          INSERT INTO usuarios (id, email, password_hash, nombre, rol, activo, fecha_creacion)
          VALUES (
            ${usuario.id},
            ${usuario.email},
            ${usuario.password_hash},
            ${usuario.nombre},
            ${usuario.rol},
            ${usuario.activo},
            ${usuario.fecha_creacion}
          )
        `;
        console.log(`[Sincronizar Usuarios] ✅ Usuario ${usuario.id} (${usuario.email}) creado en branch`);
        usuariosCreados++;
      } catch (error: any) {
        console.error(`[Sincronizar Usuarios] ❌ Error creando usuario ${usuario.id}:`, error.message);
        errores.push({
          usuario_id: usuario.id,
          email: usuario.email,
          error: error.message
        });
      }
    }

    // Actualizar la secuencia de IDs en el branch para evitar conflictos futuros
    if (usuariosCentral.length > 0) {
      const maxId = Math.max(...usuariosCentral.map((u: any) => u.id));
      await branchSql`SELECT setval('usuarios_id_seq', ${maxId})`;
      console.log(`[Sincronizar Usuarios] ✅ Secuencia actualizada a ${maxId}`);
    }

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${usuariosCreados} usuarios creados`,
      detalles: {
        usuarios_en_central: usuariosCentral.length,
        usuarios_en_branch_antes: usuariosBranch.length,
        usuarios_creados: usuariosCreados,
        usuarios_ya_existentes: usuariosCentral.length - usuariosCreados,
        errores: errores.length > 0 ? errores : undefined
      }
    });

  } catch (error: any) {
    console.error('[Sincronizar Usuarios] Error general:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Error al sincronizar usuarios' },
      { status: 500 }
    );
  }
}
