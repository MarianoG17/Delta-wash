-- Eliminar promoción por defecto hardcodeada
-- Ejecutar en Neon SQL Editor
-- 1. Ver la promoción antes de eliminar
SELECT id,
    nombre,
    empresa_id
FROM promociones_upselling
WHERE empresa_id IS NULL;
-- 2. Ver si hay interacciones asociadas
SELECT COUNT(*) as interacciones_asociadas
FROM upselling_interacciones
WHERE promocion_id IN (
        SELECT id
        FROM promociones_upselling
        WHERE empresa_id IS NULL
    );
-- 3. PRIMERO eliminar las interacciones asociadas a promociones globales
DELETE FROM upselling_interacciones
WHERE promocion_id IN (
        SELECT id
        FROM promociones_upselling
        WHERE empresa_id IS NULL
    );
-- 4. LUEGO eliminar todas las promociones globales (empresa_id NULL)
DELETE FROM promociones_upselling
WHERE empresa_id IS NULL;
-- 5. Verificar que se eliminó todo
SELECT COUNT(*) as promociones_restantes
FROM promociones_upselling;
SELECT COUNT(*) as interacciones_restantes
FROM upselling_interacciones;