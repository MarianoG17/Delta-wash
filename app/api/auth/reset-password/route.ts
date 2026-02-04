import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';

/**
 * API: Resetear contraseña con token
 * POST /api/auth/reset-password
 * 
 * Body: { token, newPassword }
 */
export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    // Validaciones
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token y contraseña son requeridos' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Conectar a BD Central
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    // Verificar token
    const tokenResult = await centralDB.sql`
      SELECT 
        t.id as token_id,
        t.user_id,
        t.expires_at,
        t.used,
        u.email,
        u.nombre
      FROM password_reset_tokens t
      INNER JOIN usuarios_sistema u ON t.user_id = u.id
      WHERE t.token = ${token}
    `;

    if (tokenResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 400 }
      );
    }

    const tokenData = tokenResult.rows[0];

    // Verificar que el token no haya sido usado
    if (tokenData.used) {
      return NextResponse.json(
        { success: false, message: 'Este link ya fue utilizado. Solicitá uno nuevo.' },
        { status: 400 }
      );
    }

    // Verificar que el token no haya expirado
    const now = new Date();
    const expiresAt = new Date(tokenData.expires_at);
    if (now > expiresAt) {
      return NextResponse.json(
        { success: false, message: 'Este link ha expirado. Solicitá uno nuevo.' },
        { status: 400 }
      );
    }

    // Hashear la nueva contraseña
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Actualizar la contraseña del usuario
    await centralDB.sql`
      UPDATE usuarios_sistema
      SET 
        password_hash = ${passwordHash},
        updated_at = NOW()
      WHERE id = ${tokenData.user_id}
    `;

    // Marcar el token como usado
    await centralDB.sql`
      UPDATE password_reset_tokens
      SET 
        used = TRUE,
        used_at = NOW()
      WHERE id = ${tokenData.token_id}
    `;

    console.log(`[Reset Password] Contraseña actualizada para: ${tokenData.email}`);

    return NextResponse.json({
      success: true,
      message: '¡Contraseña actualizada exitosamente! Ya podés iniciar sesión.',
      email: tokenData.email
    });

  } catch (error) {
    console.error('[Reset Password] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al resetear la contraseña. Intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}
