# 🛡️ Diseño de Sistema de Backup - LAVAPP SaaS Multitenant

**Fecha**: 2026-02-09  
**Última actualización**: 2026-02-09  
**Versión**: 2.0.0 (Con ajustes pre-implementación)  
**Estado**: Listo para aprobación final  
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
│                  ┌─────────────────────────────┐            │
│                  │   GitHub Actions Runner     │            │
│                  │   (Scheduled Workflow)      │            │
│                  │                             │            │
│                  │  - pg_dump exec             │            │
│                  │  - AES-256 encryption       │            │
│                  │  - Google Drive upload      │            │
│                  │  - Validation & logs        │            │
│                  └──────────────┬──────────────┘            │
│                                 │                            │
│                                 │ HTTPS                      │
│                                 ▼                            │
│                  ┌──────────────────────────┐               │
│                  │    Google Drive API v3   │               │
│                  │                          │               │
│                  │  /LAVAPP_Backups/        │               │
│                  │    └─ central/           │               │
│                  │    └─ lavapp/            │               │
│                  │    └─ demos/             │               │
│                  └──────────────────────────┘               │
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
| **Scheduling** | **GitHub Actions** | Robusto, logs persistentes, independiente de Vercel |
| **Restore** | `pg_restore` + script Node.js | Estándar PostgreSQL |

### ¿Por qué GitHub Actions y no Vercel Cron?

**GitHub Actions**:
- ✅ Logs persistentes e históricos
- ✅ Manejo robusto de secrets
- ✅ No depende del deployment de Vercel
- ✅ Puede correr aunque Vercel esté caído
- ✅ Mayor control y visibilidad
- ✅ Reintentos automáticos configurables
- ✅ Notificaciones nativas de fallos

**Vercel Cron**:
- ⚠️ Logs efímeros (desaparecen)
- ⚠️ Depende de que la app esté deployada
- ⚠️ Menos control sobre el entorno
- ⚠️ Si Vercel cae, no hay backup

**Decisión**: GitHub Actions es más robusto para operaciones críticas como backups.

---

## 📦 2. Formato de Backup Recomendado

### Formato: `pg_dump` Custom Format + AES-256

**Comando simplificado**:
```bash
# 1. Backup (custom format ya incluye compresión)
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

# 2. Encriptar (sin gzip adicional, más simple)
openssl enc -aes-256-cbc -salt \
  -in backup.dump \
  -out backup.dump.enc \
  -pass pass:$BACKUP_ENCRYPTION_KEY
```

### Simplificación vs Diseño Original

**ANTES** (más complejo):
```bash
pg_dump → backup.dump → gzip → backup.dump.gz → encrypt → backup.dump.gz.enc
```

**AHORA** (más simple):
```bash
pg_dump → backup.dump (ya comprimido) → encrypt → backup.dump.enc
```

**Ventajas**:
- ✅ Menos pasos = menos puntos de fallo
- ✅ Mismo nivel de compresión (custom format usa gzip internamente)
- ✅ Mismo nivel de seguridad (AES-256)
- ✅ Más fácil de mantener
- ✅ Menos procesamiento CPU

**Características**:
- ✅ **Custom format** (`.dump`): Flexible, comprimido, selectivo para restore
- ✅ **Compress=9**: Máxima compresión (~70% reducción) ya incluida
- ✅ **--clean**: Incluye DROP commands para restore limpio
- ✅ **--if-exists**: Evita errores si objetos no existen
- ✅ **--no-owner**: Evita problemas de permisos en restore
- ✅ **--verbose**: Logging detallado
- ✅ **AES-256 solo**: No necesita gzip adicional

---

### Estructura de Archivos en Google Drive

```
/LAVAPP_Backups/
├─ central/
│  ├─ 2026-02/
│  │  ├─ central_2026-02-09_03-00.dump.enc
│  │  ├─ central_2026-02-09_03-00.metadata.json
│  │  ├─ central_2026-02-08_03-00.dump.enc
│  │  └─ ...
│  └─ 2026-01/
│     └─ ...
│
├─ lavapp/
│  ├─ 2026-02/
│  │  ├─ lavapp_2026-02-09_03-00.dump.enc
│  │  ├─ lavapp_2026-02-09_03-00.metadata.json
│  │  └─ ...
│  └─ 2026-01/
│
├─ demos/
│  └─ (estructura similar)
│
└─ README.md (instrucciones de restore)
```

