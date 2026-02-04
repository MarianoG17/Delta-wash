-- ============================================
-- SCRIPT: Limpiar cuentas de prueba/testing
-- ============================================
-- Base de datos: CENTRAL
-- IMPORTANTE: NO borrar las TABLAS, solo los REGISTROS de prueba
-- ⚠️⚠️⚠️ ADVERTENCIA ⚠️⚠️⚠️
-- Este script ELIMINA DATOS PERMANENTEMENTE
-- Ejecutar SOLO si estás seguro
-- Hacer BACKUP antes si tenés datos importantes
-- ⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️
-- ============================================
-- PASO 1: Ver qué cuentas existen antes de borrar
-- ============================================
SELECT e.id as empresa_id,
    e.nombre as empresa_nombre,
    e.slug,
    e.estado,
    e.plan,
    COUNT(u.id) as cantidad_usuarios,
    e.created_at
FROM empresas e
    LEFT JOIN usuarios_sistema u ON e.id = u.empresa_id
GROUP BY e.id,
    e.nombre,
    e.slug,
    e.estado,
    e.plan,
    e.created_at
ORDER BY e.created_at DESC;
-- ============================================
-- PASO 2: Ver todos los usuarios
-- ============================================
SELECT u.id,
    u.email,
    u.nombre,
    u.rol,
    e.nombre as empresa_nombre,
    e.slug as empresa_slug,
    u.created_at
FROM usuarios_sistema u
    LEFT JOIN empresas e ON u.empresa_id = e.id
ORDER BY u.created_at DESC;
-- ============================================
-- PASO 3: BORRAR cuentas de prueba específicas
-- ============================================
-- OPCIÓN A: Borrar UNA empresa y sus usuarios por slug
-- Descomentar y cambiar el slug:
-- DELETE FROM usuarios_sistema 
-- WHERE empresa_id = (SELECT id FROM empresas WHERE slug = 'lo-de-mirta');
-- DELETE FROM empresas 
-- WHERE slug = 'lo-de-mirta';
-- ============================================
-- OPCIÓN B: Borrar TODAS las empresas de prueba/demo
-- ============================================
-- Esto borra todas las empresas cuyo plan sea 'demo' o 'prueba'
-- ⚠️ CUIDADO: Solo ejecutar si estás seguro
-- DELETE FROM usuarios_sistema 
-- WHERE empresa_id IN (
--     SELECT id FROM empresas 
--     WHERE plan IN ('demo', 'prueba')
-- );
-- DELETE FROM empresas 
-- WHERE plan IN ('demo', 'prueba');
-- ============================================
-- OPCIÓN C: Borrar empresas creadas hoy (para testing)
-- ============================================
-- DELETE FROM usuarios_sistema 
-- WHERE empresa_id IN (
--     SELECT id FROM empresas 
--     WHERE DATE(created_at) = CURRENT_DATE
-- );
-- DELETE FROM empresas 
-- WHERE DATE(created_at) = CURRENT_DATE;
-- ============================================
-- OPCIÓN D: Borrar UN usuario específico por email
-- ============================================
-- DELETE FROM usuarios_sistema 
-- WHERE email = 'admin.temp@lavapp.com.ar';
-- ============================================
-- OPCIÓN E: LIMPIAR TODO (empezar de cero)
-- ============================================
-- ⚠️⚠️⚠️ ESTO BORRA TODAS LAS EMPRESAS Y USUARIOS ⚠️⚠️⚠️
-- Solo usar en development/testing
-- NUNCA en producción con datos reales
-- TRUNCATE TABLE password_reset_tokens CASCADE;
-- TRUNCATE TABLE usuarios_sistema CASCADE;
-- TRUNCATE TABLE empresas CASCADE;
-- TRUNCATE TABLE actividad_sistema CASCADE;
-- Esto resetea los IDs a 1
-- ALTER SEQUENCE password_reset_tokens_id_seq RESTART WITH 1;
-- ALTER SEQUENCE usuarios_sistema_id_seq RESTART WITH 1;
-- ALTER SEQUENCE empresas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE actividad_sistema_id_seq RESTART WITH 1;
-- ============================================
-- PASO 4: Verificar que se borraron
-- ============================================
SELECT 'Total empresas' as tipo,
    COUNT(*) as cantidad
FROM empresas
UNION ALL
SELECT 'Total usuarios' as tipo,
    COUNT(*) as cantidad
FROM usuarios_sistema
UNION ALL
SELECT 'Total actividades' as tipo,
    COUNT(*) as cantidad
FROM actividad_sistema;
-- ============================================
-- RECOMENDACIONES:
-- ============================================
-- 1. SIEMPRE ejecutar PASO 1 y PASO 2 primero para ver qué hay
-- 2. Elegir UNA opción (A, B, C, D o E) y descomentar
-- 3. Verificar con PASO 4 que se borró lo correcto
-- 4. Si te equivocás, NO hay forma de recuperar (hacer backup antes)
-- ============================================
-- ============================================
-- IMPORTANTE: ¿Qué NO borrar?
-- ============================================
-- NO borrar las TABLAS (no hacer DROP TABLE)
-- NO borrar la empresa que uses para producción
-- NO borrar usuarios reales/activos
-- 
-- Solo borrar:
-- - Cuentas de prueba
-- - Usuarios temporales
-- - Empresas demo
-- ============================================