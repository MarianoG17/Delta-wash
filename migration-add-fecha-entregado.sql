-- Migración: Agregar columna fecha_entregado a la tabla registros_lavado
-- Ejecutar este script en la base de datos de producción (Neon)

ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS fecha_entregado TIMESTAMP;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado' 
ORDER BY ordinal_position;
