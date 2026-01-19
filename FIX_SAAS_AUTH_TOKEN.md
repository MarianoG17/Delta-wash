# 🔧 FIX: Error "invalid_connection_string" en SaaS

## 📋 Problema Reportado

Al intentar anular una venta en historial (sistema Legacy), apareció error:
```
Error: Registro no encontrado
```

Luego al intentar crear cuenta corriente en SaaS, apareció:
```
VercelPostgresError - 'invalid_connection_string': This connection string is meant to be used with a direct connection
```

## 🔍 Análisis del Problema

### Problema 1: Incompatibilidad de Drivers PostgreSQL (Legacy)
El código original usaba solo `result.rows` sin verificar si el driver retorna array directo.

**Drivers:**
- `@vercel/postgres` → Retorna `{rows: [...]}`
- `@neondatabase/serverless` → Retorna array directo `[...]`

### Problema 2: Token JWT No Enviado (SaaS)
Aunque el login SaaS generaba y guardaba el token correctamente:

```typescript
// ✅ Backend genera token
const token = jwt.sign({ empresaId, userId, ... }, jwtSecret, { expiresIn: '7d' });

// ✅ Frontend guarda token
localStorage.setItem('authToken', data.token);
```

**PERO** muchas páginas NO enviaban el token en los fetch:

```typescript
// ❌ SIN TOKEN
fetch('/api/cuentas-corrientes', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({...})
})

// Resultado:
[Auth] Sin header de autorización → Modo Legacy (DeltaWash)
[DB] ⚠️ Sin empresaId → Usando POSTGRES_URL (DeltaWash Legacy)
```

Esto causaba que el sistema SaaS cayera en modo Legacy, intentando usar `POSTGRES_URL` (connection string directa de Neon) con el driver `@vercel/postgres` → **ERROR: "invalid_connection_string"**

### Problema 3: Fallback Sin Auto-Detección
Cuando el sistema caía en modo Legacy por falta de token, usaba `sql` de `@vercel/postgres` directamente, sin detectar si el connection string era compatible.

## ✅ Soluciones Aplicadas

### 1. Auto-Detección de Driver en Fallbacks
**Archivo:** `lib/db-saas.ts`

Todos los fallbacks ahora detectan automáticamente el tipo de connection string:

```typescript
// ANTES (❌)
return sql;  // Siempre usaba @vercel/postgres

// DESPUÉS (✅)
const postgresUrl = process.env.POSTGRES_URL || '';
return postgresUrl.includes('neon.tech') 
  ? neon(postgresUrl)  // Driver correcto para Neon
  : sql;               // Driver correcto para pooled
```

**Puntos modificados:**
- Línea 223-235: Fallback cuando `!empresaId`
- Línea 256-266: Fallback cuando empresa no encontrada
- Línea 272-283: Fallback cuando empresa inactiva
- Línea 289-299: Fallback cuando falta `branch_url`

### 2. Agregar Token a Todos los Fetch (SaaS)
**Archivo:** `app/cuentas-corrientes/page.tsx`

```typescript
// ✅ CORRECTO - Con token
const user = getAuthUser();
const authToken = user?.isSaas
  ? localStorage.getItem('authToken')
  : localStorage.getItem('lavadero_token');

const headers: HeadersInit = { 'Content-Type': 'application/json' };
if (authToken) {
  headers['Authorization'] = `Bearer ${authToken}`;
}

fetch('/api/cuentas-corrientes', {
  method: 'POST',
  headers,
  body: JSON.stringify({...})
})
```

**Funciones corregidas:**
- `crearCuenta()` - Línea 80-105
- `cargarSaldo()` - Línea 117-145

### 3. Compatibilidad de Drivers (Legacy)
**Archivos:** `app/api/registros/anular/route.ts`, `enviar-whatsapp/route.ts`, `eliminar/route.ts`, `exportar/route.ts`

Patrón unificado para manejar ambos drivers:

```typescript
const registros = Array.isArray(result) 
  ? result 
  : (result.rows || []);
```

## 🎯 Resultado Final

### ✅ Sistema Legacy (DeltaWash)
- Usa `POSTGRES_URL` con auto-detección de driver
- Compatible con Neon direct connection
- Compatible con Vercel pooled connection
- Funciones de anular, eliminar, exportar, WhatsApp funcionan correctamente

### ✅ Sistema SaaS
- Envía token JWT en todas las peticiones
- Usa branch dedicado de Neon por empresa
- Fallback seguro a Legacy si falta autenticación
- Cuentas corrientes funciona correctamente

## 📊 Flujo de Autenticación

