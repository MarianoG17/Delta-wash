-- ============================================
-- SCRIPT: Diagnóstico de usuario admin@lavapp.com.ar
-- ============================================
-- IMPORTANTE: Ejecutar en la BD CENTRAL

-- PASO 1: Ver TODOS los usuarios de la empresa LAVAPP
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.rol,
    u.activo,
    u.empresa_id,
    e.nombre as empresa_nombre,
    e.slug as empresa_slug,
    e.estado as empresa_estado,
    e.fecha_expiracion,
    LEFT(u.password_hash, 40) as password_hash_preview,
    u.created_at,
    u.updated_at
FROM usuarios_sistema u
INNER JOIN empresas e ON u.empresa_id = e.id
WHERE e.slug = 'lavapp'  -- O el slug que corresponda
ORDER BY u.id;

-- PASO 2: Buscar si existe un usuario con ese email específico
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.rol,
    u.activo,
    u.empresa_id,
    e.nombre as empresa_nombre,
    LEFT(u.password_hash, 40) as password_hash_preview,
    u.updated_at
FROM usuarios_sistema u
LEFT JOIN empresas e ON u.empresa_id = e.id
WHERE u.email = 'admin@lavapp.com.ar';

-- PASO 3: Ver TODOS los usuarios del sistema (para verificar el email correcto)
SELECT 
    u.id,
    u.email,
    u.nombre,
    u.rol,
    e.nombre as empresa_nombre,
    e.slug as empresa_slug
FROM usuarios_sistema u
LEFT JOIN empresas e ON u.empresa_id = e.id
ORDER BY u.id DESC
LIMIT 20;

-- ============================================
-- INSTRUCCIONES:
-- ============================================
-- 1. Ejecutá este script completo
-- 2. Copiá el resultado de PASO 2 o PASO 3
-- 3. Mandame el resultado para verificar:
--    - Si el email es correcto
--    - Si el password_hash se actualizó
--    - Cuál es tu empresa_id
-- ============================================
