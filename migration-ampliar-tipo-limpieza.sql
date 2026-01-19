-- ================================================================
-- MIGRACIÓN: Ampliar campo tipo_limpieza de VARCHAR(50) a VARCHAR(200)
-- ================================================================
-- 
-- PROBLEMA: 
-- Al seleccionar múltiples servicios en el formulario, el campo
-- tipo_limpieza excede los 50 caracteres, generando error:
-- "value too long for type character varying(50)"
--
-- Ejemplo de valor largo:
-- "simple_exterior, simple, con_cera, pulido, limpieza_chasis, limpieza_motor"
-- Son aproximadamente 75 caracteres.
--
-- SOLUCIÓN:
-- Ampliar a VARCHAR(200) para soportar hasta 4-5 servicios combinados.
--
-- COMPATIBILIDAD:
-- - PostgreSQL permite ALTER COLUMN sin perder datos
-- - Operación rápida (solo actualiza metadata)
-- - No requiere reconstruir índices
-- ================================================================

-- Para DeltaWash (Base de datos legacy en producción)
-- Ejecutar en: https://console.neon.tech/app/projects/[PROJECT_ID]/branches/main/tables
ALTER TABLE registros_lavado 
ALTER COLUMN tipo_limpieza TYPE VARCHAR(200);

-- Verificar el cambio
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado' 
  AND column_name = 'tipo_limpieza';

-- ================================================================
-- NOTA: Para empresas SaaS nuevas
-- ================================================================
-- Las empresas SaaS nuevas YA tendrán el límite correcto porque
-- se crearon con el schema actualizado en lib/neon-api.ts
-- 
-- Sin embargo, si existen empresas SaaS creadas ANTES de este fix,
-- deberás ejecutar el ALTER TABLE en cada branch individual.
--
-- Puedes usar el siguiente script para aplicar a múltiples branches:
-- ================================================================

/*
-- SCRIPT PARA ACTUALIZAR MÚLTIPLES BRANCHES (Node.js)
-- Guardar como: scripts/migrate-all-branches.js
-- Ejecutar: node scripts/migrate-all-branches.js

const { neon } = require('@neondatabase/serverless');
const { sql } = require('@vercel/postgres');

async function migrarTodosLosBranches() {
  // 1. Obtener todas las empresas SaaS
  const empresas = await sql`
    SELECT id, nombre, slug, branch_url 
    FROM empresas 
    WHERE branch_url IS NOT NULL
  `;
  
  console.log(`🚀 Migrando ${empresas.rows.length} branches de empresas SaaS`);
  
  for (const empresa of empresas.rows) {
    try {
      console.log(`\n📋 Empresa: ${empresa.nombre} (ID: ${empresa.id})`);
      
      const branchSql = neon(empresa.branch_url);
      
      // Ejecutar migración
      await branchSql`
        ALTER TABLE registros_lavado 
        ALTER COLUMN tipo_limpieza TYPE VARCHAR(200)
      `;
      
      console.log(`✅ Migrado exitosamente`);
      
    } catch (error) {
      console.error(`❌ Error en empresa ${empresa.id}:`, error.message);
    }
  }
  
  console.log('\n🎉 Migración completada');
}

migrarTodosLosBranches().catch(console.error);
*/

-- ================================================================
-- ROLLBACK (solo si es necesario revertir)
-- ================================================================
-- ALTER TABLE registros_lavado 
-- ALTER COLUMN tipo_limpieza TYPE VARCHAR(50);
-- 
-- ADVERTENCIA: Si hay registros con más de 50 caracteres, 
-- el rollback fallará con error de truncamiento.
-- ================================================================
