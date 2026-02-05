-- ============================================
-- INSERTAR TIPOS INICIALES
-- ============================================
-- Ejecutar en: Branch de tu empresa en Neon
-- Propósito: Poblar las tablas tipos_vehiculo y tipos_limpieza con los valores actuales del sistema
-- ============================================

-- 1. Insertar tipos de vehículo (según lo que tenés hardcodeado en listas-precios)
INSERT INTO tipos_vehiculo (nombre, orden, activo) VALUES
('auto', 1, true),
('mono', 2, true),
('camioneta', 3, true),
('camioneta_xl', 4, true),
('moto', 5, true)
ON CONFLICT DO NOTHING;

-- 2. Insertar tipos de limpieza (según lo que tenés hardcodeado en listas-precios)
INSERT INTO tipos_limpieza (nombre, orden, activo) VALUES
('simple_exterior', 1, true),
('simple', 2, true),
('con_cera', 3, true),
('pulido', 4, true),
('limpieza_chasis', 5, true),
('limpieza_motor', 6, true)
ON CONFLICT DO NOTHING;

-- 3. Verificar que se insertaron correctamente
SELECT 'Tipos de Vehículo:' as tabla, COUNT(*) as total FROM tipos_vehiculo
UNION ALL
SELECT 'Tipos de Limpieza:', COUNT(*) FROM tipos_limpieza;

-- 4. Ver los datos insertados
SELECT 'VEHÍCULOS' as tipo, id, nombre, orden, activo FROM tipos_vehiculo ORDER BY orden
UNION ALL
SELECT 'LIMPIEZA', id, nombre, orden, activo FROM tipos_limpieza ORDER BY orden;
