-- Ejecutar en branch: lo-de-nano

-- Ver estructura real de la tabla benefits
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'benefits'
ORDER BY ordinal_position;

-- Si no funciona, alternativamente:
\d benefits

-- HIPÓTESIS:
-- La tabla benefits en branches NO TIENE discount_percentage
-- Esa columna solo existe en DeltaWash Legacy
-- En branch-per-company architecture, benefits es más simple
