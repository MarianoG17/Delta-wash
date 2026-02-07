# Tareas de Mejoras para lavapp.ar

## 🎯 Lista de Tareas Identificadas

### 1. ✉️ Email de Bienvenida al Registrarse

**Descripción:** Enviar email automático cuando un nuevo cliente se registra en el SaaS.

**Contenido sugerido del email:**

```
Asunto: ¡Bienvenido a LAVAPP! Tu cuenta está lista

Hola [Nombre de la Empresa],

¡Bienvenido a LAVAPP! 🎉

Tu cuenta ha sido creada exitosamente. Ahora podés empezar a gestionar tu lavadero de forma profesional.

🚀 Próximos pasos:

1. **Configurá tu perfil:** Agregá logo, colores y datos de tu empresa
2. **Cargá tus precios:** Define los servicios y tarifas que ofrecés  
3. **Registrá tu primer auto:** Empezá a usar el sistema hoy mismo
4. **Explorá las funciones:**
   - Historial de autos
   - Cuenta corriente con clientes
   - Reportes y estadísticas
   - Encuestas de satisfacción

📊 Tu panel de control: https://lavapp.ar/home

💡 ¿Necesitás ayuda?
Respondé este email y te asistimos con gusto.

¡Éxitos con tu lavadero!

Equipo LAVAPP
https://lavapp.ar
```

**Archivos a modificar:**
- `app/api/registro/route.ts` - Agregar envío de email después de crear la empresa

**Estimación:** 30 minutos

---

### 2. 🔍 Buscar y Reemplazar "chasis" en la Web

**Descripción:** Encontrar todas las referencias a "chasis" en el código frontend y reemplazar por "lavapp" o la marca correcta.

**Acción:** 
1. Buscar en todo el código: "chasis", "Chasis", "CHASIS"
2. Identificar dónde aparece (landing, home, etc.)
3. Reemplazar con texto apropiado

**Archivos probables:**
- Landing page
- Home
- Textos de ayuda
- Links
- Meta tags

**Estimación:** 20 minutos

---

### 3. 💰 Mejorar Descripción de Cuenta Corriente

**Descripción actual (probablemente):**
> Control de cuentas corrientes con clientes

**Descripción mejorada:**
> Control de cuentas corrientes, seguimiento de saldos, y generación de anticipos de pago para empresas

**Archivos a modificar:**
- Landing page / Home (donde se describe la feature)

**Estimación:** 5 minutos

---

### 4. 📊 Ajustar Descripción de Reportes/Estadísticas

**Descripción actual (probablemente):**
> Análisis de horarios pico

**Descripción mejorada:**
> Visualización de cantidad de autos por día y por franja horaria, estadísticas de ingresos y servicios más demandados

**Archivos a modificar:**
- Landing page / Home

**Estimación:** 5 minutos

---

### 5. 📋 Agregar Sección de Encuestas en Landing/Home

**Descripción:** La funcionalidad de encuestas existe pero no está mencionada en la landing.

**Texto sugerido:**
```
📋 Encuestas de Satisfacción
Recibí feedback automático de tus clientes después de cada servicio. 
Mejorá la calidad y fidelizá clientes con encuestas por email.
```

**Archivos a modificar:**
- Landing page / Home (agregar feature card)

**Estimación:** 15 minutos

---

### 6. ❌ Eliminar/Ajustar "Control de Permisos" en Usuarios

**Descripción:** La landing menciona "permisos personalizados" pero el sistema no lo tiene implementado.

**Opciones:**

**A) Eliminarlo:**
- Quitar la referencia a permisos personalizados
- Mencionar solo: "Gestión de usuarios y roles básicos"

**B) Dejarlo como roadmap:**
- Agregar badge "Próximamente"
- Mantener en la lista pero indicar que está en desarrollo

**Recomendación:** Opción A (ser honesto con lo que está disponible)

**Archivos a modificar:**
- Landing page / Home

**Estimación:** 5 minutos

---

### 7. 💵 Implementar Módulo de Control de Caja

