-- ============================================
-- MIGRACIÓN: Agregar columnas de vehículo a tabla surveys
-- Fecha: 2026-02-05
-- Versión: SaaS (Branch per Company)
-- ============================================
-- 
-- PROBLEMA:
--   La tabla surveys fue creada sin columnas vehicle_marca, vehicle_patente, vehicle_servicio
--   pero el código las necesita para almacenar datos del vehículo al crear la encuesta.
--
-- SOLUCIÓN:
--   Agregar las 3 columnas faltantes a la tabla surveys
--
-- EJECUTAR EN: Todos los branches SaaS existentes que tengan surveys sin estas columnas
-- ============================================
BEGIN;
-- Agregar columnas si no existen
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS vehicle_marca VARCHAR(200);
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS vehicle_patente VARCHAR(20);
ALTER TABLE surveys
ADD COLUMN IF NOT EXISTS vehicle_servicio VARCHAR(300);
-- Verificar cambios
DO $$
DECLARE col_count INTEGER;
BEGIN
SELECT COUNT(*) INTO col_count
FROM information_schema.columns
WHERE table_name = 'surveys'
    AND column_name IN (
        'vehicle_marca',
        'vehicle_patente',
        'vehicle_servicio'
    );
RAISE NOTICE '================================================';
RAISE NOTICE '✅ MIGRACIÓN COMPLETADA';
RAISE NOTICE '================================================';
RAISE NOTICE 'Columnas agregadas a tabla surveys: %',
col_count;
IF col_count = 3 THEN RAISE NOTICE '✅ Todas las columnas están presentes';
ELSE RAISE WARNING '⚠️  Faltan columnas (esperadas: 3, encontradas: %)',
col_count;
END IF;
RAISE NOTICE '================================================';
END $$;
COMMIT;
-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
/*
 -- Ver estructura de la tabla surveys
 SELECT column_name, data_type, character_maximum_length 
 FROM information_schema.columns 
 WHERE table_name = 'surveys' 
 ORDER BY ordinal_position;
 
 -- Ver encuestas existentes (si las hay)
 SELECT id, survey_token, visit_id, vehicle_marca, vehicle_patente, vehicle_servicio 
 FROM surveys 
 LIMIT 5;
 */