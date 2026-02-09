# 🛡️ Diseño de Sistema de Backup - LAVAPP SaaS Multitenant

**Fecha**: 2026-02-09  
**Estado**: Diseño técnico  
**Sistema**: LAVAPP SaaS (Postgres en Neon + Vercel)

---

## 🎯 Objetivo

Backup completo y restaurable del sistema SaaS multitenant sin modificar el schema ni la lógica existente.

### Requisitos
- ✅ Backup completo (schema + datos)
- ✅ Almacenamiento externo (Google Drive)
- ✅ Independiente de Neon y Vercel
- ✅ Restaurable en un branch nuevo de Neon
- ✅ Sin modificar schema existente
- ✅ Sin agregar soft delete ni auditoría
- ✅ Sin cambiar queries

---

## 🏗️ 1. Arquitectura de Backup

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    LAVAPP SaaS Architecture                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐         ┌─────────────────┐               │
│  │ Vercel App   │────────►│ Neon Postgres   │               │
│  │ (Frontend +  │         │                 │               │
│  │  Backend)    │         │ - Branch Central│               │
│  └──────────────┘         │ - Branch Lavapp │               │
│                           │ - Branch Demos  │               │
│                           └────────┬────────┘               │
│                                    │                         │
│                                    │ pg_dump                │
│                                    ▼                         │
│                           ┌────────────────┐                │
│                           │ Backup Script  │                │
│                           │  (Node.js)     │                │
│                           │                │                │
│                           │ - pg_dump exec │                │
│                           │ - Compression  │                │
│                           │ - Encryption   │                │
│                           │ - Upload       │                │
│                           └────────┬───────┘                │
│                                    │                         │
│                                    │ HTTPS                   │
│                                    ▼                         │
│                           ┌────────────────┐                │
│                           │ Google Drive   │                │
│                           │   API v3       │                │
│                           │                │                │
│                           │ /backups/      │                │
│                           │   └─ central/  │                │
│                           │   └─ lavapp/   │                │
│                           │   └─ demos/    │                │
│                           └────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

| Componente | Herramienta | Justificación |
|------------|-------------|---------------|
| **Export** | `pg_dump` (CLI) | Estándar de PostgreSQL, formato compatible |
| **Runtime** | Node.js script | Integración con ecosystem existente |
| **Compresión** | Custom format (built-in) | Compresión incluida en pg_dump, ~70% reducción |
| **Encriptación** | AES-256-CBC (openssl) | Proteger datos sensibles, estándar de la industria |
| **Storage** | Google Drive API v3 | 15GB gratis, versionado automático |
| **Scheduling** | GitHub Actions | Robusto, logs persistentes, no depende de Vercel |
| **Restore** | `pg_restore` + script Node.js | Estándar PostgreSQL |

---

## 📦 2. Formato de Backup Recomendado

### Formato Principal: `pg_dump` Custom Format

**Comando**:
```bash
pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --clean \
  --if-exists \
  --verbose \
  "$DATABASE_URL" \
  --file="backup.dump"

# Luego encriptar (sin gzip adicional)
openssl enc -aes-256-cbc -salt \
  -in backup.dump \
  -out backup.dump.enc \
  -pass pass:$BACKUP_ENCRYPTION_KEY
```

**Características**:
- ✅ **Custom format** (`.dump`): Flexible, comprimido, selectivo para restore
- ✅ **Compress=9**: Máxima compresión (~70% reducción) ya incluida
- ✅ **--clean**: Incluye DROP commands para restore limpio
- ✅ **--if-exists**: Evita errores si objetos no existen
- ✅ **--no-owner**: Evita problemas de permisos en restore
- ✅ **--verbose**: Logging detallado
- ✅ **AES-256 solo**: No necesita gzip adicional, más simple

**Nota**: El formato custom ya incluye compresión interna, por lo que NO se necesita `gzip` adicional. Solo aplicar encriptación AES-256.

### Estructura de Archivos en Google Drive

