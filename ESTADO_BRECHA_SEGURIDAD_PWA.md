# Estado Brecha de Seguridad PWA - Login Type Memory

**Fecha de análisis:** 2026-02-06 00:40 AM  
**Status:** ✅ **FIX IMPLEMENTADO Y DESPLEGADO EN PRODUCCIÓN**

---

## 📋 Resumen del Problema

**Brecha de seguridad identificada:**
Cuando un usuario hacía logout en la PWA de LAVAPP (SaaS), al reabrir la aplicación mostraba el login de DeltaWash (legacy) en lugar del login correcto de LAVAPP con email.

**Impacto:**
- Confusión del usuario (veía un login diferente)
- Posible intento de login con credenciales incorrectas
- Mala experiencia de usuario en PWA

---

## ✅ Solución Implementada

### Cambios Aplicados

Se agregó un **flag persistente** llamado `preferredLoginType` que sobrevive al logout:

1. **[`lib/auth-utils.ts:92`](lib/auth-utils.ts:92)** - NO elimina `preferredLoginType` al hacer logout
2. **[`lib/auth-utils.ts:110`](lib/auth-utils.ts:110)** - Verifica `preferredLoginType` antes de elegir qué login mostrar
3. **[`app/login/page.tsx:33`](app/login/page.tsx:33)** - Guarda `'legacy'` al hacer login DeltaWash
4. **[`app/login-saas/page.tsx:48`](app/login-saas/page.tsx:48)** - Guarda `'saas'` al hacer login LAVAPP
5. **[`app/registro/page.tsx:62`](app/registro/page.tsx:62)** - Guarda `'saas'` al registrarse

### Cómo Funciona

```typescript
// Al hacer login en LAVAPP SaaS
localStorage.setItem('preferredLoginType', 'saas');

// Al hacer logout
clearAuth(); // Limpia authToken pero NO limpia preferredLoginType

// Al reabrir PWA
getLoginUrl(); // Lee preferredLoginType y retorna '/login-saas' ✅
```

---

## 🔍 Verificación del Estado Actual

### Commit donde se implementó:
```
commit 73b5099a0c7b53177054886953955b56ee20451a
Author: Mariano <mariano@coques.com.ar>
Date:   Wed Feb 4 15:58:10 2026 -0300

    fix: PWA remembers login type after logout (saas vs legacy) + Sprint 1 migrations and docs
```

### Estado en Repositorio:
✅ **Commiteado en branch `main`**
✅ **Pusheado a `origin/main`**
✅ **Desplegado en Vercel automáticamente**

### Archivos Modificados:
- ✅ [`lib/auth-utils.ts`](lib/auth-utils.ts:1) - Lógica de persistencia
- ✅ [`app/login/page.tsx`](app/login/page.tsx:1) - Login Legacy
- ✅ [`app/login-saas/page.tsx`](app/login-saas/page.tsx:1) - Login SaaS  
- ✅ [`app/registro/page.tsx`](app/registro/page.tsx:1) - Registro SaaS

---

## 🧪 Testing Requerido

Para verificar que el fix funciona correctamente:

### Test 1: Usuario SaaS en PWA
1. Abre Chrome/Safari en tu celular
2. Ve a `https://lavapp-pi.vercel.app/login-saas` o `https://chasis.app/login-saas`
3. Haz login con tu email y contraseña
4. **Verifica en DevTools:** `localStorage.getItem('preferredLoginType')` = `'saas'`
5. Haz logout
6. Cierra completamente la PWA
7. Vuelve a abrir la PWA
8. **✅ DEBE mostrar `/login-saas` (LAVAPP con email)**

### Test 2: Usuario Legacy en PWA
1. Ve a `https://deltawash-app.vercel.app/login`
2. Haz login con usuario/contraseña
3. **Verifica:** `localStorage.getItem('preferredLoginType')` = `'legacy'`
4. Haz logout y reabre PWA
5. **✅ DEBE mostrar `/login` (DeltaWash con usuario)**

