-- MIGRATION: Completar estructura de tabla benefits
-- Agregar columnas faltantes para el sistema de redención de beneficios

-- 1. Agregar redeemed_visit_id (relaciona el beneficio con el registro de lavado donde se canjeó)
ALTER TABLE benefits
ADD COLUMN IF NOT EXISTS redeemed_visit_id INTEGER REFERENCES registros_lavado(id) ON DELETE SET NULL;

-- 2. Asegurarnos que discount_percentage existe (ya se agregó en otra migración, pero por si acaso)
ALTER TABLE benefits
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 10 
CHECK (discount_percentage >= 0 AND discount_percentage <= 100);

-- 3. Crear índice para mejorar performance de búsquedas de beneficios
CREATE INDEX IF NOT EXISTS idx_benefits_status ON benefits(status);
CREATE INDEX IF NOT EXISTS idx_benefits_survey_id ON benefits(survey_id);
CREATE INDEX IF NOT EXISTS idx_benefits_redeemed_visit_id ON benefits(redeemed_visit_id);

-- 4. Verificar estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'benefits'
ORDER BY ordinal_position;
