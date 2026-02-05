-- ============================================
-- SETUP COMPLETO - TIPOS EDITABLES
-- ============================================
-- Ejecutar en: Branch de tu empresa en Neon
-- Este script crea las tablas y inserta los datos iniciales
-- ============================================

-- PASO 1: Crear tabla tipos_vehiculo
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PASO 2: Crear tabla tipos_limpieza
CREATE TABLE IF NOT EXISTS tipos_limpieza (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    orden INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- PASO 3: Agregar columnas a tabla precios (si no existen)
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

-- PASO 4: Insertar tipos de vehículo
INSERT INTO tipos_vehiculo (nombre, orden, activo) VALUES
('auto', 1, true),
('mono', 2, true),
('camioneta', 3, true),
('camioneta_xl', 4, true),
('moto', 5, true)
ON CONFLICT (nombre) DO NOTHING;

-- PASO 5: Insertar tipos de limpieza
INSERT INTO tipos_limpieza (nombre, orden, activo) VALUES
('simple_exterior', 1, true),
('simple', 2, true),
('con_cera', 3, true),
('pulido', 4, true),
('limpieza_chasis', 5, true),
('limpieza_motor', 6, true)
ON CONFLICT (nombre) DO NOTHING;

-- PASO 6: Migrar datos existentes (mapear strings a IDs)
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

-- PASO 7: Verificar resultados
SELECT 'Tipos de Vehículo Creados:' as info, COUNT(*) as total FROM tipos_vehiculo
UNION ALL
SELECT 'Tipos de Limpieza Creados:', COUNT(*) FROM tipos_limpieza
UNION ALL
SELECT 'Precios con vehiculo_id:', COUNT(*) FROM precios WHERE tipo_vehiculo_id IS NOT NULL
UNION ALL
SELECT 'Precios con limpieza_id:', COUNT(*) FROM precios WHERE tipo_limpieza_id IS NOT NULL;

-- PASO 8: Mostrar tipos creados
SELECT '=== TIPOS DE VEHÍCULO ===' as resultado;
SELECT id, nombre, orden, activo FROM tipos_vehiculo ORDER BY orden;

SELECT '=== TIPOS DE LIMPIEZA ===' as resultado;
SELECT id, nombre, orden, activo FROM tipos_limpieza ORDER BY orden;

-- ✅ Script completado
SELECT '✅ Setup completado exitosamente' as status;
