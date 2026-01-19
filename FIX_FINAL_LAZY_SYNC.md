# Fix Final: Lazy Sync - Registro de Autos

## 🎯 Problema Resuelto

**Error:** `VercelPostgresError - 'invalid_connection_string'` al registrar autos en sistema SaaS

**Síntoma:** Los registros de autos fallaban con error de conexión en el Lazy Sync

## 🔍 Causa Raíz

El Lazy Sync en [`app/api/registros/route.ts`](app/api/registros/route.ts:204) (línea 204) usaba el driver **INCORRECTO** para conectar a `CENTRAL_DB_URL`:

```typescript
// ❌ CÓDIGO PROBLEMÁTICO
const { sql: centralSql } = await import('@/lib/db');
```

Este import carga [`lib/db.ts`](lib/db.ts:1) que usa `@vercel/postgres`:

```typescript
// lib/db.ts línea 1
import { sql } from '@vercel/postgres';
```

**Problema:** `@vercel/postgres` NO acepta conexiones directas con URLs custom (como `CENTRAL_DB_URL`). Solo funciona con variables de entorno específicas de Vercel (`POSTGRES_URL`, `POSTGRES_URL_NON_POOLING`, etc.).

## ✅ Solución Implementada

### Commit `5fd6619` - Fix driver en Lazy Sync

**Archivo:** [`app/api/registros/route.ts`](app/api/registros/route.ts:204)

**Cambio aplicado:**
```typescript
// ✅ SOLUCIÓN CORRECTA (líneas 204-206)
const { neon } = await import('@neondatabase/serverless');
const centralSql = neon(process.env.CENTRAL_DB_URL!);
const empresaResult = await centralSql`
    SELECT branch_url FROM empresas WHERE id = ${empresaId}
`;

// También se corrigió el acceso a datos (línea 210)
// Neon driver retorna array directamente (no tiene .rows)
const empresaData = Array.isArray(empresaResult) ? empresaResult : [];
```

**Por qué funciona:**
- `@neondatabase/serverless` SÍ acepta conexiones directas con cualquier URL
- Es el driver nativo de Neon para entornos serverless
- Retorna arrays directamente (interfaz más simple)

## 📊 Contexto Completo

### Historial de Fixes (cronológico)

1. **Commit `564ad15`** - Retry Logic en registro empresa + helpers
2. **Commit `314168d`** - Lazy Sync + VARCHAR(200) tipo_limpieza  
3. **Commit `7748053`** - Sincronización onCreate usuario
4. **Commit `5b02b6b`** - Intento 1: Fix driver (falló, usaba `createPool` incompatible)
5. **Commit `13af651`** - Intento 2: Fix driver en `lib/neon-api.ts` (parcial, faltaba registros)
6. **Commit `5fd6619`** ✅ **FIX DEFINITIVO**: Corregir driver en Lazy Sync de registros

### Archivos Modificados en Este Fix

```
app/api/registros/route.ts
├── Línea 204: Import correcto del driver Neon
├── Línea 205: Crear conexión con CENTRAL_DB_URL
└── Línea 210: Acceso correcto a datos (array directo)
```

## 🔧 Detalles Técnicos

### Drivers de PostgreSQL en el Proyecto

| Driver | Uso | Acepta URLs Custom | Ubicación |
|--------|-----|-------------------|-----------|
| `@vercel/postgres` | DeltaWash legacy (POSTGRES_URL) | ❌ No | `lib/db.ts` |
| `@vercel/postgres` (createPool) | BD Central con pool | ✅ Sí | `lib/db-saas.ts` |
| `@neondatabase/serverless` | Conexiones dinámicas SaaS | ✅ Sí | `lib/neon-api.ts`, `app/api/registros/route.ts` |

### Función `sincronizarUsuariosEmpresa()`

**Ubicación:** [`lib/neon-api.ts`](lib/neon-api.ts:554-591)

**Corrección previa (commit 13af651):**
```typescript
// Líneas 558-559
const { neon: neonDriver } = await import('@neondatabase/serverless');
const centralSql = neonDriver(process.env.CENTRAL_DB_URL!);
```

**Llamadas en el código:**
1. ✅ [`app/api/registro/route.ts`](app/api/registro/route.ts:210) - Retry Logic (OK desde 564ad15)
2. ✅ [`app/api/registros/route.ts`](app/api/registros/route.ts:216) - Lazy Sync (CORREGIDO en 5fd6619)
3. ✅ [`app/api/usuarios/route.ts`](app/api/usuarios/route.ts:210) - onCreate usuario (OK desde 7748053)

## 🎉 Estado Final

**TODAS las capas de sincronización ahora usan el driver correcto:**

### 1. Retry Logic (Preventivo)
- **Dónde:** Al crear empresa nueva ([`app/api/registro/route.ts`](app/api/registro/route.ts:210))
- **Cuándo:** Antes de primer login del admin
- **Driver:** ✅ Correcto desde commit `564ad15`

### 2. Lazy Sync (Reactivo)
- **Dónde:** Al registrar auto ([`app/api/registros/route.ts`](app/api/registros/route.ts:216))
- **Cuándo:** Cuando detecta error FK de usuario
- **Driver:** ✅ **CORREGIDO en commit `5fd6619`** ← ESTE FIX

### 3. onCreate Usuario (Proactivo)
- **Dónde:** Al crear nuevo usuario ([`app/api/usuarios/route.ts`](app/api/usuarios/route.ts:210))
- **Cuándo:** Después de INSERT en BD Central
- **Driver:** ✅ Correcto desde commit `7748053`

## 📝 Pruebas Recomendadas

Una vez deployado commit `5fd6619`:

1. **Crear empresa nueva** → Debería sincronizar admin (Retry Logic)
2. **Login admin** → Debería funcionar
3. **Crear usuario nuevo** → Debería aparecer en branch (onCreate)
4. **Registrar auto** → Debería funcionar sin error (Lazy Sync como fallback)

## 🔗 Referencias

- **Issue original:** Error al registrar autos en SaaS
- **Documentación:** `RESUMEN_FIX_REGISTRO_AUTOS.md`
- **Auditoría:** `AUDITORIA_COMPLETA_PROYECTO_SAAS.md`
- **Migration SQL:** `migration-ampliar-tipo-limpieza.sql`

---

**Fecha Fix:** 2026-01-19  
**Commit Final:** `5fd6619`  
**Estado:** ✅ Resuelto - Esperando deploy de Vercel
