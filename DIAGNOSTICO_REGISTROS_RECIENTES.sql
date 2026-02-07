-- DIAGNÓSTICO: Registros recientes y beneficios
-- Ver si se están registrando vehículos con benefit_id

-- 1. Ver los registros más recientes
SELECT 
    id,
    marca_modelo,
    patente,
    nombre_cliente,
    celular,
    precio,
    estado,
    created_at,
    pagado,
    usa_cuenta_corriente
FROM registros_lavado
ORDER BY created_at DESC
LIMIT 20;

-- 2. Ver si hay alguna relación entre registros y beneficios
-- (los beneficios tienen redeemed_visit_id que debería apuntar a un registro)
SELECT 
    b.id as benefit_id,
    b.status,
    b.redeemed_at,
    b.redeemed_visit_id,
    b.discount_percentage,
    s.customer_phone,
    s.customer_name,
    r.id as registro_id,
    r.patente,
    r.created_at as registro_fecha
FROM benefits b
LEFT JOIN surveys s ON s.id = b.survey_id
LEFT JOIN registros_lavado r ON r.id = b.redeemed_visit_id
WHERE s.customer_phone = '1166004684'
ORDER BY b.id DESC;

-- 3. Ver si existe algún campo benefit_id en registros_lavado
-- (esto nos dirá si la tabla tiene o no la columna)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado'
ORDER BY ordinal_position;
