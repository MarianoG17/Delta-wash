-- =====================================================
-- MIGRACIÓN: Agregar columnas faltantes para super-admin
-- =====================================================
-- Compatibilidad con super-admin
-- =====================================================
-- Agregar neon_branch_id (duplicado de branch_name para compatibilidad)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS neon_branch_id TEXT;
-- Agregar email si no existe
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS email TEXT;
-- Agregar trial_end_date (renombrado de fecha_expiracion)
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMP;
-- Copiar valores de branch_name a neon_branch_id
UPDATE empresas
SET neon_branch_id = branch_name
WHERE branch_name IS NOT NULL
    AND neon_branch_id IS NULL;
-- Copiar fecha_expiracion a trial_end_date
UPDATE empresas
SET trial_end_date = fecha_expiracion
WHERE fecha_expiracion IS NOT NULL
    AND trial_end_date IS NULL;
-- Verificar
SELECT id,
    nombre,
    email,
    branch_name,
    neon_branch_id,
    fecha_expiracion,
    trial_end_date,
    precio_mensual,
    descuento_porcentaje,
    precio_final
FROM empresas
LIMIT 5;