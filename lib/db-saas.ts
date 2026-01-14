/**
 * Sistema de Conexiones para LAVAPP SaaS
 * 
 * Este archivo maneja las conexiones dinámicas a diferentes branches de Neon
 * NO MODIFICA la conexión actual de DeltaWash
 * 
 * NOTA: Este archivo usa el mismo patrón de @vercel/postgres que lib/db.ts
 */

import { sql } from '@vercel/postgres';
import { createPool } from '@vercel/postgres';

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
