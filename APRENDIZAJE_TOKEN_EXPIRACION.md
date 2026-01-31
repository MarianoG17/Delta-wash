# Manejo de Expiración de Tokens JWT

## Resumen del Problema

Los tokens JWT de sesión expiran después de **7 días** (`expiresIn: '7d'`). Cuando un token expira, el sistema antes fallaba silenciosamente con errores 500, causando confusión al usuario.

## Solución Implementada

### 1. Backend: Detección de Token Expirado

En `lib/auth-middleware.ts` se agregó:

```typescript
export async function checkTokenStatus(request: Request): Promise<'valid' | 'expired' | 'no_token' | 'legacy_token'>
```

Los APIs críticos ahora verifican el estado del token al inicio:

```typescript
const tokenStatus = await checkTokenStatus(request);
if (tokenStatus === 'expired') {
    return NextResponse.json(
        { success: false, message: 'Sesión expirada', code: 'TOKEN_EXPIRED' },
        { status: 401 }
    );
}
```

### 2. Frontend: Manejo Automático de Errores

En `lib/auth-utils.ts` se agregaron:

- `handleApiError(response, router)` - Detecta 401/403 y redirige al login
- `handleSessionExpired(router)` - Limpia sesión, muestra mensaje, redirige
- `authFetch(url, options, router)` - Wrapper de fetch con manejo automático

### 3. Configuración del Token

El token se configura en 3 lugares (todos con `expiresIn: '7d'`):
- `app/api/auth/login-saas/route.ts` (línea 181)
- `app/api/registro/route.ts` (línea 247)
- `app/api/auth/session/route.ts` (línea 143)

## Cómo Usar en Nuevos Componentes

```typescript
import { handleApiError, getAuthUser } from '@/lib/auth-utils';
import { useRouter } from 'next/navigation';

const router = useRouter();

const cargarDatos = async () => {
    const user = getAuthUser();
    const token = user?.isSaas 
        ? localStorage.getItem('authToken')
        : localStorage.getItem('lavadero_token');

    const res = await fetch('/api/algo', {
        headers: { 'Authorization': `Bearer ${token}` }
    });

    // Si retorna true, hubo error de auth y ya redirigió
    if (handleApiError(res, router)) return;

    const data = await res.json();
    // ... usar data
};
```

## Notas Importantes

1. **Sin token ≠ token expirado**: Si no hay header Authorization, es modo legacy (DeltaWash). Solo se retorna 401 si había un token pero expiró.

2. **Fallback seguro**: El backend siempre cae a DeltaWash si hay problemas de autenticación graves, garantizando que el sistema legacy siga funcionando.

3. **7 días es el default**: Se podría extender a 30 días si se prefiere menos interrupciones.

## Archivos Modificados

- `lib/auth-middleware.ts` - Nueva función `checkTokenStatus()`
- `lib/auth-utils.ts` - Nuevas funciones `handleApiError()`, `handleSessionExpired()`, `authFetch()`
- `app/api/listas-precios/route.ts` - Check de token al inicio
- `app/api/listas-precios/obtener-precios/route.ts` - Check de token al inicio

---

*Documentado: 2026-01-31*
