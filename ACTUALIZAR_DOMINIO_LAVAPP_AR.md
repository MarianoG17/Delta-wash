# Actualización Completa: De chasis.app a lavapp.ar

## ✅ Cambios Realizados en el Código

### 1. Email de recuperación de contraseña
**Archivo:** [`app/api/auth/forgot-password/route.ts`](app/api/auth/forgot-password/route.ts:107)

```typescript
// ANTES:
from: 'LAVAPP <onboarding@resend.dev>',

// AHORA:
from: 'LAVAPP <noreply@lavapp.ar>',
```

### 2. URL por defecto en el código
**Archivo:** [`app/api/auth/forgot-password/route.ts`](app/api/auth/forgot-password/route.ts:90)

```typescript
// ANTES:
const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp-pi.vercel.app'}/reset-password/${token}`;

// AHORA:
const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp.ar'}/reset-password/${token}`;
```

---

## 🔧 Configuración Necesaria en Vercel

### Variable de Entorno CRÍTICA

En Vercel → Settings → Environment Variables:

```bash
NEXT_PUBLIC_APP_URL=https://lavapp.ar
```

**IMPORTANTE:**
- ✅ Debe estar en **Production**
- ✅ También agregar en **Preview** y **Development** si querés
- ✅ Aplicar a **todos los branches** o solo a `main`

### Cómo Actualizar en Vercel:

1. **Ir a:** https://vercel.com/marianos-projects-7b8bdb06/app-lavadero/settings/environment-variables

2. **Buscar** la variable `NEXT_PUBLIC_APP_URL`

3. **Opciones:**
   - **Si existe:** Editarla y cambiar el valor a `https://lavapp.ar`
   - **Si NO existe:** Crear una nueva con ese valor

4. **Guardar**

5. **Redeploy:** Vercel → Deployments → (último deploy) → 3 puntitos → Redeploy

---

## 📋 Verificación de Dominios

### En Vercel - Dominios Configurados

Deberías tener estos dominios agregados:

```
lavapp.ar         ✅ Primary (principal)
www.lavapp.ar     ✅ Redirect to lavapp.ar
chasis.app        ⚠️ Opcional (mantener si querés)
www.chasis.app    ⚠️ Opcional
```

### Recomendación:

**Opción A: Mantener ambos dominios**
- lavapp.ar → Dominio principal
- chasis.app → Redirect a lavapp.ar

**Opción B: Solo lavapp.ar**
- Eliminar chasis.app de Vercel
- Enfocarte 100% en lavapp.ar

---

## 📧 Verificación de Resend

### En Resend - Dominios Verificados

```
lavapp.ar    ✅ Verified (DKIM, SPF, DMARC)
chasis.app   ⚠️ Opcional (si no lo usarás, podés eliminarlo)
```

### Estado Necesario para Enviar Emails:

```
lavapp.ar
├── Enable Sending: ✅ ON
├── Enable Receiving: ❌ OFF
├── DKIM (TXT): ✅ Verified
├── SPF (MX + TXT): ✅ Verified
└── DMARC (TXT): ✅ Verified
```

---

## 🎯 Flujo Completo de Testing

### 1. Verificar Variables de Entorno

```bash
# Ir a Vercel → Settings → Environment Variables
# Verificar que NEXT_PUBLIC_APP_URL=https://lavapp.ar
```

### 2. Redeploy

Si cambiaste variables de entorno, **DEBES redeploy**:
- Vercel → Deployments → (último deploy) → Redeploy

### 3. Probar Recuperación de Contraseña

1. **Abrir:** https://lavapp.ar/login
2. **Click en:** "¿Olvidaste tu contraseña?"
3. **Ingresar:** Tu email de prueba
4. **Esperar:** 1-2 minutos
5. **Revisar inbox** (incluyendo spam)

### 4. Verificar el Email Recibido

El email debe tener:
- ✅ **From:** LAVAPP <noreply@lavapp.ar>
- ✅ **Link:** https://lavapp.ar/reset-password/[token]
- ✅ **Subject:** Recuperá tu contraseña - LAVAPP

### 5. Si NO llega el email

**Revisar Logs en Vercel:**

1. Vercel → Tu proyecto → Logs
2. Filtrar por "Forgot Password"
3. Buscar mensajes como:
   ```
   [Forgot Password] Email enviado exitosamente
   ```

**Revisar en Resend:**

1. https://resend.com/emails
2. Buscar emails enviados recientemente
3. Ver status: Sent / Delivered / Failed

---

## 🚨 Problemas Comunes y Soluciones

### Problema 1: Email no llega

**Posibles causas:**

❌ **Dominio no verificado en Resend**
```
Solución: Ir a Resend → Domains → lavapp.ar → Verificar que todos tengan ✅
```

