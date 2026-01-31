# 🔍 SOLUCIÓN CORREGIDA - PATENTE AA865QG (DELTA WASH)

## 📋 Situación Actualizada

✅ **CONFIRMADO**: El precio de "limpieza_motor" SÍ EXISTE en la base de datos  
❌ **PROBLEMA**: El servicio no apareció en el registro de la patente AA865QG

---

## 🎯 DIAGNÓSTICO ACTUALIZADO

Ya que el precio existe, el problema NO es falta de configuración. Las causas posibles son:

### Causa #1: El servicio NO fue seleccionado al cargar (error humano) 🔴
**Probabilidad: ALTA**

Durante la carga del auto:
- Seleccionaron el checkbox de "Lavado/Simple" ✅
- **NO marcaron** el checkbox de "Limpieza de Motor" ❌
- Por eso solo se guardó un servicio

### Causa #2: El servicio SÍ está guardado pero no se visualiza 🟡
**Probabilidad: MEDIA**

El servicio podría estar en la base de datos como:
- `"simple, limpieza_motor"` 
Pero hay un problema visual al mostrarlo

---

## 🔍 VERIFICACIÓN INMEDIATA

### PASO 1: Ver qué se guardó realmente

```sql
-- Ejecutar en la consola SQL de Neon (Delta Wash)
SELECT 
    id,
    patente,
    tipo_limpieza,  ← ESTE ES EL CAMPO CLAVE
    precio,
    fecha_ingreso,
    nombre_cliente,
    estado
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha_ingreso DESC
LIMIT 3;
```

**Analizar el resultado:**

#### Si `tipo_limpieza` = `"simple"` o `"lavado"`:
→ **El servicio NO se seleccionó durante la carga**  
→ **Solución**: Editar el registro manualmente (ver PASO 2)

#### Si `tipo_limpieza` = `"simple, limpieza_motor"`:
→ **El servicio SÍ está guardado**  
→ **Problema**: Es visual en el frontend  
→ **Solución**: Verificar que se muestre correctamente (ver PASO 3)

---

### PASO 2: Confirmar que el precio existe

```sql
-- Ver todos los servicios disponibles
SELECT 
    tipo_vehiculo,
    tipo_servicio,
    precio,
    lista_id
FROM precios
WHERE tipo_servicio LIKE '%motor%'
ORDER BY tipo_vehiculo;
```

**Resultado esperado:**
```
tipo_vehiculo | tipo_servicio    | precio  | lista_id
--------------+------------------+---------+----------
auto          | limpieza_motor   | 15000   | 1
mono          | limpieza_motor   | 20000   | 1
camioneta     | limpieza_motor   | 25000   | 1
camioneta_xl  | limpieza_motor   | 30000   | 1
moto          | limpieza_motor   | 10000   | 1
```

---

## 🛠️ SOLUCIONES SEGÚN EL CASO

### CASO A: El servicio NO está en el registro (más probable)

Si la consulta del PASO 1 muestra que `tipo_limpieza` NO incluye "limpieza_motor":

#### Opción 1: Corregir el registro manualmente

```sql
-- 1. Primero ver el registro actual
SELECT id, tipo_limpieza, precio, tipo_vehiculo 
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG' 
ORDER BY fecha_ingreso DESC 
LIMIT 1;

-- 2. Actualizar para agregar el servicio faltante
-- IMPORTANTE: Ajustar el ID según el resultado anterior
-- IMPORTANTE: Ajustar el precio_adicional según el tipo_vehiculo
UPDATE registros_lavado
SET 
    tipo_limpieza = tipo_limpieza || ', limpieza_motor',
    precio = precio + 15000  -- Ajustar: auto=15000, mono=20000, camioneta=25000, xl=30000, moto=10000
WHERE id = [REEMPLAZAR_CON_ID_DEL_REGISTRO]
    AND UPPER(patente) = 'AA865QG'
    AND tipo_limpieza NOT LIKE '%motor%';

-- 3. Verificar que se actualizó correctamente
SELECT id, tipo_limpieza, precio 
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG' 
ORDER BY fecha_ingreso DESC 
LIMIT 1;
```

#### Opción 2: Crear un nuevo registro correcto

Si prefieren mantener el original y crear uno nuevo:

```sql
-- Copiar el registro anterior pero con ambos servicios
INSERT INTO registros_lavado (
    marca_modelo,
    patente,
    tipo_vehiculo,
    tipo_limpieza,  ← Con ambos servicios
    nombre_cliente,
    celular,
    precio,
    usuario_id,
    estado
)
SELECT 
    marca_modelo,
    patente,
    tipo_vehiculo,
    'simple, limpieza_motor',  ← SERVICIOS CORRECTOS
    nombre_cliente,
    celular,
    precio + 15000,  ← PRECIO CORREGIDO (ajustar según tipo_vehiculo)
    usuario_id,
    'en_proceso'
FROM registros_lavado
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha_ingreso DESC
LIMIT 1;

-- Anular el registro anterior (opcional)
UPDATE registros_lavado
SET estado = 'cancelado'
WHERE id = [ID_DEL_REGISTRO_ANTERIOR];
```

