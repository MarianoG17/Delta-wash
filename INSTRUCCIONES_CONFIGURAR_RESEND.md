# Configurar Resend para Recupero de Contraseña

## 1️⃣ Copiar API Key de Resend

En la pantalla que tenés abierta de Resend:
- Click en el ícono del **ojo** (👁️) para ver la key completa
- Click en el ícono de **copiar** (📋) para copiarla al portapapeles
- La key comienza con `re_` y tiene muchos caracteres

## 2️⃣ Agregar API Key Localmente

1. **Abrir archivo `.env.local`** (si no existe, crearlo en la raíz del proyecto)

2. **Agregar esta línea al final**:
   ```bash
   RESEND_API_KEY=re_TuKeyAquiCompleta
   ```
   (Reemplazar `re_TuKeyAquiCompleta` con la key que copiaste)

3. **Verificar que `.env.local` esté en `.gitignore`** (ya debería estar)

## 3️⃣ Agregar API Key en Vercel

1. **Ir a Vercel**: https://vercel.com/marianog17s-projects/lavapp-pi/settings/environment-variables

2. **Agregar variable de entorno**:
   - Name: `RESEND_API_KEY`
   - Value: `re_TuKeyAquiCompleta` (pegar la key)
   - Environment: Seleccionar **Production, Preview, Development** (las 3)
   - Click en **Save**

## 4️⃣ Configurar Email "From" en Resend

1. **En Resend, ir a "Domains"** (sidebar izquierdo)

2. **Opciones**:
   - **Opción A (Gratis)**: Usar el dominio de prueba `onboarding@resend.dev` (ya está disponible)
   - **Opción B (Producción)**: Agregar tu propio dominio personalizado (requiere configurar DNS)

3. **Para usar el dominio de prueba** (más rápido):
   - No necesitás hacer nada más
   - El email de recupero se enviará desde `onboarding@resend.dev`
   - **IMPORTANTE**: Con el dominio de prueba, los emails solo se pueden enviar a tu email verificado en Resend

## 5️⃣ Ejecutar Migración en Neon Central

1. **Ir a Neon Console**: https://console.neon.tech

2. **Seleccionar tu proyecto** y el **branch "central"**

3. **Ir a SQL Editor**

4. **Ejecutar el SQL**:
   ```sql
   -- Copiar y ejecutar el contenido de migration-password-reset-tokens.sql
   ```

## 6️⃣ Re-deploy en Vercel

Después de agregar la variable de entorno en Vercel, necesitás:

1. **Ir a Deployments**: https://vercel.com/marianog17s-projects/lavapp-pi/deployments

2. **Buscar el último deployment** (el que se hizo con el último push)

3. **Click en los 3 puntos** → **Redeploy** → **Redeploy** (para que tome la nueva variable)

O simplemente hacer un pequeño cambio y push (Vercel detecta automáticamente las nuevas variables en el siguiente deploy)

## 7️⃣ Probar Sistema de Recupero

1. **Ir a**: https://lavapp-pi.vercel.app/forgot-password

2. **Ingresar tu email** (mariano@coques.com.ar)

3. **Verificar que se envía el email** (en desarrollo se loguea en consola, en producción se envía por Resend)

4. **Hacer click en el link del email** → Debería abrir `/reset-password/[token]`

5. **Cambiar contraseña** → Debería funcionar sin errores

---

## 🔍 Verificar Configuración

### Local (.env.local debe tener):
```bash
RESEND_API_KEY=re_TuKeyCompleta
```

### Vercel (Environment Variables debe tener):
- `RESEND_API_KEY` configurada para Production, Preview, Development

### Neon Central (debe existir la tabla):
```sql
SELECT * FROM password_reset_tokens LIMIT 1;
```

---

## ⚠️ Notas Importantes

1. **Dominio de Prueba**: Con `onboarding@resend.dev`, los emails solo se envían a tu email registrado en Resend
   - Para enviar a cualquier email, necesitás verificar un dominio propio

2. **Rate Limits**: Resend Free Plan tiene límite de 100 emails/día y 3,000 emails/mes

3. **Logs de Email**: Podés ver todos los emails enviados en Resend → Logs

4. **Testing Local**: En desarrollo, el sistema loguea el token en consola (no envía email real)
