-- ============================================================================
-- PASO 1: Ejecutar este script en BD CENTRAL (CENTRAL_DB_URL)
-- Para obtener los datos de tu empresa ID 37
-- ============================================================================

-- Ver todas las empresas para confirmar tu empresa existe
SELECT id, nombre, slug, branch_name, estado, fecha_creacion 
FROM empresas 
WHERE id = 37 OR slug LIKE '%prueba%' OR slug LIKE '%37%'
ORDER BY id DESC;

-- Ver todos los usuarios de tu empresa (ID 37)
SELECT 
  id,
  empresa_id,
  email,
  password_hash,
  nombre,
  rol,
  activo,
  fecha_creacion
FROM usuarios_sistema
WHERE empresa_id = 37
ORDER BY id ASC;

-- ============================================================================
-- RESULTADO ESPERADO:
-- Deberías ver algo como:
-- 
-- id  | empresa_id | email              | password_hash               | nombre      | rol   
-- ----|------------|--------------------|-----------------------------|-------------|-------
-- 73  | 37         | tu@email.com       | $2a$10$abc123...          | Tu Nombre   | admin
-- 74  | 37         | operador@slug.demo | $2a$10$def456...          | Operador    | operador
-- 
-- COPIAR estos valores para usarlos en el siguiente paso
-- ============================================================================


-- ============================================================================
-- BONUS: Ver información completa de la empresa para debugging
-- ============================================================================

SELECT 
  e.id as empresa_id,
  e.nombre as empresa_nombre,
  e.slug,
  e.branch_name,
  e.branch_url,
  e.plan,
  e.estado,
  COUNT(u.id) as usuarios_en_central,
  e.fecha_creacion
FROM empresas e
LEFT JOIN usuarios_sistema u ON u.empresa_id = e.id
WHERE e.id = 37
GROUP BY e.id, e.nombre, e.slug, e.branch_name, e.branch_url, e.plan, e.estado, e.fecha_creacion;
