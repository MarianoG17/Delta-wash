/**
 * Cliente para API de Neon
 * Permite crear branches automáticamente para nuevas empresas SaaS
 * 
 * Documentación: https://api-docs.neon.tech/reference/getting-started-with-neon-api
 */

// ============================================
// TIPOS
// ============================================

export interface NeonBranch {
  id: string;
  project_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  current_state: string;
}

export interface NeonEndpoint {
  id: string;
  host: string;
  connection_uri: string;
}

export interface CreateBranchResponse {
  branch: NeonBranch;
  endpoints: NeonEndpoint[];
  connection_uris: {
    connection_uri: string;
    connection_uri_pooler: string;
  }[];
}

// ============================================
// CONFIGURACIÓN
// ============================================

const NEON_API_KEY = process.env.NEON_API_KEY;
const NEON_PROJECT_ID = process.env.NEON_PROJECT_ID;
const NEON_API_BASE = 'https://console.neon.tech/api/v2';

// ============================================
// VALIDACIONES
// ============================================

function validateNeonConfig() {
  if (!NEON_API_KEY) {
    throw new Error('NEON_API_KEY no está configurada en .env.local');
  }
  if (!NEON_PROJECT_ID) {
    throw new Error('NEON_PROJECT_ID no está configurada en .env.local');
  }
}

// ============================================
// CREAR BRANCH (BASE DE DATOS PARA EMPRESA)
// ============================================

/**
 * Crea un nuevo branch en Neon para una empresa
 * @param branchName - Nombre único para el branch (slug de la empresa)
 * @returns Información del branch creado con connection string
 */
