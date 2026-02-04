# 🎨 Mockups UI - Tipos de Vehículos y Lavados Editables

**Fecha:** 2026-02-04  
**Contexto:** 3 opciones de UI para implementar tipos editables

---

## 📊 Comparativa Rápida

| Aspecto | Opción A: Página Config | Opción B: Modal Simple | Opción C: Híbrida |
|---------|------------------------|------------------------|-------------------|
| **Complejidad** | Media-Alta | Baja | Alta |
| **Esfuerzo** | ~14 horas | ~8 horas | ~16 horas |
| **Profesionalidad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Flexibilidad** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **UX Crear precio** | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **UX Gestionar tipos** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 🅰️ Opción A: Página Dedicada de Configuración

### Navegación
```
Sidebar:
├── 🏠 Inicio
├── 📋 Registros
├── 💰 Listas de Precios
└── ⚙️ Configuración         ← NUEVA
    ├── General
    ├── Servicios            ← NUEVA (tipos vehículos/lavados)
    ├── Encuestas
    └── Usuarios
```

### Mockup: `/configuracion/servicios`

```
╔════════════════════════════════════════════════════════════════════════╗
║                   ⚙️  Configuración de Servicios                       ║
╚════════════════════════════════════════════════════════════════════════╝

┌──────────────────────────────────────────────────────────────────────┐
│ 🚗 TIPOS DE VEHÍCULO                                     [+ Agregar] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ⠿  Auto                                    [✏️ Editar] [❌ Desactivar] │
│  ⠿  Camioneta                               [✏️ Editar] [❌ Desactivar] │
│  ⠿  SUV                                     [✏️ Editar] [❌ Desactivar] │
│  ⠿  Pick-up                                 [✏️ Editar] [❌ Desactivar] │
│                                                                       │
│  💡 Arrastrá para reordenar                                          │
│  ⚠️  Si desactivás un tipo, no podrás crear nuevos precios para él  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ 💧 TIPOS DE LAVADO                                       [+ Agregar] │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ⠿  Lavado Básico                          [✏️ Editar] [❌ Desactivar] │
│     Lavado exterior + secado                                         │
│                                                                       │
│  ⠿  Lavado Completo                        [✏️ Editar] [❌ Desactivar] │
│     Interior + exterior + aspirado + secado                          │
│                                                                       │
│  ⠿  Pulido                                 [✏️ Editar] [❌ Desactivar] │
│     Lavado completo + pulido de pintura                              │
│                                                                       │
│  ⠿  Encerado                               [✏️ Editar] [❌ Desactivar] │
│     Lavado completo + cera protectora                                │
│                                                                       │
│  💡 Arrastrá para reordenar                                          │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

                              [Guardar Cambios]
```

### Modal al hacer click en "Editar"

```
╔═══════════════════════════════════════╗
║   ✏️  Editar Tipo de Vehículo        ║
╚═══════════════════════════════════════╝

  Nombre *
  ┌─────────────────────────────────┐
  │ Auto                            │
  └─────────────────────────────────┘

  ⚠️  Este tipo tiene 12 precios configurados
      Al cambiar el nombre, se actualizarán automáticamente.

           [Cancelar]  [Guardar]
```

### Modal al hacer click en "+ Agregar"

```
╔═══════════════════════════════════════╗
║   ➕ Nuevo Tipo de Vehículo          ║
╚═══════════════════════════════════════╝

  Nombre *
  ┌─────────────────────────────────┐
  │                                 │
  └─────────────────────────────────┘

  Ejemplos: Sedan, 4x4, Moto, Furgón

           [Cancelar]  [Crear]
```

### Ventajas Opción A
- ✅ Interfaz limpia y profesional
- ✅ Todas las opciones visibles (reordenar, editar, desactivar)
- ✅ Descripción de cada tipo de lavado
- ✅ Advertencias claras (impacto de desactivar)
- ✅ Drag-and-drop para reordenar
- ✅ Escalable (fácil agregar más configs)

### Desventajas Opción A
- ❌ Más navegación (ir a Configuración → Servicios)
- ❌ Para crear precio, usuario debe:
  1. Ir a Configuración → Servicios
  2. Crear el tipo nuevo
  3. Volver a Listas de Precios
  4. Crear el precio

---

## 🅱️ Opción B: Modal Simple desde Listas de Precios

