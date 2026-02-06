# Configurar IS_SAAS_PROJECT en Vercel

## ✅ CAMBIO DEPLOYADO

**Commit**: `bd6f380` - "feat: Add SaaS multi-tenant survey support with IS_SAAS_PROJECT flag"

**Archivo modificado**: [`app/api/survey/[token]/route.ts`](app/api/survey/[token]/route.ts:1)

---

## 🎯 QUÉ HACE ESTE CAMBIO

La API de encuestas públicas `/api/survey/[token]` ahora soporta DOS modos:

### 1. **Modo Legacy** (deltawash-app)
- ❌ NO tiene variable `IS_SAAS_PROJECT` (o está en `false`)
- ✅ Usa `DATABASE_URL` directamente → branch `deltawash`
- ✅ Funciona **IGUAL que antes** - zero cambios
- ✅ Links formato: `https://deltawash-app.vercel.app/survey/[UUID]`

### 2. **Modo SaaS** (lavapp / chasis.app)
- ✅ Tiene variable `IS_SAAS_PROJECT=true`
- ✅ Usa `survey_lookup` de `CENTRAL_DB_URL` → obtiene `branch_url` → conecta al branch del cliente
- ✅ Soporta multi-tenant (cada cliente en su branch)
- ✅ Links formato: `https://chasis.app/survey/[UUID]`

---

## 📋 PASOS PARA CONFIGURAR VERCEL

### PROYECTO 1: deltawash-app (Legacy)

**NO HACER NADA** ✅

El proyecto deltawash-app NO necesita configuración adicional. Al NO tener la variable `IS_SAAS_PROJECT`, automáticamente usa el modo Legacy.

**Comportamiento**: Seguirá funcionando exactamente igual que ahora.

---

### PROYECTO 2: lavapp (SaaS / chasis.app)

#### Paso 1: Ir a Vercel Dashboard
```
https://vercel.com/dashboard
```

#### Paso 2: Seleccionar Proyecto
- Click en **lavapp** (o el nombre del proyecto SaaS)

#### Paso 3: Ir a Settings
- Click en pestaña **Settings** (arriba)

#### Paso 4: Agregar Variable de Entorno
1. En el menú lateral, click en **Environment Variables**
2. Click en **Add Variable** o **Add New**
3. Completar:
   ```
   Name:  IS_SAAS_PROJECT
   Value: true
   ```
4. **IMPORTANTE**: Seleccionar en qué environments aplicar:
   - ✅ **Production** (required)
   - ✅ **Preview** (opcional, recomendado)
   - ✅ **Development** (opcional)
5. Click en **Save**

#### Paso 5: Redeploy
**CRÍTICO**: Las variables de entorno solo se aplican en NUEVO deployment.

Opción A - Automático (esperar):
- Vercel ya está haciendo deploy del commit `bd6f380`
- Esperar 2-3 minutos
- Si no funciona, seguir con Opción B

Opción B - Manual (forzar):
1. Ir a pestaña **Deployments**
2. Click en el deployment más reciente (debe ser `bd6f380`)
3. Click en los 3 puntos (...) → **Redeploy**
4. Confirmar

---

## 🧪 TESTING

### Test 1: Verificar Legacy (deltawash-app)
```bash
# Link existente de Legacy (debe seguir funcionando):
https://deltawash-app.vercel.app/survey/[UUID-legacy]
```

**Resultado esperado**: ✅ Carga la encuesta normalmente

---

### Test 2: Verificar SaaS (lavapp)
```bash
# Link de SaaS que estaba fallando:
https://chasis.app/survey/18eb65c4-e5cd-492e-83ac-5344503939ab
```

**Resultado esperado**: ✅ Carga la encuesta del cliente correcto (lo-de-nano)

---

### Test 3: Verificar Logs (si falla)

#### En Vercel Dashboard:
1. Ir a proyecto → pestaña **Logs**
2. Buscar logs recientes con `[Survey SaaS]` o `[Survey Legacy]`
3. Verificar qué modo se está usando

**Logs esperados en lavapp:**
```
[Survey SaaS] Buscando en survey_lookup...
```

**Logs esperados en deltawash-app:**
```
[Survey Legacy] Usando DATABASE_URL directo...
```

---

## 🚨 TROUBLESHOOTING

### Problema: lavapp sigue dando "Encuesta no encontrada"

**Causa probable**: Variable de entorno no se aplicó o deployment no se hizo

**Solución**:
1. Verificar que la variable existe:
   - Settings → Environment Variables
   - Debe estar `IS_SAAS_PROJECT = true`
2. Forzar redeploy:
   - Deployments → último deployment → Redeploy
3. Esperar 2-3 minutos
4. Probar link nuevamente

---

### Problema: Legacy dejó de funcionar

**Causa**: Muy improbable, pero si pasa:

**Solución**:
1. Verificar que deltawash-app NO tiene `IS_SAAS_PROJECT`
2. Si la tiene, ELIMINARLA
3. Redeploy deltawash-app
4. El código tiene fallback seguro para este caso

---

## ✅ CHECKLIST FINAL

- [ ] Variable `IS_SAAS_PROJECT=true` agregada en lavapp
- [ ] lavapp redeployado después de agregar variable
- [ ] Test: Link `https://chasis.app/survey/18eb65c4...` funciona ✅
- [ ] Test: Link Legacy `https://deltawash-app.vercel.app/survey/...` sigue funcionando ✅
- [ ] deltawash-app NO tiene variable `IS_SAAS_PROJECT` (o está vacío)

---

## 📊 PRÓXIMOS PASOS (DESPUÉS DE TESTING)

Si todo funciona:
1. ✅ Legacy operando normalmente
2. ✅ SaaS encuestas funcionando
3. ✅ Sistema multi-tenant habilitado

Si algo falla:
1. Revisar logs en Vercel
2. Verificar variables de entorno
3. Rollback simple: `git revert bd6f380` + push
