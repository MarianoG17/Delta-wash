# Fix: PWA Login Issue - App mostrando login incorrecto después de logout

## 📋 Problema Identificado

**Síntoma**: Después de hacer logout en la PWA de LAVAPP (SaaS), al volver a abrir la app mostraba el login de DeltaWash (legacy) en lugar del login SaaS.

**Causa raíz**: 
1. El PWA manifest tiene `start_url: "/"` 
2. Al hacer logout, se limpiaba TODO el localStorage, incluyendo `authToken`
3. Al reabrir la PWA, [`getLoginUrl()`](lib/auth-utils.ts:96) detectaba la ausencia de `authToken` y asumía que debía mostrar login Legacy (`/login`)
4. La PWA perdía la "memoria" de qué tipo de aplicación era (SaaS vs Legacy)

## ✅ Solución Implementada

Se agregó un **flag persistente** en localStorage llamado `preferredLoginType` que sobrevive al logout y le indica a la PWA qué pantalla de login mostrar.

### Cambios Realizados

#### 1. [`lib/auth-utils.ts`](lib/auth-utils.ts:1)

**a) Función `clearAuth()` modificada** (línea 70-95):
- Ya NO elimina `preferredLoginType` cuando hace logout
- Este valor persiste para que la PWA recuerde su tipo

```typescript
export function clearAuth(): void {
  // ... limpia authToken, empresaId, etc.
  
  // NO eliminamos 'preferredLoginType' - es persistente para PWA
}
```

**b) Función `getLoginUrl()` mejorada** (línea 92-118):
- Ahora verifica PRIMERO el flag `preferredLoginType`
- Si existe `'saas'` → redirige a `/login-saas`
- Si existe `'legacy'` → redirige a `/login`
- Fallback: comportamiento anterior (detectar por `authToken`)

```typescript
export function getLoginUrl(afterLogout: boolean = false): string {
  // ... código existente ...
  
  // IMPORTANTE: Primero verificar la preferencia persistente (para PWA)
  const preferredLoginType = localStorage.getItem('preferredLoginType');
  if (preferredLoginType === 'saas') {
    return '/login-saas';
  } else if (preferredLoginType === 'legacy') {
    return '/login';
  }
  
  // Fallback: detectar por authToken
  const authToken = localStorage.getItem('authToken');
  return authToken ? '/login-saas' : '/login';
}
```

#### 2. [`app/login-saas/page.tsx`](app/login-saas/page.tsx:1)

**Login SaaS actualizado** (línea 34-52):
- Al hacer login exitoso, guarda `localStorage.setItem('preferredLoginType', 'saas')`

```typescript
if (response.ok && data.success) {
  localStorage.setItem('authToken', data.token);
  // ... otros datos ...
  
  // IMPORTANTE: Marcar preferencia persistente para PWA
  localStorage.setItem('preferredLoginType', 'saas');
  
  router.push('/');
}
```

#### 3. [`app/login/page.tsx`](app/login/page.tsx:1)

**Login Legacy actualizado** (línea 28-36):
- Al hacer login exitoso, guarda `localStorage.setItem('preferredLoginType', 'legacy')`

```typescript
if (data.success) {
  localStorage.setItem('lavadero_user', JSON.stringify(data.user));
  
  // IMPORTANTE: Marcar preferencia persistente para PWA
  localStorage.setItem('preferredLoginType', 'legacy');
  
  router.push('/');
}
```

#### 4. [`app/registro/page.tsx`](app/registro/page.tsx:1)

**Registro SaaS actualizado** (línea 51-63):
- Al registrarse, también guarda `localStorage.setItem('preferredLoginType', 'saas')`

```typescript
if (response.ok && data.success) {
  localStorage.setItem('authToken', data.token);
  // ... otros datos ...
  
  // IMPORTANTE: Marcar preferencia persistente para PWA
  localStorage.setItem('preferredLoginType', 'saas');
  
  setShowWelcome(true);
}
```

## 🔄 Flujo Corregido

### Escenario 1: Usuario SaaS en PWA
1. ✅ Usuario instala PWA desde `/login-saas` o `/registro`
2. ✅ Al hacer login/registro → se guarda `preferredLoginType: 'saas'`
3. ✅ Usuario usa la app normalmente
4. ✅ Usuario hace LOGOUT → se limpia `authToken` pero NO `preferredLoginType`
5. ✅ Usuario cierra la PWA
6. ✅ Usuario vuelve a abrir la PWA
7. ✅ [`app/page.tsx`](app/page.tsx:1) detecta no hay usuario → llama [`getLoginUrl()`](lib/auth-utils.ts:96)
8. ✅ [`getLoginUrl()`](lib/auth-utils.ts:96) lee `preferredLoginType: 'saas'` → retorna `/login-saas`
9. ✅ **Usuario ve la pantalla correcta de LAVAPP SaaS** 🎉

