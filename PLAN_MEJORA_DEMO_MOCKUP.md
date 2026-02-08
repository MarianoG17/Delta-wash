# Plan: Mejora del Demo Animado del Mockup

## Objetivo
Reemplazar el demo actual con uno más realista que muestre el formulario completo de la app autocompletándose y el flujo de estados.

## Timing Total: 7 segundos
- **Step 1:** 3.5 segundos - Formulario completo autocompletándose
- **Step 2:** 2 segundos - Auto en "En Proceso"
- **Step 3:** 1.5 segundos - Auto en "Listo" + botón WhatsApp

## Diseño del Nuevo Mockup

### Step 1: Formulario Completo (0s - 3.5s)

Mostrar el formulario real como aparece en la app:

```
┌─────────────────────────────┐
│  📝 Nuevo Auto              │
├─────────────────────────────┤
│                             │
│  Patente                    │
│  [ABC123]                   │ ← Aparece typed (0.3s)
│  ✓ Cliente encontrado       │ ← (0.5s)
│                             │
│  Marca        Modelo        │
│  [Toyota]     [Corolla]     │ ← Auto-fill (1s)
│                             │
│  Tipo de Vehículo           │
│  [Auto ▼]                   │ ← (1.3s)
│                             │
│  Tipos de Limpieza          │
│  ☑ Simple Exterior          │ ← Check (1.6s)
│  ☑ Simple                   │ ← Check (1.9s)
│  ☐ Con Cera                 │
│  ☐ Pulido                   │
│                             │
│  Nombre del Cliente         │
│  [Juan Pérez]               │ ← (2.2s)
│                             │
│  Número de Celular          │
│  [11-1234567]               │ ← (2.5s)
│                             │
│  Extras (Opcional)          │
│  [Lavado de tapiz] [$0]    │ ← (2.8s)
│                             │
│  [💰 Registrar Auto]        │ ← Button click (3.3s)
└─────────────────────────────┘
```

**Animaciones:**
- Typing effect en la patente (letra por letra)
- Mensaje de "Cliente encontrado" con fade-in
- Campos autocompletándose uno por uno
- Checkboxes marcándose con efecto
- Botón destacándose y "clickeándose"

### Step 2: Auto en Proceso (3.5s - 5.5s)

Transición suave (scroll hacia abajo) mostrando el panel principal:

```
┌─────────────────────────────┐
│  🚗 Panel Principal         │
├─────────────────────────────┤
│                             │
│  🔄 En Proceso          [1] │
│  ┌─────────────────────┐   │
│  │ ABC123              │   │
│  │ Juan Pérez          │   │
│  │ Lavado Completo     │   │
│  │ $35.000             │   │
│  │                     │   │
│  │ [✓ Marcar Listo]    │ ← Highlighted (4.5s)
│  └─────────────────────┘   │
│                             │
│  ✅ Listo               [0] │
│  (vacío)                    │
│                             │
└─────────────────────────────┘
```

**Animaciones:**
- Smooth scroll desde formulario
- Card aparece con slide-in from bottom
- Botón "Marcar Listo" con pulse effect

### Step 3: Auto Listo (5.5s - 7s)

El auto se mueve a "Listo" con animación:

```
┌─────────────────────────────┐
│  🚗 Panel Principal         │
├─────────────────────────────┤
│                             │
│  🔄 En Proceso          [0] │
│  (vacío)                    │
│                             │
│  ✅ Listo               [1] │
│  ┌─────────────────────┐   │
│  │ ABC123              │   │
│  │ Juan Pérez          │   │
│  │ Lavado Completo     │   │
│  │ $35.000             │   │
│  │                     │   │
│  │ [💬 Enviar WhatsApp]│ ← Highlighted (6.5s)
│  └─────────────────────┘   │
│                             │
└─────────────────────────────┘
```

**Animaciones:**
- Card se mueve de "En Proceso" a "Listo" con smooth transition
- Botón WhatsApp aparece con scale effect
- Confetti o sparkles celebrando el completado

## CSS/Tailwind Classes Necesarias

```css
/* Nuevas animaciones en globals.css */
@keyframes typing {
  from { width: 0; }
  to { width: 100%; }
}

@keyframes slideInBottom {
  from { 
    transform: translateY(100%);
    opacity: 0;
  }
  to { 
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes moveCard {
  from { 
    transform: translateY(0);
  }
  to { 
    transform: translateY(150px);
  }
}

@keyframes scaleIn {
  from { 
    transform: scale(0.8);
    opacity: 0;
  }
  to { 
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes checkmark {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}
```

## Ventajas del Nuevo Diseño

1. **Más Realista:** Muestra exactamente cómo se ve la app real
2. **Educativo:** El usuario ve todos los campos y cómo funciona el autocompletado
3. **Flujo Completo:** Se entiende el proceso completo: registro → proceso → listo
4. **Visual:** Animaciones suaves y profesionales
5. **Timing Perfecto:** 7 segundos exactos, no se hace eterno

## Cambios en el Código

### Archivos a Modificar:
1. `app/home/page.tsx` - Reemplazar sección del mockup (líneas 64-218)
2. `app/globals.css` - Agregar nuevas animaciones

### Estructura del Nuevo JSX:
- 3 steps con clases `demo-step-1`, `demo-step-2`, `demo-step-3`
- Animaciones CSS con delays precisos
- Scroll interno del mockup (overflow-y con animación)

## Testing

Después de implementar:
1. Verificar que el loop funcione correctamente (vuelve a step 1)
2. Verificar tiempos (deben sumar 7s exactos)
3. Verificar que se vea bien en mobile
4. Verificar que no haya jumps bruscos

## ¿Aprobás este diseño?

Si está bien, procedo con la implementación completa.
