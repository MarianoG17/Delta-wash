// lib/fidelizacion-webhook.ts

/**
 * Notifica al sistema de Fidelización Coques cuando cambia el estado de un auto
 * Esto permite activar beneficios automáticamente para clientes registrados en ambos sistemas
 */

interface WebhookPayload {
  phone: string;
  patente: string;
  estado: 'en proceso' | 'listo' | 'entregado';
  marca?: string;
  modelo?: string;
  notas?: string;
}

interface WebhookResponse {
  success: boolean;
  mensaje?: string;
  message?: string;
  beneficiosActivados?: Array<{
    id: string;
    nombre: string;
    descripcion: string;
  }>;
}

export async function notificarFidelizacion(
  celular: string,
  patente: string,
  estado: 'en_proceso' | 'listo' | 'entregado',
  marca_modelo?: string
): Promise<void> {
  const webhookUrl = process.env.FIDELIZACION_WEBHOOK_URL;
  const webhookSecret = process.env.DELTAWASH_WEBHOOK_SECRET;

  // Si no está configurado, no hacer nada (no es un error crítico)
  if (!webhookUrl || !webhookSecret) {
    console.log('[Fidelización] Webhook no configurado - Saltando notificación');
    return;
  }

  try {
    // Normalizar estado al formato esperado por Fidelización
    const estadoNormalizado = estado === 'en_proceso' 
      ? 'en proceso' 
      : estado === 'listo'
      ? 'listo'
      : 'entregado';

    // Separar marca y modelo si vienen juntos
    const [marca, ...modeloParts] = (marca_modelo || '').split(' ');
    const modelo = modeloParts.join(' ');

    const payload: WebhookPayload = {
      phone: celular,
      patente: patente.toUpperCase(),
      estado: estadoNormalizado,
      marca: marca || undefined,
      modelo: modelo || undefined,
    };

    console.log('[Fidelización] 📤 Enviando webhook:', {
      url: webhookUrl,
      patente: payload.patente,
      estado: payload.estado,
    });

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${webhookSecret}`,
      },
      body: JSON.stringify(payload),
    });

    const result: WebhookResponse = await response.json();

    if (response.ok && result.success) {
      console.log('[Fidelización] ✅ Webhook exitoso:', result.mensaje || result.message);
      
      if (result.beneficiosActivados && result.beneficiosActivados.length > 0) {
        console.log('[Fidelización] 🎁 Beneficios activados:', result.beneficiosActivados.map(b => b.nombre).join(', '));
      }
    } else {
      // Cliente no registrado en Fidelización (no es un error)
      if (!result.success && result.message?.includes('no registrado')) {
        console.log('[Fidelización] ℹ️ Cliente no registrado en sistema de fidelización');
      } else {
        console.warn('[Fidelización] ⚠️ Webhook falló:', result.message || 'Error desconocido');
      }
    }
  } catch (error) {
    // No fallar el proceso principal si el webhook falla
    console.error('[Fidelización] ❌ Error llamando webhook:', error instanceof Error ? error.message : error);
  }
}

/**
 * Notifica con reintentos en caso de fallo temporal
 */
export async function notificarFidelizacionConRetry(
  celular: string,
  patente: string,
  estado: 'en_proceso' | 'listo' | 'entregado',
  marca_modelo?: string,
  intentos: number = 2
): Promise<void> {
  for (let i = 0; i < intentos; i++) {
    try {
      await notificarFidelizacion(celular, patente, estado, marca_modelo);
      return; // Éxito
    } catch (error) {
      if (i === intentos - 1) {
        console.error(`[Fidelización] Falló después de ${intentos} intentos`);
      } else {
        // Esperar antes de reintentar (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
}
