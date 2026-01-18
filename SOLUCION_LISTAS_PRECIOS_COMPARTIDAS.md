# 🚨 Problema: Listas de Precios se Comparten Entre Empresas SaaS

## 📋 Diagnóstico

### Síntoma
Las empresas SaaS nuevas VEN las listas de precios de "DeltaWash" (u otra empresa) y **NO pueden editarlas** desde el módulo de precios.

### Causa Posible

Hay **3 escenarios** posibles:

#### 🔴 **Escenario A: Branch Template NO está vacío**
El branch `br-quiet-moon-ahudb5a2` ("central") que se usa como template **tiene datos de DeltaWash**.

**Verificación:**
1. Ir a https://console.neon.tech/
2. Ir a "Branches" → Buscar branch "central" (`br-quiet-moon-ahudb5a2`)
3. Ir a "SQL Editor"
4. Ejecutar:
```sql
-- Verificar si hay listas de precios
SELECT * FROM listas_precios ORDER BY id;

-- Verificar si hay precios
SELECT COUNT(*) as total_precios FROM precios;
```

**Resultado esperado para template vacío:**
- `listas_precios`: **0 filas** ✅
- `precios`: **0 filas** ✅

**Si tiene datos:**
- Necesitas limpiar el branch template o crear uno nuevo vacío

---

#### 🟡 **Escenario B: Frontend usa token incorrecto**
El frontend está enviando request **SIN** authorization header o con token de DeltaWash.

**Verificación:**
1. Abrir DevTools (F12) → Tab "Network"
2. Navegar a `/listas-precios`
3. Buscar request `GET /api/listas-precios`
4. Ver "Request Headers"

**Headers esperados:**
```
Authorization: Bearer eyJhbGci...  ← DEBE estar presente
```

**Si falta el header:**
- La API está usando `POSTGRES_URL` (DeltaWash) por defecto

---

#### 🟢 **Escenario C: Session/Token no tiene empresaId**
El token JWT de la empresa SaaS **NO contiene empresaId** válido.

**Verificación:**
1. Ir a https://jwt.io/
2. Copiar el token que ves en `localStorage.getItem('authToken')` desde DevTools → Console
3. Decodificar y verificar payload

**Payload esperado:**
```json
{
  "userId": 123,
  "empresaId": 456,  ← DEBE estar presente para SaaS
  "email": "usuario@empresa.com",
  ...
}
```

**Si `empresaId` no existe o es null:**
- La API usará DeltaWash por defecto

---

## 🛠️ Soluciones

### ✅ Solución 1: Limpiar Branch Template

Si el branch template (`br-quiet-moon-ahudb5a2`) tiene datos, límpialo:

```sql
-- Ejecutar en SQL Editor del branch "central" en Neon
DELETE FROM precios;
DELETE FROM listas_precios;

-- Verificar
SELECT COUNT(*) FROM listas_precios;  -- Debe ser 0
SELECT COUNT(*) FROM precios;         -- Debe ser 0
```

**IMPORTANTE:** Este branch debe tener **SOLO schema** (tablas vacías), sin datos.

---

### ✅ Solución 2: Forzar Recreación de Listas en Branch de Empresa

Si una empresa ya fue creada con datos incorrectos, necesitas recrear su lista de precios:

**API de Diagnóstico y Limpieza:**

Crear archivo: `app/api/admin/limpiar-listas-empresa/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        
        if (!empresaId) {
            return NextResponse.json({ 
                success: false, 
                message: 'Solo para empresas SaaS' 
            }, { status: 400 });
        }

        const db = await getDBConnection(empresaId);

        console.log(`[Limpiar Listas] Limpiando listas para empresa ${empresaId}`);

        // 1. Eliminar todas las listas y precios
        await db`DELETE FROM precios`;
        await db`DELETE FROM listas_precios`;

        console.log(`[Limpiar Listas] ✅ Listas eliminadas`);

        // 2. Crear lista "Por Defecto" limpia
        await db`
            INSERT INTO listas_precios (nombre, descripcion, activa, es_default)
            VALUES ('Por Defecto', 'Lista de precios - Configure sus valores', true, true)
        `;

        const listaResult = await db`SELECT id FROM listas_precios WHERE nombre = 'Por Defecto' LIMIT 1`;
        const listaId = listaResult[0]?.id;

        console.log(`[Limpiar Listas] ✅ Lista "Por Defecto" creada con ID ${listaId}`);

        // 3. Insertar precios en $0
        const tiposVehiculo = ['auto', 'mono', 'camioneta', 'camioneta_xl', 'moto'];
        const tiposServicio = ['simple_exterior', 'simple', 'con_cera', 'pulido', 'limpieza_chasis', 'limpieza_motor'];

        for (const vehiculo of tiposVehiculo) {
            for (const servicio of tiposServicio) {
                await db`
                    INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
                    VALUES (${listaId}, ${vehiculo}, ${servicio}, 0)
                `;
            }
        }

        console.log(`[Limpiar Listas] ✅ Precios en $0 inicializados`);

        return NextResponse.json({
            success: true,
            message: '✅ Listas de precios reiniciadas correctamente',
            listas_eliminadas: 'Todas las listas anteriores fueron eliminadas',
            nueva_lista: 'Por Defecto con precios en $0',
            accion_requerida: 'Configure sus precios desde el módulo Listas de Precios'
        });

    } catch (error: any) {
        console.error('[Limpiar Listas] Error:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al limpiar listas',
            error: error.message
        }, { status: 500 });
    }
}
```

