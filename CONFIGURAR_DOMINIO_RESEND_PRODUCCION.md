# Configurar Dominio Propio en Resend para Producción

## 🎯 Problema Actual

Actualmente el sistema funciona con el **dominio de prueba** de Resend (`onboarding@resend.dev`), que tiene una limitación importante:

**Solo puede enviar emails al email registrado en tu cuenta de Resend**

Esto significa:
- ✅ Si tu cuenta Resend usa `mariano@coques.com.ar` → Solo ese email recibe los mensajes
- ❌ Otros emails de clientes del SaaS → NO reciben nada (aunque el log diga "enviado")

---

## ✅ Solución: Verificar Dominio Propio

Para que el sistema funcione con **TODOS los clientes del SaaS**, necesitás verificar un dominio propio en Resend.

### Beneficios:
- ✅ Enviar a **cualquier dirección de email** (no solo la tuya)
- ✅ Emails desde tu marca: `noreply@lavapp.com.ar`
- ✅ Mejor deliverability (menos chance de ir a spam)
- ✅ Profesional para producción

---

## 📋 Opciones de Dominios

### Opción A: Verificar lavapp.com.ar (Recomendado)

Si tenés el dominio `lavapp.com.ar` (o similar):
1. Podés usarlo para enviar emails
2. Los emails saldrán de: `noreply@lavapp.com.ar`
3. Gratis en el plan Free de Resend (hasta 3,000 emails/mes)

### Opción B: Usar Dominio de Prueba (Actual)

Mantener `onboarding@resend.dev`:
- ❌ Solo funciona con tu email personal
- ❌ No apto para producción con múltiples clientes
- ✅ Gratis
- ✅ OK para desarrollo/testing

### Opción C: Usar Otro Servicio

Alternativas a Resend:
- **SendGrid** (100 emails/día gratis, luego $20/mes)
- **Mailgun** (5,000 emails/mes gratis primer mes)
- **AWS SES** ($0.10 por 1,000 emails)

---

## 🔧 Pasos para Verificar Dominio Propio en Resend

### **Requisitos Previos**

- Tener un dominio (ej: `lavapp.com.ar`)
- Acceso al panel de DNS del dominio (donde lo compraste: GoDaddy, Hostinger, etc.)

---

### **Paso 1: Agregar Dominio en Resend**

1. **Ir a Resend Domains**: https://resend.com/domains

2. **Click en "Add Domain"**

3. **Ingresar tu dominio**:
   ```
   lavapp.com.ar
   ```
   (O el dominio que tengas)

4. **Click "Add"**

---

### **Paso 2: Configurar Registros DNS**

Resend te mostrará 3 registros DNS que necesitás agregar:

#### **1. SPF Record** (TXT)
```
Name:    @
Type:    TXT
Value:   v=spf1 include:resend.net ~all
TTL:     3600
```

#### **2. DKIM Record** (CNAME)
```
Name:    resend._domainkey
Type:    CNAME
Value:   resend.wl.resend.com
TTL:     3600
```

#### **3. DMARC Record** (TXT)
```
Name:    _dmarc
Type:    TXT
Value:   v=DMARC1; p=none; rua=mailto:tu@email.com
TTL:     3600
```

---

### **Paso 3: Agregar Registros en tu Proveedor DNS**

Los pasos exactos dependen de dónde compraste tu dominio:

#### **Si usás GoDaddy**:
1. Ir a: https://dcc.godaddy.com/domains
2. Buscar tu dominio → Click en "DNS"
3. Scroll hasta "Records"
4. Click "Add" para cada registro
5. Copiar los valores exactos de Resend

#### **Si usás Hostinger**:
1. Panel de Hostinger → Dominios
2. Click en tu dominio → DNS Zone
3. Agregar cada registro
4. Save

#### **Si usás Cloudflare**:
1. Dashboard → Seleccionar dominio
2. DNS → Add record
3. Agregar cada registro

---

### **Paso 4: Esperar Verificación**

1. **Después de agregar los registros**, volver a Resend

