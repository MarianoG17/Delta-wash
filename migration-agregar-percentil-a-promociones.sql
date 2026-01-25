-- ============================================================
-- MIGRACIÓN: Agregar percentil_clientes a promociones
-- Descripción: Permite que cada promoción tenga su propio 
--              público objetivo (Top 10%, Top 20%, etc.)
-- ============================================================
-- Agregar columna percentil_clientes a la tabla promociones_upselling
ALTER TABLE promociones_upselling
ADD COLUMN IF NOT EXISTS percentil_clientes INTEGER DEFAULT 80;
-- Comentario para documentación
COMMENT ON COLUMN promociones_upselling.percentil_clientes IS 'Percentil para seleccionar clientes (80 = Top 20%, 90 = Top 10%)';
-- Actualizar promociones existentes con valor por defecto
UPDATE promociones_upselling
SET percentil_clientes = 80
WHERE percentil_clientes IS NULL;