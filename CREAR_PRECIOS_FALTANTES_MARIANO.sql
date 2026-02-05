-- ============================================
-- CREAR PRECIOS FALTANTES PARA TIPOS NUEVOS
-- ============================================
-- Este script crea filas de precios ($0) para todos los tipos
-- de vehículo que existen pero no tienen precios asignados
-- ============================================

-- PARTE 1: Ver qué tipos existen vs qué tipos tienen precios
SELECT 'Tipos de vehículo en sistema:' as info;
SELECT id, nombre, activo FROM tipos_vehiculo ORDER BY orden;

SELECT 'Tipos con precios existentes:' as info;
SELECT DISTINCT tipo_vehiculo FROM precios;

-- PARTE 2: Crear precios faltantes para todos los tipos de vehículo x servicios
-- Esto creará filas con precio $0 para las combinaciones que faltan
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
SELECT 
    l.id as lista_id,
    tv.nombre as tipo_vehiculo,
    ts.nombre as tipo_servicio,
    0 as precio
FROM 
    listas_precios l
CROSS JOIN 
    tipos_vehiculo tv
CROSS JOIN 
    tipos_limpieza ts
WHERE 
    tv.activo = true 
    AND ts.activo = true
    AND NOT EXISTS (
        SELECT 1 FROM precios p 
        WHERE p.lista_id = l.id 
        AND p.tipo_vehiculo = tv.nombre 
        AND p.tipo_servicio = ts.nombre
    );

-- PARTE 3: Verificar resultados
SELECT 'Total de precios ahora:' as info, COUNT(*) as total FROM precios;

SELECT 'Precios por tipo de vehículo:' as info;
SELECT tipo_vehiculo, COUNT(*) as cantidad_precios 
FROM precios 
GROUP BY tipo_vehiculo 
ORDER BY tipo_vehiculo;

-- ✅ Script completado
SELECT '✅ Precios faltantes creados - Ahora todos los tipos deben aparecer en la tabla' as status;
