# 🔗 Integración Webhook Fidelización - DeltaWash

## 📋 Resumen

Se agregó integración opcional con el sistema de Fidelización Coques para notificar automáticamente cuando un auto cambia de estado. Esto permite activar beneficios (como 20% de descuento) para clientes registrados en ambos sistemas.

---

## ✅ Garantías de Seguridad

### 1. **NO Bloquea el Flujo Principal**
- El webhook se ejecuta con `.catch(() => {})` (fire-and-forget)
- Si falla, solo loguea pero NO interrumpe el registro del auto
- La operación principal SIEMPRE se completa exitosamente

### 2. **Configuración Opcional**
- Si las variables de entorno NO están configuradas, la función retorna silenciosamente
- NO genera errores ni warnings molestos
- Totalmente transparente para instalaciones que no usan Fidelización

### 3. **Sin Dependencias Nuevas**
- Solo usa `fetch` (nativo de Node.js)
- NO requiere instalar paquetes adicionales
- NO modifica package.json

### 4. **Retrocompatibilidad Total**
- NO modifica el schema de la base de datos
- NO cambia la estructura de respuestas de la API
- NO afecta el frontend existente

---

## 📂 Archivos Modificados

### 1. Archivo Nuevo: `lib/fidelizacion-webhook.ts`

**Ubicación:** `lib/fidelizacion-webhook.ts`

**Función:** Helper function para notificar a Fidelización

**Características:**
- Exporta `notificarFidelizacion()` que envía webhook
- Manejo de errores silencioso (no lanza excepciones)
- Logs informativos para debugging
- Normalización automática de estados

**Código seguro:**
```typescript
// Si no está configurado, no hacer nada
if (!webhookUrl || !webhookSecret) {
  console.log('[Fidelización] Webhook no configurado - Saltando notificación');
  return;
}

try {
  // ... código del webhook
} catch (error) {
  // No fallar el proceso principal si el webhook falla
  console.error('[Fidelización] ❌ Error:', error);
}
```

---

### 2. Modificado: `app/api/registros/route.ts`

**Líneas agregadas:** ~5 líneas en 2 ubicaciones

**Cambio 1: Import (línea ~5)**
```typescript
import { notificarFidelizacion } from '@/lib/fidelizacion-webhook';
```

**Cambio 2: Después de INSERT exitoso (POST, línea ~210)**
```typescript
// ✅ Registro exitoso
// 🔔 Notificar a Fidelización (fire-and-forget, no bloquea)
notificarFidelizacion(celular, patente.toUpperCase(), 'en_proceso', marca_modelo)
  .catch(() => {}); // Silenciar errores
```

**¿Por qué es seguro?**
- Se ejecuta DESPUÉS de que el auto ya fue registrado
- El `.catch(() => {})` asegura que cualquier error se ignore
- NO afecta el `return NextResponse.json()` que sigue después
- Si falla, el cliente recibe la respuesta exitosa igual

**Cambio 3: En marcado como "listo" (ver archivo `marcar-listo/route.ts`)**
Similar al anterior, notifica cuando el estado cambia a "listo"

---

### 3. Variables de Entorno Nuevas

**Archivo:** `.env.example` actualizado

```bash
# Webhook secret (debe coincidir con Fidelización)
DELTAWASH_WEBHOOK_SECRET="..."

# URL del webhook de Fidelización
FIDELIZACION_WEBHOOK_URL="https://tu-dominio-fidelizacion.vercel.app/api/webhook/deltawash"
```

**Importante:** 
- Si NO están configuradas, el webhook NO se ejecuta (silenciosamente)
- NO genera errores en logs
- La app funciona normalmente sin estas variables

---

## 🧪 Testing

### Prueba 1: Sin Variables de Entorno
```bash
# No configurar DELTAWASH_WEBHOOK_SECRET ni FIDELIZACION_WEBHOOK_URL
# Registrar un auto normalmente
```

**Resultado esperado:**
- ✅ Auto se registra exitosamente
- ✅ Log: "[Fidelización] Webhook no configurado - Saltando notificación"
- ✅ Sin errores

### Prueba 2: Con Variables Configuradas (Cliente NO Registrado)
```bash
# Configurar variables
# Registrar auto de cliente que NO está en Fidelización
```

**Resultado esperado:**
- ✅ Auto se registra exitosamente
- ✅ Webhook se envía
- ✅ Log: "[Fidelización] ℹ️ Cliente no registrado en sistema de fidelización"
- ✅ Sin errores

### Prueba 3: Con Variables Configuradas (Cliente Registrado)
```bash
# Registrar auto de cliente que SÍ está en Fidelización
```