---

### CASO B: El servicio SÍ está guardado (menos probable)

Si `tipo_limpieza` = `"simple, limpieza_motor"` en la base de datos:

**El problema es de visualización en el frontend**

Verificar en la app:
1. Ver la tarjeta del vehículo en "Autos en Proceso" o "Listos"
2. Buscar la sección "📋 Servicios incluidos:"
3. Debería mostrar ambos servicios separados por viñetas

Si NO se muestran correctamente, es un bug visual del frontend (líneas 1218-1231 en app/page.tsx)

---

## 📊 SCRIPT DE DIAGNÓSTICO COMPLETO

```sql
-- ================================================================
-- DIAGNÓSTICO COMPLETO - PATENTE AA865QG
-- Copiar y pegar todo este bloque en la consola SQL de Neon
-- ================================================================

-- 1. Ver el registro de la patente
SELECT 
    '=== REGISTRO DE LA PATENTE ===' as seccion,
    id,
    patente,
    tipo_vehiculo,
    tipo_limpieza,
    precio,
    TO_CHAR(fecha_ingreso, 'DD/MM/YYYY HH24:MI') as fecha_ingreso,
    estado,
    nombre_cliente
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha_ingreso DESC
LIMIT 3;

-- 2. Ver si el servicio está disponible
SELECT 
    '=== SERVICIO LIMPIEZA_MOTOR ===' as seccion,
    tipo_vehiculo,
    tipo_servicio,
    precio,
    lista_id
FROM precios
WHERE tipo_servicio = 'limpieza_motor'
ORDER BY tipo_vehiculo;

-- 3. Ver todos los servicios disponibles
SELECT 
    '=== TODOS LOS SERVICIOS ===' as seccion,
    DISTINCT tipo_servicio
FROM precios
ORDER BY tipo_servicio;

-- 4. Análisis del problema
SELECT 
    '=== ANÁLISIS ===' as seccion,
    CASE 
        WHEN tipo_limpieza LIKE '%motor%' THEN '✅ El servicio ESTÁ en el registro'
        ELSE '❌ El servicio NO ESTÁ en el registro (problema de carga)'
    END as diagnostico,
    tipo_limpieza as servicios_actuales,
    precio as precio_actual,
    tipo_vehiculo
FROM registros_lavado 
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha_ingreso DESC
LIMIT 1;
```

---

## 🎓 PREVENCIÓN: Cómo evitar que vuelva a pasar

### Capacitación al personal:

**CORRECTO al cargar un auto:**
1. Ingresar datos básicos (patente, marca, modelo)
2. **Mirar la pantalla del celular/computadora**
3. **Marcar TODOS los checkboxes** necesarios:
   - ☑️ Simple (o el lavado básico)
   - ☑️ Limpieza de Motor
4. **VERIFICAR que el precio total sea correcto**:
   - Simple auto: ~$22.000
   - Limpieza motor auto: ~$15.000
   - **TOTAL esperado: ~$37.000**
5. Si el precio no coincide, revisar los checkboxes

**INCORRECTO:**
- ❌ Marcar solo un checkbox cuando deberían ser dos
- ❌ No verificar el precio total
- ❌ Apurarse sin revisar

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de registrar un auto con múltiples servicios:

- [ ] Marqué todos los checkboxes de servicios solicitados
- [ ] El precio total es correcto (suma de todos los servicios)
- [ ] Veo el desglose de servicios en el resumen
- [ ] El cliente confirma el precio
- [ ] Presiono "Registrar Auto"

---

## 🆘 SOPORTE RÁPIDO

### Para el personal de Delta Wash:

**Si el servicio falta en un registro:**
1. Anotar el ID del registro (lo ven en la consulta SQL)
2. Contactar al administrador con:
   - Patente del vehículo
   - ID del registro
   - Servicios que deberían estar
   - Tipo de vehículo
3. El admin ejecutará el UPDATE para corregirlo

**Fórmulas de precios (para verificar):**
- Auto: Simple $22.000 + Motor $15.000 = $37.000
- SUV/Mono: Simple $30.000 + Motor $20.000 = $50.000
- Camioneta: Simple $35.000 + Motor $25.000 = $60.000
- Camioneta XL: Simple $38.000 + Motor $30.000 = $68.000
- Moto: Simple $15.000 + Motor $10.000 = $25.000

---

**Documento actualizado:** 2026-01-26  
**Versión:** 2.0 - Corregida sin empresa_id  
**Estado:** ✅ Listo para aplicar
