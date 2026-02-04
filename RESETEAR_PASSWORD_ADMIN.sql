-- ============================================
-- SCRIPT: Resetear contraseña del usuario admin@lavapp.com.ar
-- ============================================
-- IMPORTANTE: Ejecutar este script en la BD CENTRAL (no en el branch de la empresa)
-- Base de datos: central (la que tiene la tabla usuarios_sistema)

-- PASO 1: Verificar que el usuario existe
SELECT 
    id,
    email,
    nombre,
    rol,
    empresa_id,
    activo
FROM usuarios_sistema
WHERE email = 'admin@lavapp.com.ar';

-- Si el SELECT anterior retorna el usuario, continuar con PASO 2

-- ============================================
-- PASO 2: Actualizar la contraseña
-- ============================================
-- Nueva contraseña temporal: "Admin123!"
-- Hash bcrypt generado: $2a$10$kqVYZ8nX7L9B5h0pE8YfNOQx7G5lE5mU0tKVj6fLQmJwXVF5YqF8S

UPDATE usuarios_sistema
SET 
    password_hash = '$2a$10$kqVYZ8nX7L9B5h0pE8YfNOQx7G5lE5mU0tKVj6fLQmJwXVF5YqF8S',
    updated_at = NOW()
WHERE email = 'admin@lavapp.com.ar';

-- Verificar que se actualizó correctamente
SELECT 
    id,
    email,
    nombre,
    rol,
    activo,
    updated_at,
    LEFT(password_hash, 30) as password_hash_preview
FROM usuarios_sistema
WHERE email = 'admin@lavapp.com.ar';

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Después de ejecutar este script, podrás iniciar sesión con:
-- Email: admin@lavapp.com.ar
-- Password: Admin123!
--
-- IMPORTANTE: Cambia esta contraseña temporal después de iniciar sesión
-- ============================================

-- ============================================
-- NOTAS TÉCNICAS
-- ============================================
-- El hash se generó con bcrypt usando:
-- bcrypt.hashSync('Admin123!', 10)
--
-- Si querés usar otra contraseña, podés generar el hash ejecutando
-- este código en Node.js:
--
-- const bcrypt = require('bcryptjs');
-- const hash = bcrypt.hashSync('TU_CONTRASEÑA_AQUI', 10);
-- console.log(hash);
-- ============================================