```
/LAVAPP_Backups/
├─ central/
│  ├─ 2026-02/
│  │  ├─ central_2026-02-09_00-00.dump.enc
│  │  ├─ central_2026-02-09_00-00.metadata.json
│  │  ├─ central_2026-02-08_00-00.dump.enc
│  │  └─ ...
│  └─ 2026-01/
│     └─ ...
│
├─ lavapp/
│  ├─ 2026-02/
│  │  ├─ lavapp_2026-02-09_00-00.dump.enc
│  │  ├─ lavapp_2026-02-09_00-00.metadata.json
│  │  └─ ...
│  └─ 2026-01/
│
├─ demos/
│  └─ (similar structure)
│
└─ README.md (instrucciones de restore)
```

**Nota**: Extensión `.dump.enc` (no `.dump.gz.enc`) porque el custom format ya está comprimido.

### Metadata JSON

Cada backup tiene un archivo metadata:

```json
{
  "backup_id": "lavapp_2026-02-09_00-00",
  "branch": "lavapp",
  "timestamp": "2026-02-09T03:00:00Z",
  "database_name": "neondb",
  "database_version": "PostgreSQL 16.1",
  "schema_version": "1.0.0",
  "backup_size_bytes": 15728640,
  "backup_size_compressed": 3145728,
  "compression_ratio": 0.20,
  "tables": [
    { "name": "registros_lavado", "row_count": 1523 },
    { "name": "clientes", "row_count": 234 },
    { "name": "usuarios", "row_count": 5 }
  ],
  "backup_duration_seconds": 12,
  "encrypted": true,
  "encryption_algorithm": "aes-256-cbc",
  "checksum_sha256": "abc123...",
  "script_version": "1.0.0"
}
```

---

## ⏰ 3. Frecuencia y Política de Retención

### Estrategia 3-2-1

- **3** copias de datos (producción + 2 backups)
- **2** formatos/ubicaciones diferentes
- **1** copia offsite (Google Drive)

### Frecuencia de Backups

| Tipo | Frecuencia | Hora (UTC-3) | Retención |
|------|------------|--------------|-----------|
| **Full Backup** | Diario | 03:00 AM | 30 días |
| **Weekly Snapshot** | Semanal (Domingo) | 02:00 AM | 3 meses |
| **Monthly Archive** | Mensual (día 1) | 01:00 AM | 1 año |

### Política de Retención Detallada

```javascript
// Pseudo-código de retención
const retentionPolicy = {
  daily: {
    keep: 30,        // Últimos 30 días
    deleteAfter: 30  // Borrar después de 30 días
  },
  weekly: {
    keep: 12,        // Últimas 12 semanas = 3 meses
    deleteAfter: 90  // Borrar después de 90 días
  },
  monthly: {
    keep: 12,        // Últimos 12 meses = 1 año
    deleteAfter: 365 // Borrar después de 1 año
  }
};
```

### Rotación Automática

**Ejemplo**: Si hoy es 10 de marzo:
- ✅ Mantener: Todos los backups diarios desde 9 feb hasta hoy (30 días)
- ✅ Mantener: Backups semanales desde diciembre (12 semanas)
- ✅ Mantener: Backups mensuales desde marzo 2025 (12 meses)
- ❌ Eliminar: Backups diarios de antes del 9 de febrero
- ❌ Eliminar: Backups semanales de antes de diciembre
- ❌ Eliminar: Backups mensuales de antes de marzo 2025

### Espacio Estimado en Google Drive

| Branch | Tamaño BD (sin compress) | Comprimido (20%) | Por 30 días | Por 3 meses |
|--------|-------------------------|------------------|-------------|-------------|
| central | ~50 MB | ~10 MB | 300 MB | 900 MB |
| lavapp | ~100 MB | ~20 MB | 600 MB | 1.8 GB |
| demos | ~20 MB | ~4 MB | 120 MB | 360 MB |
| **TOTAL** | - | ~34 MB/día | **1 GB** | **3 GB** |

**Conclusión**: Con 15 GB gratis en Google Drive, tenés espacio para **4-5 años** de backups.

---

## 🔧 4. Procedimiento de Restore Seguro en Branch

### Flujo de Restauración

