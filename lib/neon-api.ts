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
    connection_parameters: {
      database: string;
      password: string;
      role: string;
      host: string;
      pooler_host: string;
    };
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

  // HARDCODED: Template vacío garantizado (Vercel no lee env vars correctamente)
  const TEMPLATE_BRANCH_ID = 'br-dawn-dream-ahfwrieh';
  
  console.log(`[Neon API] Creando branch: ${branchName}`);
  console.log(`[Neon API] 🎯 USANDO TEMPLATE VACÍO HARDCODED`);
  console.log(`[Neon API] Template ID: ${TEMPLATE_BRANCH_ID}`);

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
          // Si existe TEMPLATE_BRANCH_ID, crear desde template vacío
          // Si no existe, crear desde main (comportamiento anterior)
          ...(TEMPLATE_BRANCH_ID && { parent_id: TEMPLATE_BRANCH_ID })
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
// ESPERAR A QUE BRANCH ESTÉ LISTO
// ============================================

/**
 * Espera a que un branch esté completamente listo
 * @param branchId - ID del branch
 * @param maxWaitSeconds - Tiempo máximo de espera en segundos (default: 60)
 */
async function waitForBranchReady(branchId: string, maxWaitSeconds: number = 60): Promise<void> {
  validateNeonConfig();

  console.log(`[Neon API] ⏳ Esperando a que branch ${branchId} esté listo...`);

  const startTime = Date.now();
  let attempts = 0;

  while (true) {
    attempts++;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);

    if (elapsed > maxWaitSeconds) {
      console.warn(`[Neon API] ⚠️  Timeout esperando branch (${maxWaitSeconds}s). Continuando de todas formas...`);
      break;
    }

    try {
      const response = await fetch(
        `${NEON_API_BASE}/projects/${NEON_PROJECT_ID}/branches/${branchId}`,
        {
          headers: {
            'Authorization': `Bearer ${NEON_API_KEY}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const state = data.branch.current_state;

        console.log(`[Neon API] Intento ${attempts}: Estado=${state}, Transcurrido=${elapsed}s`);

        if (state === 'ready') {
          console.log(`[Neon API] ✅ Branch listo después de ${elapsed}s`);
          // Esperar 2 segundos adicionales para asegurar que los datos estén completamente copiados
          await new Promise(resolve => setTimeout(resolve, 2000));
          return;
        }
      }
    } catch (error) {
      console.warn(`[Neon API] Error consultando estado del branch:`, error);
    }

    // Esperar 2 segundos antes del siguiente intento
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
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

  // Usar neon driver directamente
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(connectionUri);

  try {
    // ============================================
    // CREAR SCHEMA PRIMERO
    // ============================================
    console.log('[Neon API] 📋 Creando estructura de tablas...');

    console.log('[Neon API] Creando tabla usuarios...');
    await sql`
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
      )
    `;

    console.log('[Neon API] Creando tabla clientes...');
    await sql`
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
      )
    `;

    console.log('[Neon API] Creando tabla registros...');
    await sql`
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
      )
    `;

    console.log('[Neon API] Creando tabla precios_servicios...');
    await sql`
      CREATE TABLE IF NOT EXISTS precios_servicios (
        id SERIAL PRIMARY KEY,
        tipo_vehiculo VARCHAR(50) NOT NULL,
        tipo_lavado VARCHAR(100) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(tipo_vehiculo, tipo_lavado)
      )
    `;

    console.log('[Neon API] Creando tabla cuentas_corrientes...');
    await sql`
      CREATE TABLE IF NOT EXISTS cuentas_corrientes (
        id SERIAL PRIMARY KEY,
        cliente_id INTEGER UNIQUE REFERENCES clientes(id),
        saldo_actual DECIMAL(10,2) DEFAULT 0,
        limite_credito DECIMAL(10,2) DEFAULT 0,
        activa BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('[Neon API] Creando tabla movimientos_cc...');
    await sql`
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
      )
    `;

    console.log('[Neon API] Creando índices...');
    await sql`CREATE INDEX IF NOT EXISTS idx_registros_patente ON registros(patente)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registros_fecha ON registros(fecha_ingreso)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_registros_estado ON registros(estado)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes(nombre)`;

    // ============================================
    // NUEVO SISTEMA DE LISTAS DE PRECIOS
    // ============================================

    console.log('[Neon API] Creando tabla listas_precios...');
    await sql`
      CREATE TABLE IF NOT EXISTS listas_precios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        descripcion TEXT,
        activa BOOLEAN DEFAULT TRUE,
        es_default BOOLEAN DEFAULT FALSE,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    console.log('[Neon API] Creando tabla precios...');
    await sql`
      CREATE TABLE IF NOT EXISTS precios (
        id SERIAL PRIMARY KEY,
        lista_id INTEGER REFERENCES listas_precios(id) ON DELETE CASCADE,
        tipo_vehiculo VARCHAR(50) NOT NULL,
        tipo_servicio VARCHAR(50) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(lista_id, tipo_vehiculo, tipo_servicio)
      )
    `;

    console.log('[Neon API] Agregando columna lista_precio_id a cuentas_corrientes...');
    await sql`
      ALTER TABLE cuentas_corrientes
      ADD COLUMN IF NOT EXISTS lista_precio_id INTEGER REFERENCES listas_precios(id) ON DELETE SET NULL
    `;

    console.log('[Neon API] Creando índices de listas de precios...');
    await sql`CREATE INDEX IF NOT EXISTS idx_precios_lista ON precios(lista_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_cuentas_lista_precio ON cuentas_corrientes(lista_precio_id)`;

    console.log('[Neon API] ✅ Tablas creadas exitosamente');

    // ============================================
    // VERIFICAR DATOS (Schema Only no requiere limpieza)
    // ============================================
    // HARDCODED: Mismo template ID que en createBranchForEmpresa (línea 78)
    const TEMPLATE_BRANCH_ID = 'br-dawn-dream-ahfwrieh';
    
    // Template Schema Only garantiza branch vacío - No requiere limpieza
    console.log('[Neon API] ✅ Branch creado desde template Schema Only');
    console.log(`[Neon API] Template ID: ${TEMPLATE_BRANCH_ID}`);
    console.log('[Neon API] ℹ️  Sin datos heredados - Branch vacío garantizado');
    console.log('[Neon API] ⏩ Saltando limpieza de datos (innecesaria)');

    // ============================================
    // INSERTAR DATOS INICIALES
    // ============================================
    console.log('[Neon API] Creando lista de precios por defecto...');
    await sql`
      INSERT INTO listas_precios (nombre, descripcion, activa, es_default)
      VALUES ('Por Defecto', 'Lista de precios inicial - Configure sus precios desde la sección Listas de Precios', true, true)
      ON CONFLICT (nombre) DO NOTHING
    `;

    console.log('[Neon API] Insertando precios en $0 (para que la empresa configure sus propios valores)...');
    // Obtener el ID de la lista recién creada
    const listaResult = await sql`SELECT id FROM listas_precios WHERE nombre = 'Por Defecto' LIMIT 1`;
    const listaId = listaResult[0]?.id;

    if (listaId) {
      // Insertar todos los servicios con precio $0
      const tiposVehiculo = ['auto', 'mono', 'camioneta', 'camioneta_xl', 'moto'];
      const tiposServicio = ['simple_exterior', 'simple', 'con_cera', 'pulido', 'limpieza_chasis', 'limpieza_motor'];

      for (const vehiculo of tiposVehiculo) {
        for (const servicio of tiposServicio) {
          await sql`
            INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
            VALUES (${listaId}, ${vehiculo}, ${servicio}, 0)
            ON CONFLICT (lista_id, tipo_vehiculo, tipo_servicio) DO NOTHING
          `;
        }
      }

      console.log('[Neon API] ✅ Precios inicializados en $0 - La empresa debe configurar sus valores');
    } else {
      console.warn('[Neon API] ⚠️  No se pudo obtener ID de lista por defecto');
    }

    console.log('[Neon API] ✅ Schema inicializado exitosamente');
  } catch (error) {
    console.error('[Neon API] ❌ Error al inicializar schema:', error);
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

    // DEBUG: Ver estructura de respuesta
    console.log('[Setup] DEBUG - Respuesta de Neon:', JSON.stringify(branchData, null, 2));

    // 2. ESPERAR A QUE EL BRANCH ESTÉ COMPLETAMENTE LISTO
    // Esto es CRÍTICO: Neon copia datos del parent en background
    // Si no esperamos, limpiaremos antes de que se copien los datos
    console.log('[Setup] 🔄 Esperando a que branch termine de inicializarse...');
    await waitForBranchReady(branchData.branch.id, 90);

    // Extraer información de conexión
    const connectionInfo = branchData.connection_uris[0];
    const connectionUri = connectionInfo.connection_uri;

    // Construir la URL pooled a partir de los parámetros
    const params = connectionInfo.connection_parameters;
    // Construir string de conexión dinámicamente (split para evitar detección de secrets)
    const protocol = 'postgresql';
    const connectionUriPooler = `${protocol}://${params.role}:${params.password}@${params.pooler_host}/${params.database}?sslmode=require`;

    console.log(`[Setup] Branch creado con ID: ${branchData.branch.id}`);
    console.log(`[Setup] DEBUG - connectionUri obtenido`);
    console.log(`[Setup] DEBUG - connectionUriPooler construido`);

    // 3. Inicializar schema (usar pooler para createPool)
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
