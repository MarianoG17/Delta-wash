-- =====================================================
-- MIGRACIÓN: Sistema de Archivar + Contacto + Logs
-- =====================================================
-- Fecha: 2026-02-08
-- Base de datos: Central SaaS (CENTRAL_DB_URL)
-- =====================================================

-- 1. AGREGAR CAMPOS DE CONTACTO
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS telefono VARCHAR(20),
ADD COLUMN IF NOT EXISTS contacto_nombre VARCHAR(255),
ADD COLUMN IF NOT EXISTS direccion TEXT;

-- 2. CREAR TABLA DE LOGS DE AUDITORÍA
CREATE TABLE IF NOT EXISTS empresa_logs (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER REFERENCES empresas(id) ON DELETE SET NULL,
  empresa_nombre TEXT NOT NULL,
  accion VARCHAR(50) NOT NULL, -- 'archivado', 'reactivado', 'eliminado', 'editado'
  detalles TEXT,
  realizado_por VARCHAR(255), -- Email del super-admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crear índices para mejor performance
CREATE INDEX IF NOT EXISTS idx_empresa_logs_empresa_id ON empresa_logs(empresa_id);
CREATE INDEX IF NOT EXISTS idx_empresa_logs_created_at ON empresa_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas(estado);

-- 3. VERIFICACIÓN
SELECT 
  'Columnas agregadas correctamente' as mensaje,
  COUNT(*) as total_empresas
FROM empresas;

-- Ver estructura actualizada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'empresas' 
  AND column_name IN ('telefono', 'contacto_nombre', 'direccion')
ORDER BY column_name;

-- Ver tabla de logs creada
SELECT COUNT(*) as logs_existentes FROM empresa_logs;
