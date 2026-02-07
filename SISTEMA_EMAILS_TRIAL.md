# Sistema de Emails Automáticos para Trial

Sistema automático de recordatorios por email cuando el período de prueba está por vencer.

## Funcionamiento

El sistema envía emails automáticos a los admins de empresas en trial cuando quedan:

- **10 días** → Email informativo 📅
- **5 días** → Email con advertencia ⚠️
- **1 día** → Email urgente ⚡

## Archivos del Sistema

### 1. Configuración del Cron
**Archivo:** [`vercel.json`](vercel.json:1)
```json
{
  "crons": [{
    "path": "/api/cron/check-trial-expiration",
    "schedule": "0 9 * * *"
  }]
}
```

- **Schedule:** Todos los días a las 9:00 AM (hora del servidor de Vercel)
- **Endpoint:** `/api/cron/check-trial-expiration`

### 2. Endpoint del Cron
**Archivo:** [`app/api/cron/check-trial-expiration/route.ts`](app/api/cron/check-trial-expiration/route.ts:1)

El endpoint:
1. Verifica que la request venga de Vercel (usando `CRON_SECRET`)
2. Consulta empresas en trial activo de la BD Central
3. Calcula días restantes para cada empresa
4. Envía emails según corresponda
5. Registra actividad en la BD

## Configuración en Vercel

### Variables de Entorno Requeridas

Ya configuradas:
- ✅ `CENTRAL_DB_URL`
- ✅ `RESEND_API_KEY`
- ✅ `NEXT_PUBLIC_APP_URL`

**Nueva variable a agregar:**

```
CRON_SECRET = [generar con el comando de abajo]
```

**Generar el secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Pasos para Configurar

1. **Generar CRON_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # Copiar el resultado
   ```

2. **Agregar en Vercel:**
   - Ir a: https://vercel.com/tu-proyecto/settings/environment-variables
   - Nombre: `CRON_SECRET`
   - Valor: [el secret generado]
   - Scope: Production, Preview, Development

3. **Deploy:**
   - Push a main
   - Vercel detecta automáticamente `vercel.json`
   - El cron se programa automáticamente ✅

## Cómo Funciona el Email

Cada tipo de email tiene:

### Email de 10 Días (Informativo)
- Emoji: 📅
- Color: Azul (#0ea5e9)
- Tono: Tranquilo, informativo
- CTA: "Acceder a mi cuenta"

### Email de 5 Días (Advertencia)
- Emoji: ⚠️
- Color: Naranja (#f59e0b)
- Tono: Advertencia suave
- CTA: "Acceder a mi cuenta"

### Email de 1 Día (Urgente)
- Emoji: ⚡
- Color: Rojo (#ef4444)
- Tono: Urgente
- CTA: "Acceder a mi cuenta"

Todos los emails incluyen:
- Nombre del admin
- Nombre de la empresa
- Fecha de vencimiento
- Recordatorio de beneficios de LAVAPP
- Nota sobre próxima funcionalidad de pagos
- Link para contacto/soporte

## Testing

### Test Manual (Desarrollo)

Podés probar el endpoint manualmente:

```bash
# Generar un CRON_SECRET temporal para testing
export CRON_SECRET="test-secret-123"

# Llamar al endpoint
curl -X GET http://localhost:3000/api/cron/check-trial-expiration \
  -H "Authorization: Bearer test-secret-123"
```

### Test en Producción

**Opción A: Esperar al día siguiente**
- El cron se ejecuta automáticamente a las 9 AM

**Opción B: Trigger manual desde Vercel**
- Ir a: https://vercel.com/tu-proyecto/deployments
- Encontrar el deployment actual
- Click en "Cron Jobs"
- Click en "Trigger" para ejecutar manualmente

### Verificar que Funciona

1. **Logs de Vercel:**
   - Ir a: https://vercel.com/tu-proyecto/logs
   - Buscar logs del cron (aparecen con tag `[Cron]`)

2. **BD Central:**
   ```sql
   SELECT *
   FROM actividad_sistema
   WHERE tipo = 'email_trial'
   ORDER BY fecha DESC
   LIMIT 10;
   ```

3. **Resend Dashboard:**
   - Ir a: https://resend.com/emails
   - Verificar emails enviados

## Datos Importantes

### Horario de Ejecución
- **9:00 AM UTC-0** (hora del servidor Vercel)
- En Argentina (UTC-3): **6:00 AM**

Si querés cambiar el horario, modificá el schedule en `vercel.json`:
```json
"schedule": "0 12 * * *"  // 12:00 PM UTC = 9:00 AM Argentina
```

### Limitaciones de Vercel Cron

- **Hobby Plan:** 1 cron job (suficiente para este caso)
- **Pro Plan:** Crons ilimitados
- **Frecuencia mínima:** 1 vez por día (suficiente)

## Próximos Pasos

Una vez que tengas la funcionalidad de pagos:

1. Actualizar los CTAs en los emails
2. Agregar link directo a página de suscripción
3. Considerar agregar email a los 0 días (vencido)
4. Considerar email de "cuenta suspendida" para planes vencidos

## Monitoreo

**Qué monitorear:**
- Emails enviados vs empresas en trial
- Tasa de apertura (Resend tiene analytics)
- Errores en logs de Vercel

**Query útil:**
```sql
-- Ver empresas próximas a vencer
SELECT 
  nombre,
  email_admin,
  plan,
  DATE(fecha_expiracion) as vence,
  (DATE(fecha_expiracion) - CURRENT_DATE) as dias_restantes
FROM empresas e
INNER JOIN usuarios_sistema u ON u.empresa_id = e.id AND u.rol = 'admin'
WHERE plan = 'trial'
  AND estado = 'activo'
  AND fecha_expiracion > NOW()
ORDER BY fecha_expiracion ASC;
```

## Troubleshooting

### El cron no se ejecuta
1. Verificar que `vercel.json` esté en la raíz del proyecto
2. Verificar que se hizo deploy después de agregar el cron
3. Ver logs en Vercel Dashboard

### Los emails no llegan
1. Verificar `RESEND_API_KEY` en Vercel
2. Verificar dominio verificado en Resend (lavapp.ar)
3. Ver logs de Resend Dashboard

### Error 401 Unauthorized
1. Verificar que `CRON_SECRET` esté configurado en Vercel
2. Verificar que el header Authorization tenga el formato correcto
