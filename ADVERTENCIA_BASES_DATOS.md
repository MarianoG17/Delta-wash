# ⚠️ ADVERTENCIA: Separación de Bases de Datos

## 🚨 PROBLEMA IDENTIFICADO Y CORREGIDO

**Fecha:** 2026-01-15

**Problema:** El endpoint de registro estaba usando `process.env.POSTGRES_URL` (la base de datos de DeltaWash) como `branch_url` para las nuevas empresas registradas.

**Consecuencia:** Al crear una nueva cuenta desde `/home`, el sistema guardaba la URL de la BD de DeltaWash, causando que las nuevas empresas accedan a datos que no les corresponden.

**Corrección aplicada:**
- ✅ [`app/api/registro/route.ts`](app/api/registro/route.ts:83) ahora usa `branchUrl = ''` (vacío) en lugar de `process.env.POSTGRES_URL`
- ✅ [`app/api/auth/login-saas/route.ts`](app/api/auth/login-saas/route.ts:89) valida que exista un `branch_url` antes de permitir login
- ✅ Mensajes claros indicando que la cuenta requiere configuración

---

## 📋 BASES DE DATOS EN EL SISTEMA

### 1. **BD Central (CENTRAL_DB_URL)**
**Propósito:** Gestión del sistema SaaS multi-tenant

**Ubicación:** `process.env.CENTRAL_DB_URL`

**Contiene:**
- Tabla `empresas` (registro de todas las empresas)
- Tabla `usuarios_sistema` (usuarios de cada empresa)
- Tabla `actividad_sistema` (logs de actividad)
- Tabla `invitaciones` (invitaciones pendientes)

**Archivos que DEBEN usarla:**
- ✅ `app/api/registro/route.ts` - Crear empresa y usuario
- ✅ `app/api/auth/login-saas/route.ts` - Autenticación SaaS
- ❌ NUNCA usar en endpoints de operación (registros, reportes, etc.)

---

### 2. **BD DeltaWash (POSTGRES_URL)**
**Propósito:** Base de datos operativa de DeltaWash (empresa original)

**Ubicación:** `process.env.POSTGRES_URL`

**Contiene:**
- Tabla `registros` (autos lavados)
- Tabla `clientes` (clientes de DeltaWash)
- Tabla `usuarios` (usuarios de DeltaWash - legacy)
- Tabla `precios_servicios` (precios)
- Tabla `cuentas_corrientes` (clientes con cuenta corriente)
- Y todas las demás tablas operativas

**Archivos que PUEDEN usarla:**
- ✅ `app/api/auth/login/route.ts` - Login legacy de DeltaWash
- ✅ Todos los endpoints operativos MIENTRAS la empresa sea DeltaWash
- ⚠️ **ADVERTENCIA:** Estos endpoints eventualmente deberán usar conexión dinámica basada en JWT

---

### 3. **BDs de Empresas (branch_url de cada empresa)**
**Propósito:** Base de datos operativa de cada empresa nueva en el SaaS

**Ubicación:** `empresas.branch_url` (consultado desde BD Central)

**Estado actual:** 🔴 **NO IMPLEMENTADO**
- Por ahora, las nuevas empresas NO tienen BD asignada
- El `branch_url` se guarda como string vacío `''`
- Cuando se registra una empresa, NO se puede usar hasta que se le asigne un branch

**Implementación futura:**
1. Crear branch en Neon vía API
2. Ejecutar schema en el nuevo branch
3. Guardar la URL en `empresas.branch_url`
4. Permitir login solo cuando `branch_url` no esté vacío

---

## 🛡️ REGLAS PARA EVITAR FUTUROS PROBLEMAS

### ❌ NUNCA HACER:

1. **NUNCA usar `process.env.POSTGRES_URL` en código SaaS**
   ```typescript
   // ❌ MAL - Esto accede a la BD de DeltaWash
   const branchUrl = process.env.POSTGRES_URL;
   ```

2. **NUNCA usar `sql` directo de `@vercel/postgres` en endpoints multi-tenant**
   ```typescript
   // ❌ MAL - Esto siempre conecta a POSTGRES_URL (DeltaWash)
   import { sql } from '@vercel/postgres';
   const result = await sql`SELECT * FROM registros`;
   ```

3. **NUNCA asumir que todos los usuarios están en la misma BD**

### ✅ SIEMPRE HACER:

1. **Usar `CENTRAL_DB_URL` para operaciones de gestión**
   ```typescript
   // ✅ BIEN - Para crear empresas, usuarios, autenticación
   import { createPool } from '@vercel/postgres';
   const centralDB = createPool({ 
     connectionString: process.env.CENTRAL_DB_URL 
   });
   ```

2. **Usar conexión dinámica para operaciones por empresa**
   ```typescript
   // ✅ BIEN - Cuando esté implementado
   import { getClientDB } from '@/lib/db-saas';
   const db = await getClientDB(empresaId);
   const result = await db`SELECT * FROM registros`;
   ```

3. **Validar sesión y obtener empresaId del JWT**
   ```typescript
   // ✅ BIEN - Verificar token antes de cualquier operación
   const decoded = jwt.verify(token, jwtSecret);
   const empresaId = decoded.empresaId;
   ```

---

## 📝 CHECKLIST PARA NUEVOS ENDPOINTS

Antes de crear un endpoint que acceda a datos:

- [ ] ¿Es un endpoint de gestión SaaS? → Usar `CENTRAL_DB_URL`
- [ ] ¿Es un endpoint operativo (registros, clientes, etc.)? → Usar `getClientDB(empresaId)`
- [ ] ¿Valida el JWT y extrae el `empresaId`?
- [ ] ¿Maneja el caso de empresa sin `branch_url` asignada?
- [ ] ¿Retorna error claro si la empresa no tiene BD?

---

## 🔧 ARCHIVOS DE REFERENCIA

**Archivos correctamente implementados:**
- [`app/api/registro/route.ts`](app/api/registro/route.ts) - Registro de empresa (usa CENTRAL_DB_URL)
- [`app/api/auth/login-saas/route.ts`](app/api/auth/login-saas/route.ts) - Login SaaS (usa CENTRAL_DB_URL)
- [`app/api/auth/session/route.ts`](app/api/auth/session/route.ts) - Validación de sesión JWT

**Archivo de utilidades:**
- [`lib/db-saas.ts`](lib/db-saas.ts) - Funciones helper para conexiones (placeholder)

---

## 🚀 PRÓXIMOS PASOS

Para completar la separación de bases de datos:

1. [ ] Implementar `getClientDB()` en `lib/db-saas.ts`
2. [ ] Crear middleware de autenticación JWT para endpoints
3. [ ] Actualizar endpoints operativos para usar conexión dinámica
4. [ ] Implementar creación automática de branches en Neon
5. [ ] Agregar validación de `branch_url` en todos los endpoints

---

## 📞 EN CASO DE DUDA

Si no estás seguro de qué base de datos usar:

1. **¿Estás creando/gestionando empresas o usuarios del sistema?** → `CENTRAL_DB_URL`
2. **¿Estás trabajando con registros, clientes, precios, etc.?** → Conexión dinámica por empresa
3. **¿Estás trabajando en DeltaWash legacy?** → `POSTGRES_URL` (pero con cuidado)

**Regla de oro:** Cuando tengas duda, NO uses `POSTGRES_URL` directamente.

---

**Última actualización:** 2026-01-15  
**Autor:** Sistema de desarrollo  
**Estado:** Problema corregido, sistema funcional para DeltaWash, nuevas empresas requieren asignación manual de BD