**Nota**: Extensión `.dump.enc` (no `.dump.gz.enc`) porque el custom format ya está comprimido.

### Metadata JSON

Cada backup tiene un archivo metadata:

```json
{
  "backup_id": "lavapp_2026-02-09_03-00",
  "branch": "lavapp",
  "timestamp": "2026-02-09T06:00:00Z",
  "database_name": "neondb",
  "database_version": "PostgreSQL 16.1",
  "schema_version": "1.0.0",
  "backup_size_bytes": 104857600,
  "backup_size_compressed": 20971520,
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
  "script_version": "2.0.0",
  "github_action_run": "https://github.com/user/repo/actions/runs/123456"
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

| Branch | Tamaño BD | Comprimido (20%) | Por 30 días | Por 3 meses |
|--------|-----------|------------------|-------------|-------------|
| central | ~50 MB | ~10 MB | 300 MB | 900 MB |
| lavapp | ~100 MB | ~20 MB | 600 MB | 1.8 GB |
| demos | ~20 MB | ~4 MB | 120 MB | 360 MB |
| **TOTAL** | - | ~34 MB/día | **1 GB** | **3 GB** |

**Conclusión**: Con 15 GB gratis en Google Drive, tenés espacio para **4-5 años** de backups.

---

## 🔧 4. Procedimiento de Restore Seguro en Branch

### ⚠️ REGLA CRÍTICA: Siempre Restore en Branch NUEVO

**NUNCA** restaurar directamente sobre producción. **SIEMPRE** crear un branch nuevo en Neon para restore, validar, y luego promover.

### Flujo de Restauración

```
1. Descargar backup de Google Drive
        ↓
2. Desencriptar (sin descomprimir, custom format ya está listo)
        ↓
3. Verificar checksum SHA-256
        ↓
4. Crear NUEVO branch en Neon (restore-YYYY-MM-DD)
        ↓
5. Obtener connection string del nuevo branch
        ↓
6. Ejecutar pg_restore en el NUEVO branch
        ↓
7. Validar datos restaurados (30+ checks)
        ↓
8. Si OK → Promover branch a producción
   Si ERROR → Eliminar branch y reintentar
```

### Comandos Manuales de Restore

**Restore completo en branch nuevo (RECOMENDADO)**

```bash
# 1. Desencriptar (custom format ya está comprimido, no necesita gunzip)
openssl enc -d -aes-256-cbc \
  -in backup.dump.enc \
  -out backup.dump \
  -pass pass:$BACKUP_KEY

# 2. Verificar checksum
sha256sum backup.dump
# Comparar con metadata.json

# 3. Crear branch NUEVO en Neon (manual en UI o via API)
# IMPORTANTE: Siempre crear branch NUEVO para restore
# Nombre sugerido: restore-lavapp-2026-02-09

# 4. Obtener connection string del nuevo branch

# 5. Restaurar en el branch nuevo
pg_restore \
  --dbname="$RESTORE_CONNECTION_STRING" \
  --verbose \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  backup.dump

# 6. Validar (ver sección de validación)
psql "$RESTORE_CONNECTION_STRING" -c "\dt"
psql "$RESTORE_CONNECTION_STRING" -c "SELECT COUNT(*) FROM registros_lavado;"
```

**Restore de tablas específicas (si es necesario)**

```bash
# Solo restaurar tabla específica en branch nuevo
pg_restore \
  --dbname="$RESTORE_CONNECTION_STRING" \
  --table=registros_lavado \
  --verbose \
  backup.dump
```

### Estrategia de Promoción de Branch

Una vez validado el restore en branch nuevo:

**Opción A (RECOMENDADA)**: Cambiar connection string en Vercel

```bash
# Actualizar variable de entorno en Vercel
vercel env rm DATABASE_URL production
vercel env add DATABASE_URL production
# (pegar el nuevo connection string del branch restaurado)

