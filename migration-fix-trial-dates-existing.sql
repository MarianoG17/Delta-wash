-- ============================================================
-- Migración: Copiar fecha_expiracion a trial_end_date
-- ============================================================
-- Problema: Las cuentas creadas antes del fix tienen la fecha
--           en fecha_expiracion pero super-admin lee trial_end_date
-- Solución: Copiar las fechas a la columna correcta
-- ============================================================

-- Verificar el estado actual
SELECT 
    id,
    nombre,
    created_at,
    fecha_expiracion,
    trial_end_date,
    CASE 
        WHEN fecha_expiracion IS NOT NULL AND trial_end_date IS NULL THEN '❌ Necesita migración'
        WHEN trial_end_date IS NOT NULL THEN '✅ Ya está correcto'
        WHEN fecha_expiracion IS NULL AND trial_end_date IS NULL THEN '⚠️ Sin fecha (puede ser normal)'
        ELSE '🤔 Revisar manualmente'
    END as estado
FROM empresas
ORDER BY created_at DESC;

-- ============================================================
-- EJECUTAR ESTA MIGRACIÓN
-- ============================================================

-- Copiar fecha_expiracion a trial_end_date donde sea necesario
UPDATE empresas
SET trial_end_date = fecha_expiracion
WHERE fecha_expiracion IS NOT NULL
  AND trial_end_date IS NULL;

-- ============================================================
-- VERIFICAR RESULTADO
-- ============================================================

SELECT 
    id,
    nombre,
    created_at,
    trial_end_date,
    CASE 
        WHEN trial_end_date IS NOT NULL THEN EXTRACT(DAY FROM (trial_end_date - NOW()))
        ELSE NULL
    END as dias_restantes,
    CASE 
        WHEN trial_end_date IS NOT NULL THEN '✅ Tiene fecha'
        ELSE '❌ Sin fecha'
    END as estado
FROM empresas
ORDER BY created_at DESC;

-- ============================================================
-- NOTAS
-- ============================================================
-- - Este script es seguro de ejecutar múltiples veces
-- - Solo actualiza registros que lo necesitan
-- - No sobrescribe trial_end_date si ya tiene un valor
-- - Después de ejecutar, las fechas deberían aparecer en super-admin
-- ============================================================
