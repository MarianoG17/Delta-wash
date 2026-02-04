-- ============================================
-- MIGRACIÓN: Configuración de Encuestas Personalizable
-- Fecha: 2026-02-04
-- Versión: SaaS SOLAMENTE
-- ============================================
-- 
-- ⚠️  IMPORTANTE - LEER ANTES DE EJECUTAR:
-- 
-- 1. Esta migración es SOLO para branches SaaS
-- 2. NO ejecutar en branch "Deltawash" (Legacy)
-- 3. Ejecutar en branch "Lavadero" (LAVAPP - Empresa ID 48)
-- 4. Ejecutar en branches futuros de empresas SaaS
-- 
-- ARQUITECTURA:
--   ✅ Branch "Lavadero" (LAVAPP) - EJECUTAR AQUÍ
--   ✅ Branches futuros de empresas SaaS - EJECUTAR AQUÍ
--   ❌ Branch "Deltawash" (Legacy) - NO EJECUTAR
--   ❌ Branch "central" (BD Central) - NO EJECUTAR
-- 
-- PROBLEMA QUE RESUELVE:
--   El link de Google Maps está hardcodeado en el código.
--   Todas las empresas SaaS enviarían clientes a Google Maps de DeltaWash.
--   Esta migración permite personalizar por empresa.
-- 
-- Referencia: plans/ANALISIS_MEJORAS_SAAS_2026.md
-- ============================================
BEGIN;
-- ============================================
-- PASO 1: VERIFICACIÓN DE SEGURIDAD
-- ============================================
-- Verificar que existe tabla empresas (solo en SaaS)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'empresas'
) THEN RAISE EXCEPTION '❌ STOP: No existe tabla empresas. Estás en branch Legacy (Deltawash). NO ejecutar esta migración aquí.';
END IF;
RAISE NOTICE '✅ Tabla empresas encontrada - Branch SaaS confirmado';
END $$;
-- Verificar que existe tabla surveys (sistema de encuestas)
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'surveys'
) THEN RAISE WARNING '⚠️  Tabla surveys no existe. Sistema de encuestas no está instalado. Esta migración creará la config pero no será utilizable hasta instalar el sistema de encuestas.';
ELSE RAISE NOTICE '✅ Tabla surveys encontrada - Sistema de encuestas instalado';
END IF;
END $$;
-- ============================================
-- PASO 2: CREAR TABLA CONFIGURACION_ENCUESTAS
-- ============================================
CREATE TABLE IF NOT EXISTS configuracion_encuestas (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    -- Configuración de Google Maps
    google_maps_link VARCHAR(500),
    nombre_negocio VARCHAR(100),
    -- Para mostrar en la encuesta
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
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_config_encuestas_empresa UNIQUE(empresa_id)
);
CREATE INDEX IF NOT EXISTS idx_config_encuestas_empresa ON configuracion_encuestas(empresa_id);
COMMENT ON TABLE configuracion_encuestas IS 'Configuración personalizable de encuestas por empresa (SaaS)';
COMMENT ON COLUMN configuracion_encuestas.google_maps_link IS 'Link de Google Maps/Reviews de la empresa (opcional)';
COMMENT ON COLUMN configuracion_encuestas.requiere_calificacion_minima IS 'Solo pedir review en Google si rating >= este valor';
-- Tabla configuracion_encuestas creada
-- ============================================
-- PASO 3: INSERTAR CONFIGURACIÓN POR DEFECTO
-- ============================================
-- Crear config por defecto para empresas existentes
DO $$
DECLARE empresa_record RECORD;
config_insertadas INT := 0;
BEGIN FOR empresa_record IN
SELECT id,
    nombre
FROM empresas LOOP
INSERT INTO configuracion_encuestas (
        empresa_id,
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
        empresa_record.id,
        empresa_record.nombre,
        NULL,
        -- Sin link por defecto - deben configurarlo
        'Gracias por tu opinión, nos ayuda a mejorar',
        '¿Cómo fue tu experiencia con nuestro servicio?',
        'Dejanos tu opinión en Google',
        7,
        TRUE,
        4
    ) ON CONFLICT (empresa_id) DO NOTHING;
