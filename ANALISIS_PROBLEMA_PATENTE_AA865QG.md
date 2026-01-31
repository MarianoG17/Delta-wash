# 🔍 ANÁLISIS DEL PROBLEMA - PATENTE AA865QG (DELTA WASH)

## 📋 Problema Reportado
En la app Delta Wash indican que la patente **AA865QG** fue ingresada con:
- ✅ Lavado (registrado correctamente)
- ❌ Limpieza de motor (NO les apareció este servicio)

---

## 🔎 DIAGNÓSTICO COMPLETO

### 1. Revisión del Sistema

El sistema **SÍ SOPORTA** múltiples servicios por registro:

#### ✅ Código Frontend (app/page.tsx)
- **Línea 42**: `const [tiposLimpieza, setTiposLimpieza] = useState<string[]>([]);`
- **Línea 355**: `tipo_limpieza: tiposLimpieza.join(', ')`
- **Líneas 885-908**: Checkboxes para seleccionar múltiples servicios

```typescript
// El usuario puede seleccionar VARIOS servicios con checkboxes:
- Simple Exterior
- Simple
- Con Cera
- Pulido
- Limpieza de Chasis
- Limpieza de Motor  ← Este está disponible
```

#### ✅ Base de Datos (schema.sql)
- **Línea 16**: `tipo_limpieza VARCHAR(200)` 
- Soporta hasta 200 caracteres para múltiples servicios

#### ✅ Formato de Almacenamiento
Los servicios se guardan así:
```
"simple, limpieza_motor"
"simple, con_cera, limpieza_chasis"
```

---

## 🎯 POSIBLES CAUSAS DEL PROBLEMA

### Causa #1: El servicio NO está en la lista de precios de Delta Wash ⚠️
**Probabilidad: ALTA 🔴**

El sistema tiene precios fallback hardcodeados (app/page.tsx líneas 258-265):
```typescript
'limpieza_motor': { 
    'auto': 15000, 
    'mono': 20000, 
    'camioneta': 25000, 
    'camioneta_xl': 30000, 
    'moto': 10000 
}
```

**PERO** si Delta Wash NO tiene este servicio en su base de datos de precios:
- El checkbox aparece en el formulario ✅
- Se puede seleccionar ✅
- Pero el precio puede ser $0 o no calcular bien ⚠️
- El servicio NO aparece en reportes/estadísticas ❌

#### 🔍 VERIFICAR ESTO:
```sql
-- Ejecutar en la base de datos de Delta Wash (empresa_id = 37)
SELECT DISTINCT p.tipo_servicio, p.tipo_vehiculo, p.precio
FROM precios p
JOIN listas_precios lp ON p.lista_id = lp.id
WHERE lp.empresa_id = 37
    AND LOWER(p.tipo_servicio) LIKE '%motor%';
```

Si esta consulta NO devuelve resultados, entonces **NO tienen el servicio configurado**.

---

### Causa #2: Error al seleccionar el servicio durante la carga
**Probabilidad: MEDIA 🟡**

Es posible que:
1. Seleccionaron los checkboxes correctamente
2. Pero al momento de enviar el formulario, JavaScript no capturó bien la selección
3. O hubo un error de validación que no se mostró

---

### Causa #3: El servicio SÍ está guardado pero no se visualiza
**Probabilidad: BAJA 🟢**

El servicio podría estar en la base de datos pero:
- No se muestra en las tarjetas de visualización
- Hay un problema en el frontend al renderizar

---

## 🛠️ SOLUCIÓN PASO A PASO

### PASO 1️⃣: Verificar si el registro existe
Ejecutar en la consola SQL de Neon (base de datos de Delta Wash):

```sql
-- Buscar el registro de la patente AA865QG
SELECT 
    id,
    patente,
    tipo_vehiculo,
    tipo_limpieza,  ← REVISAR ESTE CAMPO
    precio,
    fecha_ingreso,
    estado,
    nombre_cliente
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha_ingreso DESC
LIMIT 5;
```

**Analizar el resultado:**
- Si `tipo_limpieza` = `"simple"` → El servicio NO se guardó ❌
- Si `tipo_limpieza` = `"simple, limpieza_motor"` → El servicio SÍ se guardó ✅

---

### PASO 2️⃣: Verificar si tienen el servicio en su lista de precios

```sql
-- Ver todos los servicios de Delta Wash
SELECT DISTINCT p.tipo_servicio
FROM precios p
JOIN listas_precios lp ON p.lista_id = lp.id
WHERE lp.empresa_id = 37
ORDER BY p.tipo_servicio;
```

