-- Migración: Agregar sistema de cuenta corriente
-- Fecha: 2026-01-09

-- Crear tabla de cuentas corrientes
CREATE TABLE IF NOT EXISTS cuentas_corrientes (
  id SERIAL PRIMARY KEY,
  nombre_cliente VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activa BOOLEAN DEFAULT TRUE,
  notas TEXT,
  UNIQUE(celular)
);

-- Crear tabla de movimientos de cuenta corriente
CREATE TABLE IF NOT EXISTS movimientos_cuenta (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER REFERENCES cuentas_corrientes(id),
  registro_id INTEGER REFERENCES registros_lavado(id),
  tipo VARCHAR(20) NOT NULL, -- 'carga' o 'descuento'
  monto DECIMAL(10,2) NOT NULL,
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_nuevo DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER REFERENCES usuarios(id)
);

-- Agregar columna para indicar si se usó cuenta corriente en el registro
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS usa_cuenta_corriente BOOLEAN DEFAULT FALSE;

ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS cuenta_corriente_id INTEGER REFERENCES cuentas_corrientes(id);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_cuentas_celular ON cuentas_corrientes(celular);
CREATE INDEX IF NOT EXISTS idx_cuentas_activa ON cuentas_corrientes(activa);
CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta ON movimientos_cuenta(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_cuenta(fecha);

-- Comentarios
COMMENT ON TABLE cuentas_corrientes IS 'Cuentas corrientes de clientes con saldo prepago';
COMMENT ON TABLE movimientos_cuenta IS 'Historial de movimientos de las cuentas corrientes';
COMMENT ON COLUMN cuentas_corrientes.saldo_inicial IS 'Monto inicial cargado a la cuenta';
COMMENT ON COLUMN cuentas_corrientes.saldo_actual IS 'Saldo disponible actual';
COMMENT ON COLUMN movimientos_cuenta.tipo IS 'Tipo de movimiento: carga (agregar saldo) o descuento (usar saldo)';
