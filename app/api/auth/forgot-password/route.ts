import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import crypto from 'crypto';

/**
 * API: Solicitar recuperación de contraseña
 * POST /api/auth/forgot-password
 * 
 * Envía un email con link de reseteo
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    // Validar email
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email es requerido' },
        { status: 400 }
      );
    }

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

    // Buscar usuario por email
    const result = await centralDB.sql`
      SELECT 
        u.id as user_id,
        u.email,
        u.nombre,
        u.activo,
        e.nombre as empresa_nombre,
        e.estado as empresa_estado
      FROM usuarios_sistema u
      INNER JOIN empresas e ON u.empresa_id = e.id
      WHERE u.email = ${email}
    `;

    // Por seguridad, siempre retornar éxito (no revelar si el email existe)
    // Esto previene ataques de enumeración de usuarios
    if (result.rows.length === 0) {
      console.log(`[Forgot Password] Email no encontrado: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un link de recuperación en los próximos minutos.'
      });
    }

    const userData = result.rows[0];

    // Verificar que el usuario esté activo
    if (!userData.activo) {
      console.log(`[Forgot Password] Usuario inactivo: ${email}`);
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, recibirás un link de recuperación en los próximos minutos.'
      });
    }

    // Generar token único
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // Válido por 1 hora

    // Guardar token en BD
    await centralDB.sql`
      INSERT INTO password_reset_tokens (
        user_id,
        token,
        expires_at
      ) VALUES (
        ${userData.user_id},
        ${token},
        ${expiresAt}
      )
    `;

    // Construir link de reseteo
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp-pi.vercel.app'}/reset-password/${token}`;

    // Enviar email con Resend
    try {
      // TODO: Configurar Resend cuando tengas la API key
      // Por ahora, solo logueamos el link (para development)
      console.log('=====================================');
      console.log(`[Forgot Password] Email: ${email}`);
      console.log(`[Forgot Password] Link de reseteo:`);
      console.log(resetLink);
      console.log(`[Forgot Password] Token válido hasta: ${expiresAt.toLocaleString('es-AR')}`);
      console.log('=====================================');

      // Cuando tengamos Resend configurado, descomentar esto:
      /*
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);

      await resend.emails.send({
        from: 'LAVAPP <noreply@lavapp.com.ar>', // O el dominio que configures
        to: email,
        subject: 'Recuperá tu contraseña - LAVAPP',
        html: `
          <h2>Recuperación de contraseña</h2>
          <p>Hola ${userData.nombre},</p>
          <p>Recibimos una solicitud para recuperar tu contraseña de <strong>${userData.empresa_nombre}</strong>.</p>
          <p>Hacé clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p><a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px;">Cambiar mi contraseña</a></p>
          <p>Este enlace es válido por 1 hora.</p>
          <p>Si no solicitaste recuperar tu contraseña, ignorá este email.</p>
          <hr />
          <p style="color: #666; font-size: 12px;">LAVAPP - Sistema de gestión para lavaderos</p>
        `
      });
      */
    } catch (emailError) {
      console.error('[Forgot Password] Error al enviar email:', emailError);
      // No fallar la request por error de email
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, recibirás un link de recuperación en los próximos minutos.',
      // En development, incluir el link
      ...(process.env.NODE_ENV === 'development' && { resetLink, expiresAt })
    });

  } catch (error) {
    console.error('[Forgot Password] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al procesar la solicitud. Intenta nuevamente.'
      },
      { status: 500 }
    );
  }
}
