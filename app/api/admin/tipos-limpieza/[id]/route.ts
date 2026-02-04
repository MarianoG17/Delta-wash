import { NextResponse } from 'next/server';
import { requireAuth, isSaaSRequest } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

// PUT /api/admin/tipos-limpieza/[id] - Actualizar tipo de limpieza
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar que sea SaaS
    if (!(await isSaaSRequest(request))) {
      return NextResponse.json(
        { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
        { status: 403 }
      );
    }

    // Validar autenticación y rol admin
    const payload = await requireAuth(request);
    
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden acceder a esta funcionalidad' },
        { status: 403 }
      );
    }

    // Validar que el token tenga empresaId
    if (!payload.empresaId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido: sin empresa asociada' },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { nombre, orden, activo } = body;

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    if (nombre.length > 50) {
      return NextResponse.json(
        { success: false, message: 'El nombre no puede exceder 50 caracteres' },
        { status: 400 }
      );
    }

    // Obtener conexión a la base de datos de la empresa
    const db = await getDBConnection(payload.empresaId);

    // Verificar si existe otro tipo con ese nombre (excepto el actual)
    const existe = await db`
      SELECT id FROM tipos_limpieza 
      WHERE nombre = ${nombre.trim()} AND id != ${parseInt(id)}
    `;

    if (existe.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un tipo de limpieza con ese nombre' },
        { status: 400 }
      );
    }

    // Actualizar tipo de limpieza
    const result = await db`
      UPDATE tipos_limpieza 
      SET 
        nombre = ${nombre.trim()},
        orden = ${orden || 0},
        activo = ${activo !== false},
        updated_at = NOW()
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tipo de limpieza no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tipo de limpieza actualizado exitosamente',
      tipo: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al actualizar tipo de limpieza:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar tipo de limpieza', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/tipos-limpieza/[id] - Eliminar tipo de limpieza
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validar que sea SaaS
    if (!(await isSaaSRequest(request))) {
      return NextResponse.json(
        { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
        { status: 403 }
      );
    }

    // Validar autenticación y rol admin
    const payload = await requireAuth(request);
    
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden acceder a esta funcionalidad' },
        { status: 403 }
      );
    }

    // Validar que el token tenga empresaId
    if (!payload.empresaId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido: sin empresa asociada' },
        { status: 403 }
      );
    }

    // Obtener conexión a la base de datos de la empresa
    const db = await getDBConnection(payload.empresaId);

    // Verificar si hay precios asociados a este tipo de limpieza
    const preciosAsociados = await db`
      SELECT COUNT(*) as count FROM precios 
      WHERE tipo_limpieza_id = ${parseInt(id)}
    `;

    if (preciosAsociados.rows[0].count > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: `No se puede eliminar porque hay ${preciosAsociados.rows[0].count} precio(s) asociado(s) a este tipo de limpieza` 
        },
        { status: 400 }
      );
    }

    // Eliminar tipo de limpieza
    const result = await db`
      DELETE FROM tipos_limpieza 
      WHERE id = ${parseInt(id)}
      RETURNING *
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tipo de limpieza no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Tipo de limpieza eliminado exitosamente'
    });

  } catch (error: any) {
    console.error('Error al eliminar tipo de limpieza:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar tipo de limpieza', error: error.message },
      { status: 500 }
    );
  }
}
