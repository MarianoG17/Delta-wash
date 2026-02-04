-- ============================================
-- SCRIPT: Borrar todas las empresas EXCEPTO ID 48 y ID 50
-- ============================================
-- Base de datos: CENTRAL
-- 
-- MANTENER:
-- - ID 48: LAVAPP (cuenta demo con datos para mostrar)
-- - ID 50: Mariano (cuenta de trabajo actual)
--
-- BORRAR:
-- IDs: 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 49
-- ============================================
-- PASO 1: Ver qué se va a borrar
SELECT id,
    nombre,
    slug,
    plan,
    created_at,
    CASE
        WHEN id IN (48, 50) THEN '✅ MANTENER'
        ELSE '❌ BORRAR'
    END as accion
FROM empresas
ORDER BY id;
-- PASO 2: Ver usuarios de las empresas que se van a borrar
SELECT u.id as usuario_id,
    u.email,
    u.nombre,
    e.id as empresa_id,
    e.nombre as empresa_nombre,
    e.slug,
    CASE
        WHEN e.id IN (48, 50) THEN '✅ MANTENER'
        ELSE '❌ BORRAR'
    END as accion
FROM usuarios_sistema u
    INNER JOIN empresas e ON u.empresa_id = e.id
ORDER BY e.id,
    u.id;
-- ============================================
-- PASO 3: BORRAR usuarios de empresas no deseadas
-- ============================================
DELETE FROM usuarios_sistema
WHERE empresa_id NOT IN (48, 50);
-- Verificar cuántos usuarios se borraron
SELECT 'Usuarios restantes' as info,
    COUNT(*) as cantidad
FROM usuarios_sistema;
-- ============================================
-- PASO 4: BORRAR empresas no deseadas
-- ============================================
DELETE FROM empresas
WHERE id NOT IN (48, 50);
-- Verificar cuántas empresas quedaron
SELECT 'Empresas restantes' as info,
    COUNT(*) as cantidad
FROM empresas;
-- ============================================
-- PASO 5: Verificar que quedaron solo las correctas
-- ============================================
SELECT e.id,
    e.nombre,
    e.slug,
    e.plan,
    e.estado,
    COUNT(u.id) as cantidad_usuarios
FROM empresas e
    LEFT JOIN usuarios_sistema u ON e.id = u.empresa_id
GROUP BY e.id,
    e.nombre,
    e.slug,
    e.plan,
    e.estado
ORDER BY e.id;
-- ============================================
-- RESULTADO ESPERADO:
-- ============================================
-- Solo 2 empresas:
-- - ID 48: LAVAPP (con sus usuarios y datos demo)
-- - ID 50: Mariano (tu cuenta nueva)
--
-- Todas las demás empresas y sus usuarios borrados
-- ============================================
-- ============================================
-- PASO 6: Extender el período de las empresas que quedaron
-- ============================================
-- Para que no se venzan y puedas seguir usándolas
UPDATE empresas
SET fecha_expiracion = '2099-12-31 23:59:59',
    estado = 'activo',
    updated_at = NOW()
WHERE id IN (48, 50);
-- Verificar
SELECT id,
    nombre,
    slug,
    estado,
    fecha_expiracion,
    '✅ Período extendido hasta 2099' as resultado
FROM empresas
WHERE id IN (48, 50);
-- ============================================
-- OPCIONAL: Limpiar tokens de password reset viejos
-- ============================================
-- Borrar tokens de usuarios que ya no existen
DELETE FROM password_reset_tokens
WHERE user_id NOT IN (
        SELECT id
        FROM usuarios_sistema
    );
SELECT 'Tokens de reset restantes' as info,
    COUNT(*) as cantidad
FROM password_reset_tokens;
-- ============================================
-- RESUMEN FINAL
-- ============================================
SELECT 'RESUMEN DE LIMPIEZA' as titulo;
SELECT 'Total empresas' as metrica,
    COUNT(*) as cantidad
FROM empresas
UNION ALL
SELECT 'Total usuarios' as metrica,
    COUNT(*) as cantidad
FROM usuarios_sistema
UNION ALL
SELECT 'Total actividades' as metrica,
    COUNT(*) as cantidad
FROM actividad_sistema
UNION ALL
SELECT 'Total tokens reset' as metrica,
    COUNT(*) as cantidad
FROM password_reset_tokens;
-- ============================================
-- ✅ LISTO!
-- ============================================
-- Ahora tenés:
-- - 2 empresas limpias y activas (ID 48 y 50)
-- - Período extendido hasta 2099 (sin vencimiento)
-- - Todas las cuentas de prueba eliminadas
-- ============================================