-- ============================================
-- SCHEMA BD CENTRAL - LAVAPP SAAS
-- ============================================
-- Base de datos para gestión de empresas y usuarios
-- Este schema va en un branch NUEVO llamado "central"
-- NO afecta la BD actual de DeltaWash
-- ============================================

-- Tabla de empresas registradas en el SaaS
CREATE TABLE IF NOT EXISTS empresas (
  id SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  branch_name TEXT NOT NULL UNIQUE,
  branch_url TEXT NOT NULL,
  
  -- Plan y facturación
  plan TEXT DEFAULT 'trial' CHECK (plan IN ('trial', 'mensual', 'anual', 'owner')),
  fecha_inicio TIMESTAMP DEFAULT NOW(),
  fecha_expiracion TIMESTAMP DEFAULT (NOW() + INTERVAL '15 days'),
  estado TEXT DEFAULT 'activo' CHECK (estado IN ('activo', 'suspendido', 'cancelado', 'vencido')),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de usuarios del sistema (credenciales en BD Central)
CREATE TABLE IF NOT EXISTS usuarios_sistema (
  id SERIAL PRIMARY KEY,
  empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
  
  -- Credenciales
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- Info del usuario
  nombre TEXT,
  rol TEXT DEFAULT 'admin' CHECK (rol IN ('admin', 'operador', 'contador', 'viewer')),
  activo BOOLEAN DEFAULT true,
  
  -- Metadata
  ultimo_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de invitaciones (para agregar usuarios a empresas)
CREATE TABLE IF NOT EXISTS invitaciones (
  id SERIAL PRIMARY KEY,
  empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  rol TEXT DEFAULT 'operador',
  token TEXT NOT NULL UNIQUE,
  usado BOOLEAN DEFAULT false,
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de actividad (log de acciones importantes)
CREATE TABLE IF NOT EXISTS actividad_sistema (
  id SERIAL PRIMARY KEY,
  empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
  usuario_id INT REFERENCES usuarios_sistema(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL, -- 'registro', 'login', 'upgrade', 'cancelacion', etc.
  descripcion TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON usuarios_sistema(empresa_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios_sistema(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios_sistema(activo);

CREATE INDEX IF NOT EXISTS idx_empresas_slug ON empresas(slug);
CREATE INDEX IF NOT EXISTS idx_empresas_estado ON empresas(estado);
CREATE INDEX IF NOT EXISTS idx_empresas_expiracion ON empresas(fecha_expiracion);

CREATE INDEX IF NOT EXISTS idx_invitaciones_token ON invitaciones(token);
CREATE INDEX IF NOT EXISTS idx_invitaciones_email ON invitaciones(email);

CREATE INDEX IF NOT EXISTS idx_actividad_empresa ON actividad_sistema(empresa_id);
CREATE INDEX IF NOT EXISTS idx_actividad_created ON actividad_sistema(created_at);

-- ============================================
-- FUNCIONES Y TRIGGERS
-- ============================================

-- Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_empresas_updated_at ON empresas;
CREATE TRIGGER update_empresas_updated_at
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios_sistema;
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios_sistema
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Función para verificar estado de trial
CREATE OR REPLACE FUNCTION verificar_trial_vencido()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.plan = 'trial' AND NEW.fecha_expiracion < NOW() THEN
    NEW.estado = 'vencido';
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS check_trial_empresas ON empresas;
CREATE TRIGGER check_trial_empresas
  BEFORE UPDATE ON empresas
  FOR EACH ROW
  EXECUTE FUNCTION verificar_trial_vencido();

-- ============================================
-- VIEWS ÚTILES
-- ============================================

-- Vista de empresas con conteo de usuarios
CREATE OR REPLACE VIEW empresas_con_usuarios AS
SELECT 
  e.*,
  COUNT(u.id) as total_usuarios,
  COUNT(CASE WHEN u.activo THEN 1 END) as usuarios_activos,
  MAX(u.ultimo_login) as ultimo_acceso
FROM empresas e
LEFT JOIN usuarios_sistema u ON e.id = u.empresa_id
GROUP BY e.id;

-- Vista de trials por vencer (próximos 3 días)
CREATE OR REPLACE VIEW trials_por_vencer AS
SELECT 
  e.*,
  u.email as admin_email,
  u.nombre as admin_nombre,
  (e.fecha_expiracion - NOW()) as tiempo_restante
FROM empresas e
JOIN usuarios_sistema u ON e.id = u.empresa_id AND u.rol = 'admin'
WHERE 
  e.plan = 'trial' 
  AND e.estado = 'activo'
  AND e.fecha_expiracion BETWEEN NOW() AND NOW() + INTERVAL '3 days'
ORDER BY e.fecha_expiracion ASC;

-- ============================================
-- DATOS INICIALES (OPCIONAL)
-- ============================================

-- Insertar empresa de ejemplo para testing
-- NOTA: Descomentar solo para desarrollo/testing local
/*
INSERT INTO empresas (
  nombre,
  slug,
  branch_name,
  branch_url,
  plan,
  estado
) VALUES (
  'Empresa de Prueba',
  'prueba',
  'prueba-dev',
  'postgresql://user:pass@localhost:5432/prueba',
  'trial',
  'activo'
) ON CONFLICT (slug) DO NOTHING;

-- Usuario de prueba
-- Password: "password123" hasheado con bcrypt
INSERT INTO usuarios_sistema (
  empresa_id,
  email,
  password_hash,
  nombre,
  rol
) VALUES (
  1,
  'admin@prueba.com',
  '$2b$10$YourHashedPasswordHere',
  'Admin Prueba',
  'admin'
) ON CONFLICT (email) DO NOTHING;
*/

-- ============================================
-- NOTAS DE MIGRACIÓN
-- ============================================

-- Para migrar DeltaWash al nuevo sistema:
-- 1. Crear entrada en tabla empresas con datos de DeltaWash
-- 2. Migrar usuarios existentes a usuarios_sistema
-- 3. Actualizar branch_url con la conexión actual
-- 4. Mantener plan como 'owner' para DeltaWash

-- Ejemplo:
-- INSERT INTO empresas (nombre, slug, branch_name, branch_url, plan, estado)
-- VALUES ('DeltaWash', 'deltawash', 'deltawash', 'tu-url-actual', 'owner', 'activo');

-- ============================================
-- FIN DEL SCHEMA
-- ============================================