**Uso:**
1. Crear el archivo arriba
2. Hacer login como empresa afectada
3. En DevTools Console ejecutar:
```javascript
fetch('/api/admin/limpiar-listas-empresa', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
  }
}).then(r => r.json()).then(console.log)
```

---

### ✅ Solución 3: API de Diagnóstico Completo

Crear: `app/api/admin/diagnostico-listas/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken, getTokenPayload } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // 1. Información del token
        const payload = await getTokenPayload(request);
        const empresaId = await getEmpresaIdFromToken(request);

        // 2. Conexión
        const db = await getDBConnection(empresaId);

        // 3. Contar listas
        const listasResult = await db`SELECT COUNT(*) as total FROM listas_precios`;
        const listas = Array.isArray(listasResult) ? listasResult : listasResult.rows || [];

        // 4. Ver nombres de listas
        const nombresResult = await db`SELECT id, nombre, es_default FROM listas_precios ORDER BY id`;
        const nombres = Array.isArray(nombresResult) ? nombresResult : nombresResult.rows || [];

        // 5. Contar precios
        const preciosResult = await db`SELECT COUNT(*) as total FROM precios`;
        const precios = Array.isArray(preciosResult) ? preciosResult : preciosResult.rows || [];

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            token: {
                presente: !!payload,
                empresaId: payload?.empresaId,
                empresaSlug: payload?.empresaSlug,
                empresaNombre: payload?.empresaNombre,
                userId: payload?.userId,
                email: payload?.email
            },
            conexion: {
                empresaIdUsado: empresaId,
                tipoConexion: empresaId ? `SaaS (Empresa ${empresaId})` : 'DeltaWash Legacy',
            },
            baseDatos: {
                totalListas: parseInt(listas[0]?.total) || 0,
                totalPrecios: parseInt(precios[0]?.total) || 0,
                listas: nombres
            },
            diagnostico: empresaId 
                ? `✅ Usando base de datos de empresa ${empresaId}`
                : '⚠️ Usando base de datos de DeltaWash (sin empresaId en token)'
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
}
```

**Uso:**
Hacer request a `/api/admin/diagnostico-listas` con la empresa SaaS logueada

---

## 🎯 Plan de Acción Paso a Paso

### Para ti (Admin):

#### Paso 1: Verificar Branch Template
```sql
-- En Neon Console → Branch "central" → SQL Editor
SELECT COUNT(*) FROM listas_precios;  -- ¿Es 0?
SELECT COUNT(*) FROM precios;         -- ¿Es 0?
```

**Si NO es 0:**
```sql
DELETE FROM precios;
DELETE FROM listas_precios;
```

#### Paso 2: Crear APIs de Diagnóstico
1. Crear `app/api/admin/diagnostico-listas/route.ts` (código arriba)
2. Crear `app/api/admin/limpiar-listas-empresa/route.ts` (código arriba)

#### Paso 3: Probar con Empresa Afectada
1. Hacer login con empresa SaaS afectada
2. En DevTools Console:
```javascript
// Ver diagnóstico
fetch('/api/admin/diagnostico-listas', {
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(console.log)
```

3. Si ve listas de otra empresa:
```javascript
// Limpiar y recrear
fetch('/api/admin/limpiar-listas-empresa', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
}).then(r => r.json()).then(console.log)
```

#### Paso 4: Verificar Funcionalidad
1. Refrescar página `/listas-precios`
2. Debe ver solo 1 lista: "Por Defecto" con todos los precios en $0
3. Debe poder EDITAR los precios sin errores

---

## 🔒 Prevención Futura

### ✅ Asegurar que Template esté Siempre Vacío

En `lib/neon-api.ts` línea 78, el código ya usa el template correcto:

```typescript
const TEMPLATE_BRANCH_ID = 'br-quiet-moon-ahudb5a2'; // ← Branch "central" vacío
```

**Acción:**
1. Verificar que este branch esté SIEMPRE vacío
2. NO ejecutar migraciones manuales en este branch
3. NO crear datos de prueba aquí

### ✅ Validar Token en APIs

Las APIs ya validan correctamente con:
```typescript
const empresaId = await getEmpresaIdFromToken(request);
const db = await getDBConnection(empresaId);
```

**Esto está correcto** ✅

---

## 📞 ¿Necesitas Ayuda?

Si después de estos pasos el problema persiste:

1. Compartir resultado de `/api/admin/diagnostico-listas`
2. Compartir screenshot de Neon Console → Branch "central" → "SQL Editor" mostrando:
   - `SELECT * FROM listas_precios;`
   - `SELECT COUNT(*) FROM precios;`
3. Screenshot de DevTools → Network → Request a `/api/listas-precios` mostrando:
   - Request Headers (especialmente `Authorization`)
   - Response (las listas que retorna)

---

**Fecha:** 2026-01-18  
**Estado:** Solución propuesta - Pendiente de implementación y prueba
