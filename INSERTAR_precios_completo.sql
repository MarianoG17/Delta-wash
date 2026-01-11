-- ============================================
-- INSERTAR: Precios Completos
-- ============================================
-- Este script elimina e inserta todos los precios
-- ============================================

-- Primero, eliminar todos los precios existentes de la lista estándar
DELETE FROM precios 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar');

-- Ahora insertar los precios correctos
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
VALUES
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'auto', 'simple', 22000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'auto', 'con_cera', 2000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'mono', 'simple', 30000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'mono', 'con_cera', 2000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'camioneta', 'simple', 35000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'camioneta', 'con_cera', 5000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'camioneta_xl', 'simple', 38000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'camioneta_xl', 'con_cera', 4000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'moto', 'simple', 15000),
  ((SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'), 'moto', 'con_cera', 0);

-- Verificar resultados
SELECT 'Precios insertados correctamente' as resultado;

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
