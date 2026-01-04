-- Migración: Agregar estado "cancelado" y fecha de cancelación
-- Ejecutar en Neon Console SQL Editor

-- 1. Agregar columna fecha_cancelado
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS fecha_cancelado TIMESTAMP;

-- 2. Agregar columna motivo_cancelacion (opcional)
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;

-- 3. Verificar los cambios
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado' 
AND column_name IN ('fecha_cancelado', 'motivo_cancelacion')
ORDER BY ordinal_position;

-- Estados posibles:
-- 'en_proceso' - Auto recién ingresado
-- 'listo' - Auto terminado
-- 'entregado' - Auto entregado al cliente
-- 'cancelado' - Cliente se fue antes de lavar (NUEVO)
