-- ============================================
-- MIGRACIÓN: Configuración de Encuestas Personalizable
-- Fecha: 2026-02-04
-- Versión: SaaS (Branch per Company)
-- ============================================
-- 
-- ⚠️  ARQUITECTURA:
-- Cada branch = Una empresa
-- NO hay empresa_id (aislamiento por branch)
-- 
-- PROBLEMA QUE RESUELVE:
--   El link de Google Maps está hardcodeado en el código.
--   Cada branch debe tener su propia config de encuestas.
-- 
-- Ejecutar en: Branch "Lavadero" (LAVAPP)
-- NO ejecutar en: Branch "Deltawash" (Legacy)
-- ============================================
BEGIN;
-- ============================================
-- PASO 1: CREAR TABLA CONFIGURACION_ENCUESTAS
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_encuestas (
    id SERIAL PRIMARY KEY,
    -- Configuración de Google Maps
    google_maps_link VARCHAR(500),
    nombre_negocio VARCHAR(100),
    -- Textos personalizables
    mensaje_agradecimiento TEXT DEFAULT 'Gracias por tu opinión, nos ayuda a mejorar',
    texto_invitacion TEXT DEFAULT '¿Cómo fue tu experiencia?',
    texto_boton_google TEXT DEFAULT 'Dejanos tu opinión en Google',
    -- Configuración de timing
    dias_para_responder INT DEFAULT 7,
    -- Configuración de comportamiento
    enviar_automatico BOOLEAN DEFAULT TRUE,
    -- Si envía automáticamente al marcar como listo
    requiere_calificacion_minima INT DEFAULT 4,
    -- Solo pedir Google si calificación >= X
    -- Metadata
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
-- Solo debe haber UNA configuración por branch
CREATE UNIQUE INDEX IF NOT EXISTS idx_config_encuestas_singleton ON configuracion_encuestas ((1));
-- ============================================
-- PASO 2: INSERTAR CONFIGURACIÓN POR DEFECTO
-- ============================================
INSERT INTO configuracion_encuestas (
        nombre_negocio,
        google_maps_link,
        mensaje_agradecimiento,
        texto_invitacion,
        texto_boton_google,
        dias_para_responder,
        enviar_automatico,
        requiere_calificacion_minima
    )
VALUES (
        'Mi Lavadero',
        -- Cambiar después desde UI
        NULL,
        -- Sin link por defecto - deben configurarlo
        'Gracias por tu opinión, nos ayuda a mejorar',
        '¿Cómo fue tu experiencia con nuestro servicio?',
        'Dejanos tu opinión en Google',
        7,
        TRUE,
        4
    ) ON CONFLICT DO NOTHING;
-- ============================================
-- PASO 3: TRIGGER PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_config_encuestas_updated_at ON configuracion_encuestas;
CREATE TRIGGER update_config_encuestas_updated_at BEFORE
UPDATE ON configuracion_encuestas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- PASO 4: VERIFICACIÓN FINAL
-- ============================================
DO $$
DECLARE config_count INT;
BEGIN
SELECT COUNT(*) INTO config_count
FROM configuracion_encuestas;
RAISE NOTICE '📊 RESUMEN:';
RAISE NOTICE '  - Configuraciones creadas: %',
config_count;
IF config_count = 1 THEN RAISE NOTICE '✅ ¡MIGRACIÓN EXITOSA! Configuración creada';
ELSIF config_count = 0 THEN RAISE WARNING '⚠️  No se pudo crear configuración';
ELSE RAISE WARNING '⚠️  Hay múltiples configuraciones (debería ser solo una)';
END IF;
END $$;
COMMIT;
-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
/*
 -- Ver configuración actual
 SELECT * FROM configuracion_encuestas;
 
 -- Probar actualización
 UPDATE configuracion_encuestas
 SET 
 nombre_negocio = 'LAVAPP',
 google_maps_link = 'https://g.page/r/TU_LINK_AQUI/review',
 requiere_calificacion_minima = 5;
 
 SELECT * FROM configuracion_encuestas;
 */
-- ============================================
-- ROLLBACK (Si algo sale mal)
-- ============================================
/*
 BEGIN;
 
 DROP TRIGGER IF EXISTS update_config_encuestas_updated_at ON configuracion_encuestas;
 DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
 DROP TABLE IF EXISTS configuracion_encuestas CASCADE;
 
 COMMIT;
 */