**Resultado esperado:**
- ✅ Auto se registra exitosamente
- ✅ Webhook se envía
- ✅ Log: "[Fidelización] ✅ Webhook exitoso"
- ✅ Log: "[Fidelización] 🎁 Beneficios activados: 20% descuento — Auto en lavadero"
- ✅ Cliente ve beneficio en app de Coques

### Prueba 4: Webhook URL Inválida (Simulación de Error)
```bash
# Configurar FIDELIZACION_WEBHOOK_URL con URL incorrecta
# Registrar un auto
```

**Resultado esperado:**
- ✅ Auto se registra exitosamente
- ✅ Log: "[Fidelización] ❌ Error llamando webhook: ..."
- ✅ Sin interrupciones en el flujo

---

## 🔄 Flujo Completo

```
1. Usuario registra auto en DeltaWash
   ↓
2. INSERT en tabla registros_lavado
   ↓
3. Si INSERT exitoso:
   ↓
   a. Retornar respuesta al usuario ✅
   ↓
   b. (En paralelo) Intentar notificar a Fidelización
      ↓
      - Si falla: Solo loguear, NO afecta nada
      - Si éxito: Cliente ve beneficio en app Coques
```

---

## 🛡️ Rollback Plan

Si algo sale mal, el rollback es simple:

### Opción 1: Deshabilitar (sin código)
```bash
# En Vercel, eliminar las variables:
# - DELTAWASH_WEBHOOK_SECRET
# - FIDELIZACION_WEBHOOK_URL
# Redeploy
```
**Resultado:** Webhook se deshabilita automáticamente

### Opción 2: Revertir Código
```bash
git revert <commit-hash>
git push
```

### Opción 3: Comentar Llamadas
En `app/api/registros/route.ts`:
```typescript
// notificarFidelizacion(celular, patente.toUpperCase(), 'en_proceso', marca_modelo)
//   .catch(() => {});
```

---

## 📊 Logs a Monitorear

### Logs Normales (Éxito)
```
[Fidelización] 📤 Enviando webhook: { url: '...', patente: 'ABC123', estado: 'en proceso' }
[Fidelización] ✅ Webhook exitoso: Estado sincronizado correctamente
[Fidelización] 🎁 Beneficios activados: 20% descuento — Auto en lavadero
```

### Logs de Cliente No Registrado (Normal)
```
[Fidelización] ℹ️ Cliente no registrado en sistema de fidelización
```

### Logs de Error (No Crítico)
```
[Fidelización] ❌ Error llamando webhook: fetch failed
```

---

## 🔍 Verificación Post-Deploy

1. **Verificar logs de Vercel:**
   - Buscar `[Fidelización]` en logs
   - Confirmar que no hay errores críticos

2. **Probar con cliente de prueba:**
   - Registrar auto con número de prueba
   - Verificar log del webhook

3. **Monitorear durante 24 horas:**
   - Asegurar que NO hay errores relacionados
   - Confirmar que registros normales funcionan

---

## ❓ FAQ

### ¿Qué pasa si Fidelización está caído?
- El registro del auto se completa normalmente
- Solo se loguea el error del webhook
- NO afecta la operación de DeltaWash

### ¿Ralentiza el registro de autos?
- NO. El webhook se ejecuta en paralelo (fire-and-forget)
- La respuesta al usuario se retorna inmediatamente
- El webhook sucede en background

### ¿Qué pasa si el cliente no tiene cuenta en Coques?
- El webhook se envía igual
- Fidelización responde "cliente no registrado"
- Se loguea como info, no como error

### ¿Necesito configurar algo en producción?
- Solo si querés activar la integración
- Si no configurás las variables, NO pasa nada
- La app funciona igual que antes

---

## 📝 Resumen de Cambios

| Archivo | Tipo | Líneas | Impacto |
|---------|------|--------|---------|
| `lib/fidelizacion-webhook.ts` | Nuevo | 110 | Ninguno (no se usa automáticamente) |
| `app/api/registros/route.ts` | Modificado | +5 | Mínimo (fire-and-forget) |
| `app/api/registros/marcar-listo/route.ts` | Modificado | +4 | Mínimo (fire-and-forget) |
| `.env.example` | Modificado | +10 | Ninguno (solo documentación) |

**Total líneas agregadas:** ~130 líneas
**Código crítico modificado:** 0 líneas (solo agregados no-bloqueantes)
**Dependencias nuevas:** 0

---

**Fecha de implementación:** 2026-02-24  
**Autor:** Sistema de Fidelización Coques  
**Aprobado por:** Mariano  
**Estado:** ✅ Listo para deploy
