import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

/**
 * API de Sesión SaaS
 * 
 * Valida el token JWT y retorna información de la sesión
 */
export async function GET(request: Request) {
  try {
    // Obtener token del header Authorization
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'Token no proporcionado', authenticated: false },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remover "Bearer "

    // Verificar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    
    try {
      const decoded = jwt.verify(token, jwtSecret) as {
        empresaId: number;
        empresaNombre: string;
        empresaSlug: string;
        plan: string;
        userId: number;
        email: string;
        nombre: string;
        rol: string;
        branchUrl: string;
        exp: number;
      };

      // Token válido, retornar datos de la sesión
      return NextResponse.json({
        success: true,
        authenticated: true,
        empresa: {
          id: decoded.empresaId,
          nombre: decoded.empresaNombre,
          slug: decoded.empresaSlug,
          plan: decoded.plan
        },
        usuario: {
          id: decoded.userId,
          email: decoded.email,
          nombre: decoded.nombre,
          rol: decoded.rol
        },
        branchUrl: decoded.branchUrl,
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });

    } catch (jwtError) {
      // Token inválido o expirado
      if (jwtError instanceof jwt.TokenExpiredError) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Token expirado. Por favor inicia sesión nuevamente.',
            authenticated: false,
            expired: true
          },
          { status: 401 }
        );
      }

      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido',
          authenticated: false
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error al validar sesión:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al validar sesión',
        authenticated: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

/**
 * POST - Refresh token (renovar token antes de que expire)
 */
export async function POST(request: Request) {
  try {
    // Obtener token del body
    const { token } = await request.json();
    
    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token no proporcionado' },
        { status: 400 }
      );
    }

    // Verificar token JWT (aunque esté expirado)
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    
    try {
      const decoded = jwt.verify(token, jwtSecret, { ignoreExpiration: true }) as {
        empresaId: number;
        empresaNombre: string;
        empresaSlug: string;
        plan: string;
        userId: number;
        email: string;
        nombre: string;
        rol: string;
        branchUrl: string;
      };

      // Generar nuevo token con los mismos datos
      const newToken = jwt.sign(
        {
          empresaId: decoded.empresaId,
          empresaNombre: decoded.empresaNombre,
          empresaSlug: decoded.empresaSlug,
          plan: decoded.plan,
          userId: decoded.userId,
          email: decoded.email,
          nombre: decoded.nombre,
          rol: decoded.rol,
          branchUrl: decoded.branchUrl
        },
        jwtSecret,
        { expiresIn: '7d' }
      );

      return NextResponse.json({
        success: true,
        message: 'Token renovado exitosamente',
        token: newToken
      });

    } catch (jwtError) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token inválido. Por favor inicia sesión nuevamente.'
        },
        { status: 401 }
      );
    }

  } catch (error) {
    console.error('Error al renovar token:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Error al renovar token',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
