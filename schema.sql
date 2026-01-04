-- Tabla de usuarios para login
CREATE TABLE IF NOT EXISTS usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de registros de lavado
CREATE TABLE IF NOT EXISTS registros_lavado (
  id SERIAL PRIMARY KEY,
  marca_modelo VARCHAR(100) NOT NULL,
  patente VARCHAR(20) NOT NULL,
  tipo_limpieza VARCHAR(50) NOT NULL,
  nombre_cliente VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_listo TIMESTAMP,
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

-- Insertar usuario por defecto (password: admin123)
INSERT INTO usuarios (username, password, nombre) 
VALUES ('admin', 'admin123', 'Administrador')
ON CONFLICT (username) DO NOTHING;