### Página: `/listas-precios` (modificada)

```
╔════════════════════════════════════════════════════════════════════════╗
║                   💰 Listas de Precios                                 ║
╚════════════════════════════════════════════════════════════════════════╝

Lista Actual: [Estándar ▼]                              [+ Agregar Precio]

┌──────────────────────────────────────────────────────────────────────┐
│ Tipo Vehículo           │ Tipo Lavado         │ Precio   │ Acciones  │
├──────────────────────────────────────────────────────────────────────┤
│ Auto                    │ Lavado Básico       │ $5,000   │ ✏️ 🗑️      │
│ Auto                    │ Lavado Completo     │ $8,000   │ ✏️ 🗑️      │
│ Camioneta               │ Lavado Básico       │ $6,000   │ ✏️ 🗑️      │
│ ...                     │ ...                 │ ...      │ ...       │
└──────────────────────────────────────────────────────────────────────┘

          [⚙️ Gestionar Tipos de Vehículo]  [⚙️ Gestionar Tipos de Lavado]
```

### Modal al hacer click en "⚙️ Gestionar Tipos de Vehículo"

```
╔═══════════════════════════════════════════════════════════════╗
║        🚗 Gestionar Tipos de Vehículo                        ║
╚═══════════════════════════════════════════════════════════════╝

  Tipos Actuales:
  ┌─────────────────────────────────────────────────────────┐
  │  • Auto                                    [✏️] [🗑️]     │
  │  • Camioneta                               [✏️] [🗑️]     │
  │  • SUV                                     [✏️] [🗑️]     │
  │  • Pick-up                                 [✏️] [🗑️]     │
  └─────────────────────────────────────────────────────────┘

  Agregar Nuevo:
  ┌─────────────────────────────────┐
  │                                 │  [Agregar]
  └─────────────────────────────────┘

                           [Cerrar]
```

### Modal al crear precio (con acceso rápido)

```
╔═══════════════════════════════════════════════════════════════╗
║        💰 Agregar Precio                                      ║
╚═══════════════════════════════════════════════════════════════╝

  Tipo de Vehículo *
  ┌─────────────────────────────────┬──────┐
  │ Auto                          ▼ │ [+]  │ ← Botón nuevo
  └─────────────────────────────────┴──────┘
      ↓ Al hacer click en [+]
      
  Tipo de Lavado *
  ┌─────────────────────────────────┬──────┐
  │ Lavado Básico                 ▼ │ [+]  │ ← Botón nuevo
  └─────────────────────────────────┴──────┘
  
  Precio *
  ┌─────────────────────────────────┐
  │ $                               │
  └─────────────────────────────────┘

           [Cancelar]  [Guardar]
```

### Mini-modal al hacer click en [+] junto al select

```
  ╔════════════════════════════════╗
  ║  ➕ Nuevo Tipo de Vehículo     ║
  ╚════════════════════════════════╝
  
    Nombre:
    ┌──────────────────────────┐
    │                          │
    └──────────────────────────┘
    
        [Cancelar]  [Crear]
```

### Ventajas Opción B
- ✅ Menos navegación (todo desde Listas de Precios)
- ✅ Flujo natural: crear tipo → inmediatamente crear precio
- ✅ Acceso rápido con botón [+] junto al select
- ✅ Más simple de implementar (~8 horas)
- ✅ Menos overwhelm para el usuario

### Desventajas Opción B
- ❌ No permite reordenar tipos
- ❌ No permite desactivar (solo eliminar)
- ❌ No permite ver/editar descripción de tipos de lavado
- ❌ Menos profesional (todo en modales)
- ❌ Difícil gestionar muchos tipos (>10)

---

## 🅲 Opción C: Híbrida (Lo Mejor de Ambos Mundos)

### Implementa AMBAS:

**1. Página dedicada `/configuracion/servicios`** (igual que Opción A)
   - Para gestión completa: reordenar, editar, desactivar, describir
   - Para cuando el usuario quiera organizar todos sus tipos

**2. PLUS: Acceso rápido desde formularios**
   - Botón [+] junto a cada select de tipo
   - Mini-modal para crear rápido
   - Después de crear, se refresca el select y queda seleccionado el nuevo

### Ejemplo de UX:

