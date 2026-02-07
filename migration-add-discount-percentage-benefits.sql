-- Migración: Agregar campo discount_percentage a benefits
-- Descripción: Añade el campo faltante discount_percentage para branches antiguos
-- Fecha: 2026-02-07

-- Agregar campo discount_percentage a benefits si no existe
ALTER TABLE benefits
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 10 CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

COMMENT ON COLUMN benefits.discount_percentage IS 'Porcentaje de descuento específico de este beneficio (0-100)';

-- Actualizar beneficios existentes que no tengan valor
UPDATE benefits
SET discount_percentage = 10
WHERE discount_percentage IS NULL;
