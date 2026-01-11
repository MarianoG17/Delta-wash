-- ============================================
-- VERIFICAR: Estado de Listas y Precios
-- ============================================
-- Ejecuta este SQL para ver qué hay en la BD
-- ============================================

-- Ver todas las listas de precios
SELECT 'LISTAS DE PRECIOS:' as seccion;
SELECT * FROM listas_precios;

-- Ver todos los precios
SELECT 'PRECIOS ACTUALES:' as seccion;
SELECT 
  p.id,
  lp.nombre as lista,
  p.tipo_vehiculo,
  p.tipo_servicio,
  p.precio
FROM precios p
JOIN listas_precios lp ON p.lista_id = lp.id
ORDER BY 
  lp.nombre,
  CASE p.tipo_vehiculo
    WHEN 'auto' THEN 1
    WHEN 'mono' THEN 2
    WHEN 'camioneta' THEN 3
    WHEN 'camioneta_xl' THEN 4
    WHEN 'moto' THEN 5
  END,
  p.tipo_servicio;

-- Contar precios
SELECT 'RESUMEN:' as seccion;
SELECT 
  COUNT(*) as total_precios,
  COUNT(CASE WHEN precio = 0 THEN 1 END) as precios_en_cero,
  COUNT(CASE WHEN precio > 0 THEN 1 END) as precios_con_valor
FROM precios;
