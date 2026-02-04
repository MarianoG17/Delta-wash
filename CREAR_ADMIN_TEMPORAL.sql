-- ============================================
-- SCRIPT: Crear un usuario admin temporal para LAVAPP
-- ============================================
-- Base de datos: CENTRAL

-- Ver primero cuál es el empresa_id de LAVAPP
SELECT id, nombre, slug FROM empresas WHERE slug = 'lavapp';
-- Resultado esperado: id (probablemente 37 o similar)

-- PASO 1: Crear nuevo usuario admin temporal
-- IMPORTANTE: Cambiá el valor de empresa_id por el que salió en el SELECT anterior
INSERT INTO usuarios_sistema (
    empresa_id,
    email,
    password_hash,  -- Hash para contraseña "temporal123"
    nombre,
    rol,
    activo,
    created_at,
    updated_at
) VALUES (
    37,  -- ⚠️ CAMBIAR ESTE VALOR por el empresa_id correcto de LAVAPP
    'admin.temp@lavapp.com.ar',
    '$2a$10$xN5rU7mT3yJ9vK2wL6xP5OqZ4cF8dH9eM1bR3sA7fG6tY5pN4kW2.',
    'Admin Temporal',
    'admin',
    true,
    NOW(),
    NOW()
);

-- PASO 2: Verificar que se creó
SELECT 
    id,
    email,
    nombre,
    rol,
    empresa_id,
    activo
FROM usuarios_sistema
WHERE email = 'admin.temp@lavapp.com.ar';

-- ============================================
-- CREDENCIALES DEL NUEVO USUARIO:
-- ============================================
-- Email: admin.temp@lavapp.com.ar
-- Password: temporal123
-- ============================================

-- Después de probar que funciona, podés eliminarlo con:
-- DELETE FROM usuarios_sistema WHERE email = 'admin.temp@lavapp.com.ar';
-- ============================================