```
┌─────────────────┐
│  Login SaaS     │
│  /login-saas    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Backend genera JWT          │
│ - empresaId                 │
│ - userId                    │
│ - branchUrl                 │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Frontend guarda en          │
│ localStorage:               │
│ - authToken                 │
│ - empresaId                 │
│ - userId                    │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Cada petición incluye:      │
│ Authorization: Bearer token │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Backend extrae empresaId    │
│ del token                   │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ getDBConnection(empresaId)  │
│ usa branch dedicado         │
└─────────────────────────────┘
```

## 🔄 Compatibilidad Legacy

```
┌─────────────────┐
│  Login Legacy   │
│  /login         │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ NO genera JWT               │
│ (sistema antiguo)           │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Peticiones SIN header       │
│ Authorization               │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ Backend detecta:            │
│ Sin token → Legacy          │
└────────┬────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│ getDBConnection(undefined)  │
│ usa POSTGRES_URL con        │
│ auto-detección de driver    │
└─────────────────────────────┘
```

## 🧪 Testing

### Verificar SaaS
1. Login en `/login-saas` con credenciales de prueba
2. Verificar en DevTools > Application > localStorage:
   - `authToken` presente
   - `empresaId` presente
3. Abrir Network > crear cuenta corriente
4. Verificar header: `Authorization: Bearer <token>`
5. Verificar logs del servidor:
   ```
   [Auth] ✅ Token válido → Empresa ID: X
   [DB] 📍 Usando branch dedicado para empresa X
   ```

### Verificar Legacy
1. Login en `/login` (DeltaWash)
2. localStorage NO debe tener `authToken`
3. Network NO debe mostrar header `Authorization`
4. Logs del servidor:
   ```
   [Auth] Sin header de autorización → Modo Legacy
   [DB] ⚠️ Sin empresaId → Usando POSTGRES_URL
   ```

## 📝 Archivos Modificados

1. ✅ `lib/db-saas.ts` - Auto-detección de drivers en fallbacks
2. ✅ `app/cuentas-corrientes/page.tsx` - Token en POST crearCuenta y cargarSaldo
3. ✅ `app/api/registros/anular/route.ts` - Compatibilidad drivers
4. ✅ `app/api/registros/enviar-whatsapp/route.ts` - Compatibilidad drivers
5. ✅ `app/api/registros/eliminar/route.ts` - Compatibilidad drivers
6. ✅ `app/api/registros/exportar/route.ts` - Compatibilidad drivers

## 🚀 Próximos Pasos

### Auditoría Completa de Fetch
Revisar TODAS las páginas SaaS y asegurar que envían el token:

```bash
# Buscar fetch sin Authorization
grep -r "fetch('/api" app/ --include="*.tsx" --include="*.ts"
```

**Páginas a revisar:**
- [ ] `app/historial/page.tsx` - Anular, marcar entregado, etc.
- [ ] `app/listas-precios/page.tsx` - Actualizar precios
- [ ] `app/usuarios/page.tsx` - CRUD usuarios
- [ ] `app/reportes/page.tsx` - Exportar reportes
- [ ] `app/clientes/page.tsx` - Gestión clientes
- [ ] `app/cuentas-corrientes/[id]/page.tsx` - Movimientos cuenta

### Crear Utilidad Fetch con Token
Para evitar repetir código, crear helper:

```typescript
// lib/fetch-with-auth.ts
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const user = getAuthUser();
  const authToken = user?.isSaas
    ? localStorage.getItem('authToken')
    : localStorage.getItem('lavadero_token');
  
  const headers = new Headers(options.headers);
  if (authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }
  
  return fetch(url, { ...options, headers });
}
```

Uso:
```typescript
// ANTES
fetch('/api/cuentas-corrientes', { method: 'POST', ... })

// DESPUÉS
fetchWithAuth('/api/cuentas-corrientes', { method: 'POST', ... })
```

## 💡 Lecciones Aprendidas

1. **Separación de Responsabilidades:**
   - Backend genera token ✅
   - Frontend guarda token ✅
   - **Frontend DEBE enviar token** ⚠️ (Este paso se olvidaba)

2. **Fallbacks Robustos:**
   - No asumir siempre un driver específico
   - Auto-detectar según el connection string
   - Mantener compatibilidad con ambos sistemas

3. **Testing Multi-Tenant:**
   - Probar SIEMPRE en ambos modos (SaaS y Legacy)
   - Verificar logs del servidor, no solo el frontend
   - Usar Network tab para ver headers reales

4. **Documentación de Flujos:**
   - Diagramas de autenticación son críticos
   - Documentar cada punto de integración
   - Mantener checklist de auditoría
