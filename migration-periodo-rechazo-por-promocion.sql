-- ============================================================
-- MIGRACIÓN: Agregar periodo_rechazado_dias a promociones
-- Descripción: Cada promoción ahora tiene su propio período
--              de rechazo, eliminando la configuración global
-- ============================================================
-- Agregar columna periodo_rechazado_dias a la tabla promociones_upselling
ALTER TABLE promociones_upselling
ADD COLUMN IF NOT EXISTS periodo_rechazado_dias INTEGER DEFAULT 30;
-- Comentario para documentación
COMMENT ON COLUMN promociones_upselling.periodo_rechazado_dias IS 'Días que deben pasar antes de volver a mostrar esta promoción a un cliente que la rechazó';
-- Actualizar promociones existentes con valor por defecto
UPDATE promociones_upselling
SET periodo_rechazado_dias = 30
WHERE periodo_rechazado_dias IS NULL;