IF FOUND THEN config_insertadas := config_insertadas + 1;
RAISE NOTICE '  ✅ Config creada para: % (ID: %)',
empresa_record.nombre,
empresa_record.id;
END IF;
END LOOP;
RAISE NOTICE '✅ Configuraciones insertadas: %',
config_insertadas;
END $$;
-- ============================================
-- PASO 4: TRIGGER PARA UPDATED_AT
-- ============================================
-- Reutilizar función si ya existe, sino crearla
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger en configuracion_encuestas
DROP TRIGGER IF EXISTS update_config_encuestas_updated_at ON configuracion_encuestas;
CREATE TRIGGER update_config_encuestas_updated_at BEFORE
UPDATE ON configuracion_encuestas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger creado
-- ============================================
-- PASO 5: TRIGGER PARA NUEVAS EMPRESAS
-- ============================================
-- Auto-crear configuración cuando se crea una empresa nueva
CREATE OR REPLACE FUNCTION crear_config_encuestas_para_nueva_empresa() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO configuracion_encuestas (
        empresa_id,
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
        NEW.id,
        NEW.nombre,
        NULL,
        'Gracias por tu opinión, nos ayuda a mejorar',
        '¿Cómo fue tu experiencia con nuestro servicio?',
        'Dejanos tu opinión en Google',
        7,
        TRUE,
        4
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trigger_crear_config_encuestas ON empresas;
CREATE TRIGGER trigger_crear_config_encuestas
AFTER
INSERT ON empresas FOR EACH ROW EXECUTE FUNCTION crear_config_encuestas_para_nueva_empresa();
-- Trigger para nuevas empresas creado
-- ============================================
-- PASO 6: VERIFICACIÓN FINAL
-- ============================================
DO $$
DECLARE empresas_count INT;
configs_count INT;
empresas_sin_config INT;
BEGIN
SELECT COUNT(*) INTO empresas_count
FROM empresas;
SELECT COUNT(*) INTO configs_count
FROM configuracion_encuestas;
empresas_sin_config := empresas_count - configs_count;
RAISE NOTICE '📊 RESUMEN:';
RAISE NOTICE '  - Empresas: %',
empresas_count;
RAISE NOTICE '  - Configuraciones: %',
configs_count;
RAISE NOTICE '  - Empresas sin config: %',
empresas_sin_config;
IF empresas_sin_config = 0 THEN RAISE NOTICE '✅ ¡MIGRACIÓN EXITOSA! Todas las empresas tienen configuración';
ELSE RAISE WARNING '⚠️  Hay % empresa(s) sin configuración',
empresas_sin_config;
END IF;
END $$;
COMMIT;
-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN (Ejecutar manualmente)
-- ============================================
-- Descomentar para verificar después de ejecutar:
/*
 -- Ver configuraciones por empresa
 SELECT 
 e.id,
 e.nombre as empresa,
 ce.nombre_negocio,
 ce.google_maps_link,
 ce.dias_para_responder,
 ce.enviar_automatico,
 ce.created_at
 FROM configuracion_encuestas ce
 JOIN empresas e ON ce.empresa_id = e.id
 ORDER BY e.nombre;
 
 -- Verificar que todas las empresas tienen config
 SELECT COUNT(*) as empresas_sin_config
 FROM empresas e
 LEFT JOIN configuracion_encuestas ce ON e.id = ce.empresa_id
 WHERE ce.id IS NULL;
 -- Debería retornar 0
 
 -- Probar trigger de nuevas empresas (crear empresa test)
 INSERT INTO empresas (nombre, slug) VALUES ('Test Config', 'test-config-trigger');
 SELECT * FROM configuracion_encuestas WHERE empresa_id = (SELECT id FROM empresas WHERE slug = 'test-config-trigger');
 -- Debería mostrar la config auto-creada
 -- Limpiar después:
 DELETE FROM empresas WHERE slug = 'test-config-trigger';
 */
-- ============================================
-- DATOS DE EJEMPLO (Para testing)
-- ============================================
-- Descomentar para insertar datos de prueba en LAVAPP
/*
 -- Actualizar config de LAVAPP (Empresa ID 48)
 UPDATE configuracion_encuestas
 SET 
 google_maps_link = 'https://g.page/r/TU_LINK_REAL_AQUI/review',
 nombre_negocio = 'LAVAPP - Lavadero Premium',
 mensaje_agradecimiento = '¡Gracias por elegirnos! Tu opinión es muy importante',
 texto_invitacion = '¿Cómo fue tu experiencia con LAVAPP?',
 requiere_calificacion_minima = 5 -- Solo si dieron 5 estrellas
 WHERE empresa_id = 48;
 
 SELECT * FROM configuracion_encuestas WHERE empresa_id = 48;
 */
-- ============================================
-- ROLLBACK (Solo si algo sale MAL)
-- ============================================
/*
 BEGIN;
 
 -- Eliminar triggers
 DROP TRIGGER IF EXISTS trigger_crear_config_encuestas ON empresas;
 DROP TRIGGER IF EXISTS update_config_encuestas_updated_at ON configuracion_encuestas;
 DROP FUNCTION IF EXISTS crear_config_encuestas_para_nueva_empresa();
 
 -- Eliminar tabla
 DROP TABLE IF EXISTS configuracion_encuestas CASCADE;
 
 COMMIT;
 
 -- Verificar que todo volvió a estado original
 SELECT table_name FROM information_schema.tables 
 WHERE table_name = 'configuracion_encuestas';
 -- Debería retornar 0 filas
 */
-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
-- 
-- ✅ Próximos pasos:
-- 1. Crear API para GET/PUT config encuestas
-- 2. Crear página /configuracion/encuestas
-- 3. Modificar sistema de encuestas para usar esta config
-- 4. Probar con empresa LAVAPP
-- 
-- 📚 Documentado en: plans/SPRINT_1_PLAN_IMPLEMENTACION.md
-- ============================================