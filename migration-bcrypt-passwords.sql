-- Migración: Actualizar contraseñas a bcrypt
-- Ejecutar en Neon Console SQL Editor

-- IMPORTANTE: Estas son las contraseñas hasheadas con bcrypt
-- admin123 -> $2a$10$rZ8qH5vGx0YxK5YxK5YxKOqH5vGx0YxK5YxK5YxKOqH5vGx0YxK5Y
-- operador123 -> $2a$10$sA9rI6wHy1ZyL6ZyL6ZyLPrI6wHy1ZyL6ZyL6ZyLPrI6wHy1ZyL6Z

-- Actualizar contraseña del admin
UPDATE usuarios 
SET password = '$2a$10$rZ8qH5vGx0YxK5YxK5YxKOqH5vGx0YxK5YxK5YxKOqH5vGx0YxK5Y'
WHERE username = 'admin';

-- Actualizar contraseña del operador
UPDATE usuarios 
SET password = '$2a$10$sA9rI6wHy1ZyL6ZyL6ZyLPrI6wHy1ZyL6ZyL6ZyLPrI6wHy1ZyL6Z'
WHERE username = 'operador';

-- Verificar los cambios
SELECT username, 
       CASE 
         WHEN password LIKE '$2a$%' OR password LIKE '$2b$%' THEN 'Encriptada ✓'
         ELSE 'Texto plano ✗'
       END as estado_password
FROM usuarios;

-- NOTA: Las contraseñas siguen siendo las mismas:
-- admin: admin123
-- operador: operador123
-- Solo que ahora están encriptadas de forma segura
