# ⚠️ COMPATIBILIDAD: Empresas Existentes vs Nuevas

## 🔴 Problema Detectado

### Empresas Creadas ANTES del Cambio
- ✅ Tienen tabla `precios_servicios` con precios viejos (8000, 12000, etc.)
- ❌ NO tienen tabla `listas_precios`
- ❌ NO tienen tabla `precios`
- ❌ NO tienen columna `lista_precio_id` en `cuentas_corrientes`

### Empresas Creadas DESPUÉS del Cambio
- ❌ NO tienen tabla `precios_servicios` (o está vacía)
- ✅ Tienen tabla `listas_precios` con lista "Por Defecto"
- ✅ Tienen tabla `precios` con 30 registros en $0
- ✅ Tienen columna `lista_precio_id` en `cuentas_corrientes`

---

## 🤔 ¿Qué Pasa si Uso un Email Viejo?

### Escenario: Login con Empresa Existente

**Resultado Actual:**
1. ✅ Login funciona correctamente
2. ✅ Navegación entre páginas funciona
3. ⚠️ **PROBLEMA:** Al intentar usar "Listas de Precios":
   - Error SQL: `relation "listas_precios" does not exist`
   - La interfaz no carga
4. ⚠️ **PROBLEMA:** El formulario de registro en `/home`:
   - Intentará cargar precios de tabla `precios` que no existe
   - Fallará silenciosamente
   - Usará fallback hardcodeado del código

---

## 💡 Soluciones Disponibles

### OPCIÓN A: Migrar Empresas Existentes (RECOMENDADO)

Crear un script de migración que actualice TODAS las empresas existentes:

**Ventajas:**
- ✅ Todas las empresas usan el mismo sistema
- ✅ Código más limpio
- ✅ Mantenimiento más fácil

**Desventajas:**
- ⚠️ Requiere ejecutar SQL en cada branch existente
- ⚠️ Las empresas viejas verán sus precios actuales migrados (no $0)

**Implementación:**
```typescript
// Script que ejecuta en cada branch existente:
// 1. CREATE TABLE listas_precios
// 2. CREATE TABLE precios
// 3. Migrar datos de precios_servicios → precios
// 4. ALTER TABLE cuentas_corrientes ADD lista_precio_id
```

### OPCIÓN B: Sistema Dual de Precios

Modificar el código para detectar qué sistema tiene cada empresa:

**Ventajas:**
- ✅ No requiere migración
- ✅ Empresas viejas siguen funcionando igual

**Desventajas:**
- ❌ Código más complejo
- ❌ Mantener dos sistemas en paralelo
- ❌ Empresas viejas no pueden usar nuevas funcionalidades

**Implementación:**
```typescript
// En cada API que use precios:
try {
  const precios = await sql`SELECT * FROM listas_precios`;
  // Usar sistema nuevo
} catch (error) {
  const precios = await sql`SELECT * FROM precios_servicios`;
  // Usar sistema viejo
}
```

### OPCIÓN C: Limpiar y Empezar de Cero

Eliminar todas las empresas de prueba existentes:

**Ventajas:**
- ✅ Todos usan el sistema nuevo desde cero
- ✅ No hay compatibilidad que mantener

**Desventajas:**
- ❌ Se pierden datos de prueba
- ❌ Las empresas deben registrarse nuevamente

---

## 🎯 Recomendación

### Para Desarrollo/Testing:
**OPCIÓN C** - Limpiar todo y empezar de cero

```bash
# 1. Ir a Neon Dashboard
# 2. Eliminar todos los branches excepto main
# 3. Registrar empresas de prueba nuevamente
```

### Para Producción (si ya hay clientes reales):
**OPCIÓN A** - Migrar empresas existentes

Necesitarías:
1. Script que lista todos los branches
2. Para cada branch, ejecutar la migración
3. Migrar datos de `precios_servicios` → `precios`

---

## 🚀 ¿Qué Hago Ahora?

### Si Estás Probando Localmente:

**Opción Simple:**
1. Eliminar branch de empresa de prueba desde Neon Dashboard
2. Registrar la empresa nuevamente desde `/registro`
3. Ahora tendrá las tablas nuevas

