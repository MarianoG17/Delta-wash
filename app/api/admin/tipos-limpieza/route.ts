import { NextResponse } from 'next/server';
import { requireAuth, isSaaSRequest } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

// GET /api/admin/tipos-limpieza - Listar todos los tipos de limpieza
export async function GET(request: Request) {
  try {
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

    // Consultar tipos de limpieza
    const result = await db`
      SELECT * FROM tipos_limpieza 
      ORDER BY orden ASC, nombre ASC
    `;

    return NextResponse.json({
      success: true,
      tipos: result.rows
    });

  } catch (error: any) {
    console.error('Error al obtener tipos de limpieza:', error);
    return NextResponse.json(
      { success: false, message: 'Error al obtener tipos de limpieza', error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/admin/tipos-limpieza - Crear nuevo tipo de limpieza
export async function POST(request: Request) {
  try {
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

    // Verificar si ya existe un tipo con ese nombre
    const existe = await db`
      SELECT id FROM tipos_limpieza 
      WHERE nombre = ${nombre.trim()}
    `;

    if (existe.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Ya existe un tipo de limpieza con ese nombre' },
        { status: 400 }
      );
    }

    // Insertar nuevo tipo de limpieza
    const result = await db`
      INSERT INTO tipos_limpieza (nombre, orden, activo)
      VALUES (${nombre.trim()}, ${orden || 0}, ${activo !== false})
      RETURNING *
    `;

    return NextResponse.json({
      success: true,
      message: 'Tipo de limpieza creado exitosamente',
      tipo: result.rows[0]
    });

  } catch (error: any) {
    console.error('Error al crear tipo de limpieza:', error);
    return NextResponse.json(
      { success: false, message: 'Error al crear tipo de limpieza', error: error.message },
      { status: 500 }
    );
  }
}
