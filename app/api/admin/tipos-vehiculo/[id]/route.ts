import { NextResponse } from 'next/server';
import { isSaaSRequest, requireAuth } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

/**
 * API: Editar y Eliminar Tipos de Vehículo
 * Solo para usuarios admin de SaaS
 */

// PUT: Actualizar tipo de vehículo
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar que sea SaaS
    if (!(await isSaaSRequest(request))) {
      return NextResponse.json(
        { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
        { status: 403 }
      );
    }

    // Verificar autenticación
    const payload = await requireAuth(request);
    
    // Verificar que sea admin
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden editar tipos de vehículo' },
        { status: 403 }
      );
    }

    const tipoId = parseInt(id);
    if (isNaN(tipoId)) {
      return NextResponse.json(
        { success: false, message: 'ID inválido' },
        { status: 400 }
      );
    }

    // Leer datos del request
    const { nombre, orden, activo } = await request.json();

    // Validaciones
    if (!nombre || nombre.trim() === '') {
      return NextResponse.json(
        { success: false, message: 'El nombre es requerido' },
        { status: 400 }
      );
    }

    // Verificar que tenga empresaId
    if (!payload.empresaId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido: sin empresa asociada' },
        { status: 403 }
      );
    }

    // Obtener conexión del branch de la empresa
    const db = await getDBConnection(payload.empresaId);

    // Verificar que el tipo existe
    const existingType = await db`
      SELECT id FROM tipos_vehiculo WHERE id = ${tipoId}
    `;

    if (existingType.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tipo de vehículo no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que no haya otro tipo con el mismo nombre
    const duplicate = await db`
      SELECT id FROM tipos_vehiculo 
      WHERE LOWER(nombre) = LOWER(${nombre.trim()})
        AND id != ${tipoId}
    `;

    if (duplicate.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ya existe otro tipo de vehículo con ese nombre' },
        { status: 400 }
      );
    }

    // Actualizar tipo
    const result = await db`
      UPDATE tipos_vehiculo
      SET 
        nombre = ${nombre.trim()},
        orden = ${orden !== undefined ? orden : 0},
        activo = ${activo !== false},
        updated_at = NOW()
      WHERE id = ${tipoId}
      RETURNING id, nombre, orden, activo, updated_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Tipo de vehículo actualizado exitosamente',
      tipo: result.rows[0]
    });

  } catch (error) {
    console.error('[Admin Tipos Vehículo PUT] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al actualizar tipo de vehículo' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar tipo de vehículo
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Verificar que sea SaaS
    if (!(await isSaaSRequest(request))) {
      return NextResponse.json(
        { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
        { status: 403 }
      );
    }

    // Verificar autenticación
    const payload = await requireAuth(request);
    
    // Verificar que sea admin
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden eliminar tipos de vehículo' },
        { status: 403 }
      );
    }

    const tipoId = parseInt(id);
    if (isNaN(tipoId)) {
      return NextResponse.json(
        { success: false, message: 'ID inválido' },
        { status: 400 }
      );
    }

    // Verificar que tenga empresaId
    if (!payload.empresaId) {
      return NextResponse.json(
        { success: false, message: 'Token inválido: sin empresa asociada' },
        { status: 403 }
      );
    }

    // Obtener conexión del branch de la empresa
    const db = await getDBConnection(payload.empresaId);

    // Obtener el nombre del tipo
    const tipo = await db`
      SELECT nombre FROM tipos_vehiculo
      WHERE id = ${tipoId}
    `;

    if (tipo.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Tipo de vehículo no encontrado' },
        { status: 404 }
      );
    }

    // CRÍTICO: Verificar que no tenga registros históricos
    const registrosAsociados = await db`
      SELECT COUNT(*) as count
      FROM registros
      WHERE tipo_vehiculo = ${tipo.rows[0].nombre}
    `;

    const totalRegistros = parseInt(registrosAsociados.rows[0]?.count || '0');

    if (totalRegistros > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se puede eliminar: Este tipo ya se usó en registros históricos',
          detalles: `Hay ${totalRegistros} registro(s) de lavados usando este tipo. Eliminar el tipo borraría la información del historial.`,
          sugerencia: 'No se puede eliminar tipos con historial. Considera inactivarlo en lugar de eliminarlo.'
        },
        { status: 400 }
      );
    }

    // Verificar si hay precios asociados a este tipo
    const preciosRelacionados = await db`
      SELECT COUNT(*) as count
      FROM precios
      WHERE tipo_vehiculo_id = ${tipoId}
    `;

    if (parseInt(preciosRelacionados.rows[0].count) > 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'No se puede eliminar este tipo de vehículo porque tiene precios asociados. Primero inactívalo en lugar de eliminarlo.',
          hasRelatedPrices: true
        },
        { status: 400 }
      );
    }

    // Eliminar tipo
    await db`
      DELETE FROM tipos_vehiculo WHERE id = ${tipoId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Tipo de vehículo eliminado exitosamente'
    });

  } catch (error) {
    console.error('[Admin Tipos Vehículo DELETE] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al eliminar tipo de vehículo' },
      { status: 500 }
    );
  }
}
