import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * API de Login SaaS
 * 
 * Autentica usuarios del sistema SaaS multi-tenant
 */
export async function POST(request: Request) {
  try {
    // Leer datos del formulario
    const { email, password } = await request.json();

    // Validaciones básicas
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    // Conectar a BD Central
    const centralDB = createPool({ 
      connectionString: process.env.CENTRAL_DB_URL 
    });

    // Buscar usuario por email con datos de la empresa
    const result = await centralDB.sql`
      SELECT 
        u.id as usuario_id,
        u.email,
        u.password_hash,
        u.nombre as usuario_nombre,
        u.rol,
        u.activo as usuario_activo,
        e.id as empresa_id,
        e.nombre as empresa_nombre,
        e.slug as empresa_slug,
        e.branch_name,
        e.branch_url,
        e.plan,
        e.estado as empresa_estado,
        e.fecha_expiracion
      FROM usuarios_sistema u
      INNER JOIN empresas e ON u.empresa_id = e.id
      WHERE u.email = ${email}
    `;

    // Verificar que el usuario existe
    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    const userData = result.rows[0];

    // Verificar que el usuario esté activo
    if (!userData.usuario_activo) {
      return NextResponse.json(
        { success: false, message: 'Usuario desactivado. Contactá al administrador.' },
        { status: 403 }
      );
    }

    // Verificar que la empresa esté activa
    if (userData.empresa_estado !== 'activo') {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Cuenta inactiva. Contactá a soporte.',
          estado: userData.empresa_estado 
        },
        { status: 403 }
      );
    }

    // Verificar si la cuenta está vencida
    const fechaExpiracion = new Date(userData.fecha_expiracion);
    const hoy = new Date();
    
    if (fechaExpiracion < hoy) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Tu período de prueba ha expirado. Contactá a soporte para activar tu suscripción.',
          vencido: true 
        },
        { status: 403 }
      );
    }

    // Comparar password con hash
    const passwordMatch = await bcrypt.compare(password, userData.password_hash);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Email o contraseña incorrectos' },
        { status: 401 }
      );
    }

    // Registrar actividad de login
    await centralDB.sql`
      INSERT INTO actividad_sistema (
        empresa_id,
        usuario_id,
        tipo,
        descripcion
      ) VALUES (
        ${userData.empresa_id},
        ${userData.usuario_id},
        'login',
        ${`Usuario ${userData.usuario_nombre} (${userData.email}) inició sesión`}
      )
    `;

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const token = jwt.sign(
      {
        empresaId: userData.empresa_id,
        empresaNombre: userData.empresa_nombre,
        empresaSlug: userData.empresa_slug,
        plan: userData.plan,
        userId: userData.usuario_id,
        email: userData.email,
        nombre: userData.usuario_nombre,
        rol: userData.rol,
        branchUrl: userData.branch_url
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Calcular días restantes del trial/plan
    const diasRestantes = Math.ceil(
      (fechaExpiracion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Retornar éxito
    return NextResponse.json({
      success: true,
      message: '¡Bienvenido!',
      token,
      empresa: {
        id: userData.empresa_id,
        nombre: userData.empresa_nombre,
        slug: userData.empresa_slug,
        plan: userData.plan,
        estado: userData.empresa_estado,
        diasRestantes: diasRestantes > 0 ? diasRestantes : 0
      },
      usuario: {
        id: userData.usuario_id,
        email: userData.email,
        nombre: userData.usuario_nombre,
        rol: userData.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al iniciar sesión. Por favor intenta nuevamente.',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
