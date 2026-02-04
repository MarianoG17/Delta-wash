# 🔧 Fix: Mostrar Estado "Enviada" en Botón de Encuesta

## 🎯 Problema Actual

Cuando presionás "📋 Enviar encuesta", el botón no cambia de estado ni muestra que ya fue enviada.

**Flujo actual**:
1. ✅ Usuario hace click en "📋 Enviar encuesta"
2. ✅ Se abre WhatsApp con el mensaje
3. ✅ Backend marca `sent_at = CURRENT_TIMESTAMP`
4. ❌ **Botón NO cambia** (sigue diciendo "Enviar encuesta")

---

## 📊 Análisis del Código Actual

### Backend ✅ (Ya está correcto)

**API [`/api/surveys/get-by-visit`](app/api/surveys/get-by-visit/route.ts:75)**:
- ✅ Ya retorna `sentAt` en la respuesta

**API [`/api/surveys/mark-sent`](app/api/surveys/mark-sent/route.ts:49)**:
- ✅ Ya marca `sent_at` en la BD

### Frontend ❌ (Necesita actualización)

**Archivo [`app/page.tsx`](app/page.tsx:31-33)**:

```typescript
// Tipo actual - FALTA sentAt
interface Survey {
    id: number;
    token: string;
    respondedAt: string | null;  // ✅ Existe
    surveyUrl: string;
    whatsappUrl: string;
    // ❌ FALTA: sentAt: string | null;
}
```

**Líneas 1556-1563** - Lógica actual del botón:
```tsx
{/* Solo verifica respondedAt, NO verifica sentAt */}
{surveys[registro.id] && !surveys[registro.id]?.respondedAt && (
    <button onClick={() => enviarEncuesta(registro.id)}>
        📋 Enviar encuesta
    </button>
)}
```

**Problema**: No usa el campo `sentAt` que el backend ya retorna

---

## ✅ Solución Diseñada

### Cambio 1: Actualizar Tipo Survey

**Archivo**: `app/page.tsx` línea 31

```typescript
// ANTES:
interface Survey {
    id: number;
    token: string;
    respondedAt: string | null;
    surveyUrl: string;
    whatsappUrl: string;
}

// DESPUÉS:
interface Survey {
    id: number;
    token: string;
    sentAt: string | null;        // ← AGREGAR
    respondedAt: string | null;
    surveyUrl: string;
    whatsappUrl: string;
}
```

---

### Cambio 2: Guardar sentAt al Cargar Encuesta

**Archivo**: `app/page.tsx` líneas 196-205

```typescript
// ANTES:
setSurveys(prev => ({
    ...prev,
    [visitId]: {
        id: data.survey.id,
        token: data.survey.token,
        respondedAt: data.survey.respondedAt,
        surveyUrl: data.survey.surveyUrl,
        whatsappUrl: data.survey.whatsappUrl
    }
}));

// DESPUÉS:
setSurveys(prev => ({
    ...prev,
    [visitId]: {
        id: data.survey.id,
        token: data.survey.token,
        sentAt: data.survey.sentAt,           // ← AGREGAR
        respondedAt: data.survey.respondedAt,
        surveyUrl: data.survey.surveyUrl,
        whatsappUrl: data.survey.whatsappUrl
    }
}));
```

---

### Cambio 3: Actualizar Lógica del Botón

**Archivo**: `app/page.tsx` líneas 1554-1568

**ANTES** (código actual):
```tsx
{/* Botón de encuesta - solo si existe y no está respondida */}
{surveys[registro.id] && !surveys[registro.id]?.respondedAt && (
    <button
        onClick={() => enviarEncuesta(registro.id)}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
    >
        📋 Enviar encuesta
    </button>
)}
{/* Indicador de encuesta respondida */}
{surveys[registro.id]?.respondedAt && (
    <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-semibold py-2 rounded-lg text-sm border-2 border-green-300">
        ✅ Encuesta respondida
    </div>
)}
```

**DESPUÉS** (con 3 estados):
```tsx
{/* ESTADO 1: Encuesta creada pero NO enviada */}
{surveys[registro.id] && 
 !surveys[registro.id]?.sentAt && 
 !surveys[registro.id]?.respondedAt && (
    <button
        onClick={() => enviarEncuesta(registro.id)}
        className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all text-sm"
    >
        📋 Enviar encuesta
    </button>
)}

{/* ESTADO 2: Encuesta enviada pero NO respondida */}
{surveys[registro.id]?.sentAt && 
 !surveys[registro.id]?.respondedAt && (
    <div className="w-full flex items-center justify-center gap-2 bg-yellow-100 text-yellow-700 font-semibold py-2 rounded-lg text-sm border-2 border-yellow-300">
        ✅ Encuesta enviada
        <span className="text-xs">(Esperando respuesta)</span>
    </div>
)}

{/* ESTADO 3: Encuesta respondida */}
{surveys[registro.id]?.respondedAt && (
    <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-semibold py-2 rounded-lg text-sm border-2 border-green-300">
        ✅ Encuesta respondida
        {surveys[registro.id]?.sentAt && (
            <span className="text-xs">
                (Enviada: {new Date(surveys[registro.id].sentAt!).toLocaleDateString('es-AR')})
            </span>
        )}
    </div>
)}
```

---

## 🎨 Estados Visuales del Botón

### Estado 1: Sin Enviar (Azul - Clickeable)
```
┌─────────────────────────────────┐
│   📋 Enviar encuesta            │ ← Botón azul clickeable
└─────────────────────────────────┘
```

