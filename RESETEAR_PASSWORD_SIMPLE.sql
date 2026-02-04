-- ============================================
-- SCRIPT: Resetear contraseña a "password" (simple para testing)
-- ============================================
-- Usuario ID: 95 (admin@lavapp.com.ar)

-- Hash bcrypt CONOCIDO Y TESTEADO para la contraseña "password"
-- Este hash fue generado y probado exitosamente

UPDATE usuarios_sistema
SET 
    password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    updated_at = NOW()
WHERE id = 95;

-- Verificar
SELECT 
    id,
    email,
    nombre,
    LEFT(password_hash, 60) as password_hash,
    updated_at
FROM usuarios_sistema
WHERE id = 95;

-- ============================================
-- DESPUÉS DE EJECUTAR:
-- ============================================
-- Probá loguearte con:
-- Email: admin@lavapp.com.ar
-- Password: password
-- ============================================

-- Si funciona, después podés cambiarla a algo más seguro
-- ============================================