```
1. Descargar backup de Google Drive
        ↓
2. Desencriptar y descomprimir
        ↓
3. Crear nuevo branch en Neon (restore-YYYY-MM-DD)
        ↓
4. Obtener connection string del nuevo branch
        ↓
5. Ejecutar pg_restore en el nuevo branch
        ↓
6. Validar datos restaurados (checksums, counts)
        ↓
7. Si OK → Promover branch a producción
   Si ERROR → Eliminar branch y reintentar
```

### Script de Restore (Pseudocódigo)

```javascript
// scripts/restore-backup.js

const restoreBackup = async (options) => {
  const {
    backupId,           // "lavapp_2026-02-09_00-00"
    targetBranch,       // Nuevo branch de Neon
    validateOnly        // Solo validar sin aplicar
  } = options;

  console.log(`🔄 Iniciando restore de ${backupId}`);

  // 1. Descargar desde Google Drive
  const backupFile = await downloadFromDrive(backupId);
  console.log(`✅ Descargado: ${backupFile}`);

  // 2. Desencriptar
  const decrypted = await decrypt(backupFile, process.env.BACKUP_ENCRYPTION_KEY);
  console.log(`✅ Desencriptado`);

  // 3. Verificar checksum
  const metadata = await readMetadata(backupId);
  const checksum = await calculateSHA256(decrypted);
  if (checksum !== metadata.checksum_sha256) {
    throw new Error('❌ Checksum mismatch - archivo corrupto');
  }
  console.log(`✅ Checksum verificado`);

  // 4. Crear branch de Neon para restore
  const restoreBranch = await createNeonBranch({
    name: `restore-${backupId}`,
    parent: 'main' // Branch vacío
  });
  console.log(`✅ Branch creado: ${restoreBranch.id}`);

  // 5. Esperar que branch esté listo
  await waitForBranchReady(restoreBranch.id);

  // 6. Obtener connection string
  const connectionString = restoreBranch.connection_uri;

  // 7. Ejecutar pg_restore
  if (!validateOnly) {
    await execPromise(`
      pg_restore \
        --dbname="${connectionString}" \
        --verbose \
        --clean \
        --if-exists \
        --no-owner \
        --no-privileges \
        ${decrypted}
    `);
    console.log(`✅ Restore completado en branch ${restoreBranch.id}`);
  }

  // 8. Validar datos restaurados
  const validation = await validateRestoredData(connectionString, metadata);
  
  if (validation.success) {
    console.log(`✅ Validación exitosa`);
    console.log(`📊 Tablas: ${validation.tableCount}`);
    console.log(`📊 Registros: ${validation.totalRows}`);
    return { success: true, branch: restoreBranch };
  } else {
    console.error(`❌ Validación falló: ${validation.errors}`);
    if (!validateOnly) {
      await deleteNeonBranch(restoreBranch.id);
      console.log(`🗑️ Branch de restore eliminado`);
    }
    return { success: false, errors: validation.errors };
  }
};
```

### Comandos Manuales de Restore

**Opción 1: Restore completo (Custom format)**

```bash
# 1. Descargar y desencriptar
openssl enc -d -aes-256-cbc -in backup.dump.gz.enc -out backup.dump.gz \
  -pass pass:$BACKUP_KEY
gunzip backup.dump.gz

# 2. Crear branch de Neon (manual en UI o via API)
# Obtener connection string del nuevo branch

# 3. Restaurar
pg_restore \
  --dbname="$RESTORE_CONNECTION_STRING" \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  backup.dump

# 4. Validar
psql "$RESTORE_CONNECTION_STRING" -c "\dt"
psql "$RESTORE_CONNECTION_STRING" -c "SELECT COUNT(*) FROM registros_lavado;"
```

**Opción 2: Restore de tablas específicas**

```bash
# Solo restaurar tabla de registros
pg_restore \
  --dbname="$RESTORE_CONNECTION_STRING" \
  --table=registros_lavado \
  --verbose \
  backup.dump
```

**Opción 3: Restore desde SQL plain text**

```bash
# 1. Descargar y desencriptar
openssl enc -d -aes-256-cbc -in backup.sql.gz.enc -out backup.sql.gz \
  -pass pass:$BACKUP_KEY
gunzip backup.sql.gz

# 2. Restaurar
psql "$RESTORE_CONNECTION_STRING" < backup.sql
```

