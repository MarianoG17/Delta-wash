-- ============================================
-- SCRIPT: Verificar si el UPDATE de contraseña funcionó
-- ============================================
-- Ver el password_hash COMPLETO del usuario ID 95
SELECT id,
    email,
    nombre,
    password_hash,
    -- Completo, no truncado
    LENGTH(password_hash) as hash_length,
    updated_at
FROM usuarios_sistema
WHERE id = 95;
-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- El password_hash debería empezar con: $2a$10$kqVYZ8nX7L9B5h0pE8YfNO
-- El LENGTH debería ser 60 caracteres
-- El updated_at debería ser la fecha/hora reciente de cuando ejecutaste el UPDATE
-- ============================================
-- Si el hash NO es el correcto o el updated_at es antiguo,
-- significa que el UPDATE no se ejecutó.
-- En ese caso, ejecutá esto de nuevo:
UPDATE usuarios_sistema
SET password_hash = '$2a$10$kqVYZ8nX7L9B5h0pE8YfNOQx7G5lE5mU0tKVj6fLQmJwXVF5YqF8S',
    updated_at = NOW()
WHERE id = 95;
-- Y después verificá de nuevo con el SELECT de arriba