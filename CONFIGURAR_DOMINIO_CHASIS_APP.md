# Configurar Dominio chasis.app con Vercel y Resend

## 📋 Resumen
Has comprado **chasis.app** en DonWeb. Ahora necesitás configurarlo para:
1. ✅ Apuntar a tu aplicación en Vercel
2. ✅ Enviar emails desde tu dominio (Resend)

---

## Parte 1: Configurar chasis.app en Vercel (Aplicación Web)

### Paso 1: Agregar Dominio en Vercel

1. **Ir a Vercel Dashboard:**
   ```
   https://vercel.com/marianos-projects-7b8bdb06/app-lavadero/settings/domains
   ```

2. **Click en "Add Domain"**

3. **Ingresar tu dominio:**
   ```
   chasis.app
   ```

4. **Click "Add"**

5. **Vercel te mostrará qué registros DNS necesitás configurar**
   - Usualmente te pedirá configurar un registro `A` o `CNAME`

---

### Paso 2: Configurar DNS en DonWeb

Desde la página que me mostraste:

1. **Click en la pestaña "Zona DNS"** (está al lado de "Configuración de Dominio")

2. **Agregar los registros que Vercel te indicó:**

   **Opción A - Si Vercel pide registro A:**
   ```
   Tipo:    A
   Host:    @
   Valor:   76.76.21.21
   TTL:     3600
   ```

   **Opción B - Si Vercel pide registro CNAME:**
   ```
   Tipo:    CNAME
   Host:    @
   Valor:   cname.vercel-dns.com
   TTL:     3600
   ```

3. **Para www (opcional pero recomendado):**
   ```
   Tipo:    CNAME
   Host:    www
   Valor:   cname.vercel-dns.com
   TTL:     3600
   ```

4. **Click "Guardar" o "Agregar Registro"**

---

### Paso 3: Verificar en Vercel

1. **Volver a Vercel** → Settings → Domains

2. **Click "Verify"** junto a chasis.app

3. **Esperar verificación** (5 minutos - 24 horas)

4. **Cuando veas el ✅ verde**, el dominio está listo

---

## Parte 2: Configurar Emails con chasis.app (Resend)

### Paso 1: Agregar Dominio en Resend

1. **Ir a Resend Domains:**
   ```
   https://resend.com/domains
   ```

2. **Click "Add Domain"**

3. **Ingresar tu dominio:**
   ```
   chasis.app
   ```
   
   **O usar un subdominio (Recomendado):**
   ```
   mail.chasis.app
   ```

4. **Click "Add"**

---

### Paso 2: Copiar Registros DNS de Resend

Resend te mostrará **3 registros DNS** que necesitás agregar:

#### 1. SPF Record (TXT)
```
Name:    @          (o "chasis.app" o dejar vacío)
Type:    TXT
Value:   v=spf1 include:resend.net ~all
TTL:     3600
```

#### 2. DKIM Record (CNAME)
```
Name:    resend._domainkey
Type:    CNAME
Value:   resend.wl.resend.com
TTL:     3600
```

#### 3. DMARC Record (TXT)
```
Name:    _dmarc
Type:    TXT
Value:   v=DMARC1; p=none; rua=mailto:tu@email.com
TTL:     3600
```

---

### Paso 3: Agregar Registros en DonWeb

1. **Ir a DonWeb** → Zona DNS (misma página que antes)

2. **Agregar cada uno de los 3 registros:**

   **Para agregar un registro:**
   - Click "Agregar Registro" o "+" 
   - Seleccionar el tipo (TXT o CNAME)
   - Copiar exactamente Name y Value de Resend
   - TTL: 3600
   - Guardar

3. **Repetir para los 3 registros**

---

### Paso 4: Verificar en Resend

1. **Volver a Resend** → Domains

2. **Click "Verify" en tu dominio**

3. **Esperar** (puede tardar desde minutos hasta 24 horas)

4. **Cuando veas ✅**, el dominio está verificado

---

### Paso 5: Actualizar Código para Usar tu Dominio

Buscar en el código todos los lugares donde se envían emails:

```typescript
// ANTES (dominio de prueba):
from: 'LAVAPP <onboarding@resend.dev>',

// DESPUÉS (tu dominio):
from: 'LAVAPP <noreply@chasis.app>',
```

