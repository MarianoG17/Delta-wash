# 🐛 Debug: branch_url Vacío en Registro

## Problema Identificado

La empresa "marianwash" se creó en la BD Central pero `branch_url` está vacío/null:

```
[Login SaaS] ❌❌❌ PROBLEMA ENCONTRADO ❌❌❌
[Login SaaS] La empresa "marianwash" NO TIENE branch_url
[Login SaaS] Empresa ID: 34
[Login SaaS] Branch URL: (VACÍO) <- ESTE ES EL PROBLEMA
```

## Causa Probable

En [`app/api/registro/route.ts`](app/api/registro/route.ts), líneas 88-132:

```typescript
let branchUrl = '';
try {
  const branchInfo = await createAndSetupBranchForEmpresa(finalSlug);
  branchUrl = branchInfo.connectionUriPooler;
} catch (neonError) {
  // ❌ Si falla, branchUrl queda vacío
  console.error('[Registro] ❌ ERROR al crear branch en Neon:');
  // ... pero la empresa SE CREA de todas formas
}

// Empresa se inserta con branchUrl potencialmente vacío
await centralDB.sql`INSERT INTO empresas (..., branch_url) VALUES (..., ${branchUrl})`
```

## Diagnóstico Necesario

Necesitamos ver los logs de Vercel del endpoint `/api/registro` cuando se creó "marianwash".

### Buscar en Vercel Runtime Logs:

**Filtro de búsqueda:**
- Endpoint: `/api/registro`
- Tiempo: Cuando se creó la empresa "marianwash"
- Buscar líneas que contengan: `[Registro]`

### Logs esperados si funciona:

```
[Registro] 🚀 INICIO: Creación de base de datos en Neon
[Registro] Empresa: marianwash
[Registro] Slug generado: marianwash
[Registro] 📞 Llamando a createAndSetupBranchForEmpresa()...
[Registro] NEON_API_KEY: ✅ Configurada (napi_40cou...)
[Registro] NEON_PROJECT_ID: ✅ Configurado (hidden-queen-29389003)
[Setup] Iniciando creación de branch para: marianwash
[Neon API] Creando branch: marianwash
[Neon API] 🎯 USANDO TEMPLATE VACÍO HARDCODED
[Neon API] Template ID: br-dawn-dream-ahfwrieh
[Neon API] Branch creado exitosamente: br-xxxxx-xxxxx
[Setup] 🔄 Esperando a que branch termine de inicializarse...
[Neon API] ⏳ Esperando a que branch br-xxxxx-xxxxx esté listo...
[Neon API] ✅ Branch listo después de Xs
[Setup] Inicializando schema en el nuevo branch...
[Neon API] ✅ Branch creado desde template Schema Only
[Registro] ✅ Base de datos creada exitosamente!
```

### Logs esperados si falla:

```
[Registro] ❌ ERROR al crear branch en Neon:
[Registro] Tipo de error: Error
[Registro] Mensaje: <MENSAJE DE ERROR AQUÍ>
[Registro] ⚠️ La empresa se creará sin BD asignada
```

## Posibles Causas del Error

### 1. API Key NO Configurada en Vercel ⚠️

**Síntoma:**
```
[Registro] NEON_API_KEY: ❌ NO configurada
NEON_API_KEY no está configurada en .env.local
```

**Solución:**
- Ir a Vercel Dashboard → Settings → Environment Variables
- Verificar que `NEON_API_KEY` esté configurada
- Valor: `napi_40cou...` (la nueva key generada)

### 2. Template Branch No Existe

**Síntoma:**
```
Error al crear branch en Neon: 404 - Branch not found
```

**Verificación:**
- Ir a Neon Console: https://console.neon.tech/app/projects/hidden-queen-29389003
- Buscar branch: `saas-template` (ID: `br-dawn-dream-ahfwrieh`)
- Verificar que existe y está activo

### 3. Límite de Branches Alcanzado

**Síntoma:**
```
Error al crear branch en Neon: 403 - Branch limit exceeded
```

**Solución:**
- Eliminar branches de prueba viejos en Neon Console
- Free tier permite ~10 branches

### 4. Error en Inicialización de Schema

**Síntoma:**
```
[Setup] Inicializando schema en el nuevo branch...
[Neon API] ❌ Error al inicializar schema: relation "xxx" does not exist
```

**Causa:**
- Tablas se intentan usar antes de ser creadas
- SOLUCIONADO en commit `2e11172` (hardcodear template ID)

## Solución Aplicada en Commit 2e11172

### Cambio en [`lib/neon-api.ts`](lib/neon-api.ts:370-378)

**ANTES:**
```typescript
const TEMPLATE_BRANCH_ID = process.env.NEON_TEMPLATE_BRANCH_ID; // ❌ Vercel no tiene esta env var

if (TEMPLATE_BRANCH_ID) {
  // Template vacío - sin limpieza
} else {
  // Limpiar datos heredados
  await sql`DELETE FROM registros`; // ❌ Falla si tablas no existen aún
}
```

**AHORA:**
```typescript
// HARDCODED: Mismo template ID que en createBranchForEmpresa
const TEMPLATE_BRANCH_ID = 'br-dawn-dream-ahfwrieh'; // ✅ Hardcoded

// Template Schema Only garantiza branch vacío - No requiere limpieza
console.log('[Neon API] ✅ Branch creado desde template Schema Only');
console.log('[Neon API] ⏩ Saltando limpieza de datos (innecesaria)');
// ✅ No ejecuta DELETE, evita errores de "relation not exists"
```

## Próximos Pasos

### 1. Esperar Deployment ⏱️ 2-3 minutos
Commit `2e11172` está deployándose en Vercel

### 2. Ver Logs del Error Anterior
Necesitamos los logs completos de cuando se creó "marianwash" para diagnosticar el error original

### 3. Probar Nuevo Registro 🧪
Una vez deployado `2e11172`, crear nueva empresa de prueba y verificar que:
- Branch se crea correctamente
- `branch_url` NO esté vacío
- Empresa puede hacer login exitosamente

### 4. Limpiar Empresa con Error
Eliminar "marianwash" de BD Central (empresa ID 34) ya que tiene `branch_url` vacío

## Variables de Entorno Críticas

Verificar en Vercel Dashboard que estas variables existan:

```env
# CRÍTICAS para creación de branches
NEON_API_KEY=napi_40cou... (la nueva key generada)
NEON_PROJECT_ID=hidden-queen-29389003

# Otras necesarias
CENTRAL_DB_URL=postgresql://...
JWT_SECRET=...
```

## Commit Relacionados

- `2e11172` - fix: hardcodear template ID en verificación ✅ AHORA
- `7711f7f` - fix: hardcodear template ID en creación
- `f040f8c` - fix: hardcodear template ID como fallback
- `9a0a7ac` - feat: usar branch template vacío

---

**Estado:** Esperando logs de error y deployment de fix
**Siguiente acción:** Compartir logs de Vercel del error de registro original
