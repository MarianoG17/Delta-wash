-- ============================================================================
-- MIGRATION FIX: Estandarizar columna en survey_responses
-- Fecha: 2026-02-01
-- Descripción: Renombrar submitted_at → created_at para consistencia con Legacy
-- ============================================================================
--
-- PROBLEMA IDENTIFICADO:
-- - DeltaWash Legacy usa: survey_responses.created_at
-- - SaaS Multi-tenant usa: survey_responses.submitted_at
-- - El código backend busca: sr.created_at
-- - Resultado: Error "column sr.created_at does not exist" en SaaS
--
-- SOLUCIÓN:
-- Estandarizar en "created_at" (estándar de industria)
--
-- DÓNDE EJECUTAR:
-- ✅ Branches SaaS en Neon (lavapp, etc.)
-- ❌ NO ejecutar en DeltaWash Legacy (ya tiene created_at)
-- ============================================================================

-- Verificar el estado actual de la tabla
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'survey_responses'
ORDER BY ordinal_position;

-- ============================================================================
-- RENOMBRAR COLUMNA (Solo si existe submitted_at)
-- ============================================================================

DO $$ 
BEGIN
    -- Verificar si la columna submitted_at existe
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'survey_responses' 
        AND column_name = 'submitted_at'
    ) THEN
        -- Renombrar submitted_at → created_at
        ALTER TABLE survey_responses 
        RENAME COLUMN submitted_at TO created_at;
        
        RAISE NOTICE '✅ Columna renombrada: submitted_at → created_at';
        RAISE NOTICE '✅ Todos los datos preservados';
        RAISE NOTICE '✅ Sistema ahora es consistente con DeltaWash Legacy';
    ELSE
        -- Ya tiene created_at o la migración ya fue aplicada
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'survey_responses' 
            AND column_name = 'created_at'
        ) THEN
            RAISE NOTICE '✅ Columna created_at ya existe. Migración ya aplicada.';
        ELSE
            RAISE WARNING '⚠️ Tabla survey_responses no tiene ni submitted_at ni created_at';
            RAISE WARNING '⚠️ Verificar que la tabla existe y tiene la estructura correcta';
        END IF;
    END IF;
END $$;

-- ============================================================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================================

-- 1. Verificar que la columna created_at ahora existe
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'survey_responses' 
        AND column_name = 'created_at'
    ) THEN
        RAISE NOTICE '✅ VERIFICACIÓN OK: Columna created_at existe';
    ELSE
        RAISE WARNING '❌ VERIFICACIÓN FALLIDA: Columna created_at NO existe';
    END IF;
END $$;

-- 2. Mostrar estructura final de la tabla
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'survey_responses'
ORDER BY ordinal_position;

-- 3. Contar registros (verificar que no se perdieron datos)
SELECT 
    COUNT(*) as total_responses,
    COUNT(created_at) as responses_with_timestamp,
    MIN(created_at) as primera_respuesta,
    MAX(created_at) as ultima_respuesta
FROM survey_responses;

-- ============================================================================
-- RESULTADO ESPERADO
-- ============================================================================
--
-- Estructura final de survey_responses:
-- ┌──────────────┬───────────────┬─────────────┬─────────────────────────┐
-- │ column_name  │ data_type     │ is_nullable │ column_default          │
-- ├──────────────┼───────────────┼─────────────┼─────────────────────────┤
-- │ id           │ integer       │ NO          │ nextval('...')          │
-- │ survey_id    │ integer       │ NO          │                         │
-- │ rating       │ integer       │ NO          │                         │
-- │ comment      │ text          │ YES         │                         │
-- │ created_at   │ timestamp...  │ YES         │ CURRENT_TIMESTAMP       │
-- └──────────────┴───────────────┴─────────────┴─────────────────────────┘
--
-- ✅ Ahora coincide exactamente con DeltaWash Legacy
-- ✅ El código backend funcionará sin cambios
-- ✅ Todos los datos históricos preservados
--
-- ============================================================================

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================
--
-- 1. SEGURIDAD DE DATOS:
--    - ALTER TABLE RENAME COLUMN es una operación de metadata
--    - NO toca los datos, solo el nombre de la columna
--    - Operación atómica (todo o nada)
--    - No hay riesgo de pérdida de datos
--
-- 2. IMPACTO:
--    - La operación toma <1 segundo
--    - No requiere downtime
--    - Queries en progreso pueden experimentar un bloqueo breve
--
-- 3. REVERSIÓN (si fuera necesario):
--    ALTER TABLE survey_responses RENAME COLUMN created_at TO submitted_at;
--
-- 4. PRÓXIMOS PASOS:
--    - Actualizar migration-sistema-encuestas-beneficios.sql (línea 32)
--    - Para que futuras empresas ya tengan created_at desde el inicio
--
-- ============================================================================
