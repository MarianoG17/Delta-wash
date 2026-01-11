-- ============================================
-- AGREGAR: Limpieza de Chasis a Lista de Precios
-- ============================================
-- Agrega el servicio de limpieza de chasis
-- ============================================

-- Insertar precios de limpieza de chasis para cada tipo de vehículo
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
VALUES
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'auto', 'limpieza_chasis', 20000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'mono', 'limpieza_chasis', 30000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'camioneta', 'limpieza_chasis', 35000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'camioneta_xl', 'limpieza_chasis', 40000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'moto', 'limpieza_chasis', 0)
ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) 
DO UPDATE SET precio = EXCLUDED.precio;

-- Verificar resultados
SELECT 'Precios de limpieza de chasis agregados' as resultado;

SELECT 
  tipo_vehiculo,
  tipo_servicio,
  precio
FROM precios
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar')
  AND tipo_servicio = 'limpieza_chasis'
ORDER BY 
  CASE tipo_vehiculo
    WHEN 'auto' THEN 1
    WHEN 'mono' THEN 2
    WHEN 'camioneta' THEN 3
    WHEN 'camioneta_xl' THEN 4
    WHEN 'moto' THEN 5
  END;
