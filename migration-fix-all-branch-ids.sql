-- Fix all empresas with incorrect branch IDs
-- Problem: neon_branch_id contains branch NAMES instead of branch IDS
-- This migration updates them to use real Neon branch IDs (br-xxx format)
-- ============================================
-- EMPRESAS CONOCIDAS CON IDS CONFIRMADOS
-- ============================================
-- LAVAPP (ID 48)
-- Branch Name: Lavadero
-- Real Branch ID: br-orange-band-ah85rblj
UPDATE empresas
SET neon_branch_id = 'br-orange-band-ah85rblj'
WHERE id = 48
    AND nombre = 'LAVAPP';
-- mariano coques (ID 51)  
-- Branch Name: mariano-coques
-- Real Branch ID: br-late-mud-ahp1incp
UPDATE empresas
SET neon_branch_id = 'br-late-mud-ahp1incp'
WHERE id = 51
    AND nombre = 'mariano coques';
-- ============================================
-- VERIFICAR EMPRESAS RESTANTES CON IDS INCORRECTOS
-- ============================================
-- Esta query muestra empresas activas que tienen neon_branch_id
-- pero NO empiezan con "br-" (formato correcto de Neon)
-- Necesitarás buscar manualmente el Branch ID real en Neon Console para cada una
SELECT id,
    nombre,
    neon_branch_id as branch_id_incorrecto,
    branch_name
FROM empresas
WHERE estado = 'activo'
    AND neon_branch_id IS NOT NULL
    AND neon_branch_id NOT LIKE 'br-%'
ORDER BY id;
-- ============================================
-- TEMPLATE PARA ACTUALIZAR MANUALMENTE
-- ============================================
-- Para cada empresa que aparezca en la query anterior:
-- 1. Ve a Neon Console
-- 2. Encuentra el branch con el nombre que aparece en branch_name
-- 3. Copia el Branch ID (br-xxxxx-xxxxxxxx)
-- 4. Ejecuta:
/*
 UPDATE empresas 
 SET neon_branch_id = 'br-xxxxx-xxxxxxxx'
 WHERE id = [ID_EMPRESA];
 */
-- ============================================
-- VERIFICACIÓN FINAL
-- ============================================
-- Verificar que todas las empresas activas tengan IDs correctos
SELECT COUNT(*) as total_activas,
    SUM(
        CASE
            WHEN neon_branch_id LIKE 'br-%' THEN 1
            ELSE 0
        END
    ) as con_id_correcto,
    SUM(
        CASE
            WHEN neon_branch_id IS NULL
            OR neon_branch_id NOT LIKE 'br-%' THEN 1
            ELSE 0
        END
    ) as con_id_incorrecto
FROM empresas
WHERE estado = 'activo';
-- Listar empresas con problemas
SELECT id,
    nombre,
    neon_branch_id,
    estado
FROM empresas
WHERE estado = 'activo'
    AND (
        neon_branch_id IS NULL
        OR neon_branch_id NOT LIKE 'br-%'
    );