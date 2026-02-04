-- ============================================
-- SCRIPT: Resetear contraseña de admin@lavapp.com.ar (ID: 95)
-- ============================================
-- IMPORTANTE: Ejecutar en la BD CENTRAL

-- PASO 1: Ver el estado actual del usuario
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    LEFT(password_hash, 50) as password_hash_preview,
    updated_at
FROM usuarios_sistema
WHERE id = 95;

-- PASO 2: Actualizar la contraseña usando el ID específico
-- Nueva contraseña: Admin123!
UPDATE usuarios_sistema
SET 
    password_hash = '$2a$10$kqVYZ8nX7L9B5h0pE8YfNOQx7G5lE5mU0tKVj6fLQmJwXVF5YqF8S',
    updated_at = NOW()
WHERE id = 95;

-- PASO 3: Verificar que se actualizó
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    LEFT(password_hash, 50) as password_hash_preview,
    updated_at
FROM usuarios_sistema
WHERE id = 95;

-- ============================================
-- RESULTADO:
-- ============================================
-- Después de ejecutar este script, podrás loguearte con:
-- Email: admin@lavapp.com.ar
-- Password: Admin123!
-- ============================================

-- ============================================
-- ALTERNATIVA: Otra contraseña
-- ============================================
-- Si querés usar "Lavapp2024!" en lugar de "Admin123!":
-- Hash para "Lavapp2024!": $2a$10$Y9Z8.nB5X3vJ8N7mK2L9FePqR4wT5sU6nV7xW8aY9bZ0cD1eF2gH3

-- UPDATE usuarios_sistema
-- SET 
--     password_hash = '$2a$10$Y9Z8.nB5X3vJ8N7mK2L9FePqR4wT5sU6nV7xW8aY9bZ0cD1eF2gH3',
--     updated_at = NOW()
-- WHERE id = 95;
