/**
 * Sistema de Conexiones para LAVAPP SaaS - MULTI-TENANT
 *
 * Este archivo maneja las conexiones dinámicas a diferentes branches de Neon
 * Compatible con DeltaWash legacy (sin cambios en su funcionamiento)
 *
 * GARANTÍA: Si algo falla, siempre cae en sql (POSTGRES_URL de DeltaWash)
 */

import { sql } from '@vercel/postgres';
import { createPool, VercelPool } from '@vercel/postgres';

// ============================================
// TIPO DE CONEXIÓN SQL
// ============================================

type SQLConnection = typeof sql;

// ============================================
// CONEXIÓN A BD CENTRAL
// ============================================

/**
 * Obtiene conexión a la BD Central (gestión de empresas/usuarios)
 * Esta BD contiene: empresas, usuarios_sistema, invitaciones, etc.
 */
export function getCentralDB(): SQLConnection {
  // NOTA: Por ahora usa la misma conexión
  // Cuando tengas el branch "central", actualiza CENTRAL_DB_URL en .env
  // y descomenta la línea de abajo

  // const pool = createPool({ connectionString: process.env.CENTRAL_DB_URL });
  // return pool.sql;

  // Por ahora, para desarrollo, usa la conexión principal
  return sql;
}

// ============================================
// CONEXIÓN LEGACY (DELTAWASH)
// ============================================

/**
 * Conexión legacy para DeltaWash
 * Mantiene compatibilidad con el sistema actual
 * USA LA VARIABLE DE ENTORNO EXISTENTE (POSTGRES_URL)
 */
export function getLegacyDB(): SQLConnection {
  // Esta es la conexión actual que ya usás
  return sql;
}

// ============================================
// CONEXIÓN MULTI-TENANT (PLACEHOLDER)
// ============================================

/**
 * Obtiene conexión a la BD de una empresa específica
 * @param empresaId - ID de la empresa en BD Central
 * @returns Conexión SQL al branch de la empresa
 * 
 * NOTA: Por ahora retorna la conexión legacy
 * Implementación completa requiere:
 * 1. Branch "central" creado en Neon
 * 2. Tabla empresas con branch_urls
 * 3. Sistema de conexiones dinámicas con createPool
 */
export async function getClientDB(empresaId: number): Promise<SQLConnection> {
  // TODO: Implementar después de crear branch "central"
  // Por ahora, retorna conexión legacy (DeltaWash)

  /*
  // Implementación futura:
  const centralDB = getCentralDB();
  
  const empresas = await centralDB`
    SELECT branch_url, estado, plan
    FROM empresas 
    WHERE id = ${empresaId}
  `;
  
  if (!empresas.rows.length) {
    throw new Error('Empresa no encontrada');
  }
  
  const empresa = empresas.rows[0];
  
  if (empresa.estado !== 'activo') {
    throw new Error(`Cuenta ${empresa.estado}`);
  }
  
  const pool = createPool({ connectionString: empresa.branch_url });
  return pool.sql;
  */

  return sql; // Por ahora, retorna conexión actual
}

/**
 * Obtiene conexión desde una sesión activa
 * Wrapper conveniente para usar en APIs
 */
export async function getDBFromSession(): Promise<SQLConnection> {
  // TODO: Implementar cuando tengamos sistema de sesiones
  // Por ahora, retorna conexión legacy

  /*
  // Implementación futura:
  const session = await getSession();
  
  if (!session?.empresaId) {
    throw new Error('No autenticado o sesión inválida');
  }
  
  return getClientDB(session.empresaId);
  */

  return sql; // Por ahora, retorna conexión actual
}

// ============================================
// HELPERS DE BD CENTRAL (PLACEHOLDER)
// ============================================

/**
 * Verifica si una empresa existe y está activa
 * TODO: Implementar cuando branch "central" esté listo
 */
export async function isEmpresaActiva(empresaId: number): Promise<boolean> {
  // Por ahora, siempre retorna true (DeltaWash)
  return true;

  /*
  // Implementación futura:
  const centralDB = getCentralDB();
  const result = await centralDB`
    SELECT estado FROM empresas WHERE id = ${empresaId}
  `;
  return result.rows.length > 0 && result.rows[0].estado === 'activo';
  */
}