### Estrategia de Promoción de Branch

Una vez validado el restore:

**Opción A**: Cambiar connection string en Vercel
```bash
# Actualizar variable de entorno en Vercel
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# (pegar el nuevo connection string del branch restaurado)
```

**Opción B**: Copiar datos al branch original
```sql
-- Desde el branch restaurado al branch producción
-- (requiere lógica más compleja, no recomendado)
```

**Opción C**: Usar branch restaurado como nuevo principal
```bash
# En Neon console:
# 1. Renombrar branch actual → "old-production-backup"
# 2. Renombrar branch restaurado → "production"
# 3. Actualizar connection string en Vercel si cambió
```

---

## ✅ 5. Checklist de Validación Post-Restore

### Validación Automática (Script)

```javascript
// scripts/validate-restore.js

const validateRestoredData = async (connectionString, originalMetadata) => {
  const client = await connectToPostgres(connectionString);
  
  const validations = {
    schema: await validateSchema(client, originalMetadata),
    data: await validateData(client, originalMetadata),
    integrity: await validateIntegrity(client),
    functionality: await validateFunctionality(client)
  };

  return {
    success: Object.values(validations).every(v => v.passed),
    details: validations
  };
};

// 1. Validación de Schema
const validateSchema = async (client, metadata) => {
  const checks = [];

  // Verificar que todas las tablas existen
  for (const table of metadata.tables) {
    const exists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = '${table.name}'
      );
    `);
    checks.push({
      name: `Tabla ${table.name} existe`,
      passed: exists.rows[0].exists
    });
  }

  // Verificar cantidad de tablas
  const tableCount = await client.query(`
    SELECT COUNT(*) FROM information_schema.tables 
    WHERE table_schema = 'public';
  `);
  checks.push({
    name: 'Cantidad de tablas',
    expected: metadata.tables.length,
    actual: parseInt(tableCount.rows[0].count),
    passed: parseInt(tableCount.rows[0].count) === metadata.tables.length
  });

  return { passed: checks.every(c => c.passed), checks };
};

// 2. Validación de Datos
const validateData = async (client, metadata) => {
  const checks = [];

  // Verificar row counts por tabla
  for (const table of metadata.tables) {
    const count = await client.query(`SELECT COUNT(*) FROM ${table.name}`);
    const actual = parseInt(count.rows[0].count);
    
    checks.push({
      name: `Registros en ${table.name}`,
      expected: table.row_count,
      actual: actual,
      passed: actual === table.row_count,
      tolerance: Math.abs(actual - table.row_count) <= 5 // Tolerancia de 5 registros
    });
  }

  return { passed: checks.every(c => c.passed || c.tolerance), checks };
};

// 3. Validación de Integridad
const validateIntegrity = async (client) => {
  const checks = [];

  // Foreign keys
  const fkCheck = await client.query(`
    SELECT COUNT(*) FROM information_schema.table_constraints 
    WHERE constraint_type = 'FOREIGN KEY';
  `);
  checks.push({
    name: 'Foreign keys presentes',
    actual: parseInt(fkCheck.rows[0].count),
    passed: parseInt(fkCheck.rows[0].count) > 0
  });

  // Indexes
  const indexCheck = await client.query(`
    SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public';
  `);
  checks.push({
    name: 'Índices presentes',
    actual: parseInt(indexCheck.rows[0].count),
    passed: parseInt(indexCheck.rows[0].count) > 0
  });

  // Secuencias
  const seqCheck = await client.query(`
    SELECT COUNT(*) FROM information_schema.sequences;
  `);
  checks.push({
    name: 'Secuencias presentes',
    actual: parseInt(seqCheck.rows[0].count),
    passed: parseInt(seqCheck.rows[0].count) > 0
  });

  return { passed: checks.every(c => c.passed), checks };
};