❌ **Variable NEXT_PUBLIC_APP_URL incorrecta**
```
Solución: Verificar en Vercel → Settings → Environment Variables
Debe ser: https://lavapp.ar (con https://)
```

❌ **No hiciste redeploy después de cambiar variables**
```
Solución: Vercel → Deployments → Redeploy
```

---

### Problema 2: Email llega pero desde resend.dev

**Causa:** El código todavía usa el dominio de prueba

**Solución:** Ya actualicé el código a `noreply@lavapp.ar`, pero necesitás:
1. Hacer commit de los cambios
2. Push a GitHub
3. Vercel deployará automáticamente

---

### Problema 3: Link en el email apunta a dominio incorrecto

**Causa:** Variable NEXT_PUBLIC_APP_URL no configurada o incorrecta

**Solución:**
1. Vercel → Settings → Environment Variables
2. NEXT_PUBLIC_APP_URL=https://lavapp.ar
3. Redeploy

---

## 📝 Checklist Final

### En el Código (Ya hecho ✅)
- [x] Cambiar email de `onboarding@resend.dev` a `noreply@lavapp.ar`
- [x] Cambiar URL por defecto de `lavapp-pi.vercel.app` a `lavapp.ar`

### En Vercel (Tu responsabilidad)
- [ ] Agregar/actualizar variable `NEXT_PUBLIC_APP_URL=https://lavapp.ar`
- [ ] Hacer commit y push de los cambios del código
- [ ] Esperar deploy automático o hacer redeploy manual
- [ ] Verificar que lavapp.ar esté como dominio primario

### En Resend (Ya hecho ✅)
- [x] Dominio lavapp.ar agregado
- [x] Registros DNS configurados
- [x] Dominio verificado (DKIM, SPF, DMARC)
- [x] "Enable Sending" activado

### Testing
- [ ] Probar recuperación de contraseña desde https://lavapp.ar/login
- [ ] Verificar que el email llegue desde noreply@lavapp.ar
- [ ] Verificar que el link apunte a https://lavapp.ar/reset-password/...
- [ ] Click en el link y verificar que funcione

---

## 🎊 Resultado Final Esperado

Cuando todo esté configurado correctamente:

1. **Tu app está en:**
   - https://lavapp.ar ✅ (Principal)
   - https://www.lavapp.ar ✅ (Redirect)
   - https://chasis.app ⚠️ (Opcional)

2. **Los emails salen de:**
   - noreply@lavapp.ar ✅
   - Ya NO de onboarding@resend.dev ❌

3. **Los links apuntan a:**
   - https://lavapp.ar/reset-password/... ✅
   - Ya NO a lavapp-pi.vercel.app ❌

4. **Tu marca es consistente:**
   - lavapp.ar en todos lados ✅
   - Profesional y verificado ✅

---

## 🔄 Próximos Pasos INMEDIATOS

### 1. Hacer Commit y Push

```bash
git add app/api/auth/forgot-password/route.ts
git commit -m "Cambiar email a noreply@lavapp.ar y URL principal a lavapp.ar"
git push
```

### 2. Configurar Variable en Vercel

1. Ir a: https://vercel.com/marianos-projects-7b8bdb06/app-lavadero/settings/environment-variables
2. Agregar/editar: `NEXT_PUBLIC_APP_URL=https://lavapp.ar`
3. Guardar

### 3. Esperar Deploy o Redeploy Manual

Vercel deployará automáticamente al hacer push, O:
1. Vercel → Deployments
2. Click en el último deploy
3. 3 puntitos → Redeploy

### 4. Probar

1. https://lavapp.ar/login
2. Click "¿Olvidaste tu contraseña?"
3. Ingresar tu email
4. Verificar que llegue el email desde noreply@lavapp.ar

---

## 💡 Consideración sobre chasis.app

Si chasis.app ya no lo vas a usar:

**En Vercel:**
1. Settings → Domains
2. Buscar chasis.app
3. Eliminar

**En Resend:**
1. Domains
2. Buscar chasis.app
3. Eliminar (opcional, no molesta dejarlo)

**En DonWeb:**
- Podés cancelar el dominio o dejarlo reservado
- NO afecta el funcionamiento de lavapp.ar

---

## 📞 Contactos y Links Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Resend Dashboard:** https://resend.com/dashboard
- **DonWeb:** https://www.donweb.com

---

## ✅ Estado Actual

```
Código:
├── Email: noreply@lavapp.ar ✅ (actualizado)
└── URL: https://lavapp.ar ✅ (actualizado)

Falta Configurar en Vercel:
└── NEXT_PUBLIC_APP_URL=https://lavapp.ar ⏳

Resend:
└── lavapp.ar verificado ✅

Siguiente Paso:
1. Commit y push
2. Configurar variable en Vercel
3. Probar
```