**Opción Avanzada:**
1. Ejecutar script de migración manualmente en el branch existente
2. Ver archivo [`migration-listas-precios.sql`](migration-listas-precios.sql:1)

### Si Tenés Empresas Reales en Producción:

**¡ESPERA!** Antes de hacer deploy:
1. Necesitamos crear un script de migración automática
2. Probar la migración en una empresa de prueba
3. Ejecutar migración en todas las empresas existentes
4. Recién ahí hacer deploy del código nuevo

---

## 📋 Script de Migración Manual

Si querés migrar una empresa existente manualmente:

```sql
-- Ejecutar en Neon Dashboard → Tu Branch → Query

-- 1. Crear tabla listas_precios
CREATE TABLE IF NOT EXISTS listas_precios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  es_default BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Crear tabla precios
CREATE TABLE IF NOT EXISTS precios (
  id SERIAL PRIMARY KEY,
  lista_id INTEGER REFERENCES listas_precios(id) ON DELETE CASCADE,
  tipo_vehiculo VARCHAR(50) NOT NULL,
  tipo_servicio VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lista_id, tipo_vehiculo, tipo_servicio)
);

-- 3. Agregar columna a cuentas_corrientes
ALTER TABLE cuentas_corrientes 
ADD COLUMN IF NOT EXISTS lista_precio_id INTEGER REFERENCES listas_precios(id) ON DELETE SET NULL;

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_precios_lista ON precios(lista_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_lista_precio ON cuentas_corrientes(lista_precio_id);

-- 5. Crear lista por defecto
INSERT INTO listas_precios (nombre, descripcion, activa, es_default)
VALUES ('Por Defecto', 'Lista de precios migrada desde sistema anterior', true, true)
ON CONFLICT (nombre) DO NOTHING;

-- 6. Migrar precios existentes (MAPEO DE NOMBRES)
-- IMPORTANTE: Adaptar según tus precios existentes
DO $$
DECLARE
  lista_id INTEGER;
BEGIN
  SELECT id INTO lista_id FROM listas_precios WHERE nombre = 'Por Defecto';
  
  -- Migrar solo si tienes datos en precios_servicios
  -- Mapeo ejemplo de tipo_lavado → tipo_servicio
  INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
  SELECT 
    lista_id,
    CASE 
      WHEN tipo_vehiculo = 'suv' THEN 'camioneta'
      WHEN tipo_vehiculo = 'xl' THEN 'camioneta_xl'
      ELSE tipo_vehiculo
    END as tipo_vehiculo,
    CASE
      WHEN tipo_lavado = 'simple' THEN 'simple'
      WHEN tipo_lavado = 'completo' THEN 'simple'
      WHEN tipo_lavado = 'simple_con_cera' THEN 'con_cera'
      WHEN tipo_lavado = 'completo_con_cera' THEN 'con_cera'
      ELSE 'simple'
    END as tipo_servicio,
    precio
  FROM precios_servicios
  WHERE activo = true
  ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO NOTHING;
  
END $$;

-- Verificar
SELECT 'Migración completada' as resultado;
SELECT * FROM listas_precios;
SELECT COUNT(*) as total_precios FROM precios;
```

---

## ❓ ¿Qué Te Recomiendo Hacer?

Depende de tu situación:

### Si Solo Estás Testeando:
✅ **Eliminar branch viejo y crear uno nuevo**
- Más rápido y limpio

### Si Tenés 1-3 Empresas de Prueba:
✅ **Ejecutar migración manual en cada branch**
- Copia el SQL de arriba en Neon Dashboard

### Si Tenés Muchas Empresas o Estás en Producción:
✅ **Necesitamos crear un script de migración automática**
- Te puedo ayudar a crearlo si me lo pedís

---

## 🎯 Próxima Decisión

**¿Qué preferís?**

**A)** Elimino las empresas de prueba existentes y empiezo de cero  
**B)** Querés que cree un script automático para migrar todas las empresas existentes  
**C)** Ejecuto la migración manual en tus branches actuales (decime cuántos branches tenés)

**Decime y continúo con la solución que elijas.**
