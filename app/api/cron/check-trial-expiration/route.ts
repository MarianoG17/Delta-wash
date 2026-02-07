import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { Resend } from 'resend';

/**
 * Cron Job: Verificar Expiración de Trials
 * Se ejecuta todos los días a las 9:00 AM (configurado en vercel.json)
 * 
 * Envía emails de recordatorio cuando quedan:
 * - 10 días
 * - 5 días  
 * - 1 día
 */
export async function GET(request: Request) {
    try {
        // Verificar que la request viene de Vercel Cron
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        console.log('[Cron] Iniciando verificación de trials...');

        // Conectar a BD Central
        const sql = neon(process.env.CENTRAL_DB_URL!);

        // Obtener empresas activas con trial
        const empresas = await sql`
      SELECT 
        e.id,
        e.nombre,
        e.slug,
        e.plan,
        e.estado,
        e.fecha_expiracion,
        e.created_at,
        u.email,
        u.nombre as admin_nombre
      FROM empresas e
      INNER JOIN usuarios_sistema u ON u.empresa_id = e.id AND u.rol = 'admin'
      WHERE e.estado = 'activo'
        AND e.plan = 'trial'
        AND e.fecha_expiracion IS NOT NULL
        AND e.fecha_expiracion > NOW()
    `;

        console.log(`[Cron] Encontradas ${empresas.length} empresas en trial activo`);

        if (empresas.length === 0) {
            return NextResponse.json({
                success: true,
                message: 'No hay empresas en trial para procesar',
                sent: 0
            });
        }

        // Inicializar Resend
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp.ar';

        let emailsSent = 0;

        // Procesar cada empresa
        for (const empresa of empresas) {
            const fechaExpiracion = new Date(empresa.fecha_expiracion);
            const hoy = new Date();

            // Calcular días restantes
            const diffTime = fechaExpiracion.getTime() - hoy.getTime();
            const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            console.log(`[Cron] ${empresa.nombre}: ${diasRestantes} días restantes`);

            // Determinar si hay que enviar email
            let shouldSendEmail = false;
            let emailType: '10days' | '5days' | '1day' | null = null;

            if (diasRestantes === 10) {
                shouldSendEmail = true;
                emailType = '10days';
            } else if (diasRestantes === 5) {
                shouldSendEmail = true;
                emailType = '5days';
            } else if (diasRestantes === 1) {
                shouldSendEmail = true;
                emailType = '1day';
            }

            // Enviar email si corresponde
            if (shouldSendEmail && emailType) {
                try {
                    await sendTrialExpirationEmail(
                        resend,
                        empresa.email,
                        empresa.nombre,
                        empresa.admin_nombre || empresa.nombre,
                        diasRestantes,
                        emailType,
                        appUrl
                    );

                    emailsSent++;
                    console.log(`[Cron] ✅ Email enviado a ${empresa.email} (${diasRestantes} días)`);

                    // Registrar en log de actividad
                    await sql`
            INSERT INTO actividad_sistema (
              empresa_id,
              tipo,
              descripcion
            ) VALUES (
              ${empresa.id},
              'email_trial',
              ${`Email de recordatorio enviado: ${diasRestantes} días restantes`}
            )
          `;
                } catch (emailError) {
                    console.error(`[Cron] ❌ Error enviando email a ${empresa.email}:`, emailError);
                    // Continuar con la siguiente empresa
                }
            }
        }

        console.log(`[Cron] Proceso completado: ${emailsSent} emails enviados`);

        return NextResponse.json({
            success: true,
            message: `Proceso completado exitosamente`,
            empresas_procesadas: empresas.length,
            emails_enviados: emailsSent
        });

    } catch (error) {
        console.error('[Cron] Error en proceso de verificación:', error);
        return NextResponse.json(
            {
                error: 'Error procesando trials',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

/**
 * Enviar email de recordatorio de expiración de trial
 */
async function sendTrialExpirationEmail(
    resend: Resend,
    email: string,
    empresaNombre: string,
    adminNombre: string,
    diasRestantes: number,
    type: '10days' | '5days' | '1day',
    appUrl: string
) {
    // Personalizar contenido según días restantes
    const config = {
        '10days': {
            emoji: '📅',
            urgency: 'info',
            subject: `Tu prueba de LAVAPP vence en ${diasRestantes} días`,
            title: 'Tu período de prueba está avanzando',
            message: 'Todavía tenés tiempo para explorar todas las funcionalidades de LAVAPP.',
            urgencyColor: '#0ea5e9'
        },
        '5days': {
            emoji: '⚠️',
            urgency: 'warning',
            subject: `⚠️ Solo quedan ${diasRestantes} días de tu prueba de LAVAPP`,
            title: 'Tu prueba está por finalizar',
            message: 'Asegurate de aprovechar al máximo estos últimos días.',
            urgencyColor: '#f59e0b'
        },
        '1day': {
            emoji: '⚡',
            urgency: 'urgent',
            subject: `⚡ ¡Último día de tu prueba de LAVAPP!`,
            title: 'Tu prueba termina mañana',
            message: 'Es tu última oportunidad para decidir si querés continuar con LAVAPP.',
            urgencyColor: '#ef4444'
        }
    };

    const cfg = config[type];

    await resend.emails.send({
        from: 'LAVAPP <noreply@lavapp.ar>',
        to: email,
        subject: cfg.subject,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #0ea5e9; font-size: 32px; margin-bottom: 10px;">
            ${cfg.emoji} LAVAPP
          </h1>
        </div>
        
        <!-- Urgency Banner -->
        <div style="background-color: ${cfg.urgencyColor}; color: white; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
          <h2 style="margin: 0; font-size: 24px;">
            ${cfg.title}
          </h2>
          <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">
            ${diasRestantes === 1 ? 'Queda 1 día' : `Quedan ${diasRestantes} días`}
          </p>
        </div>

        <!-- Main Content -->
        <div style="background-color: #f9fafb; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 30px;">
          <p style="margin: 0; font-size: 16px; color: #333;">
            Hola <strong>${adminNombre}</strong>,
          </p>
          <p style="margin-top: 15px; color: #666;">
            Tu período de prueba de <strong>${empresaNombre}</strong> en LAVAPP vence el <strong>${new Date(Date.now() + diasRestantes * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR')}</strong>.
          </p>
          <p style="margin-top: 15px; color: #666;">
            ${cfg.message}
          </p>
        </div>

        <!-- Benefits Reminder -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #0ea5e9; font-size: 18px; margin-bottom: 15px;">
            Recordá lo que LAVAPP te ofrece:
          </h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>✅ Gestión completa de registros de lavado</li>
            <li>📊 Reportes y estadísticas en tiempo real</li>
            <li>💰 Control de cuentas corrientes</li>
            <li>📱 Acceso desde cualquier dispositivo</li>
            <li>⭐ Sistema de encuestas y beneficios</li>
            <li>🔒 Tus datos seguros en la nube</li>
          </ul>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 40px 0;">
          <a href="${appUrl}/login-saas" style="display: inline-block; padding: 16px 32px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            Acceder a mi cuenta →
          </a>
        </div>

        <!-- Payment Placeholder -->
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
          <p style="margin: 0; color: #92400e; font-size: 14px;">
            <strong>💳 Próximamente:</strong> Podrás gestionar tu suscripción y medios de pago directamente desde tu cuenta.
          </p>
        </div>

        <!-- Support -->
        <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 40px;">
          <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
            ¿Necesitás ayuda o tenés consultas?<br>
            Respondé este email y te asistimos con gusto.
          </p>
          <p style="color: #999; font-size: 12px;">
            LAVAPP - Sistema de gestión para lavaderos de autos<br>
            <a href="${appUrl}" style="color: #0ea5e9; text-decoration: none;">lavapp.ar</a>
          </p>
        </div>
      </div>
    `
    });
}
