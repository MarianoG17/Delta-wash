-- ============================================
-- ACTUALIZAR: Precios Directamente
-- ============================================
-- Script simplificado sin variables
-- ============================================

-- Actualizar precios directamente usando el nombre de la lista
UPDATE precios 
SET precio = 22000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'auto' 
  AND tipo_servicio = 'simple';

UPDATE precios 
SET precio = 2000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'auto' 
  AND tipo_servicio = 'con_cera';

UPDATE precios 
SET precio = 30000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'mono' 
  AND tipo_servicio = 'simple';

UPDATE precios 
SET precio = 2000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'mono' 
  AND tipo_servicio = 'con_cera';

UPDATE precios 
SET precio = 35000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'camioneta' 
  AND tipo_servicio = 'simple';

UPDATE precios 
SET precio = 5000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'camioneta' 
  AND tipo_servicio = 'con_cera';

UPDATE precios 
SET precio = 38000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'camioneta_xl' 
  AND tipo_servicio = 'simple';

UPDATE precios 
SET precio = 4000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'camioneta_xl' 
  AND tipo_servicio = 'con_cera';

UPDATE precios 
SET precio = 15000 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'moto' 
  AND tipo_servicio = 'simple';

UPDATE precios 
SET precio = 0 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar') 
  AND tipo_vehiculo = 'moto' 
  AND tipo_servicio = 'con_cera';

-- Verificar resultados
SELECT 'Precios actualizados:' as resultado;
SELECT 
  tipo_vehiculo,
  tipo_servicio,
  precio
FROM precios
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar')
ORDER BY 
  CASE tipo_vehiculo
    WHEN 'auto' THEN 1
    WHEN 'mono' THEN 2
    WHEN 'camioneta' THEN 3
    WHEN 'camioneta_xl' THEN 4
    WHEN 'moto' THEN 5
  END,
  tipo_servicio;