// 4. Validación Funcional
const validateFunctionality = async (client) => {
  const checks = [];

  // Test query simple
  try {
    await client.query('SELECT 1');
    checks.push({ name: 'Query básica', passed: true });
  } catch (e) {
    checks.push({ name: 'Query básica', passed: false, error: e.message });
  }

  // Test join entre tablas críticas
  try {
    const result = await client.query(`
      SELECT COUNT(*) FROM registros_lavado r
      JOIN clientes c ON r.celular = c.celular
      LIMIT 1;
    `);
    checks.push({ name: 'Join registros-clientes', passed: true });
  } catch (e) {
    checks.push({ name: 'Join registros-clientes', passed: false, error: e.message });
  }

  return { passed: checks.every(c => c.passed), checks };
};
```

### Checklist Manual de Validación

**CRÍTICO - Verificar antes de promover a producción**:

#### 1. Schema
- [ ] Todas las tablas esperadas existen
- [ ] Columnas críticas presentes (registros_lavado.id, .patente, .celular)
- [ ] Foreign keys activas
- [ ] Índices creados
- [ ] Secuencias reiniciadas correctamente

#### 2. Datos
- [ ] Cantidad de registros en `registros_lavado` coincide (~±5)
- [ ] Cantidad de registros en `clientes` coincide
- [ ] Cantidad de usuarios coincide
- [ ] Último registro tiene fecha coherente
- [ ] No hay duplicados en `registros_lavado.id`
- [ ] No hay valores NULL en columnas NOT NULL

#### 3. Integridad Referencial
- [ ] Todos los `registros_lavado.celular` existen en `clientes.celular`
- [ ] Todos los `registros_lavado.usuario_id` existen en `usuarios.id`
- [ ] No hay registros huérfanos

#### 4. Funcionalidad
- [ ] Query básica funciona: `SELECT * FROM registros_lavado LIMIT 1`
- [ ] Join funciona: `SELECT r.*, c.nombre FROM registros_lavado r JOIN clientes c ON r.celular = c.celular LIMIT 1`
- [ ] Autenticación funciona (usuarios pueden hacer login)
- [ ] Agregar un registro de prueba funciona
- [ ] Eliminar registro de prueba funciona

#### 5. Performance
- [ ] Índices funcionando: `EXPLAIN SELECT * FROM registros_lavado WHERE patente = 'ABC123'`
- [ ] Query time razonable (< 100ms para queries simples)

#### 6. Específico Multitenant
- [ ] Empresas en branch central existen
- [ ] Branch URLs en `empresas` tabla son válidos
- [ ] Cada empresa tiene su configuración (listas_precios, tipos_vehiculo)

### Queries de Validación Manual

```sql
-- 1. Verificar estructura de tablas
\dt

-- 2. Verificar row counts
SELECT 
  'registros_lavado' as tabla, COUNT(*) as registros FROM registros_lavado
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'usuarios', COUNT(*) FROM usuarios
UNION ALL
SELECT 'empresas', COUNT(*) FROM empresas
UNION ALL
SELECT 'listas_precios', COUNT(*) FROM listas_precios;

-- 3. Verificar integridad referencial
SELECT COUNT(*) as registros_huerfanos
FROM registros_lavado r
LEFT JOIN clientes c ON r.celular = c.celular
WHERE c.celular IS NULL;

-- Debería dar 0

-- 4. Verificar último registro (fecha coherente)
SELECT * FROM registros_lavado 
ORDER BY fecha_hora DESC 
LIMIT 5;

-- 5. Verificar usuarios pueden autenticar
SELECT id, username, email, rol 
FROM usuarios 
WHERE username = 'admin';

-- 6. Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 7. Verificar foreign keys
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- 8. Verificar secuencias
SELECT 
  sequencename,
  last_value,
  increment_by
FROM pg_sequences
WHERE schemaname = 'public';
```

---

## 🚨 Procedimiento de Rollback

Si el restore falla o la validación no pasa:

### Rollback Seguro

```javascript
// scripts/rollback-restore.js

