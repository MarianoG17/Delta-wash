# Comparativa de Opciones para Survey API SaaS

## Contexto del Problema
- **Legacy (deltawash-app)**: `DATABASE_URL` → branch `deltawash` → encuestas están ahí ✅
- **SaaS (lavapp)**: Cada cliente en branch separado (`lo-de-nano`, `mariano`, etc.)
- **Necesidad**: La API `/api/survey/[token]` debe funcionar para AMBOS

---

## OPCIÓN 1: Variable de Entorno `IS_SAAS_PROJECT`

### Implementación
```typescript
const isSaasProject = process.env.IS_SAAS_PROJECT === 'true';

if (isSaasProject) {
    // Buscar SOLO en survey_lookup → branch_url
} else {
    // Buscar en DATABASE_URL (Legacy directo)
}
```

### Configuración Vercel
- **deltawash-app**: NO agregar variable (o `IS_SAAS_PROJECT=false`)
- **lavapp**: Agregar `IS_SAAS_PROJECT=true`

### ✅ PROS
- **Simple y explícito**: Cada proyecto sabe qué es
- **Sin fallbacks confusos**: Flujo claro y predecible
- **Performance**: No hace queries innecesarias
- **Fácil debug**: Logs claros de qué path se usó

### ❌ CONTRAS
- **Configuración manual**: Hay que recordar setear la variable en Vercel
- **Dos proyectos distintos**: Necesita mantener configs separadas
- **Risk**: Si olvidás setear la variable en lavapp, fallaría

### 🎯 MEJOR PARA
Escenarios donde tenés control total de la infraestructura y querés máxima claridad.

---

## OPCIÓN 2: Fallback Automático (Sin Variables)

### Implementación
```typescript
// 1. Intentar en DATABASE_URL
const result = await sql`SELECT * FROM surveys WHERE survey_token = ${token}`;

if (result.length === 0) {
    // 2. No encontró → intentar en survey_lookup
    const lookup = await centralSql`SELECT branch_url FROM survey_lookup WHERE survey_token = ${token}`;
    // Conectar al branch y buscar
}
```

### ✅ PROS
- **Sin configuración extra**: Mismo código funciona en ambos proyectos
- **Auto-detección**: No necesita saber si es Legacy o SaaS
- **Resiliente**: Si algo falla en un path, intenta el otro
- **Un solo proyecto**: Mismo deploy para ambos

### ❌ CONTRAS
- **Performance SaaS**: lavapp SIEMPRE intenta DATABASE_URL primero (query fallido)
- **Confuso**: No está claro cuándo usa cada path
- **Logs difíciles**: Errores mezclados de ambos paths
- **Latencia extra**: Doble query en SaaS (fallido + correcto)

### 🎯 MEJOR PARA
Cuando querés máxima flexibilidad y no te importa el overhead de queries fallidas.

---

## OPCIÓN 3: Detectar por `CENTRAL_DB_URL` Existente

### Implementación
```typescript
const hasCentralDb = !!process.env.CENTRAL_DB_URL;

if (hasCentralDb) {
    // Es SaaS → usar survey_lookup
} else {
    // Es Legacy → usar DATABASE_URL
}
```

### ✅ PROS
- **Auto-detección inteligente**: Si tiene `CENTRAL_DB_URL` = SaaS
- **Sin variables extra**: Usa las que ya existen
- **Claro**: Lógica basada en capacidades disponibles
- **Fácil setup**: Solo configurar `CENTRAL_DB_URL` en lavapp

### ❌ CONTRAS
- **Asume que Legacy NO tiene CENTRAL_DB_URL**: Si algún día lo necesita, rompe
- **Implícito**: No es obvio por qué detecta así
- **Frágil**: Si cambia la arquitectura, puede romperse

### 🎯 MEJOR PARA
Cuando las variables de entorno ya definen las capacidades del proyecto.

---

## OPCIÓN 4: Fallback Inteligente con Timeout

### Implementación
```typescript
try {
    // Intentar DATABASE_URL con timeout corto (500ms)
    const result = await Promise.race([
        sql`SELECT ...`,
        new Promise((_, reject) => setTimeout(() => reject('timeout'), 500))
    ]);
    
    if (result.length > 0) return result;
} catch (error) {
    // Timeout o error → ir a survey_lookup
}
```

### ✅ PROS
- **Sin configuración**: Funciona automáticamente
- **Fast-fail**: No espera mucho si DATABASE_URL está mal
- **Universal**: Mismo código sirve para ambos

### ❌ CONTRAS
- **Complejo**: Agregar timeouts es propenso a bugs
- **Falsos positivos**: Query lenta != query fallida
- **Difícil tunear**: ¿500ms? ¿1000ms? Depende de la latencia
- **Overhead**: Siempre intenta DATABASE_URL primero en SaaS

### 🎯 MEJOR PARA
Nunca. Es overengineering.

---

## 📊 RECOMENDACIÓN

### 🥇 **OPCIÓN 1: Variable `IS_SAAS_PROJECT`**

**Razones:**
1. ✅ **Claridad máxima**: Código explícito, fácil de entender
2. ✅ **Performance óptima**: No hace queries innecesarias
3. ✅ **Fácil debug**: Logs claros de qué path se usó
4. ✅ **Futuro-proof**: Si cambia la arquitectura, solo cambiar la variable
5. ✅ **Best practice**: Configuración explícita > auto-detección mágica

**Setup requerido:**
```bash
# En Vercel dashboard de lavapp:
IS_SAAS_PROJECT=true

# En deltawash-app: 
# NO agregar nada (default = false)
```

**Alternativa aceptable:** OPCIÓN 3 (detectar por `CENTRAL_DB_URL`) si querés evitar agregar variables.

**NO recomendado:** OPCIÓN 2 (fallback) ni OPCIÓN 4 (timeout) por overhead y complejidad innecesaria.