**Archivos a actualizar:**
- `app/api/auth/forgot-password/route.ts`
- Cualquier otro archivo que envíe emails

---

## 📊 Resumen de Registros DNS en DonWeb

Después de configurar todo, deberías tener estos registros en tu Zona DNS:

| Tipo | Host/Name | Valor | Propósito |
|------|-----------|-------|-----------|
| A o CNAME | @ | (valor de Vercel) | Apuntar chasis.app a Vercel |
| CNAME | www | cname.vercel-dns.com | Redirección www |
| TXT | @ | v=spf1 include:resend.net ~all | Autenticación email |
| CNAME | resend._domainkey | resend.wl.resend.com | DKIM email |
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:tu@email.com | DMARC email |

---

## ⏱️ Tiempos de Propagación

- **Mínimo:** 5-10 minutos
- **Promedio:** 1-2 horas
- **Máximo:** 24-48 horas

Para verificar si ya está propagado:
```
https://dnschecker.org
```

---

## 🔍 Cómo Navegar en DonWeb

Desde la página que me mostraste:

1. **Pestaña "Configuración"** (activa ahora)
   - Muestra servidores NS
   - Información general del dominio
   - Botón "Editar NS" (NO tocar, dejar ns1.donweb.com y ns2.donweb.com)

2. **Pestaña "Zona DNS"** o "Configuración Avanzada de DNS"
   - **AHÍ es donde vas a agregar los registros**
   - Buscar algo como:
     - "Administrar registros DNS"
     - "Zona DNS"
     - "DNS Records"
     - Botón verde "Editar NS" puede abrir un menú con "Zona DNS"

---

## ⚠️ Importante: NO cambiar los Servidores NS

En la página veo que tus servidores NS son:
- ns1.donweb.com
- ns2.donweb.com

**NO cambies estos servidores**. Solo necesitás agregar registros dentro de la Zona DNS de DonWeb.

---

## 🎯 Pasos Resumidos

### Para la Aplicación Web:
1. ✅ Agregar dominio en Vercel
2. ✅ Copiar registros A/CNAME que Vercel te muestra
3. ✅ Ir a DonWeb → Zona DNS → Agregar registros
4. ✅ Esperar verificación en Vercel

### Para Emails:
1. ✅ Agregar dominio en Resend
2. ✅ Copiar 3 registros DNS (SPF, DKIM, DMARC)
3. ✅ Ir a DonWeb → Zona DNS → Agregar registros
4. ✅ Esperar verificación en Resend
5. ✅ Actualizar código con el nuevo dominio

---

## 🆘 Si necesitás ayuda

Si no encontrás la opción "Zona DNS" en DonWeb:
1. Podés hacer click en "Editar NS" (el botón verde que veo)
2. Puede que ahí te muestre opciones adicionales
3. O buscar en el menú lateral izquierdo de DonWeb

También podés contactar soporte de DonWeb si no encontrás dónde agregar registros.

---

## 📝 Variables de Entorno a Actualizar (Vercel)

Una vez configurado el dominio, actualizar en Vercel:

```bash
NEXT_PUBLIC_APP_URL=https://chasis.app
```

Esto afectará:
- URLs de encuestas
- Links de recuperación de contraseña
- URLs en emails

---

## ✅ Testing Final

Después de configurar todo:

1. **Probar el dominio:**
   ```
   https://chasis.app
   ```
   Debería mostrar tu aplicación

2. **Probar www:**
   ```
   https://www.chasis.app
   ```
   Debería redireccionar a chasis.app

3. **Probar envío de emails:**
   - Usar función de recuperación de contraseña
   - Verificar que el email llega
   - Verificar que el remitente es `noreply@chasis.app`

---

## 🎊 Resultado Final

Cuando todo esté configurado:

- ✅ Tu app estará en: **https://chasis.app**
- ✅ Emails saldrán de: **noreply@chasis.app**
- ✅ Professional y con tu propia marca
- ✅ Listo para producción

---

## 📌 Siguiente Paso Inmediato

1. **Ir a Vercel ahora** y agregar el dominio chasis.app
2. **Anotar** qué tipo de registros te pide (A o CNAME)
3. **Luego ir a DonWeb** y buscar la sección "Zona DNS"
4. **Compartir screenshot** si no encontrás dónde agregar los registros

¿Empezamos con el paso 1 (Vercel)?
