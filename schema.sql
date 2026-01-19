-- Tabla de usuarios para login
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  rol VARCHAR(20) DEFAULT 'operador', -- 'admin' o 'operador'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros de lavado
CREATE TABLE IF NOT EXISTS registros_lavado (
  id SERIAL PRIMARY KEY,
  marca_modelo VARCHAR(100) NOT NULL,
  patente VARCHAR(20) NOT NULL,
  tipo_limpieza VARCHAR(200) NOT NULL,  -- Aumentado de 50 a 200 para soportar múltiples servicios
  nombre_cliente VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_listo TIMESTAMP,
  fecha_entregado TIMESTAMP,
  estado VARCHAR(20) DEFAULT 'en_proceso',
  mensaje_enviado BOOLEAN DEFAULT FALSE,
  usuario_id INTEGER REFERENCES usuarios(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS idx_patente ON registros_lavado(patente);
CREATE INDEX IF NOT EXISTS idx_celular ON registros_lavado(celular);
CREATE INDEX IF NOT EXISTS idx_fecha_ingreso ON registros_lavado(fecha_ingreso);
CREATE INDEX IF NOT EXISTS idx_estado ON registros_lavado(estado);

-- Insertar usuarios por defecto
INSERT INTO usuarios (username, password, nombre, rol)
VALUES
  ('admin', 'admin123', 'Administrador', 'admin'),
  ('operador', 'operador123', 'Operador', 'operador')
ON CONFLICT (username) DO NOTHING;