export async function createBranchForEmpresa(
  branchName: string
): Promise<CreateBranchResponse> {
  validateNeonConfig();

  console.log(`[Neon API] Creando branch: ${branchName}`);

  const response = await fetch(
    `${NEON_API_BASE}/projects/${NEON_PROJECT_ID}/branches`,
    {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`,
      },
      body: JSON.stringify({
        branch: {
          name: branchName,
        },
        // Crear endpoint automáticamente para el branch
        endpoints: [
          {
            type: 'read_write',
          }
        ]
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[Neon API] Error al crear branch:', errorText);
    throw new Error(`Error al crear branch en Neon: ${response.status} - ${errorText}`);
  }

  const data: CreateBranchResponse = await response.json();
  console.log(`[Neon API] Branch creado exitosamente: ${data.branch.id}`);

  return data;
}

// ============================================
// EJECUTAR SQL EN UN BRANCH
// ============================================

/**
 * Ejecuta SQL en un branch específico (para inicializar schema)
 * @param branchId - ID del branch
 * @param sql - Script SQL a ejecutar
 */
export async function executeSQLInBranch(
  branchId: string,
  sql: string
): Promise<void> {
  validateNeonConfig();

  console.log(`[Neon API] Ejecutando SQL en branch: ${branchId}`);

  // Nota: Neon no tiene endpoint directo para ejecutar SQL
  // Deberás usar el connection_uri para conectarte y ejecutar el schema
  // Esto se maneja en la función initializeBranchSchema

  console.warn('[Neon API] executeSQLInBranch requiere conexión directa con Postgres');
}

// ============================================
// INICIALIZAR SCHEMA EN BRANCH NUEVO
// ============================================

/**
 * Inicializa el schema de una empresa nueva en su branch
 * @param connectionUri - URI de conexión al branch
 */
export async function initializeBranchSchema(
  connectionUri: string
): Promise<void> {
  console.log('[Neon API] Inicializando schema en nuevo branch');

  // Importar el schema SQL
  const { createPool } = await import('@vercel/postgres');

  const pool = createPool({ connectionString: connectionUri });

  try {
    // Crear tablas necesarias
    await pool.sql`
      -- Tabla de usuarios locales de la empresa
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nombre VARCHAR(255) NOT NULL,
        rol VARCHAR(50) DEFAULT 'operador',
        telefono VARCHAR(50),
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de clientes
      CREATE TABLE IF NOT EXISTS clientes (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        telefono VARCHAR(50),
        email VARCHAR(255),
        direccion TEXT,
        notas TEXT,
        tiene_cuenta_corriente BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de registros (autos lavados)
      CREATE TABLE IF NOT EXISTS registros (
        id SERIAL PRIMARY KEY,
        patente VARCHAR(50) NOT NULL,
        marca VARCHAR(100),
        modelo VARCHAR(100),
        color VARCHAR(50),
        cliente_id INTEGER REFERENCES clientes(id),
        tipo_vehiculo VARCHAR(50),
        servicio VARCHAR(100),
        precio DECIMAL(10,2),
        metodo_pago VARCHAR(50),
        estado VARCHAR(50) DEFAULT 'en_proceso',
        observaciones TEXT,
        fecha_ingreso TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_listo TIMESTAMP,
        fecha_entregado TIMESTAMP,
        usuario_id INTEGER REFERENCES usuarios(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de precios por servicio
      CREATE TABLE IF NOT EXISTS precios_servicios (
        id SERIAL PRIMARY KEY,
        tipo_vehiculo VARCHAR(50) NOT NULL,
        tipo_lavado VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tipo_vehiculo, tipo_lavado)
      );

      -- Tabla de cuentas corrientes
      CREATE TABLE IF NOT EXISTS cuentas_corrientes (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER UNIQUE REFERENCES clientes(id),
        saldo_actual DECIMAL(10,2) DEFAULT 0,
        limite_credito DECIMAL(10,2) DEFAULT 0,
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Tabla de movimientos de cuenta corriente
      CREATE TABLE IF NOT EXISTS movimientos_cc (
        id SERIAL PRIMARY KEY,
        cuenta_corriente_id INTEGER REFERENCES cuentas_corrientes(id),
        tipo VARCHAR(50),
        monto DECIMAL(10,2),
        descripcion TEXT,
        saldo_anterior DECIMAL(10,2),
        saldo_nuevo DECIMAL(10,2),
        registro_id INTEGER REFERENCES registros(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Índices para mejor rendimiento
      CREATE INDEX IF NOT EXISTS idx_registros_patente ON registros(patente);
      CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha_ingreso);
      CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros(estado);
      CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre);
    `;

    // Insertar precios por defecto
    await pool.sql`
      INSERT INTO precios_servicios (tipo_vehiculo, tipo_lavado, precio) VALUES
        ('auto', 'simple', 8000),
        ('auto', 'simple_con_cera', 12000),
        ('auto', 'completo', 15000),
        ('auto', 'completo_con_cera', 20000),
        ('auto', 'express', 6000),
        ('auto', 'premium', 25000),
        ('suv', 'simple', 10000),
        ('suv', 'simple_con_cera', 15000),
        ('suv', 'completo', 18000),
        ('suv', 'completo_con_cera', 24000),
        ('suv', 'express', 8000),
        ('suv', 'premium', 30000),
        ('camioneta', 'simple', 10000),
        ('camioneta', 'simple_con_cera', 15000),
        ('camioneta', 'completo', 18000),
        ('camioneta', 'completo_con_cera', 24000),
        ('camioneta', 'express', 8000),
        ('camioneta', 'premium', 30000),
        ('xl', 'simple', 12000),
        ('xl', 'simple_con_cera', 18000),
        ('xl', 'completo', 22000),
        ('xl', 'completo_con_cera', 28000),
        ('xl', 'express', 10000),
        ('xl', 'premium', 35000),
        ('moto', 'simple', 4000),
        ('moto', 'simple_con_cera', 6000),
        ('moto', 'completo', 7000),
        ('moto', 'completo_con_cera', 9000),
        ('moto', 'express', 3000),
        ('moto', 'premium', 10000)
      ON CONFLICT (tipo_vehiculo, tipo_lavado) DO NOTHING;
    `;

    console.log('[Neon API] Schema inicializado exitosamente');
  } catch (error) {
    console.error('[Neon API] Error al inicializar schema:', error);
    throw error;
  }
}

// ============================================
// ELIMINAR BRANCH (SOLO PARA TESTING/DESARROLLO)
// ============================================

/**
 * Elimina un branch de Neon (usar con precaución)
 * @param branchId - ID del branch a eliminar
 */
export async function deleteBranch(branchId: string): Promise<void> {
  validateNeonConfig();

  console.log(`[Neon API] Eliminando branch: ${branchId}`);

  const response = await fetch(
    `${NEON_API_BASE}/projects/${NEON_PROJECT_ID}/branches/${branchId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${NEON_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error al eliminar branch: ${response.status} - ${errorText}`);
  }

  console.log('[Neon API] Branch eliminado exitosamente');
}

// ============================================
// FUNCIÓN COMPLETA: CREAR Y CONFIGURAR EMPRESA
// ============================================

/**
 * Crea un branch completo para una empresa nueva:
 * 1. Crea el branch en Neon
 * 2. Inicializa el schema
 * 3. Retorna la información de conexión
 * 
 * @param empresaSlug - Slug único de la empresa
 * @returns Connection URI para la empresa
 */
export async function createAndSetupBranchForEmpresa(
  empresaSlug: string
): Promise<{
  branchId: string;
  branchName: string;
  connectionUri: string;
  connectionUriPooler: string;
}> {
  try {
    // 1. Crear branch en Neon
    console.log(`[Setup] Iniciando creación de branch para: ${empresaSlug}`);
    const branchData = await createBranchForEmpresa(empresaSlug);

    // Extraer información de conexión
    const connectionUri = branchData.connection_uris[0].connection_uri;
    const connectionUriPooler = branchData.connection_uris[0].connection_uri_pooler;

    console.log(`[Setup] Branch creado con ID: ${branchData.branch.id}`);

    // 2. Inicializar schema (usar pooler para createPool)
    console.log('[Setup] Inicializando schema en el nuevo branch...');
    await initializeBranchSchema(connectionUriPooler);

    console.log('[Setup] ✅ Branch completamente configurado');

    return {
      branchId: branchData.branch.id,
      branchName: branchData.branch.name,
      connectionUri,
      connectionUriPooler,
    };

  } catch (error) {
    console.error('[Setup] Error al crear y configurar branch:', error);
    throw error;
  }
}
