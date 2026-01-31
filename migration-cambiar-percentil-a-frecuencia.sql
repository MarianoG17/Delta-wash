-- ================================================================
-- MIGRACIÓN: Cambiar percentil por frecuencia de visitas
-- ================================================================
-- 
-- CAMBIO: En lugar de usar percentil (top X% más frecuentes),
-- ahora se usa frecuencia de visitas en días.
--
-- Ejemplo anterior: "Top 20% más frecuentes" (percentil 80)
-- Ejemplo nuevo: "Clientes que vienen cada 15 días o menos"
--
-- La columna percentil_clientes se reemplaza conceptualmente por
-- frecuencia_dias_max (pero mantenemos ambas por compatibilidad)
-- ================================================================
-- Agregar nueva columna para frecuencia máxima de días entre visitas
ALTER TABLE promociones_upselling
ADD COLUMN IF NOT EXISTS frecuencia_dias_max INTEGER;
-- Convertir valores existentes de percentil a frecuencia aproximada
-- Percentil 80 (Top 20%) ≈ visitan cada 15 días o menos
-- Percentil 90 (Top 10%) ≈ visitan cada 10 días o menos
UPDATE promociones_upselling
SET frecuencia_dias_max = CASE
        WHEN percentil_clientes >= 90 THEN 10 -- Top 10% = muy frecuentes
        WHEN percentil_clientes >= 80 THEN 15 -- Top 20% = frecuentes
        WHEN percentil_clientes >= 70 THEN 20 -- Top 30%
        WHEN percentil_clientes >= 60 THEN 25 -- Top 40%
        ELSE 30 -- Top 50%+
    END
WHERE frecuencia_dias_max IS NULL;
-- Verificar los cambios
SELECT id,
    nombre,
    percentil_clientes as percentil_anterior,
    frecuencia_dias_max as frecuencia_nueva
FROM promociones_upselling;
-- ================================================================
-- NOTA: NO eliminamos la columna percentil_clientes para mantener
-- compatibilidad con código existente. En el futuro se puede eliminar.
-- ================================================================