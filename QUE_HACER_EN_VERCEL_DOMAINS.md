# ¿Qué hacer en Vercel → Domains → lavapp.ar?

## ✅ Estado Actual de tu Dominio

Según tu captura, lavapp.ar está:
- ✅ **Registrar:** Third Party (DonWeb)
- ✅ **Nameservers:** Third Party (DonWeb)
- ✅ **Vercel CDN:** Active
- ✅ **Age:** 16h (recién configurado)

**Esto significa que el dominio YA ESTÁ FUNCIONANDO correctamente.**

---

## 🎯 NO necesitás hacer nada en esta página

La configuración del dominio está completa:
- ✅ Los DNS están en DonWeb (Third Party)
- ✅ Vercel ya detectó el dominio
- ✅ El dominio está activo

**La sección "DNS Records" está vacía porque usás nameservers de DonWeb (Third Party), no de Vercel.**

---

## 🔧 Lo que SÍ necesitás hacer (en otra página)

### 1. Configurar Variable de Entorno

**NO es en esta página de Domains**, sino en:

1. **Ir a:** Settings (en el menú de arriba)
2. **Click en:** Environment Variables (menú lateral izquierdo)
3. **Agregar/Editar:**
   ```
   Name: NEXT_PUBLIC_APP_URL
   Value: https://lavapp.ar
   ```
4. **Environment:** Production (y opcionalmente Preview + Development)
5. **Click:** Save

**Link directo:**
```
https://vercel.com/marianos-projects-7b8bdb06/app-lavadero/settings/environment-variables
```

---

### 2. Hacer Commit y Push del Código

En tu terminal local:

```bash
git add app/api/auth/forgot-password/route.ts
git commit -m "Cambiar email a noreply@lavapp.ar y URL a lavapp.ar"
git push
```

Vercel deployará automáticamente.

---

### 3. Esperar Deploy y Probar

1. **Esperar** que Vercel termine el deploy (2-3 minutos)
2. **Ir a:** https://lavapp.ar/login
3. **Click:** "¿Olvidaste tu contraseña?"
4. **Ingresar** tu email
5. **Verificar** que el email llegue desde **noreply@lavapp.ar**

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────┐
│ Vercel Dashboard                    │
├─────────────────────────────────────┤
│ ✅ Domains → lavapp.ar             │  ← Estás aquí (YA ESTÁ OK)
│    └─ Status: Active ✅             │
│                                     │
│ ⏳ Settings → Environment Variables │  ← Necesitás ir aquí
│    └─ NEXT_PUBLIC_APP_URL           │
│                                     │
│ 📦 Deployments                      │  ← Después del push
│    └─ Ver el deploy automático      │
└─────────────────────────────────────┘
```

---

## ❓ FAQ

### ¿Por qué la sección "DNS Records" está vacía?

Porque usás **Third Party Nameservers** (DonWeb). Los registros DNS están en DonWeb, no en Vercel.

Si quisieras usar Vercel DNS (no recomendado en este caso), tendrías que:
1. Click "Enable Vercel DNS"
2. Cambiar los nameservers en DonWeb a los de Vercel
3. Reconfigurar todos los registros DNS

**NO hagas esto** - tu configuración actual funciona perfectamente.

---

### ¿Necesito agregar registros DNS aquí?

**NO.** Tus registros DNS están en DonWeb:
- Registro A para lavapp.ar → 76.76.21.21
- Registro CNAME para www → cname.vercel-dns.com
- Registros de Resend (TXT, MX, CNAME) para emails

Todo está bien configurado en DonWeb.

---

### ¿El dominio ya funciona?

**SÍ**, el dominio ya apunta a Vercel correctamente.

Puedes verificar:
```
https://lavapp.ar
```

Debería cargar tu aplicación.

---

### ¿Por qué los emails no llegan entonces?

El dominio funciona, pero los emails necesitan:

1. ✅ **Dominio verificado en Resend** (ya está)
2. ✅ **Código actualizado** (ya actualicé el código)
3. ⏳ **Variable NEXT_PUBLIC_APP_URL** (falta configurar en Vercel)
4. ⏳ **Deploy del código nuevo** (falta hacer commit y push)

Una vez hagas los pasos 3 y 4, los emails funcionarán.

---

## 🎯 Acción Inmediata

**Salir de esta página de Domains** y hacer:

### Paso 1: Variable de Entorno
```
1. Click en "Settings" (arriba)
2. Click en "Environment Variables" (izquierda)
3. Agregar: NEXT_PUBLIC_APP_URL = https://lavapp.ar
4. Save
```

### Paso 2: Terminal Local
```bash
git add app/api/auth/forgot-password/route.ts
git commit -m "Actualizar dominio a lavapp.ar"
git push
```

### Paso 3: Verificar
```
1. Esperar deploy (Vercel → Deployments)
2. Ir a https://lavapp.ar/login
3. Probar recuperación de contraseña
4. Verificar email desde noreply@lavapp.ar
```

---

## ✅ Checklist Final

En la página actual (Domains → lavapp.ar):
- [x] Dominio está activo
- [x] Nameservers Third Party configurados
- [x] Vercel CDN activo
- [x] **NO necesitás hacer nada más aquí**

Próximos pasos (en otras páginas):
- [ ] Settings → Environment Variables → Agregar NEXT_PUBLIC_APP_URL
- [ ] Terminal → Commit y push
- [ ] Deployments → Verificar deploy
- [ ] Testing → Probar emails

---

## 🎊 Conclusión

**En esta página de Domains NO necesitás hacer nada más.**

El dominio lavapp.ar ya está configurado y funcionando correctamente con Third Party nameservers (DonWeb).

Necesitás ir a **Settings → Environment Variables** para configurar la URL de la aplicación.
