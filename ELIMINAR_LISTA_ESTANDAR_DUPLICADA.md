# Cómo Eliminar la Lista "Estándar" Duplicada en Neon

## 🎯 Problema

La empresa de prueba tiene **2 listas de precios**:
- ✅ "Por Defecto" (correcta, creada por el código actual)
- ❌ "Lista Estándar" (incorrecta, creada por migración SQL vieja)

## 🔍 Causa

El archivo [`migration-listas-precios.sql`](migration-listas-precios.sql:38-40) es una migración **manual antigua** que creaba "Lista Estándar". Si ejecutaste esta migración, por eso apareció la lista duplicada.

El código actual en [`lib/neon-api.ts`](lib/neon-api.ts:298-303) solo crea "Por Defecto", por lo tanto **nuevas empresas NO tendrán este problema**.

## 🛠️ Solución: Eliminar desde Neon Dashboard

### Paso 1: Entrar a Neon Dashboard

1. Ir a https://console.neon.tech/
2. Hacer login con tu cuenta
3. Seleccionar tu proyecto (el que tiene NEON_PROJECT_ID)

### Paso 2: Seleccionar el Branch de tu empresa de prueba

1. En el menú izquierdo, hacer clic en **"Branches"**
2. Buscar el branch de tu empresa de prueba (ejemplo: `empresa-demo`, `lavadero-test`, etc.)
3. Hacer clic en el nombre del branch

### Paso 3: Abrir SQL Editor

1. En el menú superior, hacer clic en **"SQL Editor"**
2. Se abrirá un editor de consultas SQL

### Paso 4: Verificar qué listas existen

Ejecutar esta consulta para ver las listas actuales:

```sql
SELECT id, nombre, descripcion, activa, es_default 
FROM listas_precios 
ORDER BY id;
```

**Resultado esperado:**
```
id | nombre           | descripcion                     | activa | es_default
---+------------------+---------------------------------+--------+-----------
 1 | Por Defecto      | Lista de precios inicial...     | true   | true
 2 | Lista Estándar   | Lista de precios estándar...    | true   | true
```

### Paso 5: Eliminar "Lista Estándar"

Ejecutar esta consulta para eliminar la lista duplicada:

```sql
-- Eliminar la lista "Lista Estándar" y todos sus precios
DELETE FROM listas_precios 
WHERE nombre = 'Lista Estándar';
```

**Importante:** Esto eliminará automáticamente todos los precios asociados a esa lista gracias a `ON DELETE CASCADE`.

### Paso 6: Verificar que se eliminó

Ejecutar nuevamente:

```sql
SELECT id, nombre, descripcion, activa, es_default 
FROM listas_precios 
ORDER BY id;
```

**Resultado esperado:**
```
id | nombre      | descripcion                     | activa | es_default
---+-------------+---------------------------------+--------+-----------
 1 | Por Defecto | Lista de precios inicial...     | true   | true
```

✅ **Ahora solo tenés 1 lista de precios!**

## ⚠️ Advertencia

**ANTES de ejecutar el DELETE, verifica que:**

1. Ningún cliente tenga asignada "Lista Estándar" en su cuenta corriente
2. Ningún registro use precios de "Lista Estándar"

Para verificar, ejecutá:

```sql
-- Ver si hay cuentas corrientes usando "Lista Estándar"
SELECT c.id, c.nombre, cc.lista_precio_id, lp.nombre as lista_nombre
FROM clientes c
JOIN cuentas_corrientes cc ON c.id = cc.cliente_id
JOIN listas_precios lp ON cc.lista_precio_id = lp.id
WHERE lp.nombre = 'Lista Estándar';
```

**Si hay clientes usando esa lista:**

Primero reasignales la lista "Por Defecto":

```sql
-- Obtener ID de lista "Por Defecto"
-- Supongamos que es 1

UPDATE cuentas_corrientes 
SET lista_precio_id = 1
WHERE lista_precio_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar');
```

**Luego sí, eliminar:**

```sql
DELETE FROM listas_precios WHERE nombre = 'Lista Estándar';
```

## 📋 Alternativa: Si no querés usar Neon Dashboard

Si preferís hacerlo desde la aplicación, puedo crear una API `/api/admin/limpiar-listas-duplicadas` que haga esto automáticamente. Avisame si querés que lo programe.

## 🔄 Prevención Futura

**¿Cómo evitar que se vuelva a crear?**

- ❌ NO ejecutes manualmente el archivo `migration-listas-precios.sql`
- ✅ El código actual en `lib/neon-api.ts` ya crea todo correctamente
- ✅ Nuevas empresas automáticamente tendrán solo "Por Defecto"

## 📝 Archivos de Migración SQL a Ignorar

Estos archivos son **solo para referencia histórica**, NO ejecutarlos manualmente:

- ❌ `migration-listas-precios.sql` - Crea "Lista Estándar" (obsoleto)
- ❌ `INSERTAR_precios_completo.sql` - Para "Lista Estándar" (obsoleto)
- ❌ `ACTUALIZAR_precios_directo.sql` - Para "Lista Estándar" (obsoleto)
- ❌ Todos los archivos `.sql` que mencionen "Lista Estándar"

**El único código que importa es:**
- ✅ `lib/neon-api.ts` - Crea "Por Defecto" automáticamente
- ✅ `/listas-precios` - Interfaz para editar precios

---

**Fecha**: 2026-01-18  
**Estado**: Por ejecutar en Neon Dashboard