### Escenario 2: Usuario Legacy en PWA
1. ✅ Usuario instala PWA desde `/login` (DeltaWash)
2. ✅ Al hacer login → se guarda `preferredLoginType: 'legacy'`
3. ✅ Usuario hace LOGOUT → se limpia session pero NO `preferredLoginType`
4. ✅ Usuario vuelve a abrir la PWA
5. ✅ [`getLoginUrl()`](lib/auth-utils.ts:96) lee `preferredLoginType: 'legacy'` → retorna `/login`
6. ✅ **Usuario ve la pantalla correcta de DeltaWash** 🎉

## 📱 Instrucciones para el Usuario

### Opción A: Desplegar los cambios (RECOMENDADO)

1. **Hacer commit y push de los cambios**:
   ```bash
   git add .
   git commit -m "fix: PWA remembers login type after logout (saas vs legacy)"
   git push
   ```

2. **Vercel desplegará automáticamente** (tarda ~2-3 minutos)

3. **En tu celular**:
   - Abre Chrome/Safari
   - Ve a `https://deltawash.vercel.app/login-saas`
   - Ingresa con tu email y contraseña
   - Ahora el flag `preferredLoginType` se guardará
   - Si haces logout y vuelves a abrir, mostrará `/login-saas` correctamente

### Opción B: Solución temporal SIN deploy

Si no querés desplegar ahora, podés hacer esto en tu celular:

1. **Abre la PWA de LAVAPP**
2. **Abre las DevTools del navegador** (si tu navegador lo permite en mobile)
3. **En la consola ejecutá**:
   ```javascript
   localStorage.setItem('preferredLoginType', 'saas');
   ```
4. **Recargá la app**
5. Ahora debería mostrar `/login-saas` correctamente

**NOTA**: Esta solución temporal se perderá si borrás los datos de la app. Es mejor hacer el deploy.

## 🧪 Testing

### Caso de Prueba 1: PWA SaaS
1. ✅ Instalar PWA desde `/login-saas`
2. ✅ Hacer login → verificar que `localStorage.getItem('preferredLoginType')` = `'saas'`
3. ✅ Hacer logout
4. ✅ Cerrar y reabrir PWA
5. ✅ **Verificar que muestra `/login-saas` (lavapp)** ✓

### Caso de Prueba 2: PWA Legacy
1. ✅ Instalar PWA desde `/login`
2. ✅ Hacer login → verificar que `localStorage.getItem('preferredLoginType')` = `'legacy'`
3. ✅ Hacer logout
4. ✅ Cerrar y reabrir PWA
5. ✅ **Verificar que muestra `/login` (DeltaWash)** ✓

### Caso de Prueba 3: Primera instalación (sin preferencia)
1. ✅ Instalar PWA nueva (sin `preferredLoginType`)
2. ✅ Abrir PWA
3. ✅ **Debería mostrar `/login` (comportamiento default)** ✓
4. ✅ Ir manualmente a `/login-saas`
5. ✅ Hacer login → ahora se guarda `preferredLoginType: 'saas'`
6. ✅ Próximas veces mostrará `/login-saas` automáticamente

## 📝 Notas Técnicas

### ¿Por qué no eliminar `preferredLoginType` al hacer logout?

**Respuesta**: Porque en un escenario PWA, queremos que la app "recuerde" su identidad:
- Si el usuario instaló la PWA desde LAVAPP SaaS, esa PWA ES una instancia de LAVAPP
- Si el usuario instaló la PWA desde DeltaWash, esa PWA ES una instancia de DeltaWash
- El logout es temporal (usuario sale y vuelve), pero la identidad de la PWA debe persistir

### ¿Y si el usuario quiere cambiar de SaaS a Legacy?

El usuario puede:
1. Desinstalar la PWA actual
2. Instalar una nueva PWA desde la URL correcta
3. O manualmente cambiar `localStorage.setItem('preferredLoginType', 'legacy')`

Pero esto es un caso edge poco común. La mayoría de usuarios tendrán UNA PWA instalada y la usarán consistentemente.

### Compatibilidad con versión web (no-PWA)

✅ **Los cambios son compatibles**:
- Usuarios en navegador web normal (no-PWA) funcionan igual
- El flag `preferredLoginType` solo se vuelve crítico en PWA donde la URL inicial es siempre `/`
- En navegador web, si un usuario va a `/login-saas`, hará login, y la próxima vez que abra el navegador podrá ir a `/login-saas` manualmente

## 🎯 Resultado Final

**Problema resuelto**: La PWA de LAVAPP ahora recuerda que es SaaS incluso después de logout, y siempre mostrará la pantalla de login correcta (`/login-saas` con email).

**Archivos modificados**:
- [`lib/auth-utils.ts`](lib/auth-utils.ts:1) - Lógica de persistencia
- [`app/login-saas/page.tsx`](app/login-saas/page.tsx:1) - Guardar flag al login SaaS
- [`app/login/page.tsx`](app/login/page.tsx:1) - Guardar flag al login Legacy
- [`app/registro/page.tsx`](app/registro/page.tsx:1) - Guardar flag al registrarse

**Deploy necesario**: Sí (para que los cambios afecten a la PWA instalada)

---

**Fecha del fix**: 2026-02-04  
**Versión**: v1.0  
**Status**: ✅ Listo para deploy
