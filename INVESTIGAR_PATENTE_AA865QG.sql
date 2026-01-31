-- ================================================================
-- INVESTIGAR PROBLEMA CON PATENTE AA865QG - DELTA WASH
-- ================================================================
-- Problema reportado: ingresaron lavado + limpieza de motor
-- pero no apareció el servicio de limpieza de motor
-- ================================================================
-- 1. Buscar todos los registros de esta patente
SELECT id,
    patente,
    tipo_vehiculo,
    tipo_limpieza,
    precio,
    fecha,
    estado,
    fecha_entregado,
    empresa_id
FROM registros
WHERE UPPER(patente) = 'AA865QG'
ORDER BY fecha DESC;
-- 2. Ver qué servicios están disponibles en la lista de precios de Delta Wash
-- (necesitamos saber el empresa_id primero, probablemente 37 para Delta Wash)
SELECT DISTINCT p.tipo_servicio,
    p.tipo_vehiculo,
    p.precio,
    lp.nombre as lista_nombre
FROM precios p
    JOIN listas_precios lp ON p.lista_id = lp.id
WHERE lp.empresa_id = 37
ORDER BY p.tipo_vehiculo,
    p.tipo_servicio;
-- 3. Verificar si existe el servicio "limpieza de motor" o similar
SELECT p.tipo_servicio,
    p.tipo_vehiculo,
    p.precio,
    lp.nombre as lista_nombre,
    lp.empresa_id
FROM precios p
    JOIN listas_precios lp ON p.lista_id = lp.id
WHERE lp.empresa_id = 37
    AND (
        LOWER(p.tipo_servicio) LIKE '%motor%'
        OR LOWER(p.tipo_servicio) LIKE '%limpieza%motor%'
    )
ORDER BY p.tipo_vehiculo;
-- 4. Ver todos los tipos de servicio únicos en el sistema
SELECT DISTINCT tipo_servicio
FROM precios
ORDER BY tipo_servicio;
-- 5. Verificar estructura de la tabla registros para entender qué campos hay
-- (comentado porque puede fallar en algunas versiones)
-- SELECT column_name, data_type, character_maximum_length
-- FROM information_schema.columns
-- WHERE table_name = 'registros'
-- ORDER BY ordinal_position;
-- ================================================================
-- NOTAS IMPORTANTES:
-- ================================================================
-- - El campo "tipo_limpieza" en la tabla registros solo almacena UN servicio
-- - Si intentan registrar múltiples servicios (lavado + limpieza motor),
--   solo se guarda uno en ese campo
-- - Posible causa: el sistema actual NO soporta múltiples servicios por registro
-- ================================================================