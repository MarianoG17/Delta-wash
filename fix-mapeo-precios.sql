-- ============================================
-- FIX: Mapeo de Precios a Tipos
-- Fecha: 2026-02-04
-- Propósito: Mapear precios existentes a tipos_vehiculo y tipos_limpieza
-- ============================================
BEGIN;
-- ============================================
-- PASO 1: AGREGAR TIPOS DE VEHÍCULO FALTANTES
-- ============================================
INSERT INTO tipos_vehiculo (nombre, orden)
VALUES ('Mono', 5),
    ('Moto', 6),
    ('Camioneta XL', 7) ON CONFLICT (nombre) DO NOTHING;
-- ============================================
-- PASO 2: AGREGAR TIPOS DE LIMPIEZA FALTANTES
-- ============================================
INSERT INTO tipos_limpieza (nombre, descripcion, orden)
VALUES (
        'Lavado Simple Exterior',
        'Lavado exterior sin aspirado',
        9
    ),
    ('Lavado Simple', 'Lavado básico completo', 10),
    (
        'Camioneta XL Simple',
        'Lavado simple para vehículos XL',
        11
    ),
    (
        'Camioneta XL Simple Exterior',
        'Lavado exterior para vehículos XL',
        12
    ),
    (
        'Camioneta XL Pulido',
        'Pulido para vehículos XL',
        13
    ),
    (
        'Camioneta XL Encerado',
        'Encerado para vehículos XL',
        14
    ) ON CONFLICT (nombre) DO NOTHING;
-- ============================================
-- PASO 3: MAPEAR TIPOS DE VEHÍCULO
-- ============================================
-- auto → Auto
UPDATE precios
SET tipo_vehiculo_id = (
        SELECT id
        FROM tipos_vehiculo
        WHERE nombre = 'Auto'
    )
WHERE LOWER(tipo_vehiculo) = 'auto'
    AND tipo_vehiculo_id IS NULL;
-- camioneta → Camioneta
UPDATE precios
SET tipo_vehiculo_id = (
        SELECT id
        FROM tipos_vehiculo
        WHERE nombre = 'Camioneta'
    )
WHERE LOWER(tipo_vehiculo) = 'camioneta'
    AND tipo_vehiculo_id IS NULL;
-- camioneta_xl → Camioneta XL
UPDATE precios
SET tipo_vehiculo_id = (
        SELECT id
        FROM tipos_vehiculo
        WHERE nombre = 'Camioneta XL'
    )
WHERE LOWER(tipo_vehiculo) = 'camioneta_xl'
    AND tipo_vehiculo_id IS NULL;
-- mono → Mono
UPDATE precios
SET tipo_vehiculo_id = (
        SELECT id
        FROM tipos_vehiculo
        WHERE nombre = 'Mono'
    )
WHERE LOWER(tipo_vehiculo) = 'mono'
    AND tipo_vehiculo_id IS NULL;
-- moto → Moto
UPDATE precios
SET tipo_vehiculo_id = (
        SELECT id
        FROM tipos_vehiculo
        WHERE nombre = 'Moto'
    )
WHERE LOWER(tipo_vehiculo) = 'moto'
    AND tipo_vehiculo_id IS NULL;
-- ============================================
-- PASO 4: MAPEAR TIPOS DE LIMPIEZA
-- ============================================
-- simple_exterior → Lavado Simple Exterior
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Lavado Simple Exterior'
    )
WHERE tipo_servicio = 'simple_exterior'
    AND tipo_limpieza_id IS NULL;
-- simple → Lavado Simple
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Lavado Simple'
    )
WHERE tipo_servicio = 'simple'
    AND tipo_limpieza_id IS NULL;
-- con_cera → Encerado
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Encerado'
    )
WHERE tipo_servicio = 'con_cera'
    AND tipo_limpieza_id IS NULL;
-- pulido → Pulido
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Pulido'
    )
WHERE tipo_servicio = 'pulido'
    AND tipo_limpieza_id IS NULL;
-- limpieza_chasis → Limpieza de Chasis
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Limpieza de Chasis'
    )
WHERE tipo_servicio = 'limpieza_chasis'
    AND tipo_limpieza_id IS NULL;
-- limpieza_motor → Limpieza de Motor
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Limpieza de Motor'
    )
WHERE tipo_servicio = 'limpieza_motor'
    AND tipo_limpieza_id IS NULL;
-- xl_simple → Camioneta XL Simple
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Camioneta XL Simple'
    )
WHERE tipo_servicio = 'xl_simple'
    AND tipo_limpieza_id IS NULL;
-- xl_simple_exterior → Camioneta XL Simple Exterior
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Camioneta XL Simple Exterior'
    )
WHERE tipo_servicio = 'xl_simple_exterior'
    AND tipo_limpieza_id IS NULL;
-- xl_pulido → Camioneta XL Pulido
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Camioneta XL Pulido'
    )
WHERE tipo_servicio = 'xl_pulido'
    AND tipo_limpieza_id IS NULL;
-- xl_con_cera → Camioneta XL Encerado
UPDATE precios
SET tipo_limpieza_id = (
        SELECT id
        FROM tipos_limpieza
        WHERE nombre = 'Camioneta XL Encerado'
    )
WHERE tipo_servicio = 'xl_con_cera'
    AND tipo_limpieza_id IS NULL;
-- ============================================
-- PASO 5: VERIFICACIÓN FINAL
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
RAISE NOTICE '📊 RESUMEN DESPUÉS DE FIX:';
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
AND precios_sin_limpieza = 0 THEN RAISE NOTICE '✅ ¡FIX EXITOSO! Todos los precios tienen IDs asignados';
ELSE RAISE WARNING '⚠️  Todavía hay precios sin IDs asignados';
END IF;
END $$;
COMMIT;
-- ============================================
-- VERIFICACIÓN POST-FIX
-- ============================================
/*
 -- Ver todos los precios con nombres resueltos
 SELECT 
 p.id,
 p.tipo_vehiculo as vehiculo_codigo,
 tv.nombre as vehiculo_nombre,
 p.tipo_servicio as servicio_codigo,
 tl.nombre as limpieza_nombre,
 p.precio
 FROM precios p
 LEFT JOIN tipos_vehiculo tv ON p.tipo_vehiculo_id = tv.id
 LEFT JOIN tipos_limpieza tl ON p.tipo_limpieza_id = tl.id
 ORDER BY tv.nombre, tl.nombre;
 
 -- Verificar que NO hay precios sin mapear
 SELECT COUNT(*) as sin_mapear
 FROM precios 
 WHERE tipo_vehiculo_id IS NULL OR tipo_limpieza_id IS NULL;
 -- Debería retornar 0
 */