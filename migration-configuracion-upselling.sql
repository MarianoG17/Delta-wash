-- ============================================================
-- MIGRACIÓN: Configuración de Upselling Dinámica
-- Descripción: Permite configurar los parámetros del sistema
--              de upselling (percentil, servicios, períodos, etc.)
-- ============================================================
-- Tabla de configuración de upselling por empresa
CREATE TABLE IF NOT EXISTS upselling_configuracion (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER,
    -- NULL para DeltaWash, ID para empresas SaaS
    -- Criterios de elegibilidad
    percentil_clientes INTEGER DEFAULT 80,
    -- Top 20% = percentil 80
    periodo_rechazado_dias INTEGER DEFAULT 30,
    -- Días antes de volver a mostrar oferta
    -- Servicios premium personalizables (JSON array de palabras clave)
    servicios_premium TEXT DEFAULT '["chasis", "motor", "pulido"]',
    -- Configuración adicional
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    -- Solo una configuración por empresa
    UNIQUE(empresa_id)
);
-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_upselling_config_empresa ON upselling_configuracion(empresa_id);
-- Insertar configuración por defecto para DeltaWash
INSERT INTO upselling_configuracion (
        empresa_id,
        percentil_clientes,
        periodo_rechazado_dias,
        servicios_premium,
        activo
    )
VALUES (
        NULL,
        -- DeltaWash
        80,
        -- Top 20%
        30,
        -- 30 días
        '["chasis", "motor", "pulido"]',
        true
    ) ON CONFLICT (empresa_id) DO NOTHING;
-- Comentarios para documentación
COMMENT ON TABLE upselling_configuracion IS 'Configuración personalizable del sistema de upselling por empresa';
COMMENT ON COLUMN upselling_configuracion.percentil_clientes IS 'Percentil para determinar clientes top (80 = top 20%, 90 = top 10%)';
COMMENT ON COLUMN upselling_configuracion.periodo_rechazado_dias IS 'Días que deben pasar antes de volver a mostrar oferta a cliente que rechazó';
COMMENT ON COLUMN upselling_configuracion.servicios_premium IS 'Array JSON de palabras clave que identifican servicios premium';