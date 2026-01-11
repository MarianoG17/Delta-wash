-- ============================================
-- MIGRACIÓN: Corregir Precios Faltantes
-- ============================================
-- Actualiza registros sin precio basándose en:
-- - tipo_vehiculo
-- - tipo_limpieza
-- ============================================

-- Función para calcular precio según tipo de vehículo y limpieza
-- Precios base por tipo de vehículo
-- auto: 22000, mono: 30000, camioneta: 35000, camioneta_xl: 38000, moto: 15000

-- Actualizar registros de AUTOS
UPDATE registros_lavado
SET precio = CASE
    -- Simple o simple_exterior
    WHEN tipo_limpieza LIKE '%simple%' AND tipo_limpieza NOT LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 22000
    -- Con cera (simple + 2000)
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 24000
    -- Limpieza chasis (simple + 20000)
    WHEN tipo_limpieza LIKE '%limpieza_chasis%' AND tipo_limpieza NOT LIKE '%con_cera%' THEN 42000
    -- Con cera + limpieza chasis (simple + 2000 + 20000)
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza LIKE '%limpieza_chasis%' THEN 44000
    -- Pulido
    WHEN tipo_limpieza LIKE '%pulido%' THEN 22000
    -- Limpieza motor
    WHEN tipo_limpieza LIKE '%limpieza_motor%' THEN 22000
    ELSE 22000
END + COALESCE(extras_valor, 0)
WHERE (precio IS NULL OR precio = 0)
  AND tipo_vehiculo = 'auto'
  AND estado = 'entregado';

-- Actualizar registros de MONOS (SUV)
UPDATE registros_lavado
SET precio = CASE
    WHEN tipo_limpieza LIKE '%simple%' AND tipo_limpieza NOT LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 30000
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 32000
    WHEN tipo_limpieza LIKE '%limpieza_chasis%' AND tipo_limpieza NOT LIKE '%con_cera%' THEN 60000
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza LIKE '%limpieza_chasis%' THEN 62000
    WHEN tipo_limpieza LIKE '%pulido%' THEN 30000
    WHEN tipo_limpieza LIKE '%limpieza_motor%' THEN 30000
    ELSE 30000
END + COALESCE(extras_valor, 0)
WHERE (precio IS NULL OR precio = 0)
  AND tipo_vehiculo = 'mono'
  AND estado = 'entregado';

-- Actualizar registros de CAMIONETAS
UPDATE registros_lavado
SET precio = CASE
    WHEN tipo_limpieza LIKE '%simple%' AND tipo_limpieza NOT LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 35000
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 40000
    WHEN tipo_limpieza LIKE '%limpieza_chasis%' AND tipo_limpieza NOT LIKE '%con_cera%' THEN 70000
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza LIKE '%limpieza_chasis%' THEN 75000
    WHEN tipo_limpieza LIKE '%pulido%' THEN 35000
    WHEN tipo_limpieza LIKE '%limpieza_motor%' THEN 35000
    ELSE 35000
END + COALESCE(extras_valor, 0)
WHERE (precio IS NULL OR precio = 0)
  AND tipo_vehiculo = 'camioneta'
  AND estado = 'entregado';

-- Actualizar registros de CAMIONETAS XL
UPDATE registros_lavado
SET precio = CASE
    WHEN tipo_limpieza LIKE '%simple%' AND tipo_limpieza NOT LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 38000
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza NOT LIKE '%limpieza_chasis%' THEN 42000
    WHEN tipo_limpieza LIKE '%limpieza_chasis%' AND tipo_limpieza NOT LIKE '%con_cera%' THEN 78000
    WHEN tipo_limpieza LIKE '%con_cera%' AND tipo_limpieza LIKE '%limpieza_chasis%' THEN 82000
    WHEN tipo_limpieza LIKE '%pulido%' THEN 38000
    WHEN tipo_limpieza LIKE '%limpieza_motor%' THEN 38000
    ELSE 38000
END + COALESCE(extras_valor, 0)
WHERE (precio IS NULL OR precio = 0)
  AND tipo_vehiculo = 'camioneta_xl'
  AND estado = 'entregado';

-- Actualizar registros de MOTOS
UPDATE registros_lavado
SET precio = 15000 + COALESCE(extras_valor, 0)
WHERE (precio IS NULL OR precio = 0)
  AND tipo_vehiculo = 'moto'
  AND estado = 'entregado';

-- Actualizar registros sin tipo_vehiculo (asumir auto)
UPDATE registros_lavado
SET precio = 22000 + COALESCE(extras_valor, 0),
    tipo_vehiculo = 'auto'
WHERE (precio IS NULL OR precio = 0)
  AND (tipo_vehiculo IS NULL OR tipo_vehiculo = '')
  AND estado = 'entregado';

-- Verificar resultados
SELECT 
    'Registros corregidos' as resultado,
    COUNT(*) as total_corregidos
FROM registros_lavado
WHERE precio > 0 
  AND estado = 'entregado';

SELECT 
    'Registros aún sin precio' as resultado,
    COUNT(*) as total_sin_precio
FROM registros_lavado
WHERE (precio IS NULL OR precio = 0)
  AND estado = 'entregado';

-- Mostrar detalle de registros corregidos por tipo
SELECT 
    tipo_vehiculo,
    COUNT(*) as cantidad,
    AVG(precio) as precio_promedio,
    MIN(precio) as precio_minimo,
    MAX(precio) as precio_maximo
FROM registros_lavado
WHERE precio > 0 
  AND estado = 'entregado'
GROUP BY tipo_vehiculo
ORDER BY tipo_vehiculo;
