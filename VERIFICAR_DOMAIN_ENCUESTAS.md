# Verificar Dominio de Encuestas

## Problema
Las encuestas siguen mostrando `chasis.app` en lugar de `lavapp.ar`

## Causas Posibles

### 1. Deploy de Vercel No Completado
El push se hizo, pero Vercel puede tardar 2-5 minutos en deployar.

**Verificar:**
1. Ir a: https://vercel.com/tu-proyecto/deployments
2. Ver que el último commit (`1634253`) esté en estado "Ready" (verde)
3. Si está "Building", esperar a que termine

### 2. Variable de Entorno en Vercel
Aunque confirmaste que está configurada, verificá:

**Pasos:**
1. Ir a: https://vercel.com/tu-proyecto/settings/environment-variables
2. Buscar: `NEXT_PUBLIC_APP_URL`
3. Valor debe ser: `https://lavapp.ar` (sin barra final)
4. Scope debe incluir: `Production`, `Preview`, `Development`

**IMPORTANTE:** Las variables que empiezan con `NEXT_PUBLIC_` necesitan:
- Estar configuradas EN VERCEL (no solo en .env local)
- El proyecto necesita RE-DEPLOYARSE después de agregarlas
- Se "queman" en el build del frontend (no son dinámicas)

### 3. Re-deploy Requerido
Si acabás de agregar/modificar `NEXT_PUBLIC_APP_URL`:

**Solución:**
1. Ir a: https://vercel.com/tu-proyecto/deployments
2. Click en los 3 puntos del último deployment
3. Click en "Redeploy"
4. Seleccionar "Use existing Build Cache: OFF"
5. Click "Redeploy"

### 4. Cache del Navegador
El browser puede tener cached el JavaScript con el valor viejo.

**Solución:**
- Hard refresh: `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac)
- O abrir en ventana incógnito

### 5. API Endpoint vs Frontend
El link se genera en el BACKEND, no en el frontend.

**El endpoint que lo genera:**
`/api/surveys/get-by-visit?visitId=X`

**Test rápido:**
1. Abrir DevTools (F12)
2. Ir a Network tab
3. Hacer click en "Enviar Encuesta"
4. Ver la respuesta de `/api/surveys/get-by-visit`
5. Buscar el campo `surveyUrl` en la response

Si en la response JSON aparece `chasis.app`, entonces:
- La variable NO está llegando al backend
- Necesitás re-deploy completo (sin cache)

## Test Manual en Producción

```bash
# Ver qué dominio está usando el API
curl https://lavapp.ar/api/surveys/get-by-visit?visitId=123

# Debería retornar algo como:
# {
#   "survey": {
#     "surveyUrl": "https://lavapp.ar/survey/abc-123-...",
#     ...
#   }
# }
```

## Código Relevante

El código que genera el link está en:
- `app/api/surveys/get-by-visit/route.ts` línea 46:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const surveyUrl = `${baseUrl}/survey/${survey.survey_token}`;
```

Si `process.env.NEXT_PUBLIC_APP_URL` es `undefined`, usa `http://localhost:3000` por defecto.

## Solución Definitiva

### Opción A: Verificar + Re-deploy
1. Verificar variable en Vercel
2. Re-deploy sin cache
3. Hard refresh del browser

### Opción B: Forzar Valor (Temporal)
Si la variable no está llegando, podemos hardcodear temporalmente:

```typescript
// Cambiar de:
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// A:
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp.ar';
```

Esto asegura que incluso si la variable no existe, use `lavapp.ar` en lugar de `localhost`.

## ¿Qué Hacer Ahora?

1. **Verificar deployment en Vercel** - Estado "Ready"?
2. **Verificar variable de entorno** - Existe y está en Production?
3. **Test con DevTools** - ¿Qué dominio aparece en la response del API?
4. **Si sigue fallando** - Re-deploy forzado sin cache

Decime qué encontrás y ajustamos.
