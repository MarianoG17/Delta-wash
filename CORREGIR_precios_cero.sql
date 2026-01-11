-- ============================================
-- CORREGIR: Precios en $0
-- ============================================
-- Ejecuta este SQL en el proyecto DeltaWash
-- para actualizar los precios que quedaron en $0
-- ============================================

-- Obtener el ID de la lista estándar
DO $$
DECLARE
  v_lista_id INTEGER;
BEGIN
  SELECT id INTO v_lista_id FROM listas_precios WHERE nombre = 'Lista Estándar';
  
  -- Actualizar precios que están en 0
  UPDATE precios SET precio = 22000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'auto' AND tipo_servicio = 'simple';
  UPDATE precios SET precio = 2000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'auto' AND tipo_servicio = 'con_cera';
  
  UPDATE precios SET precio = 30000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'mono' AND tipo_servicio = 'simple';
  UPDATE precios SET precio = 2000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'mono' AND tipo_servicio = 'con_cera';
  
  UPDATE precios SET precio = 35000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'camioneta' AND tipo_servicio = 'simple';
  UPDATE precios SET precio = 5000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'camioneta' AND tipo_servicio = 'con_cera';
  
  UPDATE precios SET precio = 38000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'camioneta_xl' AND tipo_servicio = 'simple';
  UPDATE precios SET precio = 4000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'camioneta_xl' AND tipo_servicio = 'con_cera';
  
  UPDATE precios SET precio = 15000 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'moto' AND tipo_servicio = 'simple';
  UPDATE precios SET precio = 0 WHERE lista_id = v_lista_id AND tipo_vehiculo = 'moto' AND tipo_servicio = 'con_cera';
  
  RAISE NOTICE 'Precios actualizados correctamente';
END $$;

-- Verificar los precios actualizados
SELECT 
  lp.nombre as lista,
  p.tipo_vehiculo,
  p.tipo_servicio,
  p.precio
FROM precios p
JOIN listas_precios lp ON p.lista_id = lp.id
ORDER BY 
  CASE p.tipo_vehiculo
    WHEN 'auto' THEN 1
    WHEN 'mono' THEN 2
    WHEN 'camioneta' THEN 3
    WHEN 'camioneta_xl' THEN 4
    WHEN 'moto' THEN 5
  END,
  p.tipo_servicio;

-- Resumen
SELECT 'Precios corregidos exitosamente' as resultado;