**Descripción:** Actualmente hay reportes de caja en historial, pero no una vista dedicada de "Caja" para:
- Ver saldo actual
- Apertura/Cierre de caja
- Movimientos del día
- Arqueo de caja

**Funcionalidades a implementar:**

1. **Vista de Caja Actual**
   - Saldo inicial del día
   - Total de ingresos (efectivo, tarjeta, transferencia)
   - Total de egresos
   - Saldo actual
   - Botón "Cerrar Caja"

2. **Apertura de Caja**
   - Modal para ingresar saldo inicial
   - Fecha y hora de apertura
   - Usuario que abre

3. **Cierre de Caja**
   - Resumen del día
   - Comparación: esperado vs real
   - Diferencia (faltante/sobrante)
   - Notas del cierre

4. **Historial de Cierres**
   - Lista de cierres anteriores
   - Filtros por fecha
   - Exportar a PDF/Excel

**Base de datos:**
- Tabla `caja_movimientos` (probablemente ya existe parcialmente)
- Tabla `caja_aperturas_cierres` (nueva)

**Archivos a crear/modificar:**
- `app/caja/page.tsx` - Vista principal
- `app/api/caja/route.ts` - API endpoints
- Componentes de caja

**Estimación:** 3-4 horas

**Beneficios:**
- ✅ Ya tenés la base de datos de pagos y movimientos
- ✅ La lógica de reportes ya está implementada
- ✅ Solo falta la UI y flujo de apertura/cierre

---

## 📊 Priorización Sugerida

### Rápido (1 hora total) - Hacer Ahora
1. ✅ Buscar y reemplazar "chasis" (20 min)
2. ✅ Mejorar descripción Cuenta Corriente (5 min)
3. ✅ Ajustar descripción Reportes (5 min)
4. ✅ Agregar sección Encuestas (15 min)
5. ✅ Eliminar/ajustar Permisos (5 min)

### Medio (30 min) - Hacer Hoy
6. ✅ Email de bienvenida al registrarse (30 min)

### Largo (3-4 horas) - Hacer Esta Semana
7. ✅ Módulo de Control de Caja (3-4 hrs)

---

## 🎯 Plan de Acción Inmediato

### Paso 1: Correcciones Rápidas (1 hora)
Hacer todas las correcciones de texto y eliminar features no implementadas.

### Paso 2: Email de Bienvenida (30 min)
Implementar el email automático al registrarse.

### Paso 3: Control de Caja (3-4 horas)
Crear el módulo completo de caja con apertura/cierre.

---

## 📝 Siguiente Acción

¿Querés que empiece con:

**A) Las correcciones rápidas de la landing** (buscar "chasis", actualizar descripciones, etc.) - 1 hora

**B) El email de bienvenida** al registrarse - 30 min

**C) Directamente el módulo de Control de Caja** - 3-4 hrs

**D) Todas en orden** (primero las rápidas, luego email, luego caja) - todo el día

---

## 💡 Notas Adicionales

### Sobre el Control de Caja

Tenés razón: con la base de datos de pagos que ya tenés, implementar el control de caja debería ser relativamente rápido. La estructura ya está, solo falta:

1. ✅ **Interfaz** para ver el estado actual
2. ✅ **Flujo** de apertura con saldo inicial
3. ✅ **Flujo** de cierre con arqueo
4. ✅ **Validaciones** (no permitir registrar si no hay caja abierta, etc.)
5. ✅ **Historial** de cierres anteriores

Lo más complejo es diseñar bien el flujo UX para que sea intuitivo para el usuario del lavadero.

### Sobre el Email de Bienvenida

Es una excelente idea porque:
- ✅ Mejora la experiencia de onboarding
- ✅ Da confianza al usuario de que su registro fue exitoso
- ✅ Guía los primeros pasos
- ✅ Profesionaliza el servicio

El email que sugerí incluye:
- Bienvenida personalizada
- Próximos pasos claros
- Link directo al panel
- Contacto para soporte

---

## 🚀 ¿Empezamos?

Decime por dónde querés que empiece y me pongo a trabajar.
