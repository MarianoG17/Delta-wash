-- ============================================
-- SCRIPT: Extender período de prueba de LAVAPP
-- ============================================
-- IMPORTANTE: Ejecutar este script en la BD CENTRAL (no en el branch de la empresa)
-- Base de datos: central (la que tiene la tabla empresas)

-- PASO 1: Verificar el estado actual de la empresa
SELECT 
    id,
    nombre,
    slug,
    plan,
    estado,
    created_at,
    fecha_expiracion,
    CASE 
        WHEN fecha_expiracion < NOW() THEN 'VENCIDO'
        ELSE 'ACTIVO'
    END as estado_actual,
    EXTRACT(DAY FROM (fecha_expiracion - NOW())) as dias_restantes
FROM empresas
WHERE slug = 'lavapp'  -- O el slug que uses para tu empresa
ORDER BY id;

-- Si no sale ningún resultado, probar con:
-- SELECT * FROM empresas WHERE nombre ILIKE '%lavapp%';

-- ============================================
-- PASO 2: Extender el período de prueba por 90 días más
-- ============================================
UPDATE empresas
SET 
    fecha_expiracion = NOW() + INTERVAL '90 days',
    estado = 'activo',
    updated_at = NOW()
WHERE slug = 'lavapp';  -- O el slug que corresponda

-- Si querés extender por otro período, podés cambiar '90 days' por:
-- '30 days'  = 1 mes
-- '180 days' = 6 meses
-- '365 days' = 1 año

-- ============================================
-- PASO 3: Verificar que se actualizó correctamente
-- ============================================
SELECT 
    id,
    nombre,
    slug,
    plan,
    estado,
    created_at,
    fecha_expiracion,
    EXTRACT(DAY FROM (fecha_expiracion - NOW())) as dias_restantes_ahora,
    updated_at
FROM empresas
WHERE slug = 'lavapp'
ORDER BY id;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Después de ejecutar este script:
-- - fecha_expiracion: será NOW() + 90 días
-- - estado: 'activo'
-- - dias_restantes_ahora: ~90
--
-- Podrás iniciar sesión normalmente en https://lavapp-pi.vercel.app/login-saas
-- ============================================

-- ============================================
-- ALTERNATIVA: Hacer el plan "ilimitado" (para testing)
-- ============================================
-- Si estás en desarrollo/testing y querés no tener límite de tiempo:
-- Ejecutá esto en lugar del UPDATE anterior:

-- UPDATE empresas
-- SET 
--     fecha_expiracion = '2099-12-31 23:59:59',
--     estado = 'activo',
--     plan = 'desarrollo',
--     updated_at = NOW()
-- WHERE slug = 'lavapp';

-- ============================================
-- ALTERNATIVA: Si no sabés el slug, buscar primero
-- ============================================
-- Si no estás seguro del slug de tu empresa:

-- SELECT id, nombre, slug, estado, fecha_expiracion 
-- FROM empresas 
-- ORDER BY id;

-- Y después usar el slug correcto en el UPDATE
