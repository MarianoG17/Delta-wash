-- ============================================
-- MIGRACIÓN: Tipos Editables (Vehículos y Limpieza)
-- Fecha: 2026-02-04
-- Versión: SaaS (Branch per Company)
-- ============================================
-- 
-- ⚠️  ARQUITECTURA:
-- Cada branch = Una empresa
-- NO hay empresa_id (aislamiento por branch)
-- 
-- Ejecutar en: Branch "Lavadero" (LAVAPP)
-- NO ejecutar en: Branch "Deltawash" (Legacy)
-- ============================================
BEGIN;
-- ============================================
-- PASO 1: CREAR TABLA TIPOS DE VEHÍCULO
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tipos_vehiculo_activo ON tipos_vehiculo(activo);
CREATE INDEX IF NOT EXISTS idx_tipos_vehiculo_orden ON tipos_vehiculo(orden);
-- ============================================
-- PASO 2: CREAR TABLA TIPOS DE LIMPIEZA
-- ============================================
CREATE TABLE IF NOT EXISTS tipos_limpieza (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_tipos_limpieza_activo ON tipos_limpieza(activo);
CREATE INDEX IF NOT EXISTS idx_tipos_limpieza_orden ON tipos_limpieza(orden);
-- ============================================
-- PASO 3: INSERTAR DATOS INICIALES
-- ============================================
-- Tipos de Vehículo (basados en sistema actual)
INSERT INTO tipos_vehiculo (nombre, orden)
VALUES ('Auto', 1),
    ('Camioneta', 2),
    ('SUV', 3),
    ('Pick-up', 4) ON CONFLICT (nombre) DO NOTHING;
-- Tipos de Limpieza (basados en sistema actual)
INSERT INTO tipos_limpieza (nombre, descripcion, orden)
VALUES ('Lavado Básico', 'Lavado exterior + secado', 1),
    (
        'Lavado Completo',
        'Interior + exterior + aspirado + secado',
        2
    ),
    (
        'Pulido',
        'Lavado completo + pulido de pintura',
        3
    ),
    (
        'Encerado',
        'Lavado completo + cera protectora',
        4
    ),
    (
        'Limpieza de Tapizados',
        'Limpieza profunda de asientos y alfombras',
        5
    ),
    (
        'Limpieza de Motor',
        'Lavado y desengrase del motor',
        6
    ),
    (
        'Tratamiento de Faros',
        'Pulido y restauración de faros opacos',
        7
    ),
    (
        'Limpieza de Chasis',
        'Lavado de parte inferior del vehículo',
        8
    ) ON CONFLICT (nombre) DO NOTHING;
-- ============================================
-- PASO 4: AGREGAR COLUMNAS A TABLA PRECIOS
-- ============================================
ALTER TABLE precios
ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INT REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
    ADD COLUMN IF NOT EXISTS tipo_limpieza_id INT REFERENCES tipos_limpieza(id) ON DELETE RESTRICT;
-- Mantener columnas viejas para backward compatibility
-- tipo_vehiculo VARCHAR - MANTENER
-- tipo_servicio VARCHAR - MANTENER
-- ============================================
-- PASO 5: MIGRAR DATOS EXISTENTES
-- ============================================
-- Mapear tipo_vehiculo string → tipo_vehiculo_id
UPDATE precios p
SET tipo_vehiculo_id = tv.id
FROM tipos_vehiculo tv
WHERE LOWER(TRIM(p.tipo_vehiculo)) = LOWER(TRIM(tv.nombre))
    AND p.tipo_vehiculo_id IS NULL;
-- Mapear tipo_servicio string → tipo_limpieza_id  
-- Nota: tipo_servicio puede tener valores como 'simple', 'completo', etc.
-- Intentar mapear por similitud
UPDATE precios p
SET tipo_limpieza_id = tl.id
FROM tipos_limpieza tl
WHERE (
        -- Mapeos específicos
        (
            p.tipo_servicio = 'simple'
            AND tl.nombre = 'Lavado Básico'
        )
        OR (
            p.tipo_servicio = 'completo'
            AND tl.nombre = 'Lavado Completo'
        )
        OR (
            p.tipo_servicio = 'pulido'
            AND tl.nombre = 'Pulido'
        )
        OR (
            p.tipo_servicio = 'encerado'
            AND tl.nombre = 'Encerado'
        )
        OR (
            p.tipo_servicio ILIKE '%tapizado%'
            AND tl.nombre = 'Limpieza de Tapizados'
        )
        OR (
            p.tipo_servicio ILIKE '%motor%'
            AND tl.nombre = 'Limpieza de Motor'
        )
        OR (
            p.tipo_servicio ILIKE '%faro%'
            AND tl.nombre = 'Tratamiento de Faros'
        )
        OR (
            p.tipo_servicio ILIKE '%chasis%'
            AND tl.nombre = 'Limpieza de Chasis'
        )
        OR -- Mapeo exacto
        (
            LOWER(TRIM(p.tipo_servicio)) = LOWER(TRIM(tl.nombre))
        )
    )
    AND p.tipo_limpieza_id IS NULL;
-- ============================================
-- PASO 6: TRIGGERS PARA UPDATED_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_tipos_vehiculo_updated_at ON tipos_vehiculo;
CREATE TRIGGER update_tipos_vehiculo_updated_at BEFORE
UPDATE ON tipos_vehiculo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
DROP TRIGGER IF EXISTS update_tipos_limpieza_updated_at ON tipos_limpieza;
CREATE TRIGGER update_tipos_limpieza_updated_at BEFORE
UPDATE ON tipos_limpieza FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================
-- PASO 7: VERIFICACIÓN FINAL
-- ============================================
DO $$
DECLARE tipos_v_count INT;
tipos_l_count INT;
precios_sin_vehiculo INT;
precios_sin_limpieza INT;
precios_totales INT;
BEGIN
SELECT COUNT(*) INTO tipos_v_count
FROM tipos_vehiculo;
SELECT COUNT(*) INTO tipos_l_count
FROM tipos_limpieza;
SELECT COUNT(*) INTO precios_totales
FROM precios;
SELECT COUNT(*) INTO precios_sin_vehiculo
FROM precios
WHERE tipo_vehiculo_id IS NULL;
SELECT COUNT(*) INTO precios_sin_limpieza
FROM precios
WHERE tipo_limpieza_id IS NULL;
RAISE NOTICE '📊 RESUMEN:';
RAISE NOTICE '  - Tipos de vehículo: %',
tipos_v_count;
RAISE NOTICE '  - Tipos de limpieza: %',
tipos_l_count;
RAISE NOTICE '  - Precios totales: %',
precios_totales;
RAISE NOTICE '  - Precios sin vehiculo_id: %',
precios_sin_vehiculo;
RAISE NOTICE '  - Precios sin limpieza_id: %',
precios_sin_limpieza;
IF precios_sin_vehiculo = 0
AND precios_sin_limpieza = 0 THEN RAISE NOTICE '✅ ¡MIGRACIÓN EXITOSA! Todos los precios tienen IDs asignados';
ELSIF precios_totales = 0 THEN RAISE NOTICE '✅ ¡MIGRACIÓN EXITOSA! (No hay precios existentes)';
ELSE RAISE WARNING '⚠️  Hay precios sin IDs asignados - Revisar mapeos';
END IF;
END $$;
COMMIT;
-- ============================================
-- VERIFICACIÓN POST-MIGRACIÓN
-- ============================================
/*
 -- Ver tipos creados
 SELECT * FROM tipos_vehiculo ORDER BY orden;
 SELECT * FROM tipos_limpieza ORDER BY orden;
 
 -- Ver precios con nombres resueltos
 SELECT 
 p.id,
 tv.nombre as vehiculo,
 tl.nombre as limpieza,
 p.precio,
 p.tipo_vehiculo as vehiculo_viejo,
 p.tipo_servicio as servicio_viejo
 FROM precios p
 LEFT JOIN tipos_vehiculo tv ON p.tipo_vehiculo_id = tv.id
 LEFT JOIN tipos_limpieza tl ON p.tipo_limpieza_id = tl.id
 ORDER BY tv.nombre, tl.nombre;
 
 -- Ver precios sin mapear
 SELECT * FROM precios WHERE tipo_vehiculo_id IS NULL OR tipo_limpieza_id IS NULL;
 */
-- ============================================
-- ROLLBACK (Si algo sale mal)
-- ============================================
/*
 BEGIN;
 
 DROP TRIGGER IF EXISTS update_tipos_limpieza_updated_at ON tipos_limpieza;
 DROP TRIGGER IF EXISTS update_tipos_vehiculo_updated_at ON tipos_vehiculo;
 DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
 
 ALTER TABLE precios DROP COLUMN IF EXISTS tipo_limpieza_id;
 ALTER TABLE precios DROP COLUMN IF EXISTS tipo_vehiculo_id;
 
 DROP TABLE IF EXISTS tipos_limpieza CASCADE;
 DROP TABLE IF EXISTS tipos_vehiculo CASCADE;
 
 COMMIT;
 */