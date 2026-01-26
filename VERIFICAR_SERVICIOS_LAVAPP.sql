-- ================================================================
-- VERIFICAR qué servicios están registrados en la lista de precios
-- ================================================================
--
-- Ejecutar en la consola SQL de Neon para el branch de LAVAPP
-- ================================================================
-- Ver todos los servicios únicos que existen
SELECT DISTINCT tipo_servicio
FROM precios
ORDER BY tipo_servicio;
-- Ver la estructura completa de precios
SELECT lista_id,
    tipo_vehiculo,
    tipo_servicio,
    precio
FROM precios
ORDER BY tipo_vehiculo,
    tipo_servicio;
-- Ver cuántos servicios hay por tipo de vehículo
SELECT tipo_vehiculo,
    COUNT(*) as cantidad_servicios
FROM precios
GROUP BY tipo_vehiculo
ORDER BY tipo_vehiculo;