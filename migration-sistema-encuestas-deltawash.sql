-- ============================================
-- MIGRACIÓN: Sistema de Encuestas y Beneficios
-- Versión: DeltaWash Legacy (Single-Tenant)
-- ============================================
-- 
-- IMPORTANTE: Esta migración es EXCLUSIVA para DeltaWash Legacy
-- NO ejecutar en branches SaaS (usar migration-sistema-encuestas-beneficios.sql)
--
-- Diferencias vs SaaS:
-- - Sin campo empresa_id (single-tenant)
-- - survey_config global (no tenant_survey_config)
-- - Constraints simplificados (sin empresa_id)
--
-- ============================================

-- ============================================
-- 1. TABLA: surveys (Encuestas)
-- ============================================
-- Almacena las encuestas generadas automáticamente
-- cuando un vehículo es marcado como "entregado"

CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  
  -- Token único para acceso público (UUID)
  survey_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  
  -- Relación con registro de lavado
  visit_id INTEGER NOT NULL UNIQUE, -- registros_lavado.id (UNIQUE: 1 encuesta por visita)
  
  -- Datos del cliente (denormalizados para evitar JOINs cross-branch)
  client_phone VARCHAR(20), -- Número de WhatsApp
  
  -- Datos del vehículo (denormalizados desde registros_lavado)
  vehicle_marca VARCHAR(200), -- marca_modelo del registro
  vehicle_patente VARCHAR(20), -- patente del registro
  vehicle_servicio VARCHAR(300), -- tipo_limpieza del registro
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cuando se creó la encuesta
  sent_at TIMESTAMP, -- Cuando se envió por WhatsApp (nullable hasta que se dispare)
  responded_at TIMESTAMP -- Cuando el cliente completó la encuesta
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_surveys_token ON surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_surveys_phone ON surveys(client_phone);
CREATE INDEX IF NOT EXISTS idx_surveys_visit ON surveys(visit_id);

COMMENT ON TABLE surveys IS 'Encuestas de satisfacción generadas automáticamente al marcar vehículo como entregado';
COMMENT ON COLUMN surveys.survey_token IS 'Token UUID para acceso público sin autenticación';
COMMENT ON COLUMN surveys.visit_id IS 'ID del registro de lavado (registros_lavado.id)';
COMMENT ON COLUMN surveys.sent_at IS 'Timestamp de cuando se envió la encuesta por WhatsApp';
COMMENT ON COLUMN surveys.responded_at IS 'Timestamp de cuando el cliente completó la encuesta';

-- ============================================
-- 2. TABLA: survey_responses (Respuestas)
-- ============================================
-- Almacena las respuestas de los clientes a las encuestas

CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  
  -- Relación con encuesta
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  
  -- Respuestas
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5), -- Calificación 1-5 estrellas
  comment TEXT, -- Comentario opcional del cliente
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: Solo 1 respuesta por encuesta
  UNIQUE(survey_id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_responses_survey ON survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_responses_rating ON survey_responses(rating);

COMMENT ON TABLE survey_responses IS 'Respuestas de clientes a encuestas de satisfacción';
COMMENT ON COLUMN survey_responses.rating IS 'Calificación de 1 a 5 estrellas';

-- ============================================
-- 3. TABLA: benefits (Beneficios/Recompensas)
-- ============================================
-- Almacena beneficios generados por responder encuestas
-- Se generan automáticamente cuando rating >= 4

CREATE TABLE IF NOT EXISTS benefits (
  id SERIAL PRIMARY KEY,
  
  -- Relación con encuesta
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  
  -- Cliente beneficiario
  client_phone VARCHAR(20) NOT NULL, -- Para búsqueda rápida al ingresar celular
  
  -- Tipo de beneficio
  benefit_type VARCHAR(50) NOT NULL DEFAULT '10_PERCENT_OFF', -- Por ahora solo descuento
  discount_percentage INTEGER DEFAULT 10, -- Porcentaje de descuento configurable
  
  -- Estado
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'redeemed' | 'expired'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Cuando se generó el beneficio
  redeemed_at TIMESTAMP, -- Cuando fue canjeado
  redeemed_visit_id INTEGER, -- ID del registro donde se canjeó
  
  -- Constraint: Solo 1 beneficio por encuesta
  UNIQUE(survey_id)
);

-- Índices para búsqueda rápida
CREATE INDEX IF NOT EXISTS idx_benefits_phone ON benefits(client_phone);
CREATE INDEX IF NOT EXISTS idx_benefits_status ON benefits(status);
CREATE INDEX IF NOT EXISTS idx_benefits_survey ON benefits(survey_id);

COMMENT ON TABLE benefits IS 'Beneficios/descuentos generados al completar encuestas con rating >= 4';
COMMENT ON COLUMN benefits.client_phone IS 'Teléfono del cliente para detectar beneficios al registrar auto';
COMMENT ON COLUMN benefits.status IS 'Estado: pending (disponible), redeemed (usado), expired (vencido)';
COMMENT ON COLUMN benefits.discount_percentage IS 'Porcentaje de descuento configurable (ej: 10 = 10% OFF)';

-- ============================================
-- 4. TABLA: survey_config (Configuración Global)
-- ============================================
-- Configuración del sistema de encuestas
-- DeltaWash: Una sola fila (configuración global)

CREATE TABLE IF NOT EXISTS survey_config (
  id INTEGER PRIMARY KEY DEFAULT 1, -- Solo permite 1 fila
  
  -- Estado del sistema
  enabled BOOLEAN DEFAULT true, -- Permite activar/desactivar el sistema de encuestas
  
  -- Branding
  brand_name VARCHAR(200) DEFAULT 'DeltaWash',
  logo_url TEXT, -- URL del logo para mostrar en encuesta pública
  
  -- Google Maps
  google_maps_url TEXT, -- URL de Google Maps para redirección (rating 4-5 estrellas)
  
  -- Mensaje WhatsApp configurable
  whatsapp_message TEXT DEFAULT '¡Gracias por confiar en nosotros! 🚗✨ Tu opinión es muy importante. Por favor completá esta breve encuesta:',
  
  -- Descuento configurable
  discount_percentage INTEGER DEFAULT 10 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraint: Solo permite 1 fila (id=1)
  CHECK (id = 1)
);

COMMENT ON TABLE survey_config IS 'Configuración global del sistema de encuestas (DeltaWash single-tenant)';
COMMENT ON COLUMN survey_config.enabled IS 'Si es false, el sistema de encuestas está desactivado y no se enviarán ni generarán encuestas';
COMMENT ON COLUMN survey_config.whatsapp_message IS 'Mensaje personalizable para envío de encuestas por WhatsApp';
COMMENT ON COLUMN survey_config.discount_percentage IS 'Porcentaje de descuento para beneficios (0-100)';
COMMENT ON COLUMN survey_config.google_maps_url IS 'URL de Google Maps para redirección automática (rating 4-5)';

-- Insertar configuración por defecto
INSERT INTO survey_config (
  id, 
  brand_name, 
  whatsapp_message, 
  discount_percentage,
  google_maps_url
) VALUES (
  1,
  'DeltaWash',
  '¡Gracias por confiar en DeltaWash! 🚗✨ Tu opinión es muy importante para nosotros. Por favor completá esta breve encuesta:',
  10,
  'https://maps.google.com/?q=Tu+Lavadero'
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. FUNCIONES Y TRIGGERS (Opcional)
-- ============================================

-- Trigger para actualizar updated_at en survey_config
CREATE OR REPLACE FUNCTION update_survey_config_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_survey_config_timestamp
BEFORE UPDATE ON survey_config
FOR EACH ROW
EXECUTE FUNCTION update_survey_config_timestamp();

-- ============================================
-- 6. PERMISOS (Opcional - ajustar según tu configuración)
-- ============================================

-- Si tienes roles específicos en PostgreSQL, ajusta permisos aquí
-- GRANT SELECT, INSERT, UPDATE ON surveys TO tu_usuario;
-- GRANT SELECT, INSERT, UPDATE ON survey_responses TO tu_usuario;
-- GRANT SELECT, INSERT, UPDATE ON benefits TO tu_usuario;
-- GRANT SELECT, UPDATE ON survey_config TO tu_usuario;

-- ============================================
-- MIGRACIÓN COMPLETADA
-- ============================================

-- Verificación rápida:
-- SELECT COUNT(*) FROM surveys; -- Debería retornar 0
-- SELECT COUNT(*) FROM benefits; -- Debería retornar 0
-- SELECT * FROM survey_config; -- Debería retornar 1 fila con config por defecto

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
--
-- 1. COMPATIBILIDAD:
--    - Esta migración es para DeltaWash Legacy (Vercel Postgres)
--    - NO ejecutar en branches SaaS (Neon)
--
-- 2. DATOS DENORMALIZADOS:
--    - vehicle_marca, vehicle_patente, vehicle_servicio se copian
--      desde registros_lavado al crear la encuesta
--    - Esto evita problemas si el registro original se elimina
--
-- 3. FLUJO AUTOMÁTICO:
--    - Al marcar vehículo como "entregado" → se crea encuesta
--    - Al responder encuesta con rating >= 4 → se crea beneficio
--    - Al registrar nuevo auto → se detectan beneficios por celular
--
-- 4. CONFIGURACIÓN:
--    - Acceder a /reportes/encuestas y click en "⚙️ Configuración"
--    - Personalizar mensaje WhatsApp y porcentaje de descuento
--
-- 5. ROLLBACK (si necesitas revertir):
--    DROP TABLE IF EXISTS survey_responses CASCADE;
--    DROP TABLE IF EXISTS benefits CASCADE;
--    DROP TABLE IF EXISTS surveys CASCADE;
--    DROP TABLE IF EXISTS survey_config CASCADE;
--    DROP FUNCTION IF EXISTS update_survey_config_timestamp CASCADE;
--
-- ============================================
