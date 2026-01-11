-- ============================================
-- REVERTIR: Sistema de Listas de Precios
-- ============================================
-- Ejecuta este SQL en el proyecto INCORRECTO
-- para eliminar las tablas creadas por error
-- ============================================

-- ADVERTENCIA: Esto eliminará TODAS las tablas y datos
-- relacionados con listas de precios
-- Solo ejecuta esto en el proyecto EQUIVOCADO

-- Eliminar tabla de precios (primero porque tiene foreign key)
DROP TABLE IF EXISTS precios CASCADE;

-- Eliminar tabla de listas de precios
DROP TABLE IF EXISTS listas_precios CASCADE;

-- Verificar que se eliminaron
SELECT 'Tablas de listas de precios eliminadas correctamente' as resultado;

-- Verificar que no existen
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('listas_precios', 'precios')
ORDER BY table_name;

-- Si no devuelve ninguna fila, significa que se eliminaron correctamente
