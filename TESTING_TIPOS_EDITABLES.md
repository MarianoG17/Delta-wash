# 🧪 Testing y Diagnóstico - Tipos Editables

**Fecha**: 2026-02-09  
**Problema**: Tipos de servicios se agregan pero NO se visualizan en formulario

---

## 📋 Estado Actual

### ✅ Lo que FUNCIONA
1. **Modal de gestión**: Existe y funciona ([`app/components/ModalTiposLimpieza.tsx`](app/components/ModalTiposLimpieza.tsx:1))
2. **API endpoints**: Existen y funcionan
   - GET [`/api/tipos-limpieza`](app/api/tipos-limpieza/route.ts:1)
   - POST [`/api/tipos-limpieza`](app/api/tipos-limpieza/route.ts:1)
   - PUT [`/api/tipos-limpieza/[id]`](app/api/tipos-limpieza/[id]/route.ts:1)
   - DELETE [`/api/tipos-limpieza/[id]`](app/api/tipos-limpieza/[id]/route.ts:1)
3. **Código de carga**: Implementado en [`app/page.tsx`](app/page.tsx:186)
4. **Renderizado**: Preparado en [`app/page.tsx`](app/page.tsx:1110)
5. **Tipos de vehículos**: ✅ Funcionan correctamente (confirmado)

### ❌ Lo que NO FUNCIONA
- **Tipos de servicios nuevos NO aparecen** en formulario de registro después de agregarlos

---

## 🔍 Plan de Testing (Paso a Paso)

### Paso 1: Verificar que el tipo se creó en BD
```sql
-- Ejecutar en Neon SQL Editor (branch correcto)
SELECT * FROM tipos_limpieza 
ORDER BY id DESC 
LIMIT 5;
```

**Resultado esperado**:
- Deberías ver el tipo que acabas de crear
- `activo` debe ser `true`
- `orden` debe tener un valor numérico

**¿Qué hacer si falla?**:
- Si NO aparece: El POST no funcionó → Verificar logs del API
- Si `activo = false`: Cambiar a `true` manualmente
- Si `orden` es NULL: Asignar un orden manualmente

---

### Paso 2: Verificar que el API devuelve el tipo
```javascript
// Abrir consola del navegador (F12) y ejecutar:
const token = localStorage.getItem('authToken') || localStorage.getItem('lavadero_token');
fetch('/api/tipos-limpieza', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(r => r.json())
  .then(d => console.log('Tipos retornados:', d));
```

**Resultado esperado**:
```json
{
  "success": true,
  "tipos": [
    { "id": 1, "nombre": "simple", "orden": 1, "activo": true },
    { "id": 7, "nombre": "mi_servicio_nuevo", "orden": 7, "activo": true }
  ]
}
```

**¿Qué hacer si falla?**:
- Si `success: false`: Ver el error en la respuesta
- Si el tipo NO está en el array: Verificar el filtro `WHERE activo = true` en el API
- Si el API da error 401: Problema de autenticación

---

### Paso 3: Verificar que se ejecuta `cargarTiposLimpieza()`

**Agregar logs temporales**:

En [`app/page.tsx`](app/page.tsx:186), línea 186, modificar:

```typescript
const cargarTiposLimpieza = async () => {
    console.log('🔄 [DEBUG] Cargando tipos de limpieza...');
    try {
        const user = getAuthUser();
        const authToken = user?.isSaas
            ? localStorage.getItem('authToken')
            : localStorage.getItem('lavadero_token');

        console.log('📍 [DEBUG] Token:', authToken ? 'Presente' : 'Ausente');

        const res = await fetch('/api/tipos-limpieza', {
            headers: authToken ? {
                'Authorization': `Bearer ${authToken}`
            } : {}
        });
        
        console.log('📍 [DEBUG] Response status:', res.status);
        
        const data = await res.json();
        console.log('📍 [DEBUG] Data recibida:', data);
        
        if (res.ok && data.success && Array.isArray(data.tipos)) {
            const tiposActivos = data.tipos
                .filter((t: any) => t.activo)
                .sort((a: any, b: any) => a.orden - b.orden);
            
            console.log('✅ [DEBUG] Tipos activos a setear:', tiposActivos);
            setTiposLimpiezaDinamicos(tiposActivos);
        } else {
            console.warn('⚠️ [DEBUG] No se cumplió la condición:', { ok: res.ok, success: data.success, isArray: Array.isArray(data.tipos) });
        }
    } catch (error) {
        console.error('❌ [DEBUG] Error cargando tipos de limpieza:', error);
    }
};
```

**Qué observar en la consola**:
1. ¿Se ejecuta `cargarTiposLimpieza()`?
2. ¿El token está presente?
3. ¿La respuesta es 200 OK?
4. ¿Los tipos llegan correctamente?
5. ¿Se ejecuta `setTiposLimpiezaDinamicos()`?

---

### Paso 4: Verificar que el estado se actualiza

**Agregar log en el renderizado**:

En [`app/page.tsx`](app/page.tsx:1110), antes del map:

```typescript
{(() => {
    const tipos = tiposLimpiezaDinamicos.length > 0 ? tiposLimpiezaDinamicos : [/* hardcoded */];
    console.log('🎨 [DEBUG] Renderizando tipos:', tipos);
    return tipos.map((tipo) => {
        // ... resto del código
    });
})()}
```

**Qué observar**:
- ¿Usa tipos dinámicos o hardcodeados?
- ¿El array tiene los tipos nuevos?

---

### Paso 5: Verificar el callback `onUpdate` del modal

