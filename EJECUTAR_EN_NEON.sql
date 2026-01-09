-- ============================================
-- MIGRACIÓN: Crear tabla movimientos_cuenta
-- ============================================
-- Ejecuta este SQL en Neon Dashboard → Query
-- ============================================

CREATE TABLE IF NOT EXISTS movimientos_cuenta (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER REFERENCES cuentas_corrientes(id) ON DELETE CASCADE,
  registro_id INTEGER REFERENCES registros(id) ON DELETE SET NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('carga', 'descuento')),
  monto DECIMAL(10,2) NOT NULL,
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_nuevo DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta_id ON movimientos_cuenta(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_registro_id ON movimientos_cuenta(registro_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_cuenta(fecha DESC);

-- Comentarios
COMMENT ON TABLE movimientos_cuenta IS 'Historial de movimientos de las cuentas corrientes';
COMMENT ON COLUMN movimientos_cuenta.tipo IS 'Tipo de movimiento: carga (agregar saldo) o descuento (usar saldo)';
COMMENT ON COLUMN movimientos_cuenta.saldo_anterior IS 'Saldo antes del movimiento';
COMMENT ON COLUMN movimientos_cuenta.saldo_nuevo IS 'Saldo después del movimiento';
COMMENT ON COLUMN movimientos_cuenta.registro_id IS 'ID del registro de lavado si el movimiento es un descuento';

-- Verificar que se creó correctamente
SELECT 'Tabla movimientos_cuenta creada exitosamente' as resultado;
SELECT COUNT(*) as total_movimientos FROM movimientos_cuenta;
