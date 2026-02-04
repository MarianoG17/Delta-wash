-- ============================================
-- MIGRACIÓN: Tipos Editables (Vehículos y Limpieza)
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
-- Referencia: APRENDIZAJES_2026_FEBRERO.md#2-arquitectura-de-branches-neon
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
-- ============================================
-- PASO 2: CREAR TABLA TIPOS DE VEHÍCULO
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_tipo_vehiculo_empresa UNIQUE(empresa_id, nombre)
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tipos_vehiculo_empresa ON tipos_vehiculo(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tipos_vehiculo_activo ON tipos_vehiculo(empresa_id, activo);
CREATE INDEX IF NOT EXISTS idx_tipos_vehiculo_orden ON tipos_vehiculo(empresa_id, orden);
COMMENT ON TABLE tipos_vehiculo IS 'Tipos de vehículos configurables por empresa (SaaS)';
COMMENT ON COLUMN tipos_vehiculo.orden IS 'Orden de visualización en selects';
COMMENT ON COLUMN tipos_vehiculo.activo IS 'Permite desactivar sin eliminar (preserva integridad)';
-- Tabla tipos_vehiculo creada
-- ============================================
-- PASO 3: CREAR TABLA TIPOS DE LIMPIEZA
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_limpieza (
    id SERIAL PRIMARY KEY,
    empresa_id INT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_tipo_limpieza_empresa UNIQUE(empresa_id, nombre)
);
-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tipos_limpieza_empresa ON tipos_limpieza(empresa_id);
CREATE INDEX IF NOT EXISTS idx_tipos_limpieza_activo ON tipos_limpieza(empresa_id, activo);
CREATE INDEX IF NOT EXISTS idx_tipos_limpieza_orden ON tipos_limpieza(empresa_id, orden);
COMMENT ON TABLE tipos_limpieza IS 'Tipos de lavados/servicios configurables por empresa (SaaS)';
COMMENT ON COLUMN tipos_limpieza.descripcion IS 'Descripción del servicio para mostrar en selects';
-- Tabla tipos_limpieza creada
-- ============================================
-- PASO 4: INSERTAR DATOS INICIALES
-- ============================================
-- Insertar tipos por defecto para todas las empresas existentes
-- Esto preserva la funcionalidad actual
DO $$
DECLARE empresa_record RECORD;
tipo_count INT;
BEGIN FOR empresa_record IN
SELECT id,
    nombre
FROM empresas LOOP RAISE NOTICE '📝 Procesando empresa: % (ID: %)',
    empresa_record.nombre,
    empresa_record.id;
-- TIPOS DE VEHÍCULO (basados en sistema actual)
INSERT INTO tipos_vehiculo (empresa_id, nombre, orden)
VALUES (empresa_record.id, 'Auto', 1),
    (empresa_record.id, 'Camioneta', 2),
    (empresa_record.id, 'SUV', 3),
    (empresa_record.id, 'Pick-up', 4) ON CONFLICT (empresa_id, nombre) DO NOTHING;
-- TIPOS DE LIMPIEZA (basados en sistema actual de DeltaWash)
INSERT INTO tipos_limpieza (empresa_id, nombre, descripcion, orden)
VALUES (
        empresa_record.id,
        'Lavado Básico',
        'Lavado exterior + secado',
        1
    ),
    (
        empresa_record.id,
        'Lavado Completo',
        'Interior + exterior + aspirado + secado',
        2
    ),
    (
        empresa_record.id,
        'Pulido',
        'Lavado completo + pulido de pintura',
        3
    ),
    (
        empresa_record.id,
        'Encerado',
        'Lavado completo + cera protectora',
        4
    ),
    (
        empresa_record.id,
        'Limpieza de Tapizados',
        'Limpieza profunda de asientos y alfombras',
        5
    ),
    (
        empresa_record.id,
        'Limpieza de Motor',
        'Lavado y desengrase del motor',
        6
    ),
    (
        empresa_record.id,
        'Tratamiento de Faros',
        'Pulido y restauración de faros opacos',
        7
    ),
    (
        empresa_record.id,
        'Limpieza de Chasis',
        'Lavado de parte inferior del vehículo',
        8
    ) ON CONFLICT (empresa_id, nombre) DO NOTHING;
SELECT COUNT(*) INTO tipo_count
FROM tipos_vehiculo
WHERE empresa_id = empresa_record.id;
RAISE NOTICE '  ✅ Tipos de vehículo: %',
tipo_count;
SELECT COUNT(*) INTO tipo_count
FROM tipos_limpieza
WHERE empresa_id = empresa_record.id;
RAISE NOTICE '  ✅ Tipos de limpieza: %',
tipo_count;
END LOOP;
RAISE NOTICE '✅ Datos iniciales insertados para todas las empresas';
END $$;
-- ============================================
-- PASO 5: AGREGAR COLUMNAS A TABLA PRECIOS
-- ============================================
-- Agregar nuevas columnas SIN eliminar las viejas (backward compatible)
ALTER TABLE precios
ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INT REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS tipo_limpieza_id INT REFERENCES tipos_limpieza(id) ON DELETE RESTRICT;
-- RESTRICT previene eliminar tipo si tiene precios asociados (integridad)
COMMENT ON COLUMN precios.tipo_vehiculo_id IS 'Referencia a tipos_vehiculo (nuevo sistema editable)';
COMMENT ON COLUMN precios.tipo_limpieza_id IS 'Referencia a tipos_limpieza (nuevo sistema editable)';
-- Mantener columnas viejas para backward compatibility
-- tipo_vehiculo VARCHAR(50) - MANTENER temporalmente
-- tipo_limpieza VARCHAR(100) - MANTENER temporalmente
-- Columnas agregadas a tabla precios
-- ============================================
-- PASO 6: MIGRAR DATOS EXISTENTES
-- ============================================
-- Conectar precios existentes con las nuevas tablas
DO $$
DECLARE precios_migrados INT;
precios_totales INT;
BEGIN -- Contar precios existentes
SELECT COUNT(*) INTO precios_totales
FROM precios;
RAISE NOTICE '📊 Precios existentes a migrar: %',
precios_totales;
-- Migrar tipo_vehiculo → tipo_vehiculo_id
UPDATE precios p
SET tipo_vehiculo_id = tv.id
FROM tipos_vehiculo tv
WHERE p.empresa_id = tv.empresa_id
    AND p.tipo_vehiculo = tv.nombre
    AND p.tipo_vehiculo_id IS NULL;
GET DIAGNOSTICS precios_migrados = ROW_COUNT;
RAISE NOTICE '  ✅ Vehículos migrados: % precios',
precios_migrados;
-- Migrar tipo_limpieza → tipo_limpieza_id
UPDATE precios p
SET tipo_limpieza_id = tl.id
FROM tipos_limpieza tl
WHERE p.empresa_id = tl.empresa_id
    AND p.tipo_limpieza = tl.nombre
    AND p.tipo_limpieza_id IS NULL;
GET DIAGNOSTICS precios_migrados = ROW_COUNT;
RAISE NOTICE '  ✅ Limpiezas migradas: % precios',
precios_migrados;
RAISE NOTICE '✅ Migración de datos existentes completada';
END $$;
-- ============================================
-- PASO 7: VERIFICACIÓN FINAL
-- ============================================
DO $$
DECLARE precios_sin_vehiculo INT;
precios_sin_limpieza INT;
empresas_count INT;
tipos_v_count INT;
tipos_l_count INT;
BEGIN -- Verificar precios sin IDs
SELECT COUNT(*) INTO precios_sin_vehiculo
FROM precios
WHERE tipo_vehiculo_id IS NULL;
SELECT COUNT(*) INTO precios_sin_limpieza
FROM precios
WHERE tipo_limpieza_id IS NULL;
IF precios_sin_vehiculo > 0 THEN RAISE WARNING '⚠️  Hay % precios sin tipo_vehiculo_id asignado',
precios_sin_vehiculo;
END IF;
IF precios_sin_limpieza > 0 THEN RAISE WARNING '⚠️  Hay % precios sin tipo_limpieza_id asignado',
precios_sin_limpieza;
END IF;
-- Contar registros
SELECT COUNT(*) INTO empresas_count
FROM empresas;
SELECT COUNT(*) INTO tipos_v_count
FROM tipos_vehiculo;
SELECT COUNT(*) INTO tipos_l_count
FROM tipos_limpieza;
RAISE NOTICE '📊 RESUMEN:';
RAISE NOTICE '  - Empresas: %',
empresas_count;
RAISE NOTICE '  - Tipos de vehículo: %',
tipos_v_count;
RAISE NOTICE '  - Tipos de limpieza: %',
tipos_l_count;
RAISE NOTICE '  - Precios sin vehiculo_id: %',
precios_sin_vehiculo;
RAISE NOTICE '  - Precios sin limpieza_id: %',
precios_sin_limpieza;
IF precios_sin_vehiculo = 0
AND precios_sin_limpieza = 0 THEN RAISE NOTICE '✅ ¡MIGRACIÓN EXITOSA! Todos los precios tienen IDs asignados';
END IF;
END $$;
-- ============================================
-- PASO 8: TRIGGER PARA UPDATED_AT
-- ============================================
-- Función para actualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger en tipos_vehiculo
DROP TRIGGER IF EXISTS update_tipos_vehiculo_updated_at ON tipos_vehiculo;
CREATE TRIGGER update_tipos_vehiculo_updated_at BEFORE
UPDATE ON tipos_vehiculo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Trigger en tipos_limpieza
DROP TRIGGER IF EXISTS update_tipos_limpieza_updated_at ON tipos_limpieza;
CREATE TRIGGER update_tipos_limpieza_updated_at BEFORE
UPDATE ON tipos_limpieza FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- Triggers creados
COMMIT;
-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN (Ejecutar manualmente)
-- ============================================
-- Descomentar para verificar después de ejecutar:
/*
 -- Ver tipos de vehículo por empresa
 SELECT e.nombre as empresa, tv.nombre as tipo, tv.orden, tv.activo
 FROM tipos_vehiculo tv
 JOIN empresas e ON tv.empresa_id = e.id
 ORDER BY e.nombre, tv.orden;
 
 -- Ver tipos de limpieza por empresa
 SELECT e.nombre as empresa, tl.nombre as tipo, tl.descripcion, tl.orden, tl.activo
 FROM tipos_limpieza tl
 JOIN empresas e ON tl.empresa_id = e.id
 ORDER BY e.nombre, tl.orden;
 
 -- Ver precios con nombres resueltos
 SELECT 
 e.nombre as empresa,
 tv.nombre as vehiculo,
 tl.nombre as limpieza,
 p.monto
 FROM precios p
 JOIN empresas e ON p.empresa_id = e.id
 LEFT JOIN tipos_vehiculo tv ON p.tipo_vehiculo_id = tv.id
 LEFT JOIN tipos_limpieza tl ON p.tipo_limpieza_id = tl.id
 ORDER BY e.nombre, tv.nombre, tl.nombre;
 
 -- Verificar precios huérfanos (no deberían existir)
 SELECT COUNT(*) as precios_sin_tipo
 FROM precios
 WHERE tipo_vehiculo_id IS NULL OR tipo_limpieza_id IS NULL;
 */
-- ============================================
-- ROLLBACK (Solo si algo sale MAL)
-- ============================================
/*
 BEGIN;
 
 -- Eliminar triggers
 DROP TRIGGER IF EXISTS update_tipos_limpieza_updated_at ON tipos_limpieza;
 DROP TRIGGER IF EXISTS update_tipos_vehiculo_updated_at ON tipos_vehiculo;
 DROP FUNCTION IF EXISTS update_updated_at_column();
 
 -- Eliminar columnas de precios
 ALTER TABLE precios DROP COLUMN IF EXISTS tipo_limpieza_id;
 ALTER TABLE precios DROP COLUMN IF EXISTS tipo_vehiculo_id;
 
 -- Eliminar tablas
 DROP TABLE IF EXISTS tipos_limpieza CASCADE;
 DROP TABLE IF EXISTS tipos_vehiculo CASCADE;
 
 COMMIT;
 
 -- Verificar que todo volvió a estado original
 SELECT table_name FROM information_schema.tables 
 WHERE table_name IN ('tipos_vehiculo', 'tipos_limpieza');
 -- Debería retornar 0 filas
 
 SELECT column_name FROM information_schema.columns 
 WHERE table_name = 'precios' 
 AND column_name IN ('tipo_vehiculo_id', 'tipo_limpieza_id');
 -- Debería retornar 0 filas
 */
-- ============================================
-- FIN DE MIGRACIÓN
-- ============================================
-- 
-- ✅ Próximos pasos:
-- 1. Verificar que la migración se ejecutó correctamente
-- 2. Probar crear/editar/eliminar tipos desde la UI (cuando esté lista)
-- 3. Verificar que precios existentes funcionan correctamente
-- 4. En futuras versiones, deprecar columnas viejas (tipo_vehiculo, tipo_limpieza)
-- 
-- 📚 Documentado en: plans/SPRINT_1_PLAN_IMPLEMENTACION.md
-- ============================================