2. **Click en "Verify"** (en la página del dominio)

3. **Esperar** (puede tardar de 5 minutos a 24 horas por propagación DNS)

4. **Cuando se verifique**, verás un ✅ verde en Resend

---

### **Paso 5: Actualizar Código**

Una vez verificado el dominio, actualizar el código para usar tu dominio:

Editar [`app/api/auth/forgot-password/route.ts`](app/api/auth/forgot-password/route.ts:1):

```typescript
// ANTES (dominio de prueba):
from: 'LAVAPP <onboarding@resend.dev>',

// DESPUÉS (tu dominio verificado):
from: 'LAVAPP <noreply@lavapp.com.ar>',
```

Hacer commit y push:
```bash
git add .
git commit -m "Cambiar a dominio propio en emails de recuperación"
git push
```

---

## 💰 Costos y Límites

### **Resend Free Plan** (Tu plan actual)
- ✅ **3,000 emails/mes** gratis
- ✅ **1 dominio** verificado gratis
- ✅ Soporte básico
- ❌ Solo envía a emails verificados con dominio de prueba

### **Resend Pro Plan** ($20/mes)
- ✅ **50,000 emails/mes**
- ✅ **Dominios ilimitados**
- ✅ Soporte prioritario
- ✅ Analytics avanzado

Para una SaaS con pocos clientes, el plan Free suele ser suficiente al principio.

---

## ⚠️ Notas Importantes

### 1. **Subdominio Recomendado**

Si tu dominio principal es `lavapp.com.ar` y lo usás para el sitio web, es mejor usar un subdominio para emails:

```
mail.lavapp.com.ar
```

Entonces los emails saldrían de:
```
noreply@mail.lavapp.com.ar
```

Esto separa el email del sitio web y es mejor práctica.

### 2. **Propagación DNS**

Los cambios DNS pueden tardar hasta 24-48 horas en propagarse completamente, pero usualmente funcionan en minutos.

### 3. **Testing**

Después de verificar el dominio, probá enviar emails a diferentes proveedores:
- Gmail
- Outlook/Hotmail
- Yahoo

Para ver si llegan correctamente y no van a spam.

---

## 🔍 Verificar Estado Actual

### **Estado del Sistema Ahora**:
- ✅ Código de Resend funcionando
- ✅ API Key configurada correctamente
- ✅ Emails enviándose (a tu email verificado)
- ❌ Dominio propio NO verificado
- ❌ No funciona para emails de otros clientes

### **Después de Verificar Dominio**:
- ✅ Emails a CUALQUIER dirección
- ✅ Sistema listo para producción con múltiples clientes
- ✅ Profesional con tu marca

---

## 📊 Resumen de Pasos

| Paso | Acción | Tiempo | Dificultad |
|------|--------|--------|------------|
| 1 | Agregar dominio en Resend | 2 min | Fácil |
| 2 | Copiar registros DNS | 1 min | Fácil |
| 3 | Agregar en proveedor DNS | 5-10 min | Media |
| 4 | Esperar verificación | 5 min - 24 hrs | - |
| 5 | Actualizar código | 2 min | Fácil |
| **Total** | **Configuración completa** | **1-24 hrs** | **Media** |

---

## 🎯 ¿Tenés Dominio Propio?

- ✅ **SÍ, tengo lavapp.com.ar (o similar)** → Seguir esta guía
- ❌ **NO, no tengo dominio** → Comprar uno primero (GoDaddy, Namecheap, etc.) o seguir con dominio de prueba para desarrollo

---

## 🆘 ¿Necesitás Ayuda?

Si necesitás ayuda con algún paso específico:
1. Decime qué proveedor DNS usás (GoDaddy, Hostinger, etc.)
2. Mostrame el panel DNS (screenshot sin datos sensibles)
3. Te guío paso a paso para agregar los registros

Por ahora, el sistema **está funcionando correctamente** para tu email personal. Para escalarlo a múltiples clientes, necesitás verificar el dominio propio.
