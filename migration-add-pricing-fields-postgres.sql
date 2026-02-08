-- =====================================================
-- MIGRACIÓN: Agregar campos de precios personalizados
-- =====================================================
-- Descripción: Agrega columnas para gestionar precios 
-- personalizados y descuentos por empresa
-- Fecha: 2026-02-08
-- Base de datos: Central SaaS (PostgreSQL/Neon)
-- =====================================================
-- Agregar columnas de precio personalizado
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS precio_mensual DECIMAL(10, 2) DEFAULT 85000.00;
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS descuento_porcentaje INTEGER DEFAULT 0 CHECK (
        descuento_porcentaje >= 0
        AND descuento_porcentaje <= 100
    );
-- Columna calculada
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS precio_final DECIMAL(10, 2);
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS nota_descuento TEXT;
-- Crear función para calcular precio final
CREATE OR REPLACE FUNCTION calcular_precio_final() RETURNS TRIGGER AS $$ BEGIN NEW.precio_final := NEW.precio_mensual * (1.0 - NEW.descuento_porcentaje / 100.0);
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Crear trigger para INSERT
DROP TRIGGER IF EXISTS empresas_precio_final_insert ON empresas;
CREATE TRIGGER empresas_precio_final_insert BEFORE
INSERT ON empresas FOR EACH ROW EXECUTE FUNCTION calcular_precio_final();
-- Crear trigger para UPDATE
DROP TRIGGER IF EXISTS empresas_precio_final_update ON empresas;
CREATE TRIGGER empresas_precio_final_update BEFORE
UPDATE OF precio_mensual,
    descuento_porcentaje ON empresas FOR EACH ROW EXECUTE FUNCTION calcular_precio_final();
-- Actualizar registros existentes con valores por defecto
UPDATE empresas
SET precio_mensual = COALESCE(precio_mensual, 85000.00),
    descuento_porcentaje = COALESCE(descuento_porcentaje, 0),
    precio_final = COALESCE(precio_mensual, 85000.00) * (1.0 - COALESCE(descuento_porcentaje, 0) / 100.0)
WHERE precio_final IS NULL
    OR precio_final = 0;
-- Verificar la migración
SELECT id,
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
-- 1. Conectarse a la base de datos central (CENTRAL_DB_URL)
-- 2. Ejecutar este script completo
-- 3. Los triggers calcularán automáticamente precio_final
-- 4. Verificar con el SELECT final
-- =====================================================