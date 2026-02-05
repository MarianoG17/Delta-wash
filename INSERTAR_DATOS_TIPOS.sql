-- ============================================
-- INSERTAR DATOS EN TIPOS (Solo datos, sin crear tablas)
-- ============================================
-- Ejecutar en: Branch de tu empresa en Neon
-- ============================================
-- Insertar tipos de vehículo
INSERT INTO tipos_vehiculo (nombre, orden, activo)
VALUES ('auto', 1, true),
    ('mono', 2, true),
    ('camioneta', 3, true),
    ('camioneta_xl', 4, true),
    ('moto', 5, true) ON CONFLICT (nombre) DO NOTHING;
-- Insertar tipos de limpieza
INSERT INTO tipos_limpieza (nombre, orden, activo)
VALUES ('simple_exterior', 1, true),
    ('simple', 2, true),
    ('con_cera', 3, true),
    ('pulido', 4, true),
    ('limpieza_chasis', 5, true),
    ('limpieza_motor', 6, true) ON CONFLICT (nombre) DO NOTHING;
-- Verificar
SELECT 'Vehículos insertados:' as info,
    COUNT(*) as total
FROM tipos_vehiculo;
SELECT 'Limpieza insertados:' as info,
    COUNT(*) as total
FROM tipos_limpieza;
-- Mostrar datos
SELECT *
FROM tipos_vehiculo
ORDER BY orden;
SELECT *
FROM tipos_limpieza
ORDER BY orden;