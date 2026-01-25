# Sistema de Upselling Configurable

## 📋 Resumen

Se ha implementado un sistema completamente configurable para el upselling que permite a cada empresa personalizar:

- **Percentil de clientes objetivo** (Top 10%, 20%, 30%, etc.)
- **Período de espera tras rechazo** (días antes de volver a mostrar la oferta)
- **Servicios premium personalizados** (no limitado a chasis, motor, pulido)
- **Activación/Desactivación** del sistema completo

## 🗄️ Archivos Creados/Modificadosa 

### 1. Migración de Base de Datos
- **`migration-configuracion-upselling.sql`**
  - Crea la tabla `upselling_configuracion`
  - Permite una configuración por empresa
  - Valores por defecto: percentil 80 (top 20%), 30 días de espera, servicios ["chasis", "motor", "pulido"]

### 2. Endpoint API
- **`app/api/upselling/configuracion/route.ts`**
  - **GET**: Obtiene la configuración actual
  - **PUT**: Actualiza la configuración
  - Validaciones incluidas para valores seguros

### 3. Lógica de Detección Actualizada
- **`app/api/upselling/detectar/route.ts`**
  - Ahora lee la configuración dinámica de la base de datos
  - Usa percentil configurable en lugar de hardcoded
  - Verifica servicios premium según configuración
  - Respeta el período de rechazo configurado

### 4. Interfaz de Administración
- **`app/admin/upselling/page.tsx`**
  - Nuevo botón "Configuración" en el header
  - Modal completo para configurar el sistema
  - Gestión de servicios premium personalizados
  - Slider visual para el percentil
  - Toggle para activar/desactivar el sistema

## 🚀 Pasos para Implementar

### 1. Ejecutar la migración en la base de datos

Ejecuta en Neon Console:

```sql
-- Contenido de migration-configuracion-upselling.sql
```

### 2. Verificar que los archivos están en su lugar

✅ `/app/api/upselling/configuracion/route.ts`
✅ `/migration-configuracion-upselling.sql`
✅ Actualizaciones en `/app/api/upselling/detectar/route.ts`
✅ Actualizaciones en `/app/admin/upselling/page.tsx`

### 3. Configurar el sistema

1. Ve a la página de administración de upselling: `/admin/upselling`
2. Haz clic en el botón "Configuración" (morado)
3. Ajusta los parámetros:
   - **Percentil**: Mueve el slider para definir qué tan exclusivo quieres el sistema
   - **Período de rechazo**: Define cuántos días esperar tras un rechazo
   - **Servicios premium**: Agrega los servicios que consideras "premium" para tu negocio
   - **Estado**: Activa o desactiva el sistema completo

## 🎯 Cómo Funciona

### Criterios de Elegibilidad (todos deben cumplirse)

1. ✅ **Cliente frecuente**: Debe estar en el percentil configurado (ej: top 20%)
2. ✅ **No usó premium**: Nunca pidió ninguno de los servicios premium configurados
3. ✅ **Sin rechazo reciente**: No rechazó la oferta en el período configurado
4. ✅ **Promoción activa**: Debe existir al menos una promoción activa
5. ✅ **Sistema activado**: La configuración debe tener `activo = true`

### Ejemplo de Configuración

**Configuración Estándar (Top 20%)**:
- Percentil: 80 (top 20%)
- Período rechazo: 30 días
- Servicios: ["chasis", "motor", "pulido"]
- Activo: Sí

**Configuración Exclusiva (Top 10%)**:
- Percentil: 90 (top 10%)
- Período rechazo: 60 días
- Servicios: ["chasis", "motor", "pulido", "hidrolavado", "descontaminado"]
- Activo: Sí

**Configuración Amplia (Top 30%)**:
- Percentil: 70 (top 30%)
- Período rechazo: 15 días
- Servicios: ["premium", "especial"]
- Activo: Sí

## 💡 Casos de Uso

### 1. Lavadero con servicios especializados
```
Servicios premium: ["detailing", "ceramic", "paint protection"]
Percentil: 85 (top 15%)
Período: 45 días
```

### 2. Lavadero de volumen
```
Servicios premium: ["completo", "premium"]
Percentil: 70 (top 30%)
Período: 20 días
```

### 3. Lavadero boutique
```
Servicios premium: ["vip", "executive", "diamond"]
Percentil: 95 (top 5%)
Período: 90 días
```

## 🔧 Personalización Avanzada

### Agregar nuevos servicios premium

1. Ve a Configuración
2. En "Servicios Premium Personalizados"
3. Escribe el nombre del servicio (en minúsculas)
4. Click en "Agregar" o presiona Enter
5. El servicio aparecerá en la lista
6. Para eliminarlo, click en la "×" al lado del nombre

### Ajustar el percentil

- **Percentil 95** = Solo top 5% (muy exclusivo)
- **Percentil 90** = Solo top 10% (exclusivo)
- **Percentil 80** = Solo top 20% (selectivo) ← **Recomendado**
- **Percentil 70** = Solo top 30% (amplio)
- **Percentil 50** = Solo top 50% (muy amplio)

### Período de rechazo

- **7 días**: Agresivo, para promociones urgentes
- **30 días**: Estándar, equilibrio entre persistencia y respeto
- **60 días**: Conservador, para no molestar a clientes
- **90+ días**: Muy conservador, solo para ofertas muy especiales

## 📊 Monitoreo

En la página de administración verás:

1. **Umbral Mínimo**: Cuántas visitas necesita un cliente para ser elegible
2. **Total Clientes**: Cantidad total de clientes en el sistema
3. **Clientes Elegibles**: Cuántos cumplen todos los criterios
4. **Interacciones**: Estadísticas de aceptación, rechazo e interés futuro

## ⚙️ Características Técnicas

- ✅ Configuración por empresa (multi-tenant)
- ✅ Valores por defecto automáticos si no existe configuración
- ✅ Validaciones en backend
- ✅ Interfaz intuitiva con feedback visual
- ✅ Sin código hardcodeado
- ✅ Totalmente personalizable

## 🎨 Beneficios

1. **Flexibilidad**: Cada empresa define sus propios criterios
2. **Escalabilidad**: Funciona desde pequeños a grandes lavaderos
3. **Adaptabilidad**: Se ajusta a diferentes modelos de negocio
4. **Control**: El admin tiene control total sin tocar código
5. **Mantenibilidad**: Cambios de estrategia sin necesitar desarrollador

## 🔒 Seguridad

- Validaciones en backend para valores seguros
- Solo usuarios admin pueden modificar la configuración
- Autenticación requerida en todos los endpoints
- Multi-tenant seguro (cada empresa solo ve/modifica su configuración)

---

✨ **El sistema está listo para usar. Configura según tu estrategia de negocio!**