const rollbackRestore = async (restoreBranchId) => {
  console.log(`⚠️ Iniciando rollback de restore en branch ${restoreBranchId}`);

  // 1. Verificar que branch de producción original sigue activo
  const prodBranch = await getNeonBranch('production');
  if (!prodBranch.active) {
    throw new Error('❌ Branch de producción no está activo - CRÍTICO');
  }

  // 2. Verificar que Vercel apunta al branch correcto
  const vercelEnv = await getVercelEnv('DATABASE_URL');
  if (vercelEnv !== prodBranch.connection_uri) {
    console.log('⚠️ Vercel no apunta a producción - restaurando...');
    await setVercelEnv('DATABASE_URL', prodBranch.connection_uri);
  }

  // 3. Eliminar branch de restore fallido
  await deleteNeonBranch(restoreBranchId);
  console.log(`✅ Branch ${restoreBranchId} eliminado`);

  // 4. Validar que producción funciona
  const validation = await validateProductionHealth(prodBranch.connection_uri);
  if (!validation.healthy) {
    throw new Error('❌ Producción no está saludable post-rollback - ALERTA');
  }

  console.log(`✅ Rollback completado - sistema en estado original`);
};
```

---

## 📊 Monitoreo y Alertas

### Métricas Clave

| Métrica | Objetivo | Alerta si |
|---------|----------|-----------|
| Duración de backup | < 5 min | > 10 min |
| Tamaño de backup | Crecimiento gradual | Aumento >50% súbito |
| Éxito de backup | 100% | Fallo 2 días consecutivos |
| Espacio en Drive | < 50% usado | > 80% usado |
| Validación post-backup | 100% pass | Cualquier check falla |

### Logs Requeridos

Cada backup debe generar log con:
- Timestamp inicio y fin
- Duración total
- Tamaño del backup
- Cantidad de tablas exportadas
- Row counts por tabla crítica
- Checksum del archivo
- Éxito/fallo del upload a Drive
- Cualquier warning o error

**Formato de log**:
```json
{
  "backup_id": "lavapp_2026-02-09_03-00",
  "status": "success",
  "started_at": "2026-02-09T03:00:00Z",
  "completed_at": "2026-02-09T03:04:23Z",
  "duration_seconds": 263,
  "database": "lavapp",
  "size_uncompressed": 104857600,
  "size_compressed": 20971520,
  "compression_ratio": 0.20,
  "tables_backed_up": 15,
  "critical_tables": {
    "registros_lavado": 1523,
    "clientes": 234,
    "usuarios": 5
  },
  "checksum": "sha256:abc123...",
  "uploaded_to_drive": true,
  "drive_file_id": "1ABC...XYZ",
  "warnings": [],
  "errors": []
}
```

---

## 🔐 Seguridad

### Encriptación

**Algoritmo**: AES-256-CBC

**Keys**:
- Key principal en Vercel Environment Variable: `BACKUP_ENCRYPTION_KEY`
- Key rotation cada 6 meses
- Keys antiguas guardadas para restore de backups viejos

**Comando de encriptación**:
```bash
openssl enc -aes-256-cbc -salt \
  -in backup.dump.gz \
  -out backup.dump.gz.enc \
  -pass pass:$BACKUP_ENCRYPTION_KEY
```

**Comando de desencriptación**:
```bash
openssl enc -d -aes-256-cbc \
  -in backup.dump.gz.enc \
  -out backup.dump.gz \
  -pass pass:$BACKUP_ENCRYPTION_KEY
```

### Autenticación Google Drive

**Método**: Service Account (no requiere interacción humana)

**Setup**:
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear Service Account
4. Descargar JSON de credenciales
5. Compartir folder de backups con email del service account
6. Guardar credentials en Vercel Environment Variables

**Permisos requeridos**:
- `https://www.googleapis.com/auth/drive.file` (solo archivos creados por la app)

---

## 🎯 Implementación en Fases

### Fase 1: MVP (1-2 días)
- [ ] Script básico de backup (pg_dump)
- [ ] Upload manual a Google Drive
- [ ] Metadata JSON
- [ ] Testing de restore manual

### Fase 2: Automatización (2-3 días)
- [ ] Integración con Google Drive API
- [ ] Vercel Cron Job para backups diarios
- [ ] Encriptación
- [ ] Logs estructurados

