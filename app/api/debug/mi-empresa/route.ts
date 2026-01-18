import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

/**
 * API de Debug: Ver información de la empresa autenticada
 */
export async function GET(request: Request) {
  try {
    // Obtener empresa del token
    const empresaId = await getEmpresaIdFromToken(request);

    if (!empresaId) {
      return NextResponse.json({
        success: false,
        message: 'Sin empresaId en el token - Modo Legacy detectado',
        tipo: 'DeltaWash Legacy',
        connectionString: process.env.POSTGRES_URL ? 'Configurado ✅' : 'NO configurado ❌'
      });
    }

    // Conectar a BD Central
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    // Obtener información de la empresa
    const empresaResult = await centralDB.sql`
      SELECT
        id,
        nombre,
        slug,
        branch_name,
        branch_url,
        plan,
        estado,
        created_at,
        fecha_expiracion
      FROM empresas
      WHERE id = ${empresaId}
    `;

    if (empresaResult.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Empresa con ID ${empresaId} no encontrada en BD Central`,
        empresaId
      }, { status: 404 });
    }

    const empresa = empresaResult.rows[0];

    // Verificar si tiene branch_url configurado
    const tieneBranchUrl = empresa.branch_url && empresa.branch_url.trim() !== '';

    // Si tiene branch_url, intentar conectar
    let conexionBranchOk = false;
    let errorConexion = null;

    if (tieneBranchUrl) {
      try {
        const { neon } = await import('@neondatabase/serverless');
        const sql = neon(empresa.branch_url);
        
        // Intentar una query simple
        await sql`SELECT 1 as test`;
        conexionBranchOk = true;
      } catch (error) {
        errorConexion = error instanceof Error ? error.message : String(error);
      }
    }

    return NextResponse.json({
      success: true,
      tipo: 'SaaS Multi-Tenant',
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        slug: empresa.slug,
        plan: empresa.plan,
        estado: empresa.estado,
        created_at: empresa.created_at,
        fecha_expiracion: empresa.fecha_expiracion
      },
      branch: {
        nombre: empresa.branch_name || '(no configurado)',
        url_configurada: tieneBranchUrl,
        url_visible: empresa.branch_url ? empresa.branch_url.substring(0, 80) + '...' : null,
        conexion_ok: conexionBranchOk,
        error: errorConexion
      },
      diagnostico: {
        status: tieneBranchUrl && conexionBranchOk ? '✅ TODO OK' : '❌ HAY PROBLEMAS',
        problemas: [
          ...(!tieneBranchUrl ? ['⚠️ branch_url NO configurado en BD Central'] : []),
          ...(tieneBranchUrl && !conexionBranchOk ? [`⚠️ No se puede conectar al branch: ${errorConexion}`] : [])
        ],
        recomendacion: !tieneBranchUrl 
          ? 'La empresa no tiene branch_url asignado. Esto significa que cuando se registró, falló la creación del branch en Neon. Deberás crear el branch manualmente o registrar la empresa de nuevo.'
          : !conexionBranchOk
          ? 'El branch_url está configurado pero no se puede conectar. Verifica que la URL sea correcta en Neon Dashboard.'
          : 'Todo funciona correctamente'
      }
    });

  } catch (error) {
    console.error('Error en API debug/mi-empresa:', error);
    return NextResponse.json({
      success: false,
      message: 'Error al obtener información de la empresa',
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
