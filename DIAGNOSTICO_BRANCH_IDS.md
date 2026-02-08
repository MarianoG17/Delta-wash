# Diagnóstico: Branch IDs Incorrectos

## Problema Identificado

El sistema está guardando **nombres de branches** en la columna `neon_branch_id` en lugar de los **IDs reales de Neon**.

### Ejemplos de Datos Incorrectos

| Empresa | neon_branch_id Guardado | Branch ID Real Requerido |
|---------|------------------------|--------------------------|
| LAVAPP | `tamy` | `br-orange-band-ah85rblj` |
| mariano coques | `mariano-coques` | `br-late-mud-ahp1incp` |

### Por Qué Falla el Archivado

La función `deleteBranch` en `lib/neon-api.ts` hace:
```typescript
DELETE /api/v2/projects/{project_id}/branches/{branchId}
```

**Esperado:** `branches/br-late-mud-ahp1incp`  
**Actual:** `branches/mariano-coques` ❌

Neon no encuentra el branch porque "mariano-coques" no es un ID válido.

## Causa Raíz

En `app/api/registro/route.ts`, al guardar la empresa se usa:

```typescript
neon_branch_id: branch_name  // ❌ INCORRECTO - esto es el nombre
```

**Debería ser:**
```typescript
neon_branch_id: branchData.branchId  // ✅ CORRECTO - esto es el ID real
```

## Solución

### 1. Fix de Datos Existentes

Ejecutar en BD central:

```sql
-- Actualizar LAVAPP
UPDATE empresas 
SET neon_branch_id = 'br-orange-band-ah85rblj'
WHERE id = 48 AND nombre = 'LAVAPP';

-- Actualizar mariano coques
UPDATE empresas 
SET neon_branch_id = 'br-late-mud-ahp1incp'
WHERE id = 51 AND nombre = 'mariano coques';

-- Verificar otras empresas
SELECT id, nombre, neon_branch_id, estado 
FROM empresas 
WHERE estado = 'activo' 
AND neon_branch_id NOT LIKE 'br-%';
```

### 2. Fix del Código

Modificar `app/api/registro/route.ts` para guardar el ID correcto desde el inicio.

## Testing

Una vez corregidos los IDs:
1. Refrescar super-admin panel
2. Intentar archivar una empresa
3. Verificar en Neon que el branch desaparece
4. Confirmar en BD que `estado = 'archivado'` y `neon_branch_id = NULL`