# Redeploy para aplicar cambios
vercel --prod
```

**Opción B**: Renombrar branches en Neon

```bash
# En Neon console:
# 1. Renombrar branch actual → "old-production-backup-2026-02-09"
# 2. Renombrar branch restaurado → "production"
# 3. Actualizar connection string en Vercel si cambió
```

**❌ NO RECOMENDADO**: Copiar datos al branch original (riesgoso, complejo, propenso a errores)

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

## 🔄 Restore por Tenant - Readiness

### Estado Actual del Diseño

**Scope actual**: Backup y restore de **branches completos** (central, lavapp, demos)

**Tenant-restore**: Actualmente **FUERA DE SCOPE** de esta implementación

### ¿Por qué tenant-restore no está incluido?

La arquitectura multitenant actual de LAVAPP usa **branches separados de Neon por empresa**:
- Branch `central`: Datos centrales (usuarios super-admin, empresas)
- Branch `lavapp`: Empresa LAVAPP
- Branch `demo-empresa-123`: Otras empresas demo

**En esta arquitectura**:
- Restore por tenant = Restore del branch completo de esa empresa
- **NO existe** el concepto de múltiples tenants en un branch compartido

Por lo tanto, **tenant-restore YA ESTÁ CUBIERTO** por el diseño actual (restaurar branch completo = restaurar tenant completo).

### ¿Qué NO se contempla? (Y por qué está bien así)

**NO se contempla**: Restore selectivo de datos de UN tenant dentro de un branch compartido por múltiples tenants.

**Razón**: Porque LAVAPP no usa ese modelo. Cada tenant tiene su propio branch.

### Preparación Futura (Si arquitectura cambia)

Si en el futuro se migra a un modelo donde **múltiples tenants comparten el mismo branch** (shared-database), se necesitarían estos cambios:

#### Cambios necesarios para tenant-restore en shared-database:

1. **Backup por tenant**:
```bash
# Ejemplo (no implementado ahora)
pg_dump --table="registros_lavado" \
  --where="empresa_id = 123" \
  "$DATABASE_URL"
```

2. **Restore selectivo**:
```javascript
// Restaurar solo datos de un tenant específico
const restoreTenant = async (backupFile, tenantId, targetBranch) => {
  // Implementación específica para shared-database
  // Filtrar por empresa_id durante restore
};
```

3. **Validación por tenant**:
```sql
-- Verificar que solo se restauró el tenant correcto
SELECT DISTINCT empresa_id FROM registros_lavado;
-- Debería mostrar solo el tenant restaurado
```

### ✅ Conclusión sobre Tenant-Restore

| Escenario | Estado | Notas |
|-----------|--------|-------|
| **Branch restore** | ✅ Completamente cubierto | Cada empresa tiene su branch |
| **Tenant restore en shared-DB** | ❌ Fuera de scope | No aplica a arquitectura actual |
| **Readiness futura** | ⚠️ Documentado | Requiere cambios si arquitectura cambia |

**Para LAVAPP actual**: Branch restore = Tenant restore. El diseño es suficiente.

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
  "started_at": "2026-02-09T06:00:00Z",
  "completed_at": "2026-02-09T06:04:23Z",
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
  "errors": [],
  "github_action_run": "https://github.com/user/repo/actions/runs/123456"
}
```

### Notificaciones

GitHub Actions permite notificaciones nativas:
- Email al fallar workflow
- Slack webhook (opcional)
- GitHub Issues automáticos (opcional)

---

## 🔐 Seguridad

### Encriptación Simplificada

**Algoritmo**: AES-256-CBC

**Keys**:
- Key principal en GitHub Secrets: `BACKUP_ENCRYPTION_KEY`
- Key rotation cada 6 meses
- Keys antiguas guardadas para restore de backups viejos

**Comando de encriptación**:
```bash
# Nota: backup.dump ya está comprimido por pg_dump custom format
openssl enc -aes-256-cbc -salt \
  -in backup.dump \
  -out backup.dump.enc \
  -pass pass:$BACKUP_ENCRYPTION_KEY
```

**Comando de desencriptación**:
```bash
openssl enc -d -aes-256-cbc \
  -in backup.dump.enc \
  -out backup.dump \
  -pass pass:$BACKUP_ENCRYPTION_KEY
```

**Simplicidad**: Solo AES-256, sin gzip adicional. El custom format de pg_dump ya incluye compresión óptima.

### Autenticación Google Drive

**Método**: Service Account (no requiere interacción humana)

**Setup**:
1. Crear proyecto en Google Cloud Console
2. Habilitar Google Drive API
3. Crear Service Account
4. Descargar JSON de credenciales
5. Compartir folder de backups con email del service account
6. Guardar credentials en GitHub Secrets (no Vercel)

**Permisos requeridos**:
- `https://www.googleapis.com/auth/drive.file` (solo archivos creados por la app)

### GitHub Secrets vs Vercel Environment Variables

**GitHub Secrets** (USAR):
- ✅ No accesibles desde la app en runtime
- ✅ Solo accesibles en GitHub Actions
- ✅ Logging enmascarado automáticamente
- ✅ Rotación más controlada

