-- ================================================================
-- VERIFICAR si DeltaWash ya tiene VARCHAR(200)
-- ================================================================
--
-- Ejecutar en la consola SQL de Neon para el branch de DeltaWash
-- ================================================================
SELECT column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'registros_lavado'
    AND column_name = 'tipo_limpieza';
-- Si character_maximum_length = 200 → ✅ Ya está actualizado
-- Si character_maximum_length = 50  → ⚠️ Necesita la migración
-- ================================================================
-- Si necesita la migración, ejecutar esto:
-- ================================================================
-- ALTER TABLE registros_lavado 
-- ALTER COLUMN tipo_limpieza TYPE VARCHAR(200);