# ✅ Proceso Correcto para Cambiar API Key Sin Perder Acceso

**Fecha:** 17 de enero de 2026

---

## 🔑 Sobre las API Keys en Neon

En Neon Console, las API keys se gestionan en:
```
https://console.neon.tech/app/settings/api-keys
```

**Características:**
- Podés tener MÚLTIPLES API keys activas al mismo tiempo
- Cada key tiene un nombre descriptivo
- Las keys NO se muestran nuevamente después de crearlas (solo una vez)
- Podés revocar keys individualmente

---

## ⚡ Proceso Correcto (SIN Interrupciones)

### ✅ Paso 1: Crear la NUEVA API Key (Sin tocar la antigua)

1. **Ir a Neon Console:**
   ```
   https://console.neon.tech/app/settings/api-keys
   ```

2. **Click en "Create new API key"**

3. **Darle un nombre descriptivo:**
   ```
   Nombre sugerido: "lavapp-production-2026"
   ```

4. **Copiar la nueva key inmediatamente**
   - Se muestra UNA SOLA VEZ
   - Ejemplo: `napi_abc123xyz789...`
   - Guardarla temporalmente en un lugar seguro (notepad)

5. **NO REVOCAR la antigua todavía** ⚠️

---

### ✅ Paso 2: Actualizar .env.local (Desarrollo Local)

**Archivo: `.env.local`**

Reemplazar SOLO la línea de NEON_API_KEY:

```bash
# ANTES:
NEON_API_KEY="napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8"

# DESPUÉS (pegar tu nueva key):
NEON_API_KEY="napi_TU_NUEVA_KEY_AQUI"
```

**Guardar el archivo.**

---

### ✅ Paso 3: Probar en Local que Funciona

```bash
# Reiniciar servidor de desarrollo
npm run dev
```

Probar el registro de nueva empresa:
1. Ir a: `http://localhost:3000/registro`
2. Llenar formulario con datos de prueba
3. Crear cuenta
4. **Verificar logs en terminal:**
   ```
   [Neon API] Creando branch: nombre-prueba
   [Neon API] Branch creado exitosamente: br-xxx
   ✅ Empresa registrada correctamente
   ```

**Si funciona correctamente, continuar al siguiente paso.**

**Si da error:** Verificar que copiaste bien la nueva API key.

---

### ✅ Paso 4: Actualizar Variables en Vercel (Producción)

**Solo SI el paso 3 funcionó:**

1. **Ir a tu proyecto en Vercel:**
   ```
   https://vercel.com/[tu-usuario]/[tu-proyecto]/settings/environment-variables
   ```

2. **Buscar la variable `NEON_API_KEY`**

3. **Click en el ícono de 3 puntos (⋮) > Edit**

4. **Pegar la NUEVA API key** (la misma del paso 2)

5. **Marcar los ambientes donde aplicar:**
   - ☑️ Production
   - ☑️ Preview (opcional)
   - ☑️ Development (opcional)

6. **Click en "Save"**

---

### ✅ Paso 5: Re-deployar Vercel

Después de cambiar la variable de entorno:

```bash
# Opción A: Trigger deploy desde terminal
git commit --allow-empty -m "chore: update neon api key"
git push

# Opción B: Desde Vercel Dashboard
# Ir a tu proyecto > Deployments > Click en "..." del último deploy > Redeploy
```

**Esperar a que el deploy termine** (~2-3 minutos)

---

### ✅ Paso 6: Verificar que Producción Funciona

1. **Ir a tu app en producción:**
   ```
   https://tu-app.vercel.app/registro
   ```

2. **Crear cuenta de prueba**

3. **Verificar que se crea correctamente**

**Si funciona → Continuar al Paso 7**

**Si NO funciona:**
- Revisar logs en Vercel: `https://vercel.com/[usuario]/[proyecto]/deployments`
- Verificar que la variable NEON_API_KEY está bien configurada
- NO revocar la antigua key todavía

---

### ✅ Paso 7: AHORA SÍ - Revocar la Antigua API Key

**Solo después de confirmar que TODO funciona:**

1. **Ir a Neon Console:**
   ```
   https://console.neon.tech/app/settings/api-keys
   ```

