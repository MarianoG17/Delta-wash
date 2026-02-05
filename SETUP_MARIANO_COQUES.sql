-- ============================================
-- SETUP COMPLETO PARA BRANCH: mariano-coques
-- ============================================
-- Este script:
-- 1. Crea tablas tipos_vehiculo y tipos_limpieza
-- 2. Amplía el campo tipo_limpieza en registros para soportar múltiples servicios
-- 3. Inserta datos iniciales
-- ============================================

-- PARTE 1: AMPLIAR CAMPO TIPO_LIMPIEZA
-- Esto soluciona el error cuando seleccionas múltiples servicios
ALTER TABLE registros_lavado
ALTER COLUMN tipo_limpieza TYPE VARCHAR(300);

-- PARTE 2: Crear tabla tipos_vehiculo
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTE 3: Crear tabla tipos_limpieza
CREATE TABLE IF NOT EXISTS tipos_limpieza (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PARTE 4: Agregar columnas a tabla precios (si no existen)
DO $$ 
BEGIN
    -- Agregar tipo_vehiculo_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'precios' AND column_name = 'tipo_vehiculo_id'
    ) THEN
        ALTER TABLE precios ADD COLUMN tipo_vehiculo_id INTEGER REFERENCES tipos_vehiculo(id);
    END IF;

    -- Agregar tipo_limpieza_id si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'precios' AND column_name = 'tipo_limpieza_id'
    ) THEN
        ALTER TABLE precios ADD COLUMN tipo_limpieza_id INTEGER REFERENCES tipos_limpieza(id);
    END IF;
END $$;

-- PARTE 5: Insertar tipos de vehículo predeterminados
INSERT INTO tipos_vehiculo (nombre, orden, activo) VALUES
('auto', 1, true),
('mono', 2, true),
('camioneta', 3, true),
('camioneta_xl', 4, true),
('moto', 5, true)
ON CONFLICT (nombre) DO NOTHING;

-- PARTE 6: Insertar tipos de limpieza predeterminados
INSERT INTO tipos_limpieza (nombre, orden, activo) VALUES
('simple_exterior', 1, true),
('simple', 2, true),
('con_cera', 3, true),
('pulido', 4, true),
('limpieza_chasis', 5, true),
('limpieza_motor', 6, true)
ON CONFLICT (nombre) DO NOTHING;

-- PARTE 7: Migrar datos existentes (mapear strings a IDs)
-- Actualizar tipo_vehiculo_id en precios basándose en tipo_vehiculo string
UPDATE precios p
SET tipo_vehiculo_id = tv.id
FROM tipos_vehiculo tv
WHERE p.tipo_vehiculo = tv.nombre
AND p.tipo_vehiculo_id IS NULL;

-- Actualizar tipo_limpieza_id en precios basándose en tipo_servicio string
UPDATE precios p
SET tipo_limpieza_id = tl.id
FROM tipos_limpieza tl
WHERE p.tipo_servicio = tl.nombre
AND p.tipo_limpieza_id IS NULL;

-- PARTE 8: Verificar resultados
SELECT 'Tipos de Vehículo Creados:' as info, COUNT(*) as total FROM tipos_vehiculo
UNION ALL
SELECT 'Tipos de Limpieza Creados:', COUNT(*) FROM tipos_limpieza
UNION ALL
SELECT 'Precios con vehiculo_id:', COUNT(*) FROM precios WHERE tipo_vehiculo_id IS NOT NULL
UNION ALL
SELECT 'Precios con limpieza_id:', COUNT(*) FROM precios WHERE tipo_limpieza_id IS NOT NULL;

-- PARTE 9: Mostrar tipos creados
SELECT '=== TIPOS DE VEHÍCULO ===' as resultado;
SELECT id, nombre, orden, activo FROM tipos_vehiculo ORDER BY orden;

SELECT '=== TIPOS DE LIMPIEZA ===' as resultado;
SELECT id, nombre, orden, activo FROM tipos_limpieza ORDER BY orden;

-- ✅ Script completado
SELECT '✅ Setup completado - Ya podés crear UTV y seleccionar múltiples servicios' as status;
