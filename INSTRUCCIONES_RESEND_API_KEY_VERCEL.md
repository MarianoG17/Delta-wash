# Configurar RESEND_API_KEY en Vercel

## 🔴 PROBLEMA DETECTADO

Los logs de Vercel muestran:
```
[Forgot Password] RESEND_API_KEY no configurada - Email no enviado
```

Esto significa que aunque el sistema:
- ✅ Encontró tu cuenta (mariano17bsas@gmail.com)
- ✅ Generó el token correctamente
- ✅ Tiene el código de Resend activado

**NO puede enviar emails** porque falta la variable de entorno `RESEND_API_KEY` en Vercel.

---

## 📋 SOLUCIÓN: Configurar API Key en Vercel

### **Paso 1: Copiar API Key de Resend**

1. **Ir a Resend**: https://resend.com/onboarding (o https://resend.com/api-keys)

2. **Buscar la API Key** que creaste (se llama "Onboarding")

3. **Ver la key completa**:
   - Click en el ícono del **ojo** (👁️)
   - La key completa se muestra (empieza con `re_`)

4. **Copiar la key**:
   - Click en el ícono de **copiar** (📋)
   - O seleccionar todo el texto y Ctrl+C

---

### **Paso 2: Agregar Variable en Vercel**

1. **Ir a Environment Variables**:
   https://vercel.com/marianog17s-projects/lavapp-pi/settings/environment-variables

2. **Click en "Add New"** (o "Create")

3. **Completar el formulario**:
   ```
   Name:     RESEND_API_KEY
   Value:    re_TuKeyCompletaAqui
   ```
   (Pegar la key que copiaste en Value)

4. **Seleccionar los 3 ambientes**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

5. **Click en "Save"**

---

### **Paso 3: Redeploy en Vercel**

Después de guardar la variable, Vercel NO la aplica automáticamente a los deployments existentes. Necesitás redeploy:

**Opción A - Redeploy Manual** (Más rápido):

1. Ir a: https://vercel.com/marianog17s-projects/lavapp-pi/deployments

2. Buscar el **último deployment** (el más reciente)

3. Click en los **3 puntos** (...) a la derecha

4. Seleccionar **"Redeploy"**

5. En el popup, click en **"Redeploy"** nuevamente

6. Esperar 2-3 minutos a que termine el build

**Opción B - Nuevo Commit** (Alternativa):

Si preferís, podés hacer cualquier cambio mínimo y push. El próximo deployment tomará la nueva variable automáticamente.

---

### **Paso 4: Probar Recupero de Contraseña**

Una vez que termine el redeploy:

1. **Ir a**: https://lavapp-pi.vercel.app/forgot-password

2. **Ingresar**: `mariano17bsas@gmail.com`

3. **Click en "Enviar"**

4. **Revisar tu email**:
   - Inbox de mariano17bsas@gmail.com
   - Revisar también carpeta de **Spam** (por las dudas)

5. **Debería llegarte un email** de `LAVAPP <onboarding@resend.dev>` con el asunto "Recuperá tu contraseña - LAVAPP"

6. **Hacer click en el botón** "Cambiar mi contraseña"

7. **Crear nueva contraseña** y confirmar

8. **Login** con tu nueva contraseña

---

## 🔍 Verificar que todo está OK

### **Antes del Paso 3** (Verificar variable):

En https://vercel.com/marianog17s-projects/lavapp-pi/settings/environment-variables deberías ver:

```
RESEND_API_KEY
Value: re_••••••••••••••••••
Environments: Production, Preview, Development
```

### **Después del Paso 3** (Verificar logs):

En https://vercel.com/marianog17s-projects/lavapp-pi/logs, al intentar recupero de contraseña deberías ver:

```
[Forgot Password] Email enviado exitosamente: { id: '...' }
```

En lugar de:

```
[Forgot Password] RESEND_API_KEY no configurada - Email no enviado
```

---

## ⚠️ IMPORTANTE: Limitación del Dominio de Prueba

Resend con `onboarding@resend.dev` (dominio de prueba) tiene una restricción:

**Solo puede enviar emails al email verificado en tu cuenta de Resend**

Esto significa:
- ✅ Si tu cuenta de Resend está registrada con `mariano17bsas@gmail.com` → Funciona
- ❌ Si intentás enviar a `mariano@coques.com.ar` → NO funciona (aunque ese email exista en LAVAPP)

**Para enviar a cualquier email** (producción):
1. Necesitás verificar un dominio propio en Resend
2. O contratar el plan de pago

Por ahora, usá `mariano17bsas@gmail.com` para probar el sistema.

---

## 📊 Resumen de Estado Actual

| Item | Estado |
|------|--------|
| Código de Resend | ✅ Activado |
| Paquete `resend` | ✅ Instalado |
| Tabla `password_reset_tokens` | ✅ Creada en Neon Central |
| API `/forgot-password` | ✅ Funcionando |
| Variable `RESEND_API_KEY` | ❌ **FALTA CONFIGURAR** |

Una vez que configures la variable y redeployes, todo debería funcionar correctamente.
