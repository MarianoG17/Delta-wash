-- ============================================
-- MIGRACIÓN: Ampliar campo tipo_limpieza
-- Fecha: 2026-02-05
-- Problema: VARCHAR(50) es insuficiente para múltiples servicios
-- Solución: Ampliar a VARCHAR(500)
-- ============================================
-- 
-- EJECUTAR EN: Branches existentes que tengan el error
-- "value too long for type character varying(50)"
-- 
-- Ejemplo de error:
-- Cuando seleccionás: simple, con_cera, pulido, limpieza_chasis
-- El string "simple, con_cera, pulido, limpieza_chasis" supera 50 caracteres
-- ============================================

BEGIN;

-- Ampliar columna tipo_limpieza en registros_lavado
ALTER TABLE registros_lavado
ALTER COLUMN tipo_limpieza TYPE VARCHAR(500);

-- Verificar cambio
DO $$
DECLARE
    col_length INTEGER;
BEGIN
    SELECT character_maximum_length INTO col_length
    FROM information_schema.columns
    WHERE table_name = 'registros_lavado' 
    AND column_name = 'tipo_limpieza';
    
    RAISE NOTICE '✅ Columna tipo_limpieza ampliada exitosamente';
    RAISE NOTICE '📊 Nuevo límite: % caracteres', col_length;
END $$;

COMMIT;

-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
/*
-- Ver definición de la columna
SELECT 
    column_name, 
    data_type, 
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'registros_lavado' 
AND column_name = 'tipo_limpieza';

-- Debería mostrar:
-- column_name     | data_type        | character_maximum_length
-- tipo_limpieza   | character varying | 500
*/
