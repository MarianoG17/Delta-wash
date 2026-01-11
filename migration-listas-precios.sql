-- ============================================
-- MIGRACIÓN: Sistema de Listas de Precios
-- ============================================
-- Ejecuta este SQL en Neon Dashboard → Query
-- ============================================

-- Tabla de listas de precios
CREATE TABLE IF NOT EXISTS listas_precios (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  activa BOOLEAN DEFAULT TRUE,
  es_default BOOLEAN DEFAULT FALSE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de precios por tipo de vehículo y servicio
CREATE TABLE IF NOT EXISTS precios (
  id SERIAL PRIMARY KEY,
  lista_id INTEGER REFERENCES listas_precios(id) ON DELETE CASCADE,
  tipo_vehiculo VARCHAR(50) NOT NULL, -- auto, mono, camioneta, camioneta_xl, moto
  tipo_servicio VARCHAR(50) NOT NULL, -- simple, con_cera
  precio DECIMAL(10,2) NOT NULL,
  fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(lista_id, tipo_vehiculo, tipo_servicio)
);

-- Agregar columna lista_precio_id a cuentas_corrientes
ALTER TABLE cuentas_corrientes 
ADD COLUMN IF NOT EXISTS lista_precio_id INTEGER REFERENCES listas_precios(id) ON DELETE SET NULL;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_precios_lista ON precios(lista_id);
CREATE INDEX IF NOT EXISTS idx_cuentas_lista_precio ON cuentas_corrientes(lista_precio_id);

-- Insertar lista de precios por defecto
INSERT INTO listas_precios (nombre, descripcion, activa, es_default)
VALUES ('Lista Estándar', 'Lista de precios estándar para todos los clientes', true, true)
ON CONFLICT (nombre) DO NOTHING;

-- Obtener el ID de la lista estándar
DO $$
DECLARE
  lista_id INTEGER;
BEGIN
  SELECT id INTO lista_id FROM listas_precios WHERE nombre = 'Lista Estándar';
  
  -- Insertar precios estándar actuales
  INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio) VALUES
  (lista_id, 'auto', 'simple', 22000),
  (lista_id, 'auto', 'con_cera', 2000),
  (lista_id, 'mono', 'simple', 30000),
  (lista_id, 'mono', 'con_cera', 2000),
  (lista_id, 'camioneta', 'simple', 35000),
  (lista_id, 'camioneta', 'con_cera', 5000),
  (lista_id, 'camioneta_xl', 'simple', 38000),
  (lista_id, 'camioneta_xl', 'con_cera', 4000),
  (lista_id, 'moto', 'simple', 15000),
  (lista_id, 'moto', 'con_cera', 0)
  ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO NOTHING;
  
  -- Asignar lista estándar a todas las cuentas corrientes existentes
  UPDATE cuentas_corrientes 
  SET lista_precio_id = lista_id 
  WHERE lista_precio_id IS NULL;
END $$;

-- Comentarios
COMMENT ON TABLE listas_precios IS 'Listas de precios configurables para diferentes tipos de clientes';
COMMENT ON TABLE precios IS 'Precios específicos por tipo de vehículo y servicio para cada lista';
COMMENT ON COLUMN cuentas_corrientes.lista_precio_id IS 'Lista de precios asignada al cliente';

-- Verificar
SELECT 'Sistema de listas de precios creado exitosamente' as resultado;
SELECT * FROM listas_precios;
SELECT COUNT(*) as total_precios FROM precios;