### Estado 2: Enviada (Amarillo - Informativo)
```
┌─────────────────────────────────┐
│ ✅ Encuesta enviada             │ ← Badge amarillo
│    (Esperando respuesta)        │
└─────────────────────────────────┘
```

### Estado 3: Respondida (Verde - Completado)
```
┌─────────────────────────────────┐
│ ✅ Encuesta respondida           │ ← Badge verde
│    (Enviada: 01/02/2026)        │
└─────────────────────────────────┘
```

---

## 📋 Cambios Necesarios (Resumen)

### Archivo: `app/page.tsx`

**1. Actualizar interfaz Survey** (línea ~31)
- ✅ Agregar: `sentAt: string | null;`

**2. Actualizar setSurveys en cargarEncuesta** (línea ~196)
- ✅ Agregar: `sentAt: data.survey.sentAt,`

**3. Reemplazar lógica del botón** (líneas ~1554-1568)
- ✅ Agregar condicional para `sentAt`
- ✅ Mostrar 3 estados diferentes
- ✅ Usar colores distintos para cada estado

---

## 🔄 Flujo Completo Después del Fix

```
1. Auto marcado como "Listo"
   ↓
2. Sistema crea encuesta automáticamente
   ↓
3. Aparece botón "📋 Enviar encuesta" (AZUL)
   ↓
4. Usuario hace click
   ↓
5. Se abre WhatsApp
   ↓
6. Backend marca sent_at
   ↓
7. Frontend recarga encuesta
   ↓
8. Botón cambia a "✅ Encuesta enviada" (AMARILLO)
   ↓
9. Cliente completa encuesta
   ↓
10. Backend marca responded_at
    ↓
11. Próxima recarga: "✅ Encuesta respondida" (VERDE)
```

---

## 🎯 Beneficios del Fix

### Para el Usuario (Operador)
- ✅ **Feedback visual inmediato**: Sabe que se envió
- ✅ **Evita envíos duplicados**: Ve que ya está enviada
- ✅ **Estado claro**: 3 estados diferentes fáciles de distinguir

### Para el Cliente Final
- ✅ No recibe múltiples mensajes de WhatsApp
- ✅ Mejor experiencia

### Para el Sistema
- ✅ Usa datos que el backend ya provee
- ✅ No requiere cambios en BD
- ✅ No requiere cambios en APIs
- ✅ Solo actualización de frontend

---

## ⏱️ Estimación

**Tiempo de desarrollo**: 15-20 minutos

**Pasos**:
1. Actualizar tipo Survey (2 min)
2. Agregar sentAt en setSurveys (2 min)
3. Reemplazar lógica del botón (10 min)
4. Testing (5 min)

---

## 🧪 Testing

### Caso 1: Registro Listo sin Encuesta Enviada
**Acción**: Ver registro listo  
**Resultado esperado**: Botón azul "📋 Enviar encuesta"

### Caso 2: Click en Enviar Encuesta
**Acción**: Click en el botón  
**Resultado esperado**:
1. Se abre WhatsApp
2. Después de recarga automática: Badge amarillo "✅ Encuesta enviada"

### Caso 3: Cliente Responde Encuesta
**Acción**: Cliente completa encuesta desde su celular  
**Resultado esperado**: Badge verde "✅ Encuesta respondida"

### Caso 4: Recarga de Página
**Acción**: Refrescar la página  
**Resultado esperado**: Estados se mantienen correctos

---

## 🚀 Implementación

### Opción A: Manual en VS Code
1. Abrir `app/page.tsx`
2. Hacer los 3 cambios descritos arriba
3. Guardar y probar

### Opción B: Con Code Mode
1. Cambiar a Code Mode
2. Pedir: "Implementar fix del botón de encuesta enviada según plan FIX_BOTON_ENCUESTA_ENVIADA.md"
3. Code Mode hace los cambios automáticamente

---

## 📝 Notas Adicionales

### ¿Por qué no se refresca automáticamente?

La función `enviarEncuesta` en línea 213 ya llama a `cargarEncuesta(visitId)` después de marcar como enviada. Esto debería funcionar, pero podría haber un delay.

**Solución alternativa** (si no se ve inmediato):
```typescript
const enviarEncuesta = async (visitId: number) => {
    const survey = surveys[visitId];
    if (!survey) return;

    try {
        window.open(survey.whatsappUrl, '_blank');

        await fetch('/api/surveys/mark-sent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
            },
            body: JSON.stringify({ visitId })
        });

        // Esperar un poco antes de recargar (dar tiempo al backend)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Recargar encuesta
        await cargarEncuesta(visitId);
    } catch (error) {
        console.error('Error al enviar encuesta:', error);
    }
};
```

---

## ✅ Checklist de Implementación

- [ ] Actualizar interfaz `Survey` con campo `sentAt`
- [ ] Agregar `sentAt` en `setSurveys` dentro de `cargarEncuesta`
- [ ] Reemplazar lógica del botón con 3 estados
- [ ] Probar: Ver botón "Enviar encuesta" (azul)
- [ ] Probar: Click → Cambio a "Encuesta enviada" (amarillo)
- [ ] Probar: Responder encuesta → "Encuesta respondida" (verde)
- [ ] Verificar en DeltaWash Legacy
- [ ] Verificar en LAVAPP (SaaS)

---

**Conclusión**: Fix simple de frontend que mejora mucho la UX del operador. No requiere cambios de backend.
