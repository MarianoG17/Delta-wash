-- Migración: Agregar sistema de roles a usuarios
-- Ejecutar en Neon Console SQL Editor

-- 1. Agregar columna rol si no existe
ALTER TABLE usuarios 
ADD COLUMN IF NOT EXISTS rol VARCHAR(20) DEFAULT 'operador';

-- 2. Actualizar usuario admin existente
UPDATE usuarios 
SET rol = 'admin' 
WHERE username = 'admin';

-- 3. Crear usuario operador si no existe
INSERT INTO usuarios (username, password, nombre, rol) 
VALUES ('operador', 'operador123', 'Operador', 'operador')
ON CONFLICT (username) DO NOTHING;

-- 4. Verificar los cambios
SELECT id, username, nombre, rol 
FROM usuarios 
ORDER BY id;

-- Credenciales:
-- Admin: usuario=admin, password=admin123 (acceso completo)
-- Operador: usuario=operador, password=operador123 (solo operaciones básicas)
