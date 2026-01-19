import { NextResponse } from 'next/server';
import { createPool, sql } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import { sincronizarUsuariosEmpresa } from '@/lib/neon-api';

/**
 * API de Gestión de Usuarios
 * Compatible con DeltaWash Legacy y Sistema SaaS
 */

// GET: Obtener todos los usuarios de la empresa
export async function GET(request: Request) {
  try {
    console.log('[Usuarios GET] 🚀 Inicio de consulta de usuarios');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    // MODO LEGACY (DeltaWash sin token JWT)
    if (!token) {
      console.log('[Usuarios GET] Modo Legacy - Consultando tabla usuarios en POSTGRES_URL');

      // Consultar tabla 'usuarios' en la BD legacy
      const result = await sql`
        SELECT
          id,
          username as email,
          nombre,
          rol,
          created_at
        FROM usuarios
        ORDER BY
          CASE rol
            WHEN 'admin' THEN 1
            WHEN 'operador' THEN 2
            ELSE 3
          END,
          created_at ASC
      `;

      const usuarios = result.rows.map((u: any) => ({
        id: u.id,
        email: u.email,
        nombre: u.nombre,
        rol: u.rol,
        activo: true, // Legacy no tiene campo activo
        fechaCreacion: u.created_at
      }));

      console.log(`[Usuarios GET] ✅ ${usuarios.length} usuarios encontrados en sistema legacy`);

      return NextResponse.json({
        success: true,
        usuarios
      });
    }

    // MODO SAAS (con token JWT)
    console.log('[Usuarios GET] Modo SaaS - Decodificando token');
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as any;

    const empresaId = decoded.empresaId;
    const rolUsuario = decoded.rol;

    console.log(`[Usuarios GET] EmpresaId: ${empresaId}, Rol: ${rolUsuario}`);

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

    const usuarios = result.rows.map((u: any) => ({
      id: u.id,
      email: u.email,
      nombre: u.nombre,
      rol: u.rol,
      activo: u.activo,
      fechaCreacion: u.created_at
    }));

    console.log(`[Usuarios GET] ✅ ${usuarios.length} usuarios encontrados en empresa ${empresaId}`);

    return NextResponse.json({
      success: true,
      usuarios
    });

  } catch (error) {
    console.error('[Usuarios GET] ❌ ERROR:', error);
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
    console.log('[Usuarios POST] 🚀 Inicio de creación de usuario');
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    const { email, password, nombre, rol } = await request.json();

    // Validaciones comunes
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

    // MODO LEGACY (DeltaWash sin token JWT)
    if (!token) {
      console.log('[Usuarios POST] Modo Legacy - Creando usuario en tabla usuarios');

      // Verificar que el username (email en este caso) no exista
      const existingUser = await sql`
        SELECT id FROM usuarios WHERE username = ${email}
      `;

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { success: false, message: 'Este usuario ya existe' },
          { status: 400 }
        );
      }

      // Encriptar contraseña
      const passwordHash = await bcrypt.hash(password, 10);

      // Crear usuario en tabla legacy
      const result = await sql`
        INSERT INTO usuarios (
          username,
          password,
          nombre,
          rol
        ) VALUES (
          ${email},
          ${passwordHash},
          ${nombre},
          ${rol}
        )
        RETURNING id, username as email, nombre, rol, created_at
      `;

      const nuevoUsuario = result.rows[0];
      console.log('[Usuarios POST] ✅ Usuario legacy creado exitosamente:', nuevoUsuario.email);

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
    }

    // MODO SAAS (con token JWT)
    console.log('[Usuarios POST] Modo SaaS - Decodificando token');
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as any;

    const empresaId = decoded.empresaId;
    const rolUsuario = decoded.rol;

    console.log(`[Usuarios POST] EmpresaId: ${empresaId}, Rol: ${rolUsuario}`);

    // Solo admins pueden crear usuarios
    if (rolUsuario !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden crear usuarios' },
        { status: 403 }
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

    // SINCRONIZAR USUARIO AL BRANCH DEDICADO
    console.log('[Usuarios POST] 🔄 Sincronizando nuevo usuario al branch dedicado...');

    try {
      const empresaResult = await centralDB.sql`
        SELECT branch_url FROM empresas WHERE id = ${empresaId}
      `;

      if (empresaResult.rows.length > 0 && empresaResult.rows[0].branch_url) {
        const branchUrl = empresaResult.rows[0].branch_url;

        const sincronizado = await sincronizarUsuariosEmpresa(empresaId, branchUrl, 2);

        if (sincronizado) {
          console.log('[Usuarios POST] ✅ Usuario sincronizado exitosamente al branch');
        } else {
          console.warn('[Usuarios POST] ⚠️ No se pudo sincronizar usuario al branch');
        }
      } else {
        console.warn('[Usuarios POST] ⚠️ Empresa sin branch_url configurado');
      }
    } catch (syncError) {
      console.error('[Usuarios POST] Error en sincronización (no crítico):', syncError);
    }

    console.log('[Usuarios POST] ✅ Usuario SaaS creado exitosamente:', nuevoUsuario.email);

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
    console.error('[Usuarios POST] ❌ ERROR:', error);
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
