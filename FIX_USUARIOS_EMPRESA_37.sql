-- ============================================================================
-- FIX: Sincronizar usuarios de empresa 37 en el branch dedicado
-- Ejecutar este script en la consola de Neon (SQL Editor del branch de empresa 37)
-- ============================================================================

-- PASO 1: Ver qué usuarios tiene actualmente el branch (para debugging)
SELECT id, email, nombre, rol, activo FROM usuarios ORDER BY id;

-- Si la tabla está vacía o falta tu usuario ID 73, continuar con PASO 2

-- ============================================================================
-- PASO 2: Insertar usuarios desde BD Central al branch
-- NOTA: Estos son los usuarios que deberían estar en BD Central para empresa 37
-- Ajustar los valores según lo que realmente tengas en BD Central
-- ============================================================================

-- Usuario Admin (ID 73) - AJUSTAR password_hash con el real
-- Para obtener el password_hash real, consultar en BD Central:
-- SELECT id, email, password_hash, nombre, rol FROM usuarios_sistema WHERE empresa_id = 37;

-- Insertar Usuario Admin (ID 73)
INSERT INTO usuarios (id, email, password_hash, nombre, rol, activo, fecha_creacion)
VALUES (
  73,
  'tu_email@ejemplo.com', -- ⚠️ REEMPLAZAR con tu email real
  '$2a$10$PLACEHOLDER', -- ⚠️ REEMPLAZAR con password_hash real de BD Central
  'Nombre Empresa 37', -- ⚠️ REEMPLAZAR con tu nombre real
  'admin',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo;

-- Insertar Usuario Operador Demo (si existe en BD Central)
-- Consultar BD Central primero para obtener el ID y password_hash correcto
INSERT INTO usuarios (id, email, password_hash, nombre, rol, activo, fecha_creacion)
VALUES (
  74, -- ⚠️ VERIFICAR ID correcto en BD Central
  'operador@tuslug.demo', -- ⚠️ REEMPLAZAR con email correcto
  '$2a$10$PLACEHOLDER', -- ⚠️ REEMPLAZAR con password_hash real
  'Operador Demo',
  'operador',
  true,
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo;

-- ============================================================================
-- PASO 3: Actualizar la secuencia de IDs para evitar conflictos futuros
-- ============================================================================

-- Obtener el máximo ID actual
SELECT setval('usuarios_id_seq', (SELECT MAX(id) FROM usuarios));

-- ============================================================================
-- PASO 4: Verificar que se insertaron correctamente
-- ============================================================================

SELECT id, email, nombre, rol, activo, fecha_creacion 
FROM usuarios 
ORDER BY id;

-- Deberías ver tu usuario ID 73 y cualquier otro usuario de la empresa 37

-- ============================================================================
-- ALTERNATIVA: Script más simple sin placeholders (si conocés tus datos)
-- ============================================================================

-- Si ya tenés los valores exactos de BD Central, podés usar este formato:

/*
-- Ejemplo completo (REEMPLAZAR todos los valores con los reales):
INSERT INTO usuarios (id, email, password_hash, nombre, rol, activo, fecha_creacion)
VALUES 
  (73, 'admin@empresa37.com', '$2a$10$abcdef123456...', 'Admin Empresa 37', 'admin', true, NOW()),
  (74, 'operador@empresa37.demo', '$2a$10$ghijkl789012...', 'Operador Demo', 'operador', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo;

SELECT setval('usuarios_id_seq', 74);
*/