**Escenario 1: Usuario organizando su lavadero (setup inicial)**
```
Usuario va a: Configuración → Servicios
Crea todos sus tipos de vehículos y lavados
Reordena para que aparezcan en el orden que prefiere
Agrega descripciones a cada tipo de lavado
```

**Escenario 2: Usuario creando precio y falta un tipo**
```
Usuario está en: Listas de Precios → Agregar Precio
Selecciona tipo de vehículo → No encuentra "Moto"
Hace click en [+] junto al select
Mini-modal se abre → Escribe "Moto" → Click en Crear
Select se refresca automáticamente con "Moto" seleccionado
Continúa creando el precio sin salir del formulario
```

### Ventajas Opción C
- ✅ Combina todas las ventajas de A y B
- ✅ Máxima flexibilidad
- ✅ UX óptima para ambos casos de uso
- ✅ Profesional y práctica

### Desventajas Opción C
- ❌ Más compleja de implementar (~16 horas)
- ❌ Más código a mantener
- ❌ Dos interfaces para la misma funcionalidad (puede confundir)

---

## 🎯 Recomendación según Caso de Uso

### Si priorizás TIME-TO-MARKET:
**→ Opción B** (8 horas)
- Funcional y suficiente para MVP
- Menos profesional pero cumple el objetivo
- Puedes mejorar después

### Si priorizás PROFESIONALIDAD:
**→ Opción A** (14 horas)
- Interfaz más pulida
- Escalable a más configuraciones
- Mejor para mostrar a inversores/clientes

### Si priorizás UX PERFECTA:
**→ Opción C** (16 horas)
- La mejor experiencia posible
- Más tiempo pero vale la pena
- Diferenciador competitivo

---

## 📊 Mi Recomendación Personal

**Empezar con Opción A**, luego agregar acceso rápido si lo necesitás.

**Razones:**
1. Solo 6 horas más que Opción B, pero mucho más profesional
2. Opción C es solo 2 horas más, pero agrega complejidad de mantenimiento
3. En práctica, usuarios configuran tipos UNA VEZ al inicio, luego solo crean precios
4. Drag-and-drop para reordenar es muy útil (orden importa en selects)
5. Descripción de tipos de lavado ayuda a clientes a entender diferencias

**Plan evolutivo:**
1. **Sprint 1:** Implementar Opción A (14 horas)
2. **Observar uso:** Ver si usuarios piden acceso rápido
3. **Si es necesario:** Agregar botón [+] en selects (2 horas adicionales)

---

## 🎨 Elementos de UI Comunes a Todas

### Colores
- Botón crear/agregar: `bg-blue-600 hover:bg-blue-700`
- Botón editar: `bg-gray-600 hover:bg-gray-700`
- Botón desactivar: `bg-yellow-600 hover:bg-yellow-700`
- Botón eliminar: `bg-red-600 hover:bg-red-700`
- Warning: `bg-yellow-50 border-yellow-200 text-yellow-800`

### Iconos (Lucide React)
- Vehículos: `<Car />`, `<Truck />`, `<Bus />`
- Lavado: `<Droplets />`, `<Sparkles />`
- Editar: `<Pencil />`
- Eliminar: `<Trash2 />`
- Agregar: `<Plus />`
- Reordenar: `<GripVertical />`
- Config: `<Settings />`

### Validaciones
- Nombre no vacío
- Nombre único dentro de la empresa
- No eliminar si tiene precios asociados (solo desactivar)
- Confirmación antes de eliminar/desactivar

---

## 💭 Preguntas para Ayudarte a Decidir

1. **¿Cuántos tipos de vehículo/lavado esperás que tenga un lavadero promedio?**
   - Si <5: Opción B suficiente
   - Si 5-10: Opción A recomendada
   - Si >10: Opción C necesaria

2. **¿Qué tan seguido cambiarán los tipos después del setup inicial?**
   - Rara vez: Opción A suficiente
   - Frecuentemente: Opción C mejor

3. **¿Cuánto tiempo tenés para este sprint?**
   - 1 semana: Opción B
   - 2 semanas: Opción A (recomendada)
   - 3+ semanas: Opción C

4. **¿Qué tan importante es impresionar a potenciales clientes en demos?**
   - Muy importante: Opción A o C
   - No crítico: Opción B

---

**¿Cuál te convence más? ¿O necesitás más detalles de alguna?**
