-- Migración: Cambiar usuario operador a deltawash
-- Fecha: 2026-01-09

-- Actualizar el usuario operador existente
UPDATE usuarios
SET username = 'deltawash',
    nombre = 'DeltaWash',
    password = 'gustavo2026'
WHERE username = 'operador';

-- Si no existe, crear el usuario deltawash
INSERT INTO usuarios (username, password, nombre, rol)
VALUES ('deltawash', 'gustavo2026', 'DeltaWash', 'operador')
ON CONFLICT (username) DO NOTHING;
