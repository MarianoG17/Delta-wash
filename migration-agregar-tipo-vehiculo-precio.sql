-- Migración: Agregar tipo de vehículo, precio y extras a registros_lavado
-- Fecha: 2026-01-09

-- Agregar columna tipo_vehiculo
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(20) DEFAULT 'auto';

-- Agregar columna precio
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0;

-- Agregar columna extras (descripción de servicios adicionales)
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS extras TEXT;

-- Agregar columna extras_valor (precio de los extras)
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS extras_valor DECIMAL(10,2) DEFAULT 0;

-- Comentarios sobre los valores
COMMENT ON COLUMN registros_lavado.tipo_vehiculo IS 'Tipos: auto, mono, camioneta, camioneta_xl, moto';
COMMENT ON COLUMN registros_lavado.precio IS 'Precio total del servicio en pesos';
COMMENT ON COLUMN registros_lavado.extras IS 'Descripción de servicios adicionales opcionales';
COMMENT ON COLUMN registros_lavado.extras_valor IS 'Precio de los servicios adicionales en pesos';
