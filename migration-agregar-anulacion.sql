-- Agregar campos para sistema de anulación
-- Esto permite anular registros sin eliminarlos, manteniendo auditoría

ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT,
ADD COLUMN IF NOT EXISTS usuario_anulacion_id INTEGER REFERENCES usuarios(id);

-- Crear índice para filtrar registros anulados
CREATE INDEX IF NOT EXISTS idx_anulado ON registros_lavado(anulado);

-- Comentarios para documentación
COMMENT ON COLUMN registros_lavado.anulado IS 'Indica si el registro fue anulado (no se cuenta en estadísticas ni facturación)';
COMMENT ON COLUMN registros_lavado.fecha_anulacion IS 'Fecha y hora en que se anuló el registro';
COMMENT ON COLUMN registros_lavado.motivo_anulacion IS 'Razón por la cual se anuló el registro';
COMMENT ON COLUMN registros_lavado.usuario_anulacion_id IS 'Usuario que realizó la anulación';
