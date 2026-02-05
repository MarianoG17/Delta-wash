-- ============================================
-- Tabla de lookup para encuestas SaaS
-- Fecha: 2026-02-05
-- Base de Datos: CENTRAL (BD SaaS multi-tenant)
-- ============================================
-- 
-- PROPÓSITO:
--   Mapear tokens de encuestas a branches de empresas.
--   Permite que la API pública /survey/[token] sepa a qué branch conectarse.
--
-- ARQUITECTURA:
--   - Cada vez que se crea una encuesta en un branch, se registra aquí
--   - El API público consulta esta tabla primero
--   - Luego conecta al branch específico para obtener/guardar datos
--
-- EJECUTAR EN: Base de datos CENTRAL (CENTRAL_DB_URL)
-- ============================================

CREATE TABLE IF NOT EXISTS survey_lookup (
    id SERIAL PRIMARY KEY,
    survey_token UUID NOT NULL UNIQUE,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    branch_url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Índices para búsqueda rápida
    INDEX idx_survey_lookup_token (survey_token),
    INDEX idx_survey_lookup_empresa (empresa_id)
);

COMMENT ON TABLE survey_lookup IS 'Mapeo de tokens de encuesta a branches de empresas (SaaS multi-tenant)';
COMMENT ON COLUMN survey_lookup.survey_token IS 'UUID del token de la encuesta (mismo que en tabla surveys del branch)';
COMMENT ON COLUMN survey_lookup.empresa_id IS 'ID de la empresa dueña de la encuesta';
COMMENT ON COLUMN survey_lookup.branch_url IS 'URL de conexión al branch Neon de la empresa';

-- Verificación
SELECT COUNT(*) as registros_lookup FROM survey_lookup;
