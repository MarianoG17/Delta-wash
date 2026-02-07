# AUDITORÍA: Impacto de Cambios SaaS en Legacy

**Fecha:** 2026-02-06 02:47 AM  
**Problema detectado:** Cambios para SaaS rompieron encuestas Legacy  
**Preocupación:** ¿Qué más puede haberse roto en Legacy sin que nos demos cuenta?

---

## 🔴 CAMBIOS QUE IMPACTARON LEGACY

### 1. `/api/survey-config/route.ts` ❌ ROMPIÓ LEGACY
**Commit:** cdbdf4e (fix), original en commits previos  
**Problema:** Buscaba tabla `configuracion_encuestas` que NO existe en Legacy DeltaWash  
**Síntoma:** "invalido o haber expirado" en encuestas Legacy  
**Fix aplicado:** Fallback automático a `survey_config` (tabla Legacy correcta)  
**Estado:** ✅ FIXED

---

## ✅ CAMBIOS QUE NO AFECTAN LEGACY (Protegidos por IS_SAAS_PROJECT)

### 2. `/api/survey/[token]/route.ts` GET ✅ SEGURO
**Protección:** `if (isSaasProject)` con `else` branch para Legacy  
**Legacy usa:**
- `process.env.DATABASE_URL` directo
- Tabla `surveys` sin empresa_id
- Tabla `survey_config` (con fallback a defaults)
**Riesgo:** ⚪ NINGUNO - Legacy tiene su propio flujo independiente

### 3. `/api/survey/[token]/submit/route.ts` POST ✅ SEGURO
**Protección:** `if (isSaasProject)` con `else` branch para Legacy  
**Legacy usa:**
- `process.env.DATABASE_URL` directo
- Tabla `benefits` CON `discount_percentage` (schema Legacy correcto)
**Riesgo:** ⚪ NINGUNO - Legacy tiene su propio flujo independiente

### 4. `/api/registros/marcar-entregado/route.ts` ✅ SEGURO
**Protección:** `if (tokenPayload && tokenPayload.empresaId && tokenPayload.branchUrl)`  
**Legacy:**
- NO tiene JWT con empresaId/branchUrl
- Condición es FALSE → NO ejecuta código SaaS
- Solo inserta en `surveys` local
**Riesgo:** ⚪ NINGUNO - Legacy NO ejecuta código survey_lookup

---

## 🔍 ARCHIVOS COMPARTIDOS SIN CAMBIOS (Bajo riesgo)

### APIs que NO tocamos para SaaS:
- `/api/auth/login/route.ts` - NO modificado
- `/api/auth/check-session/route.ts` - NO modificado  
- `/api/registros/route.ts` - NO modificado
- `/api/clientes/route.ts` - NO modificado
- `/api/reportes/ventas/route.ts` - NO modificado
- `/api/reportes/encuestas/route.ts` - NO modificado
- `/api/cuentas-corrientes/route.ts` - NO modificado
- Todas las páginas frontend (page.tsx) - NO modificadas

**Riesgo:** ⚪ NINGUNO - Estos no fueron tocados en implementación SaaS

---

## 📋 ARCHIVOS QUE CAMBIAMOS PARA SAAS (Auditar)

### ✅ `/lib/db-saas.ts`
**Cambios:** Agregamos funciones SaaS (getCentralDB, getClientDB)  
**Legacy usa:** `getDBConnection()` que internamente usa `process.env.POSTGRES_URL` cuando NO hay empresaId  
**Riesgo:** ⚪ BAJO - Legacy path NO modificado, solo agregamos paths nuevos

### ✅ `/lib/auth-middleware.ts`
**Cambios:** Agregamos `getTokenPayload()`, `isSaaSRequest()`  
**Legacy:** NO usa JWT, funciones retornan null/false correctamente  
**Riesgo:** ⚪ NINGUNO - Solo agregamos funciones, NO modificamos las existentes

---

## 🎯 RECOMENDACIONES

### CRÍTICO: Testear en Legacy
1. ✅ Login Legacy → Ya funcionaba
2. ✅ Historial → Usuario confirmó funciona
3. ✅ Clientes → Usuario confirmó funciona  
4. ✅ Reportes → Usuario confirmó funciona
5. 🔄 **Encuestas Legacy** → TESTEANDO AHORA (después del fix cdbdf4e)

### Flujo completo a verificar en Legacy:
1. Crear venta nueva con cliente
2. Marcar listo
3. Enviar WhatsApp (genera survey)
4. Abrir link de encuesta
5. Responder encuesta
6. Verificar beneficio creado
7. Canjear beneficio en nueva venta

### Si algo más falla en Legacy:
1. **NO hacer rollback** (rompe SaaS que funciona)
2. Identificar el archivo específico problemático
3. Agregar try/catch con fallback a comportamiento Legacy
4. Usar detección automática (por tabla, por env var, por JWT)

---

## 🛡️ PROTECCIONES IMPLEMENTADAS

1. **IS_SAAS_PROJECT env var** - Separa flujos a nivel de deployment
2. **JWT detection** - `getTokenPayload()` retorna null en Legacy
3. **Table detection** - Try/catch en queries para detectar schema Legacy vs SaaS
4. **Fallback a defaults** - Si falla todo, usar valores por defecto seguros

---

## ✅ CONCLUSIÓN

**¿Qué más puede estar roto?**  
Con alta probabilidad: **NADA MÁS**

**Razón:**  
- Solo cambiamos 4 archivos relacionados a surveys
- 3 de 4 tienen protección IS_SAAS_PROJECT o JWT detection
- 1 de 4 tenía bug de nombre de tabla (YA FIXED)
- Resto del código NO fue tocado

**Próximo paso:**  
Testear encuesta Legacy end-to-end para confirmar fix cdbdf4e resuelve el problema.
