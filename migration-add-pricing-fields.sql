-- =====================================================
-- MIGRACIÓN: Agregar campos de precios personalizados
-- =====================================================
-- Descripción: Agrega columnas para gestionar precios 
-- personalizados y descuentos por empresa
-- Fecha: 2026-02-08
-- Base de datos: Central SaaS (saas.db)
-- =====================================================

-- Agregar columnas de precio personalizado
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS precio_mensual DECIMAL(10,2) DEFAULT 85000.00;

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS descuento_porcentaje INTEGER DEFAULT 0 
CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100);

-- Columna calculada automáticamente
-- Nota: SQLite no soporta GENERATED ALWAYS AS directamente en ALTER TABLE
-- Por lo que primero agregamos la columna y luego creamos un trigger

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS precio_final DECIMAL(10,2) DEFAULT 85000.00;

ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS nota_descuento TEXT;

-- Crear triggers para actualizar automáticamente precio_final
-- Trigger para INSERT
DROP TRIGGER IF EXISTS empresas_precio_final_insert;
CREATE TRIGGER empresas_precio_final_insert
AFTER INSERT ON empresas
FOR EACH ROW
BEGIN
  UPDATE empresas
  SET precio_final = NEW.precio_mensual * (1.0 - NEW.descuento_porcentaje / 100.0)
  WHERE id = NEW.id;
END;

-- Trigger para UPDATE
DROP TRIGGER IF EXISTS empresas_precio_final_update;
CREATE TRIGGER empresas_precio_final_update
AFTER UPDATE OF precio_mensual, descuento_porcentaje ON empresas
FOR EACH ROW
BEGIN
  UPDATE empresas
  SET precio_final = NEW.precio_mensual * (1.0 - NEW.descuento_porcentaje / 100.0)
  WHERE id = NEW.id;
END;

-- Actualizar registros existentes con valores por defecto
UPDATE empresas
SET 
  precio_mensual = COALESCE(precio_mensual, 85000.00),
  descuento_porcentaje = COALESCE(descuento_porcentaje, 0),
  precio_final = COALESCE(precio_mensual, 85000.00) * (1.0 - COALESCE(descuento_porcentaje, 0) / 100.0)
WHERE precio_final IS NULL OR precio_final = 0;

-- Verificar la migración
SELECT 
  id,
  nombre,
  precio_mensual,
  descuento_porcentaje,
  precio_final,
  nota_descuento
FROM empresas
LIMIT 5;

-- =====================================================
-- INSTRUCCIONES DE USO
-- =====================================================
-- 1. Ejecutar en la base de datos central SaaS (saas.db)
-- 2. Los triggers se encargan de calcular automáticamente 
--    precio_final cuando se modifiquen precio_mensual o 
--    descuento_porcentaje
-- 3. Desde el panel super-admin podrás modificar estos valores
-- =====================================================
