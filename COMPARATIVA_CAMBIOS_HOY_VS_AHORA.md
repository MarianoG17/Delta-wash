# Comparativa: Cambios que FALLARON hoy vs Cambio SEGURO ahora

## ❌ LO QUE FALLÓ HOY (causó rollback)

### Archivo 1: `lib/db-saas.ts` (CORE FILE)
```typescript
// ANTES (funcionaba):
import { createPool } from '@vercel/postgres';
const pool = createPool({ connectionString: process.env.CENTRAL_DB_URL });

// DESPUÉS (rompió todo):
import { neon } from '@neondatabase/serverless';
const centralSql = neon(process.env.CENTRAL_DB_URL!);
```
**Por qué falló:** `db-saas.ts` es usado por TODO el sistema. Al cambiar el driver ahí, rompimos Legacy y SaaS.

### Archivo 2: `app/api/auth/login-saas/route.ts`
```typescript
// También cambiamos de createPool a neon
```
**Por qué falló:** Es archivo de autenticación compartido.

---

## ✅ LO QUE ESTAMOS HACIENDO AHORA (seguro)

### Archivo ÚNICO modificado: `app/api/registros/marcar-entregado/route.ts`

**Este archivo:**
- ✅ Es una ruta API aislada (solo para marcar vehículo entregado)
- ✅ NO es un core file
- ✅ NO es compartido por otros módulos
- ✅ Legacy no lo usa de forma crítica
- ✅ Si falla, solo afecta a "marcar entregado" (no todo el sistema)

**Cambio específico (línea 108):**
```typescript
// Crear conexión directa SOLO para insertar en survey_lookup
const centralSql = neon(process.env.CENTRAL_DB_URL!);
await centralSql`INSERT INTO survey_lookup ...`;
```

**Es seguro porque:**
1. NO modificamos `db-saas.ts`
2. NO modificamos `db.ts`
3. NO modificamos ningún archivo de autenticación
4. Solo agregamos una conexión adicional dentro de UNA ruta específica

---

## 🎯 PRUEBA: survey/[token] YA USA ESTO Y FUNCIONA

El archivo `app/api/survey/[token]/route.ts` **YA USA** exactamente lo mismo:

```typescript
// Líneas 1-4 de survey/[token]/route.ts
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request, context: { params: Promise<{ token: string }> }) {
    const params = await context.params;
    const token = params.token;
    
    const isSaasProject = process.env.IS_SAAS_PROJECT === 'true';
    
    if (isSaasProject) {
        // ESTO YA FUNCIONA:
        const centralSql = neon(process.env.CENTRAL_DB_URL!);  // ← LÍNEA 14
        const lookupResult = await centralSql`
            SELECT sl.branch_url, sl.empresa_id, e.nombre as empresa_nombre
            FROM survey_lookup sl
            LEFT JOIN empresas e ON e.id = sl.empresa_id
            WHERE sl.survey_token = ${token}
        `;
        // ... resto del código
    }
}
```

**Este código lo deployamos en commit bd6f380 y FUNCIONA correctamente.**

---

## 📊 Comparación lado a lado

| Aspecto | Cambios HOY (fallaron) | Cambio AHORA (seguro) |
|---------|------------------------|----------------------|
| **Archivos modificados** | `db-saas.ts` + `login-saas/route.ts` | Solo `marcar-entregado/route.ts` |
| **Tipo de archivo** | Core + Auth (críticos) | Route API aislada |
| **Impacto si falla** | TODO el sistema | Solo marcar entregado |
| **Usa `neon()`** | Sí, en core | Sí, pero solo en ruta aislada |
| **Igual que survey/[token]** | No | **Sí (exacto patrón)** |
| **Ya probado funcionando** | No | **Sí (survey/[token])** |

---

## ✅ Conclusión

El patrón de usar `neon(CENTRAL_DB_URL)` **es seguro** cuando:
1. Se usa en rutas API aisladas (no core files)
2. Ya está probado funcionando (survey/[token])
3. No modifica archivos compartidos

**Estamos replicando EXACTAMENTE lo que ya funciona en survey/[token].**
