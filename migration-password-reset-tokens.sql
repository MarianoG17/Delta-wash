-- ============================================
-- MIGRACIÓN: Sistema de recupero de contraseña
-- ============================================
-- Base de datos: CENTRAL (donde están los usuarios_sistema)
-- Ejecutar SOLO UNA VEZ
-- Crear tabla para tokens de reseteo de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES usuarios_sistema(id) ON DELETE CASCADE,
    token VARCHAR(100) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    -- Índices para búsquedas rápidas
    INDEX idx_token (token),
    INDEX idx_user_id (user_id),
    INDEX idx_expires_at (expires_at)
);
-- Comentarios para documentación
COMMENT ON TABLE password_reset_tokens IS 'Tokens de un solo uso para recuperación de contraseña';
COMMENT ON COLUMN password_reset_tokens.token IS 'Token único enviado por email (UUID v4)';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Token válido por 1 hora desde creación';
COMMENT ON COLUMN password_reset_tokens.used IS 'Marca si el token ya fue usado';
-- Verificar que se creó correctamente
SELECT table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'password_reset_tokens'
ORDER BY ordinal_position;
-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Se creó la tabla password_reset_tokens con:
-- - id (SERIAL)
-- - user_id (INTEGER)
-- - token (VARCHAR)
-- - expires_at (TIMESTAMP)
-- - used (BOOLEAN)
-- - used_at (TIMESTAMP)
-- - created_at (TIMESTAMP)
-- ============================================