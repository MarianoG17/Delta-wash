-- ============================================================================
-- MIGRATION: Sistema de Encuestas con Beneficios
-- Fecha: 2026-01-31
-- Descripción: Sistema multi-tenant de encuestas post-servicio con beneficios
-- ============================================================================

-- Tabla principal de encuestas
CREATE TABLE IF NOT EXISTS surveys (
  id SERIAL PRIMARY KEY,
  survey_token UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  empresa_id INTEGER NOT NULL, -- tenant_id, NO tiene FK porque empresa_id viene del JWT
  visit_id INTEGER NOT NULL, -- registros_lavado.id
  client_phone VARCHAR(20), -- registros_lavado.celular (nullable por si se borró el registro)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sent_at TIMESTAMP, -- cuando el operador hizo click en "Enviar encuesta"
  responded_at TIMESTAMP, -- cuando el cliente completó la encuesta
  UNIQUE(visit_id, empresa_id) -- Prevenir duplicados por visita
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_surveys_empresa ON surveys(empresa_id);
CREATE INDEX IF NOT EXISTS idx_surveys_token ON surveys(survey_token);
CREATE INDEX IF NOT EXISTS idx_surveys_phone ON surveys(client_phone);
CREATE INDEX IF NOT EXISTS idx_surveys_visit ON surveys(visit_id);

-- Tabla de respuestas de encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índice para buscar respuestas por encuesta
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON survey_responses(survey_id);

-- Tabla de beneficios generados
CREATE TABLE IF NOT EXISTS benefits (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER NOT NULL, -- tenant_id
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  client_phone VARCHAR(20) NOT NULL, -- identificador del cliente
  benefit_type VARCHAR(50) NOT NULL DEFAULT '10_PERCENT_OFF',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  redeemed_at TIMESTAMP,
  redeemed_by_user_id INTEGER, -- usuario que canjeó el beneficio
  notes TEXT -- notas adicionales del canje
);

-- Índices para búsqueda rápida de beneficios
CREATE INDEX IF NOT EXISTS idx_benefits_empresa ON benefits(empresa_id);
CREATE INDEX IF NOT EXISTS idx_benefits_phone_status ON benefits(client_phone, empresa_id, status);
CREATE INDEX IF NOT EXISTS idx_benefits_survey ON benefits(survey_id);

-- Tabla de configuración de encuestas por tenant (para futuro)
CREATE TABLE IF NOT EXISTS tenant_survey_config (
  empresa_id INTEGER PRIMARY KEY,
  brand_name VARCHAR(100) DEFAULT 'DeltaWash',
  logo_url TEXT,
  google_maps_url TEXT DEFAULT 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36',
  whatsapp_message TEXT DEFAULT 'Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)',
  enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios para documentación
COMMENT ON TABLE surveys IS 'Encuestas generadas automáticamente al entregar un vehículo';
COMMENT ON COLUMN surveys.survey_token IS 'Token UUID único para acceso público sin login';
COMMENT ON COLUMN surveys.sent_at IS 'Timestamp cuando el operador hizo click en enviar por WhatsApp';
COMMENT ON COLUMN surveys.responded_at IS 'Timestamp cuando el cliente completó la encuesta';

COMMENT ON TABLE survey_responses IS 'Respuestas de las encuestas (rating + comentario opcional)';
COMMENT ON COLUMN survey_responses.rating IS 'Calificación de 1 a 5 estrellas';

COMMENT ON TABLE benefits IS 'Beneficios generados al responder encuestas';
COMMENT ON COLUMN benefits.benefit_type IS 'Tipo de beneficio (actualmente solo 10% OFF)';
COMMENT ON COLUMN benefits.status IS 'Estado: pending (disponible) o redeemed (canjeado)';

COMMENT ON TABLE tenant_survey_config IS 'Configuración personalizada de encuestas por tenant (futuro)';

-- ============================================================================
-- FIN DE LA MIGRATION
-- ============================================================================
