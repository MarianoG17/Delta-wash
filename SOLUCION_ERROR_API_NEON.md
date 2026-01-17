# 🔧 Solución: Error de API de Neon al Crear Empresas

**Fecha:** 16 de enero de 2026  
**Estado:** ✅ RESUELTO

---

## 📋 Resumen del Problema

Al intentar crear una cuenta nueva desde [`/registro`](app/registro/page.tsx), la aplicación fallaba al crear automáticamente la base de datos en Neon, mostrando errores relacionados con la API de Neon.

### Errores Identificados

1. **Error 1: `connectionUriPooler undefined`**
   - La respuesta de la API de Neon no incluía `connection_uri_pooler` como propiedad directa
   - El código intentaba acceder a `branchData.connection_uris[0].connection_uri_pooler` que no existía

2. **Error 2: `cannot insert multiple commands into a prepared statement`**
   - `@vercel/postgres` no puede ejecutar múltiples comandos SQL en una sola sentencia
   - El schema incluía múltiples `CREATE TABLE` en un solo query

---

## ✅ Soluciones Implementadas

### 1. Construcción Manual de connectionUriPooler

**Archivo:** [`lib/neon-api.ts`](lib/neon-api.ts:345)

**Antes:**
```typescript
const connectionUri = branchData.connection_uris[0].connection_uri;
const connectionUriPooler = branchData.connection_uris[0].connection_uri_pooler; // ❌ No existe
```

**Después:**
```typescript
const connectionInfo = branchData.connection_uris[0];
const connectionUri = connectionInfo.connection_uri;

// Construir la URL pooled a partir de los parámetros
const params = connectionInfo.connection_parameters;
const connectionUriPooler = `postgresql://${params.role}:${params.password}@${params.pooler_host}/${params.database}?sslmode=require`;
```

**Resultado:**
✅ Ahora se construye correctamente la URL de conexión pooled usando `connection_parameters.pooler_host`

---

### 2. Cambio de Driver para Inicialización de Schema

**Archivo:** [`lib/neon-api.ts`](lib/neon-api.ts:140)

**Antes:**
```typescript
// Usar @vercel/postgres (NO soporta múltiples comandos)
const { createPool } = await import('@vercel/postgres');
const pool = createPool({ connectionString: connectionUri });

await pool.sql`
  CREATE TABLE usuarios (...);
  CREATE TABLE clientes (...);
  -- ❌ Error: cannot insert multiple commands
`;
```

**Después:**
```typescript
// Usar driver de Neon directamente (SÍ soporta múltiples comandos)
const { neon } = await import('@neondatabase/serverless');
const sql = neon(connectionUri);

await sql`
  CREATE TABLE usuarios (...);
  CREATE TABLE clientes (...);
  -- ✅ Funciona correctamente
`;
```

**Resultado:**
✅ El schema completo se ejecuta sin errores, creando todas las tablas e índices

---

### 3. Actualización de Tipos TypeScript

**Archivo:** [`lib/neon-api.ts`](lib/neon-api.ts:27)

Se actualizó la interfaz `CreateBranchResponse` para incluir `connection_parameters`:

```typescript
export interface CreateBranchResponse {
  branch: NeonBranch;
  endpoints: NeonEndpoint[];
  connection_uris: {
    connection_uri: string;
    connection_parameters: {
      database: string;
      password: string;
      role: string;
      host: string;
      pooler_host: string; // ✅ Agregado
    };
  }[];
}
```

---

## 🧪 Pruebas Realizadas

### Test 1: Crear cuenta "Lavadero Test API"
- ✅ Variables de entorno configuradas correctamente
- ✅ API Key de Neon válida
- ✅ Branch creado exitosamente: `br-red-cloud-ahzwsujf`
- ✅ `connectionUriPooler` construido correctamente
- ⚠️ Falló al inicializar schema (error de múltiples comandos SQL)

### Test 2: Crear cuenta "Lavadero Fix Test"
- ✅ Variables de entorno configuradas correctamente
- ✅ Branch creado exitosamente: `br-calm-shape-ahpprj57`
- ✅ `connectionUriPooler` construido correctamente
- ✅ Schema inicializado correctamente con driver de Neon
- ✅ Cuenta creada exitosamente

---

## 📊 Logs de Éxito

```
[Registro] 🚀 INICIO: Creación de base de datos en Neon
[Registro] Empresa: Lavadero Fix Test
[Registro] NEON_API_KEY: ✅ Configurada
[Registro] NEON_PROJECT_ID: ✅ Configurado (hidden-queen-29389003)

[Neon API] Creando branch: lavadero-fix-test
[Neon API] Branch creado exitosamente: br-calm-shape-ahpprj57

[Setup] DEBUG - connectionUri: postgresql://neondb_owner:npg_7PVbs...
[Setup] DEBUG - connectionUriPooler: postgresql://neondb_owner:npg_7PVbs...

[Setup] Inicializando schema en el nuevo branch...
[Neon API] Inicializando schema en nuevo branch
[Neon API] Schema inicializado exitosamente
[Setup] ✅ Branch completamente configurado
```

---

## 🎯 Funcionalidad Actual

Ahora cuando un usuario se registra desde [`/registro`](app/registro/page.tsx):

1. ✅ Se validan los datos del formulario
2. ✅ Se verifica que el email no esté registrado
3. ✅ Se genera un slug único para la empresa
4. ✅ **Se crea un branch automáticamente en Neon**
5. ✅ **Se construye correctamente la URL de conexión pooled**
6. ✅ **Se inicializa el schema completo con todas las tablas:**
   - `usuarios`
   - `clientes`
   - `registros`
   - `precios_servicios` (con precios por defecto)
   - `cuentas_corrientes`
   - `movimientos_cc`
   - Índices para rendimiento
7. ✅ Se guarda la empresa en BD Central
8. ✅ Se crean usuarios de prueba (admin y operador)
9. ✅ Se retorna token JWT para login inmediato

---

## 📝 Archivos Modificados

- ✅ [`lib/neon-api.ts`](lib/neon-api.ts) - Correcciones principales
  - Línea 27-40: Actualización de interfaz TypeScript
  - Línea 140-283: Cambio de driver para inicialización
  - Línea 330-374: Construcción manual de connectionUriPooler

---

## ⚠️ Notas Importantes

### Variables de Entorno Requeridas

Asegurate de tener configuradas en `.env.local`:

```bash
NEON_API_KEY="napi_TU_API_KEY_DE_NEON"
NEON_PROJECT_ID="tu-project-id"
CENTRAL_DB_URL="postgresql://neondb_owner:xxx@ep-xxx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

### Límites de Neon

**Plan Free:**
- ✅ Hasta 10 branches por proyecto
- ✅ Actualmente tenés 3 branches creados (incluyendo pruebas)

---

## ✅ Conclusión

Los errores de la API de Neon han sido completamente resueltos. El sistema ahora:

1. ✅ Construye correctamente la URL de conexión pooled
2. ✅ Inicializa el schema completo sin errores
3. ✅ Crea empresas con bases de datos funcionales automáticamente
4. ✅ Mantiene backwards compatibility con DeltaWash

**Estado:** LISTO PARA PRODUCCIÓN 🚀
