-- Agregar campo de porcentaje de descuento configurable a la configuración de encuestas
ALTER TABLE tenant_survey_config
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 10 CHECK (
        discount_percentage >= 0
        AND discount_percentage <= 100
    );
-- Agregar campo para almacenar el porcentaje en la tabla de beneficios
ALTER TABLE benefits
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 10;
-- Actualizar beneficios existentes con 10%
UPDATE benefits
SET discount_percentage = 10
WHERE discount_percentage IS NULL;
-- Comentarios
COMMENT ON COLUMN tenant_survey_config.discount_percentage IS 'Porcentaje de descuento que se otorga al completar encuestas (0-100)';
COMMENT ON COLUMN benefits.discount_percentage IS 'Porcentaje de descuento específico de este beneficio';