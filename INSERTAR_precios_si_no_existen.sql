-- ============================================
-- INSERTAR: Precios si no existen
-- ============================================
-- Este script inserta los precios si no existen
-- o los actualiza si ya existen
-- ============================================

-- Primero, eliminar todos los precios existentes de la lista estándar
DELETE FROM precios 
WHERE lista_id = (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar');

-- Ahora insertar los precios correctos
INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
SELECT 
  (SELECT id FROM listas_precios WHERE nombre = 'Lista Estándar'),
  tipo_vehiculo,
  tipo_servicio,
  precio
FROM (VALUES
  ('auto', 'simple', 22000),