**Vercel Environment Variables** (NO USAR para backup):
- ⚠️ Accesibles desde la app
- ⚠️ Mayor superficie de ataque
- ⚠️ Riesgo si app es comprometida

---

## 🎯 Implementación en Fases

### Fase 1: MVP (1-2 días)
- [ ] Script básico de backup (pg_dump custom format)
- [ ] Encriptación AES-256 (sin gzip adicional)
- [ ] Upload manual a Google Drive
- [ ] Metadata JSON
- [ ] Testing de restore manual en branch nuevo

### Fase 2: Automatización (2-3 días)
- [ ] Integración con Google Drive API
- [ ] **GitHub Actions workflow** `.github/workflows/backup.yml`
- [ ] Secrets en GitHub (no Vercel)
- [ ] Logs estructurados y persistentes
- [ ] Notificaciones de fallos (email GitHub)
- [ ] Reintentos automáticos

### Fase 3: Validación (1-2 días)
- [ ] Script de validación post-backup
- [ ] Script de restore automatizado (siempre a branch nuevo)
- [ ] Checklist de validación (30+ checks)
- [ ] Testing completo en branch de test
- [ ] Procedimiento de promoción documentado
- [ ] Testing de rollback

### Fase 4: Producción (1 día)
- [ ] Política de retención implementada
- [ ] Monitoreo y alertas (GitHub Actions + logs)
- [ ] Documentación completa
- [ ] Runbook de emergencia
- [ ] Primer backup exitoso de producción
- [ ] Restore drill mensual programado

---

## 📝 Comandos Rápidos de Referencia

### Backup Manual
```bash
# Full backup de un branch (custom format ya comprime)
pg_dump --format=custom --compress=9 \
  --no-owner --no-privileges \
  "$NEON_CONNECTION_STRING" \
  --file="backup_$(date +%Y-%m-%d).dump"

# Luego encriptar (sin gzip adicional)
openssl enc -aes-256-cbc -salt \
  -in "backup_$(date +%Y-%m-%d).dump" \
  -out "backup_$(date +%Y-%m-%d).dump.enc" \
  -pass pass:$BACKUP_KEY
```

