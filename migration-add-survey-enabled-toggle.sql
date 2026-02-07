-- Migración: Agregar campo enabled a survey_config
-- Descripción: Permite activar/desactivar el sistema de encuestas
-- Fecha: 2026-02-07

-- Agregar campo enabled a survey_config (DeltaWash/Legacy schema)
ALTER TABLE survey_config
ADD COLUMN IF NOT EXISTS enabled BOOLEAN DEFAULT true;

COMMENT ON COLUMN survey_config.enabled IS 'Si es false, el sistema de encuestas está desactivado y no se enviarán ni generarán encuestas';

-- Actualizar configuración existente para estar habilitado por defecto
UPDATE survey_config
SET enabled = true
WHERE id = 1;