2. **Identificar la key antigua:**
   - Buscar por nombre o fecha de creación
   - O la que empieza con `napi_8knk7pkuq6qe7p7h...`

3. **Click en "Delete" o "Revoke"**

4. **Confirmar la revocación**

---

## 📊 Estado de las Keys Durante el Proceso

```
INICIO:
┌─────────────────────────────────┐
│ Key Antigua (comprometida)      │ ✅ Activa en .env y Vercel
└─────────────────────────────────┘

DESPUÉS DEL PASO 1:
┌─────────────────────────────────┐
│ Key Antigua (comprometida)      │ ✅ Activa en .env y Vercel
│ Key Nueva                       │ ✅ Creada pero no en uso
└─────────────────────────────────┘

DESPUÉS DEL PASO 3:
┌─────────────────────────────────┐
│ Key Antigua (comprometida)      │ ✅ Activa en Vercel
│ Key Nueva                       │ ✅ Activa en .env.local
└─────────────────────────────────┘

DESPUÉS DEL PASO 6:
┌─────────────────────────────────┐
│ Key Antigua (comprometida)      │ ⚠️ Ya no se usa pero aún existe
│ Key Nueva                       │ ✅ Activa en todo
└─────────────────────────────────┘

DESPUÉS DEL PASO 7:
┌─────────────────────────────────┐
│ Key Antigua                     │ ❌ REVOCADA
│ Key Nueva                       │ ✅ Activa en todo
└─────────────────────────────────┘
```

---

## ❓ Preguntas Frecuentes

### ¿Qué pasa si revoco la antigua antes de tiempo?

Si revocás la antigua key ANTES de actualizar Vercel:
- ❌ Tu app en producción dejará de funcionar
- ❌ No se podrán crear nuevas empresas
- ✅ Las empresas existentes seguirán funcionando (usan sus propias DBs)

Por eso es importante el orden: **Crear nueva → Actualizar → Probar → Revocar antigua**

### ¿Cuántas API keys puedo tener?

Neon permite tener múltiples API keys activas simultáneamente. No hay límite práctico.

### ¿Puedo usar diferentes keys para desarrollo y producción?

Sí, es una buena práctica:
- Key 1: "lavapp-development"
- Key 2: "lavapp-production"

Pero para simplificar, podés usar la misma.

### ¿Qué pasa si pierdo la nueva key antes de guardarla?

Si cerrás la ventana sin copiar la key:
- La key existe pero NO podés verla nuevamente
- Solución: Crear otra key nueva y usar esa

### ¿Cuánto tiempo tengo para hacer el cambio?

Técnicamente, la key comprometida seguirá funcionando hasta que la revoqués manualmente. Sin embargo, por seguridad deberías hacerlo lo antes posible (hoy mismo).

---

## 🎯 Resumen del Orden Correcto

```
1. Crear NUEVA key (la antigua sigue activa)
   ↓
2. Actualizar .env.local
   ↓
3. Probar en local
   ↓
4. Actualizar Vercel
   ↓
5. Re-deployar
   ↓
6. Probar en producción
   ↓
7. RECIÉN AHÍ revocar la antigua
```

**Nunca al revés** ❌

---

## ✅ Checklist Visual

```
[ ] 1. Entrar a Neon Console > API Keys
[ ] 2. Click en "Create new API key"
[ ] 3. Nombre: "lavapp-production-2026"
[ ] 4. Copiar la nueva key (guardar en lugar seguro)
[ ] 5. Actualizar .env.local con nueva key
[ ] 6. Probar en local (npm run dev → /registro)
[ ] 7. Ir a Vercel > Settings > Environment Variables
[ ] 8. Editar NEON_API_KEY con nueva key
[ ] 9. Save en Vercel
[ ] 10. Git commit + push (o redeploy manual)
[ ] 11. Esperar deploy (~2-3 min)
[ ] 12. Probar en producción (tu-app.vercel.app/registro)
[ ] 13. Si todo funciona → Revocar antigua key en Neon
[ ] 14. ✅ LISTO - Key actualizada sin interrupciones
```

---

**Última actualización:** 17 de enero de 2026