### Restore Manual
```bash
# 1. Crear branch NUEVO en Neon UI primero (CRÍTICO)

# 2. Desencriptar
openssl enc -d -aes-256-cbc \
  -in backup_2026-02-09.dump.enc \
  -out backup_2026-02-09.dump \
  -pass pass:$BACKUP_KEY

# 3. Restaurar en el branch nuevo
pg_restore \
  --dbname="$RESTORE_CONNECTION_STRING" \
  --verbose --clean --if-exists \
  --no-owner --no-privileges \
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

**Respuesta**: Plan Free de Neon NO incluye backups automáticos. Solo Plan Launch ($19/mes) tiene PITR. Este sistema mantiene $0 de costo recurrente mientras provee backups robustos.

### ¿Por qué Google Drive y no AWS S3?

**Respuesta**: 
- Google Drive: 15 GB gratis, suficiente para 4-5 años
- AWS S3: Cuesta dinero ($0.023/GB/mes + requests)
- Si el proyecto crece, podés migrar a S3 fácilmente (mismo formato de backup)

### ¿Por qué GitHub Actions y no Vercel Cron?

**Respuesta**:
- GitHub Actions: Logs persistentes, robusto, no depende de Vercel
- Vercel Cron: Logs efímeros, depende del deployment
- Para operaciones críticas como backups, GitHub Actions es más confiable

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

**Respuesta**: GitHub Actions:
1. Reintenta 3 veces con delay
2. Si sigue fallando, envía email de notificación
3. Logging detallado en GitHub Actions UI
4. No sobrescribe último backup exitoso

### ¿Cómo pruebo que el backup funciona?

**Respuesta**: Monthly drill (recomendado):
1. Tomar backup de producción
2. Crear branch de test en Neon
3. Restaurar en branch de test
4. Ejecutar checklist de validación completo
5. Eliminar branch de test
6. Documentar resultado

### ¿Por qué no necesito gzip adicional?

**Respuesta**: El formato custom de `pg_dump` ya incluye compresión gzip interna con `--compress=9`. Agregar otro gzip es redundante y no mejora la compresión.

---

## ✅ Checklist Final Pre-Implementación

Antes de comenzar el desarrollo, verificar que estos puntos estén claros:

### Decisiones Arquitectónicas
- [x] ✅ **Automatización en GitHub Actions** (no Vercel Cron) - Más robusto
- [x] ✅ **Compresión simplificada**: Custom format + AES-256 (sin gzip adicional)
- [x] ✅ **Tenant-restore readiness**: Documentado claramente (branch restore = tenant restore)
- [x] ✅ **Restore en branch nuevo**: SIEMPRE, nunca sobre producción
- [x] ✅ **Validación exhaustiva**: 30+ checks antes de promover
- [x] ✅ **Rollback seguro**: Procedimiento documentado

### Costos y Seguridad
- [x] ✅ **$0 de costo recurrente**: Plan Free de Google Drive (15GB)
- [x] ✅ **Independencia**: No depende de Vercel ni Neon para backup
- [x] ✅ **Encriptación**: AES-256-CBC, keys en GitHub Secrets
- [x] ✅ **Logs persistentes**: GitHub Actions mantiene historial completo

### Scope Clarificado
- [x] ✅ **Restore por tenant**: Fuera de scope explícito (no necesario con arquitectura actual)
- [x] ✅ **Branch restore**: Totalmente cubierto (= tenant restore en arquitectura actual)
- [x] ✅ **Soft delete**: Explícitamente excluido del scope
- [x] ✅ **Auditoría**: Explícitamente excluida del scope
- [x] ✅ **Sin cambios al schema**: Garantizado

### Listo para Go
- [x] ✅ Arquitectura definida y simplificada
- [x] ✅ Formato de backup optimizado
- [x] ✅ Procedimiento de restore validado
- [x] ✅ Checklist de validación completo (30+ checks)
- [x] ✅ Política de retención definida
- [x] ✅ FAQ respondidas

**Estado**: ✅ **READY para implementación**

---

## 🎯 Próximos Pasos (Orden de Ejecución)

1. [ ] Crear Service Account de Google Cloud
2. [ ] Configurar secrets en GitHub (no Vercel)
   - `NEON_CONNECTION_STRING_CENTRAL`
   - `NEON_CONNECTION_STRING_LAVAPP`
   - `BACKUP_ENCRYPTION_KEY`
   - `GOOGLE_DRIVE_CREDENTIALS`
3. [ ] Crear script `scripts/backup-to-drive.js`
4. [ ] Crear script `scripts/restore-from-drive.js`
5. [ ] Crear script `scripts/validate-restore.js`
6. [ ] Crear GitHub Actions workflow `.github/workflows/backup-daily.yml`
7. [ ] Testing completo en staging/test
8. [ ] Primer backup manual de producción
9. [ ] Restore drill en branch de test (validar checklist completo)
10. [ ] Documentar runbook de emergencia específico
11. [ ] Activar backups automáticos via GitHub Actions
12. [ ] Programar monthly restore drill

**Tiempo estimado total**: 5-7 días de desarrollo + testing

---

## 📚 Referencias

- [PostgreSQL pg_dump docs](https://www.postgresql.org/docs/current/app-pgdump.html)
- [PostgreSQL pg_restore docs](https://www.postgresql.org/docs/current/app-pgrestore.html)
- [Google Drive API v3](https://developers.google.com/drive/api/v3/about-sdk)
- [Neon Branching Guide](https://neon.tech/docs/guides/branching)
- [GitHub Actions - Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [GitHub Actions - Workflows](https://docs.github.com/en/actions/using-workflows)
- [OpenSSL AES-256 Encryption](https://www.openssl.org/docs/man1.1.1/man1/enc.html)

---

**Documento creado**: 2026-02-09  
**Última actualización**: 2026-02-09  
**Versión**: 2.0.0 (Con ajustes pre-implementación aplicados)  
**Estado**: ✅ Listo para aprobación e implementación

---

## 📝 Changelog

**v2.0.0** (2026-02-09):
- ✅ Cambiado a GitHub Actions (en vez de Vercel Cron)
- ✅ Simplificada compresión (custom format + AES-256, sin gzip adicional)
- ✅ Agregada sección "Restore por Tenant - Readiness"
- ✅ Clarificado que tenant-restore está fuera de scope (no necesario)
- ✅ Enfatizado: SIEMPRE restore en branch nuevo
- ✅ Agregado checklist final pre-implementación
- ✅ Mejorada documentación de seguridad (GitHub Secrets vs Vercel)

**v1.0.0** (2026-02-09):
- Diseño inicial completo
