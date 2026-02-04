-- ============================================
-- SCRIPT COMPLETO: Arreglar LAVAPP para que puedas entrar
-- ============================================
-- Base de datos: CENTRAL

-- PASO 1: Ver TODAS las empresas y encontrar LAVAPP
SELECT 
    id,
    nombre,
    slug,
    estado,
    fecha_expiracion,
    CASE 
        WHEN fecha_expiracion < NOW() THEN '❌ VENCIDO'
        WHEN fecha_expiracion > NOW() THEN '✅ ACTIVO'
    END as estado_periodo
FROM empresas
ORDER BY id DESC
LIMIT 10;

-- PASO 2: Extender el período de TODAS las empresas que se llamen LAVAPP o similar
-- (por si el slug no es exactamente 'lavapp')
UPDATE empresas
SET 
    fecha_expiracion = '2099-12-31 23:59:59',
    estado = 'activo',
    updated_at = NOW()
WHERE LOWER(nombre) LIKE '%lavapp%' 
   OR LOWER(slug) LIKE '%lavapp%';

-- PASO 3: Verificar que se actualizó
SELECT 
    id,
    nombre,
    slug,
    estado,
    fecha_expiracion,
    '✅ DEBERÍA ESTAR ACTIVO AHORA' as resultado
FROM empresas
WHERE LOWER(nombre) LIKE '%lavapp%' 
   OR LOWER(slug) LIKE '%lavapp%';

-- ============================================
-- AHORA PROBÁ LOGUEARTE CON:
-- ============================================
-- Email: admin.temp@lavapp.com.ar
-- Password: temporal123
-- ============================================
-- O con tu usuario original:
-- Email: admin@lavapp.com.ar  
-- Password: (la que tenías originalmente, porque los resets no funcionaron)
-- ============================================
