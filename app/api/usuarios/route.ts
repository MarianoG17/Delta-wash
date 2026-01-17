import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

/**
 * API de Gestión de Usuarios
 * Permite al admin ver y gestionar usuarios de su empresa
 */

// GET: Obtener todos los usuarios de la empresa
export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Decodificar token para obtener empresaId
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as any;

    const empresaId = decoded.empresaId;
    const rolUsuario = decoded.rol;

    // Solo admins pueden ver usuarios
    if (rolUsuario !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden ver usuarios' },
        { status: 403 }
      );
    }

    // Conectar a BD Central
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    // Obtener usuarios de la empresa
    const result = await centralDB.sql`
      SELECT 
        id,
        email,
        nombre,
        rol,
        activo,
        created_at
      FROM usuarios_sistema
      WHERE empresa_id = ${empresaId}
      ORDER BY 
        CASE rol 
          WHEN 'admin' THEN 1 
          WHEN 'operador' THEN 2 
          ELSE 3 
        END,
        created_at ASC
    `;

    const usuarios = result.rows.map(u => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo,
      fechaCreacion: u.created_at
    }));

    return NextResponse.json({
      success: true,
      usuarios
    });

  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al obtener usuarios',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo usuario
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Decodificar token
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as any;

    const empresaId = decoded.empresaId;
    const rolUsuario = decoded.rol;

    // Solo admins pueden crear usuarios
    if (rolUsuario !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden crear usuarios' },
        { status: 403 }
      );
    }

    const { email, password, nombre, rol } = await request.json();

    // Validaciones
    if (!email || !password || !nombre || !rol) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    if (!['admin', 'operador'].includes(rol)) {
      return NextResponse.json(
        { success: false, message: 'Rol inválido' },
        { status: 400 }
      );
    }

    // Conectar a BD Central
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    // Verificar que el email no exista
    const existingUser = await centralDB.sql`
      SELECT id FROM usuarios_sistema 
      WHERE email = ${email} AND empresa_id = ${empresaId}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Este email ya está registrado en tu empresa' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await centralDB.sql`
      INSERT INTO usuarios_sistema (
        empresa_id,
        email,
        password_hash,
        nombre,
        rol,
        activo
      ) VALUES (
        ${empresaId},
        ${email},
        ${passwordHash},
        ${nombre},
        ${rol},
        true
      )
      RETURNING id, email, nombre, rol, created_at
    `;

    const nuevoUsuario = result.rows[0];

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: {
        id: nuevoUsuario.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
        fechaCreacion: nuevoUsuario.created_at
      }
    });

  } catch (error) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al crear usuario',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
