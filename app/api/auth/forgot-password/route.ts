import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import { Resend } from 'resend';
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
        ${expiresAt.toISOString()}
      )
    `;

    // Construir link de reseteo
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp.ar'}/reset-password/${token}`;

    // Enviar email con Resend
    try {
      // Log para debugging
      console.log('=====================================');
      console.log(`[Forgot Password] Email: ${email}`);
      console.log(`[Forgot Password] Link de reseteo:`);
      console.log(resetLink);
      console.log(`[Forgot Password] Token válido hasta: ${expiresAt.toLocaleString('es-AR')}`);
      console.log('=====================================');

      // Verificar si tenemos la API key de Resend
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);

        const result = await resend.emails.send({
          from: 'LAVAPP <noreply@lavapp.ar>',
          to: email,
          subject: 'Recuperá tu contraseña - LAVAPP',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0ea5e9;">Recuperación de contraseña</h2>
              <p>Hola <strong>${userData.nombre}</strong>,</p>
              <p>Recibimos una solicitud para recuperar tu contraseña de <strong>${userData.empresa_nombre}</strong>.</p>
              <p>Hacé clic en el siguiente enlace para crear una nueva contraseña:</p>
              <p style="margin: 30px 0;">
                <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Cambiar mi contraseña</a>
              </p>
              <p style="color: #666;">O copiá y pegá este enlace en tu navegador:</p>
              <p style="color: #0ea5e9; word-break: break-all;">${resetLink}</p>
              <p style="margin-top: 30px;"><strong>Este enlace es válido por 1 hora.</strong></p>
              <p style="color: #666;">Si no solicitaste recuperar tu contraseña, ignorá este email.</p>
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;" />
              <p style="color: #999; font-size: 12px; text-align: center;">LAVAPP - Sistema de gestión para lavaderos</p>
            </div>
          `
        });

        console.log('[Forgot Password] Email enviado exitosamente:', result);
      } else {
        console.warn('[Forgot Password] RESEND_API_KEY no configurada - Email no enviado');
      }
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