### Fase 3: Validación (1-2 días)
- [ ] Script de validación post-backup
- [ ] Script de restore automatizado
- [ ] Checklist de validación
- [ ] Testing en branch de restore

### Fase 4: Producción (1 día)
- [ ] Política de retención implementada
- [ ] Monitoreo y alertas
- [ ] Documentación completa
- [ ] Runbook de emergencia

---

## 📝 Comandos Rápidos de Referencia

### Backup Manual
```bash
# Full backup de un branch
pg_dump --format=custom --compress=9 \
  "$NEON_CONNECTION_STRING" \
  --file="backup_$(date +%Y-%m-%d).dump"
```

### Restore Manual
```bash
# Crear branch en Neon UI primero, luego:
pg_restore \
  --dbname="$RESTORE_CONNECTION_STRING" \
  --verbose --clean --if-exists \
  backup_2026-02-09.dump
```

### Validar Backup
```bash
# Listar contenido sin restaurar
pg_restore --list backup.dump | head -20
```

### Checksum
```bash
# Generar checksum
sha256sum backup.dump > backup.dump.sha256

# Verificar checksum
sha256sum -c backup.dump.sha256
```

---

## ❓ FAQ - Preguntas Frecuentes

### ¿Por qué no usar Neon's built-in backups?

**Respuesta**: Plan Free de Neon NO incluye backups automáticos. Solo Plan Launch ($19/mes) tiene PITR. Este sistema es para mantener $0 de costo recurrente.

### ¿Por qué Google Drive y no AWS S3?

**Respuesta**: 
- Google Drive: 15 GB gratis, suficiente para años
- AWS S3: Cuesta dinero ($0.023/GB/mes + requests)
- Si el proyecto crece, podés migrar a S3 fácilmente

### ¿Qué pasa si Google Drive se llena?

**Respuesta**: Con la política de retención (30 días + 3 meses + 1 año), usás ~3-4 GB. Si se llena:
1. Ajustar retención (e.g., 15 días en vez de 30)
2. Comprar Google One ($2/mes por 100GB)
3. Migrar a otro storage (S3, Backblaze)

### ¿Puedo restaurar solo una tabla?

**Respuesta**: Sí, con custom format:
```bash
pg_restore --table=registros_lavado backup.dump
```

### ¿Cuánto tarda un restore completo?

**Respuesta**: 
- Descargar de Drive: 1-2 min (para 20MB)
- Crear branch Neon: 30-60 seg
- Restore pg_restore: 2-5 min (depende de tamaño)
- Validación: 1-2 min
- **Total**: 5-10 minutos

### ¿Qué pasa si falla un backup automático?

**Respuesta**: El script debería:
1. Reintentar 3 veces con delay
2. Si sigue fallando, enviar alerta (email/Slack)
3. Logging detallado del error
4. No sobrescribir último backup exitoso

### ¿Cómo pruebo que el backup funciona?

**Respuesta**: Monthly drill:
1. Tomar backup de producción
2. Crear branch de test
3. Restaurar en branch de test
4. Ejecutar checklist de validación
5. Eliminar branch de test
6. Documentar resultado

---

## 🎯 Próximos Pasos

Una vez aprobado este diseño:

1. [ ] Crear Service Account de Google Cloud
2. [ ] Crear script `scripts/backup-to-drive.js`
3. [ ] Crear script `scripts/restore-from-drive.js`
4. [ ] Crear script `scripts/validate-restore.js`
5. [ ] Configurar Vercel Cron Job
6. [ ] Testing completo en staging
7. [ ] Primer backup manual de producción
8. [ ] Restore drill en branch de test
9. [ ] Documentar runbook de emergencia
10. [ ] Activar backups automáticos

**Tiempo estimado total**: 5-7 días de desarrollo + testing

---

## 📚 Referencias

- [PostgreSQL pg_dump docs](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL pg_restore docs](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/about-sdk)
- [Neon Branching Guide](https://neon.tech/docs/guides/branching)
- [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

**Documento creado**: 2026-02-09  
**Autor**: Sistema de Backup LAVAPP  
**Versión**: 1.0.0  
**Estado**: Pendiente aprobación
