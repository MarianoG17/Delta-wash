import { NextResponse } from 'next/server';
import { isSaaSRequest, requireAuth } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

/**
 * API: CRUD Tipos de Vehículo
 * Solo para usuarios admin de SaaS
 */

// GET: Listar todos los tipos de vehículo
export async function GET(request: Request) {
  try {
    // Verificar que sea SaaS
    if (!(await isSaaSRequest(request))) {
      return NextResponse.json(
        { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
        { status: 403 }
      );
    }

    // Verificar autenticación y obtener datos del usuario
    const payload = await requireAuth(request);
    
    // Verificar que sea admin
    if (payload.rol !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden acceder a esta funcionalidad' },
        { status: 403 }
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

    // Obtener todos los tipos de vehículo, ordenados por 'orden'
    const result = await db`
      SELECT 
        id,
        nombre,
        orden,
        activo,
        created_at,
        updated_at
      FROM tipos_vehiculo
      ORDER BY orden ASC, nombre ASC
    `;

    return NextResponse.json({
      success: true,
      tipos: result.rows
    });

  } catch (error) {
    console.error('[Admin Tipos Vehículo GET] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener tipos de vehículo' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo tipo de vehículo
export async function POST(request: Request) {
  try {
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
        { success: false, message: 'Solo administradores pueden crear tipos de vehículo' },
        { status: 403 }
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

    // Verificar que no exista ya ese nombre
    const exists = await db`
      SELECT id FROM tipos_vehiculo 
      WHERE LOWER(nombre) = LOWER(${nombre.trim()})
    `;

    if (exists.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un tipo de vehículo con ese nombre' },
        { status: 400 }
      );
    }

    // Insertar nuevo tipo
    const result = await db`
      INSERT INTO tipos_vehiculo (nombre, orden, activo)
      VALUES (
        ${nombre.trim()},
        ${orden || 0},
        ${activo !== false}
      )
      RETURNING id, nombre, orden, activo, created_at
    `;

    return NextResponse.json({
      success: true,
      message: 'Tipo de vehículo creado exitosamente',
      tipo: result.rows[0]
    });

  } catch (error) {
    console.error('[Admin Tipos Vehículo POST] Error:', error);
    return NextResponse.json(
      { success: false, message: 'Error al crear tipo de vehículo' },
      { status: 500 }
    );
  }
}