En [`app/page.tsx`](app/page.tsx:1), buscar dónde se usa el `ModalTiposLimpieza` y verificar que tenga:

```typescript
<ModalTiposLimpieza
    isOpen={modalLimpiezaAbierto}
    onClose={() => setModalLimpiezaAbierto(false)}
    onUpdate={() => {
        cargarTiposLimpieza(); // ⚠️ CRÍTICO: Debe estar aquí
    }}
/>
```

**Si NO está `cargarTiposLimpieza()` en `onUpdate`**: ESE ES EL PROBLEMA ✅

---

## 🐛 Posibles Causas y Soluciones

### Causa 1: `onUpdate` no recarga los tipos ⭐ (MÁS PROBABLE)

**Síntoma**: El modal guarda correctamente pero el formulario no se actualiza

**Solución**: Verificar que el callback `onUpdate` llame a `cargarTiposLimpieza()`:

```typescript
<ModalTiposLimpieza
    isOpen={modalLimpiezaAbierto}
    onClose={() => setModalLimpiezaAbierto(false)}
    onUpdate={() => {
        cargarTiposLimpieza(); // Debe recargar
    }}
/>
```

---

### Causa 2: El tipo se crea como `activo = false`

**Síntoma**: El tipo se guarda pero no aparece en el API GET

**Solución**: Verificar en [`app/api/tipos-limpieza/route.ts`](app/api/tipos-limpieza/route.ts:67) que cree con `activo = true`:

```typescript
const resultado = await sql`
    INSERT INTO tipos_limpieza (nombre, orden, activo)
    VALUES (${nombre.trim()}, ${nuevoOrden}, true)
    RETURNING *
`;
```

Si falta `, activo`, PostgreSQL usa el default (que debería ser `true`).

---

### Causa 3: `cargarTiposLimpieza()` no se ejecuta al iniciar

**Síntoma**: Al recargar la página tampoco aparecen

**Solución**: Verificar en [`app/page.tsx`](app/page.tsx:131) que se llame en el `useEffect`:

```typescript
useEffect(() => {
    // ... otras cargas
    cargarTiposVehiculo();
    cargarTiposLimpieza(); // ⚠️ Debe estar aquí
    cargarRegistrosEnProceso();
}, [mounted]);
```

---

### Causa 4: Problema de autenticación

**Síntoma**: El API retorna 401

**Solución**: Verificar que el token se envía correctamente:
- Legacy: `localStorage.getItem('lavadero_token')`
- SaaS: `localStorage.getItem('authToken')`

---

### Causa 5: El renderizado usa mal el estado

**Síntoma**: El estado tiene los tipos pero no se renderizan

**Solución**: Verificar la condición en [`app/page.tsx`](app/page.tsx:1110):

```typescript
{(tiposLimpiezaDinamicos.length > 0 ? tiposLimpiezaDinamicos : [
    /* hardcoded fallback */
]).map((tipo) => {
    // ...
})}
```

Si `tiposLimpiezaDinamicos` es `undefined` o no es array, usará hardcoded.

---

## 🎯 Testing Rápido (5 minutos)

1. **Abrir consola** (F12)
2. **Ir a** Listas de Precios
3. **Agregar tipo nuevo** (ej: "Lavado Especial")
4. **Observar consola** durante todo el proceso
5. **Volver a página principal**
6. **Ver si aparece** en el formulario

**Logs esperados**:
```
🔄 [DEBUG] Cargando tipos de limpieza...
📍 [DEBUG] Token: Presente
📍 [DEBUG] Response status: 200
📍 [DEBUG] Data recibida: { success: true, tipos: [...] }
✅ [DEBUG] Tipos activos a setear: [...]
🎨 [DEBUG] Renderizando tipos: [...]
```

---

## 🔧 Fix Probable (Sin logs)

**Si no querés agregar logs**, el fix más probable es asegurar que el modal llame a recargar:

**En el archivo que renderiza el modal** (buscar `<ModalTiposLimpieza`):

```typescript
<ModalTiposLimpieza
    isOpen={modalLimpiezaAbierto}
    onClose={() => setModalLimpiezaAbierto(false)}
    onUpdate={() => {
        cargarTiposLimpieza(); // ⚠️ AGREGAR ESTA LÍNEA
    }}
/>
```

**Y asegurar que `cargarTiposLimpieza()` se ejecute al inicio**:

```typescript
useEffect(() => {
    if (mounted && user) {
        cargarTiposVehiculo();
        cargarTiposLimpieza(); // ⚠️ ASEGURAR QUE ESTÉ
        // ... otros
    }
}, [mounted]);
```

---

## ✅ Checklist de Verificación

Antes de considerar el problema resuelto, verificar:

- [ ] El tipo se crea en BD con `activo = true`
- [ ] El API GET `/api/tipos-limpieza` lo devuelve
- [ ] `cargarTiposLimpieza()` se ejecuta al iniciar la página
- [ ] `cargarTiposLimpieza()` se ejecuta después de agregar (en `onUpdate`)
- [ ] El estado `tiposLimpiezaDinamicos` se actualiza
- [ ] El componente se re-renderiza con los nuevos tipos
- [ ] Los tipos aparecen en el formulario

---

## 🚀 Próximo Paso

**¿Qué quieres hacer?**

1. **Opción A**: Agregar los logs de debug y hacer el testing paso a paso
2. **Opción B**: Verificar directamente el archivo que renderiza el modal
3. **Opción C**: Aplicar el fix probable sin testing previo

Decime cuál preferís y te guío específicamente en esa opción.