**Si NO aparece "limpieza_motor" en la lista:**

```sql
-- AGREGAR el servicio a la lista de precios de Delta Wash
-- Primero obtener el ID de su lista de precios
SELECT id, nombre FROM listas_precios WHERE empresa_id = 37;

-- Luego insertar los precios para cada tipo de vehículo
-- Supongamos que su lista_id es 5 (ajustar según el resultado anterior)

INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio) VALUES
(5, 'auto', 'limpieza_motor', 15000),
(5, 'mono', 'limpieza_motor', 20000),
(5, 'camioneta', 'limpieza_motor', 25000),
(5, 'camioneta_xl', 'limpieza_motor', 30000),
(5, 'moto', 'limpieza_motor', 10000);
```

---

### PASO 3️⃣: Si el registro se guardó incorrectamente, corregirlo

```sql
-- Si el registro existe pero solo tiene "simple" cuando debería tener "simple, limpieza_motor"
UPDATE registros_lavado
SET 
    tipo_limpieza = 'simple, limpieza_motor',
    precio = precio + 15000  -- Ajustar según el tipo de vehículo
WHERE id = [ID_DEL_REGISTRO]  -- Usar el ID del PASO 1
    AND UPPER(patente) = 'AA865QG';
```

---

## 📊 VERIFICACIÓN FINAL

Después de aplicar la solución, ejecutar:

```sql
-- 1. Verificar que el servicio existe en precios
SELECT tipo_vehiculo, tipo_servicio, precio
FROM precios p
JOIN listas_precios lp ON p.lista_id = lp.id
WHERE lp.empresa_id = 37 
    AND tipo_servicio = 'limpieza_motor';

-- 2. Verificar el registro corregido
SELECT id, patente, tipo_limpieza, precio, estado
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha_ingreso DESC
LIMIT 1;
```

---

## ⚡ ACCIÓN INMEDIATA RECOMENDADA

**Para el equipo de Delta Wash:**

1. **Acceder a la sección "Precios"** en la app
2. **Verificar si existe el servicio "Limpieza de Motor"**
3. Si NO existe, agregarlo con los precios correspondientes
4. **Reintentar** crear un registro de prueba con múltiples servicios para verificar que funciona

**Script de verificación rápida:**

```sql
-- COPIAR Y PEGAR EN CONSOLA SQL DE NEON
-- Base de datos de Delta Wash (empresa_id = 37)

-- Ver la patente problemática
SELECT * FROM registros_lavado WHERE UPPER(patente) = 'AA865QG' ORDER BY fecha_ingreso DESC LIMIT 3;

-- Ver servicios disponibles
SELECT DISTINCT tipo_servicio FROM precios p
JOIN listas_precios lp ON p.lista_id = lp.id  
WHERE lp.empresa_id = 37;
```

---

## 📝 NOTAS ADICIONALES

### Comportamiento del Sistema:
- ✅ El sistema permite seleccionar múltiples servicios
- ✅ Los servicios se visualizan separados por comas en las tarjetas
- ✅ Cada servicio suma su precio individual al total
- ⚠️ **IMPORTANTE**: Si un servicio NO está en la lista de precios, su precio será $0

### Recomendaciones:
1. Siempre verificar que todos los servicios estén en la lista de precios ANTES de usarlos
2. Si agregan servicios nuevos, agregarlos primero en "Listas de Precios"
3. Capacitar al personal sobre cómo seleccionar múltiples servicios usando los checkboxes

---

## 🎓 CAPACITACIÓN: Cómo cargar múltiples servicios

### ✅ CORRECTO:
1. Ingresar patente, marca, modelo
2. Seleccionar tipo de vehículo (Auto, SUV, etc.)
3. **Marcar TODOS los checkboxes** de los servicios deseados:
   - ✅ Simple
   - ✅ Limpieza de Motor
4. Completar datos del cliente
5. Verificar que el precio total incluya AMBOS servicios
6. Registrar auto

### ❌ INCORRECTO:
- Marcar solo un servicio cuando deberían ser dos
- No verificar el precio total antes de confirmar
- Usar servicios que no están en la lista de precios

---

## 📞 CONTACTO PARA SOPORTE

Si después de seguir estos pasos el problema persiste:
1. Tomar screenshot del registro problemático
2. Exportar el resultado de las consultas SQL
3. Reportar con todos los detalles

---

**Documento creado:** 2026-01-26  
**Última actualización:** 2026-01-26  
**Estado:** ✅ Análisis completo - Pendiente verificación en base de datos