### Test 3: Primera instalación
1. Instala PWA nueva (sin `preferredLoginType` previo)
2. **Comportamiento:** Mostrará `/login` por defecto (legacy)
3. Si vas manualmente a `/login-saas` y haces login, ahora recordará `'saas'`

---

## 📱 Impacto en Usuarios

### Usuarios existentes (antes del fix):
- Si ya habían instalado la PWA, el flag `preferredLoginType` NO existe aún
- **Primera vez después del deploy:** Verán el login default (`/login`)
- **Después de hacer login una vez:** El flag se guarda y funciona correctamente
- **Solución rápida:** Hacer login una vez en la PWA para que se guarde el flag

### Usuarios nuevos (después del fix):
- ✅ Al instalar PWA desde `/login-saas` → Al hacer login se guarda `'saas'`
- ✅ Al hacer logout → La PWA recuerda que es SaaS
- ✅ Al reabrir → Muestra `/login-saas` correctamente

---

## 🔒 Beneficios de Seguridad

1. **Consistencia de identidad:** La PWA mantiene su "identidad" (SaaS vs Legacy)
2. **Mejor UX:** Usuario siempre ve el login correcto
3. **Prevención de errores:** No intenta usar credenciales incorrectas
4. **Compatible con arquitectura híbrida:** Funciona en ambos modos (Legacy y SaaS)

---

## ⚠️ Consideraciones Importantes

### ¿Se pierde funcionalidad existente?
❌ **NO.** Los cambios son **aditivos**:
- Se AGREGAN verificaciones de `preferredLoginType`
- Se AGREGA el guardado del flag al hacer login
- Se PROTEGE el flag para que NO se elimine al hacer logout
- **Toda la funcionalidad anterior sigue funcionando igual**

### ¿Qué pasa si borro el localStorage?
- Si el usuario borra manualmente los datos de la app, se pierde el flag
- **Fallback:** La app usará el comportamiento anterior (detectar por `authToken`)
- **No hay pérdida de funcionalidad:** Solo necesita hacer login una vez más

### ¿Compatibilidad con navegador web (no-PWA)?
✅ **Totalmente compatible:**
- En navegador web, los usuarios pueden ir directamente a `/login` o `/login-saas`
- El flag solo es crítico en PWA donde la URL inicial es siempre `/`
- **No afecta el comportamiento en navegador normal**

---

## 📊 Estado Final

| Aspecto | Estado |
|---------|--------|
| **Código implementado** | ✅ Sí |
| **Commiteado en main** | ✅ Sí |
| **Desplegado en Vercel** | ✅ Sí |
| **Testing requerido** | ⚠️ Pendiente (test manual en celular) |
| **Documentación** | ✅ Completa |
| **Impacto en funcionalidad existente** | ✅ Ninguno (cambios aditivos) |

---

## 🚀 Próximos Pasos Recomendados

1. **Test manual en celular** (5 minutos):
   - Abre la PWA de LAVAPP en tu celular
   - Haz login → logout → reabrir PWA
   - Verifica que muestra `/login-saas` correctamente

2. **Opción si no funciona correctamente:**
   - Abre DevTools en el navegador de tu celular
   - Ejecuta manualmente: `localStorage.setItem('preferredLoginType', 'saas')`
   - Esto fuerza el comportamiento correcto hasta que hagas login naturalmente

3. **Monitorear usuarios existentes:**
   - Usuarios con PWA instalada pre-fix necesitarán hacer login una vez más
   - No es un problema crítico, solo una mejora progresiva

---

## 📝 Conclusión

**La brecha de seguridad PWA está RESUELTA y DESPLEGADA en producción.**

Los cambios:
- ✅ NO modifican funcionalidad existente
- ✅ AGREGAN protección para PWA
- ✅ Mejoran experiencia de usuario
- ✅ Son compatibles con arquitectura híbrida Legacy/SaaS

**Acción inmediata:** Hacer un test rápido en tu celular para confirmar que funciona correctamente después del deploy.

---

**Última actualización:** 2026-02-06 00:40 AM  
**Documentación relacionada:** [`FIX_PWA_LOGIN_ISSUE.md`](FIX_PWA_LOGIN_ISSUE.md:1)
