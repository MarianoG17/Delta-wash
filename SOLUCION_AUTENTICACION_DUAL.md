# ✅ Solución: Autenticación Dual (SaaS + DeltaWash Legacy)

## Problema Identificado

El usuario reportó que después de hacer login en el sistema SaaS, al navegar a otras páginas (como `/cuentas-corrientes`), la aplicación lo redirigía al login de DeltaWash legacy.

**Causa raíz:** Cada página tenía su propia lógica de autenticación que solo verificaba la sesión de DeltaWash legacy (`lavadero_user` en localStorage), ignorando los tokens del sistema SaaS nuevo.

## Solución Implementada

### 1. Creación de Utilidades Centralizadas

Se creó el archivo [`lib/auth-utils.ts`](lib/auth-utils.ts) con funciones reutilizables:

- **`getAuthUser()`**: Detecta y retorna el usuario autenticado (SaaS o legacy)
- **`clearAuth()`**: Limpia toda la sesión (ambos sistemas)
- **`getLoginUrl()`**: Retorna la URL de login correcta según el sistema

```typescript
export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  empresaId?: string;
  empresaNombre?: string;
  isSaas: boolean;
}
```

### 2. Orden de Detección de Autenticación

La función `getAuthUser()` verifica en este orden:

1. **Primero SaaS nuevo**:
   - `authToken` en localStorage
   - `empresaId` en localStorage
   - `userId` en localStorage
   
2. **Luego DeltaWash legacy**:
   - `lavadero_user` en localStorage

### 3. Páginas Actualizadas

Se actualizaron **7 páginas** para usar las nuevas utilidades:

✅ [`app/page.tsx`](app/page.tsx) - Página principal
✅ [`app/cuentas-corrientes/page.tsx`](app/cuentas-corrientes/page.tsx)
✅ [`app/cuentas-corrientes/[id]/page.tsx`](app/cuentas-corrientes/[id]/page.tsx)
✅ [`app/reportes/page.tsx`](app/reportes/page.tsx)
✅ [`app/clientes/page.tsx`](app/clientes/page.tsx)
✅ [`app/historial/page.tsx`](app/historial/page.tsx)
✅ [`app/listas-precios/page.tsx`](app/listas-precios/page.tsx)

### 4. Ejemplo de Código Antes/Después

**❌ ANTES** (cada página con su propia lógica):
```typescript
useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
        const session = localStorage.getItem('lavadero_user');
        if (!session) {
            router.push('/login');
        } else {
            const data = JSON.parse(session);
            setUserRole(data.rol || 'operador');
            setUserId(data.id);
            // ...
        }
    }
}, [router]);
```

**✅ DESPUÉS** (usando utilidades centralizadas):
```typescript
import { getAuthUser, getLoginUrl } from '@/lib/auth-utils';

useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
        const user = getAuthUser();
        if (!user) {
            router.push(getLoginUrl());
        } else {
            setUserRole(user.rol);
            setUserId(user.id);
            // ...
        }
    }
}, [router]);
```

## Beneficios

✅ **Código DRY**: Lógica de autenticación centralizada en un solo lugar
✅ **Mantenibilidad**: Cambios futuros solo requieren editar `auth-utils.ts`
✅ **Compatibilidad**: Soporta ambos sistemas simultáneamente
✅ **Navegación fluida**: Los usuarios SaaS pueden navegar entre todas las páginas sin problemas
✅ **Backward compatible**: Los usuarios DeltaWash legacy siguen funcionando

## Tokens del Sistema SaaS

El sistema SaaS nuevo almacena estos datos en localStorage:

```
authToken       → JWT de autenticación
empresaId       → ID de la empresa
empresaNombre   → Nombre de la empresa
empresaSlug     → Slug de la empresa
empresaPlan     → Plan contratado
userId          → ID del usuario
userEmail       → Email del usuario
userNombre      → Nombre del usuario
userRol         → Rol del usuario (admin, operador)
isDemo          → Si es cuenta demo
```

## Tokens del Sistema Legacy

El sistema DeltaWash legacy almacena:

```
lavadero_user   → JSON con {id, nombre, username, rol, email}
```

## Testing

Para probar el funcionamiento:

1. **Login SaaS**: Ingresa por `/login-saas` o `/home`
2. **Navega**: Prueba ir a Cuentas, Reportes, Clientes, Historial, Precios
3. **Verifica**: No debería redirigir al login en ningún momento
4. **Logout**: Al cerrar sesión, limpia ambos sistemas

## Archivos Modificados

```
✅ NUEVO: lib/auth-utils.ts
✅ MODIFICADO: app/page.tsx
✅ MODIFICADO: app/cuentas-corrientes/page.tsx
✅ MODIFICADO: app/cuentas-corrientes/[id]/page.tsx
✅ MODIFICADO: app/reportes/page.tsx
✅ MODIFICADO: app/clientes/page.tsx
✅ MODIFICADO: app/historial/page.tsx
✅ MODIFICADO: app/listas-precios/page.tsx
```

## Próximos Pasos

- ✅ **Completado**: Autenticación dual implementada
- 🔄 **Probar**: Verificar navegación en desarrollo local
- 🚀 **Deploy**: Hacer commit y desplegar a Vercel
- 📝 **Documentar**: Actualizar documentación del proyecto

---

**Fecha de implementación**: 17/01/2026
**Problema original**: Redirección al login legacy desde páginas SaaS
**Status**: ✅ RESUELTO