/**
 * Obtiene información básica de una empresa
 * TODO: Implementar cuando branch "central" esté listo
 */
export async function getEmpresaInfo(empresaId: number) {
  // Por ahora, retorna datos mock de DeltaWash
  return {
    id: 1,
    nombre: 'DeltaWash',
    slug: 'deltawash',
    plan: 'owner',
    estado: 'activo'
  };

  /*
  // Implementación futura:
  const centralDB = getCentralDB();
  const empresas = await centralDB`
    SELECT id, nombre, slug, plan, estado, fecha_expiracion
    FROM empresas 
    WHERE id = ${empresaId}
  `;
  return empresas.rows[0] || null;
  */
}

/**
 * Registra nueva empresa en BD Central
 * TODO: Implementar cuando branch "central" esté listo
 */
export async function registrarEmpresa(datos: {
  nombre: string;
  slug: string;
  branchName: string;
  branchUrl: string;
  plan?: string;
}) {
  // TODO: Implementar después de setup de Neon
  throw new Error('Registro de empresas aún no implementado. Completar setup de Neon primero.');

  /*
  // Implementación futura:
  const centralDB = getCentralDB();
  const result = await centralDB`
    INSERT INTO empresas (nombre, slug, branch_name, branch_url, plan, estado, fecha_expiracion)
    VALUES (
      ${datos.nombre},
      ${datos.slug},
      ${datos.branchName},
      ${datos.branchUrl},
      ${datos.plan || 'trial'},
      'activo',
      NOW() + INTERVAL '15 days'
    )
    RETURNING *
  `;
  return result.rows[0];
  */
}

// ============================================
// EXPORTS DE TIPOS
// ============================================

// ============================================
// CONEXIÓN DINÁMICA MULTI-TENANT (NUEVO)
// ============================================

/**
 * Obtiene la conexión apropiada según el empresaId
 *
 * GARANTÍA DE SEGURIDAD:
 * - Si empresaId es undefined → Retorna sql (DeltaWash)
 * - Si hay cualquier error → Retorna sql (DeltaWash)
 * - Solo usa branch específico si TODO está correcto
 *
 * @param empresaId - ID de la empresa (undefined para DeltaWash legacy)
 * @returns Conexión SQL apropiada
 */
