-- ================================================================
-- MIGRACIÓN URGENTE: Ampliar campo tipo_limpieza a VARCHAR(200)
-- ================================================================
-- 
-- PROBLEMA:
-- Error al registrar autos con múltiples servicios:
-- "value too long for type character varying(50)"
--
-- SOLUCIÓN:
-- Ampliar la columna tipo_limpieza de VARCHAR(50) a VARCHAR(200)
-- ================================================================

-- Ejecutar en la consola SQL de Neon para el branch de LAVAPP
ALTER TABLE registros_lavado 
ALTER COLUMN tipo_limpieza TYPE VARCHAR(200);

-- Verificar que se aplicó correctamente
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado' 
  AND column_name = 'tipo_limpieza';

-- El resultado debería mostrar character_maximum_length = 200