export async function getDBConnection(empresaId?: number): Promise<typeof sql> {
  try {
    console.log('========================================');
    console.log('[DB] 🔌 getDBConnection() iniciado');
    console.log(`[DB] empresaId recibido: ${empresaId || '(undefined)'}`);
    
    // NIVEL 1: Sin empresaId = DeltaWash legacy
    if (!empresaId) {
      console.log('[DB] ⚠️ Sin empresaId → Usando POSTGRES_URL (DeltaWash Legacy)');
      console.log('[DB] Connection String: POSTGRES_URL (variable de entorno)');
      console.log('========================================');
      return sql;
    }

    try {
      // NIVEL 2: Consultar BD Central para obtener branch_url
      console.log(`[DB] 🔍 Consultando BD Central para empresa ${empresaId}...`);
      console.log(`[DB] CENTRAL_DB_URL: ${process.env.CENTRAL_DB_URL ? '✅ Configurada' : '❌ NO configurada'}`);

      const centralDB = createPool({
        connectionString: process.env.CENTRAL_DB_URL
      });

      const empresaResult = await centralDB.sql`
        SELECT id, slug, branch_url, estado, nombre
        FROM empresas
        WHERE id = ${empresaId}
      `;

      console.log(`[DB] Resultados encontrados: ${empresaResult.rows.length}`);

      // Verificar que la empresa existe
      if (empresaResult.rows.length === 0) {
        console.warn(`[DB] ❌ Empresa ${empresaId} NO ENCONTRADA en BD Central`);
        console.warn(`[DB] → Fallback a POSTGRES_URL (DeltaWash)`);
        console.log('========================================');
        return sql;
      }

      const empresa = empresaResult.rows[0];
      console.log(`[DB] ✅ Empresa encontrada:`);
      console.log(`     - ID: ${empresa.id}`);
      console.log(`     - Nombre: ${empresa.nombre}`);
      console.log(`     - Slug: ${empresa.slug}`);
      console.log(`     - Estado: ${empresa.estado}`);
      console.log(`     - Branch URL: ${empresa.branch_url ? '✅ Tiene' : '❌ Vacío'}`);

      // Verificar que esté activa
      if (empresa.estado !== 'activo') {
        console.warn(`[DB] ⚠️ Empresa ${empresaId} está ${empresa.estado.toUpperCase()}, no ACTIVA`);
        console.warn(`[DB] → Fallback a POSTGRES_URL (DeltaWash)`);
        console.log('========================================');
        return sql;
      }

      // NIVEL 3: Verificar que tenga branch_url
      if (!empresa.branch_url || empresa.branch_url.trim() === '') {
        console.warn(`[DB] ❌ Empresa ${empresaId} SIN branch_url configurado`);
        console.warn(`[DB] → Fallback a POSTGRES_URL (DeltaWash)`);
        console.log('========================================');
        return sql;
      }

      try {
        // NIVEL 4: Crear pool con el branch_url específico
        console.log(`[DB] 🚀 Creando pool dinámico para empresa "${empresa.slug}"...`);
        console.log(`[DB] Branch URL (primeros 50 chars): ${empresa.branch_url.substring(0, 50)}...`);

        const pool = createPool({
          connectionString: empresa.branch_url
        });

        console.log(`[DB] ✅ Pool creado exitosamente para empresa ${empresaId}`);
        console.log(`[DB] 🎯 Usando branch dedicado: ${empresa.slug}`);
        console.log('========================================');

        // Retornar la función sql del pool
        // TypeScript: usamos 'as any' para compatibilidad de tipos
        return pool.sql as any;

      } catch (poolError) {
        console.error(`[DB] ❌ ERROR al crear pool para empresa ${empresaId}:`);
        console.error(`[DB] Tipo de error: ${poolError instanceof Error ? poolError.constructor.name : typeof poolError}`);
        console.error(`[DB] Mensaje: ${poolError instanceof Error ? poolError.message : JSON.stringify(poolError)}`);
        console.error(`[DB] → Fallback a POSTGRES_URL (DeltaWash)`);
        console.log('========================================');
        return sql; // Fallback a DeltaWash
      }

    } catch (queryError) {
      console.error(`[DB] ❌ ERROR al consultar BD Central:`);
      console.error(`[DB] Tipo de error: ${queryError instanceof Error ? queryError.constructor.name : typeof queryError}`);
      console.error(`[DB] Mensaje: ${queryError instanceof Error ? queryError.message : JSON.stringify(queryError)}`);
      console.error(`[DB] → Fallback a POSTGRES_URL (DeltaWash)`);
      console.log('========================================');
      return sql; // Fallback a DeltaWash
    }

  } catch (error) {
    console.error('[DB] ❌ ERROR GENERAL en getDBConnection():');
    console.error(`[DB] Tipo: ${error instanceof Error ? error.constructor.name : typeof error}`);
    console.error(`[DB] Mensaje: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
    console.error(`[DB] → Fallback final a POSTGRES_URL (DeltaWash)`);
    console.log('========================================');
    return sql; // Fallback final a DeltaWash
  }
}

// ============================================
// EXPORTS DE TIPOS
// ============================================

export type { SQLConnection };

export type EmpresaInfo = {
  id: number;
  nombre: string;
  slug: string;
  plan: string;
  estado: string;
  fecha_expiracion?: Date;
};

// ============================================
// NOTA IMPORTANTE
// ============================================

/*
 * PASOS PARA ACTIVAR FUNCIONALIDAD COMPLETA:
 * 
 * 1. Seguir guía en: GUIA_SETUP_NEON_SAAS.md
 * 2. Crear branch "central" en Neon
 * 3. Ejecutar schema: scripts/schema-bd-central-saas.sql
 * 4. Actualizar .env.local con CENTRAL_DB_URL
 * 5. Descomentar implementaciones reales en este archivo
 * 6. Crear sistema de autenticación en lib/auth-saas.ts
 * 
 * Por ahora, todo apunta a la BD actual de DeltaWash
 * para no interrumpir el funcionamiento normal.
 */
