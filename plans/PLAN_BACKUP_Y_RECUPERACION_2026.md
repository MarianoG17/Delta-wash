# 🛡️ Plan de Backup y Recuperación 2026

## 🎯 Objetivo

**Proteger contra pérdida de datos** en DeltaWash y empresas SaaS, especialmente ante borrados accidentales.

**Escenario a prevenir**: Cliente borra sin querer todo su historial de lavados

---

## 📊 Arquitectura Actual

### Bases de Datos

| Sistema | Proveedor | Plan | Ubicación | Datos Críticos |
|---------|-----------|------|-----------|----------------|
| **DeltaWash Legacy** | Vercel Postgres | Free | POSTGRES_URL | Todos los registros de lavado históricos |
| **LAVAPP (SaaS)** | Neon | Free | Branch "Lavadero" | Registros operativos de LAVAPP |
| **BD Central** | Neon | Free | Branch "central" | Empresas y usuarios del sistema |

### Datos Críticos a Proteger

**Nivel CRÍTICO** (pérdida catastrófica):
- ✅ `registros_lavado` - Historial completo de servicios
- ✅ `cuentas_corrientes` - Saldos y movimientos financieros
- ✅ `clientes` - Base de datos de clientes
- ✅ `pagos` - Registro de pagos realizados

**Nivel IMPORTANTE** (pérdida significativa):
- ⚠️ `listas_precios` - Configuración de precios
- ⚠️ `promociones` - Configuración de promociones
- ⚠️ `usuarios` - Usuarios del sistema
- ⚠️ `surveys` / `benefits` - Encuestas y beneficios

**Nivel RECUPERABLE** (pérdida menor):
- 📝 `survey_config` - Configuración (se puede recrear)
- 📝 `tenant_survey_config` - Configuración por tenant

---

## 🔍 Evaluación de Opciones

### Opción 1: Soft Deletes ⭐⭐⭐⭐⭐ (RECOMENDADO)

**Descripción**: En lugar de borrar registros, marcarlos como "eliminado" con un flag

**Ventajas**:
- ✅ **Costo**: $0
- ✅ **Recuperación**: Instantánea (solo cambiar flag)
- ✅ **Complejidad**: Baja
- ✅ **Auditoría**: Automática (sabés quién y cuándo borró)
- ✅ **Independiente del proveedor**: Funciona en Vercel y Neon

**Desventajas**:
- ⚠️ Ocupa espacio en BD (datos "borrados" siguen ahí)
- ⚠️ Requiere modificar queries (agregar `WHERE eliminado = FALSE`)

**Implementación**:
```sql
-- Agregar columnas a tablas críticas
ALTER TABLE registros_lavado ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;
ALTER TABLE registros_lavado ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMP;
ALTER TABLE registros_lavado ADD COLUMN IF NOT EXISTS eliminado_por INTEGER;

-- Similar para otras tablas críticas
ALTER TABLE cuentas_corrientes ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;
ALTER TABLE movimientos_cuenta_corriente ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE;
```

**Recuperación**:
```sql
-- Restaurar registros eliminados accidentalmente
UPDATE registros_lavado 
SET eliminado = FALSE, 
    fecha_eliminacion = NULL,
    eliminado_por = NULL
WHERE id IN (1, 2, 3);
```

---

### Opción 2: Tabla de Auditoría ⭐⭐⭐⭐

**Descripción**: Registrar TODOS los cambios críticos antes de ejecutarlos

**Ventajas**:
- ✅ **Costo**: $0
- ✅ **Trazabilidad**: Completa (quién, qué, cuándo)
- ✅ **Útil para**: Debugging, disputas, cumplimiento normativo
- ✅ **Independiente del proveedor**

**Desventajas**:
- ⚠️ Ocupa espacio adicional
- ⚠️ Requiere modificar código backend
- ⚠️ Recuperación manual (hay que restaurar desde JSON)

**Implementación**:
```sql
CREATE TABLE auditoria_operaciones (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER,  -- NULL para DeltaWash Legacy
  usuario_id INTEGER,
  operacion VARCHAR(50), -- 'DELETE', 'UPDATE', 'CREATE'
  tabla VARCHAR(100),
  registro_id INTEGER,
  datos_anteriores JSONB, -- Estado ANTES del cambio
  datos_nuevos JSONB,     -- Estado DESPUÉS del cambio
  fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(50)
);

CREATE INDEX idx_auditoria_empresa ON auditoria_operaciones(empresa_id);
CREATE INDEX idx_auditoria_tabla ON auditoria_operaciones(tabla, registro_id);
CREATE INDEX idx_auditoria_fecha ON auditoria_operaciones(fecha_operacion);
```

---

### Opción 3: Branches de Backup Manual (Neon) ⭐⭐⭐

**Descripción**: Crear branches de Neon como snapshots periódicos

**Ventajas**:
- ✅ **Costo**: $0 (plan Free permite 10 branches)
- ✅ **Backup completo**: Toda la BD
- ✅ **Fácil de crear**: UI de Neon o API

**Desventajas**:
- ⚠️ **Solo para Neon**: No funciona para DeltaWash (Vercel Postgres)
- ⚠️ **Manual**: Requiere acordarse de hacerlo
- ⚠️ **Límite**: 10 branches en plan Free
- ⚠️ **Recuperación**: Horas (copiar datos de branch a producción)

**Implementación**:
```bash
# Cada semana/mes crear branch de backup
Neon Console → Branch "Lavadero" → "Create Branch"
Nombre: backup-lavapp-2026-02-01
```

---

### Opción 4: Confirmaciones Dobles ⭐⭐⭐⭐⭐ (PREVENTIVO)

**Descripción**: UI que pide confirmación antes de eliminaciones

**Ventajas**:
- ✅ **Costo**: $0
- ✅ **Prevención**: Evita errores humanos
- ✅ **Fácil de implementar**: Solo frontend

**Desventajas**:
- ⚠️ No protege contra bugs en el código
- ⚠️ No protege contra eliminaciones maliciosas

**Implementación**:
```typescript
const eliminarRegistros = async (ids: number[]) => {
  // Confirmación 1
  if (!confirm(`¿Eliminar ${ids.length} registro(s)?`)) return;
  
  // Confirmación 2 para operaciones masivas
  if (ids.length > 10) {
    const input = prompt('Escribe "CONFIRMAR" para eliminar:');
    if (input !== 'CONFIRMAR') return;
  }
  
  // Ejecutar
  await api.delete('/registros', { ids });
};
```

---

### Opción 5: Exportaciones Automáticas ⭐⭐⭐

**Descripción**: Script que exporta datos críticos periódicamente

**Ventajas**:
- ✅ **Independiente del proveedor**: Tu propio backup
- ✅ **Control total**: Sabés dónde están tus datos
- ✅ **Puede estar offline**: No depende de BD en línea

**Desventajas**:
- ⚠️ **Costo**: Variable (storage, compute)
- ⚠️ **Complejidad**: Alta (infraestructura adicional)
- ⚠️ **Recuperación**: Lenta (importar desde archivos)

**Opciones de Storage**:
1. **GitHub** - Gratis hasta 1GB, versionado automático
2. **Google Drive** - 15GB gratis
3. **AWS S3** - $0.023/GB/mes
4. **Vercel Blob** - Integrado con Vercel

---

### Opción 6: Upgrade Neon a Plan Pago ⭐⭐⭐⭐

**Descripción**: Plan Launch de Neon ($19/mes) con Point-in-Time Recovery

**Ventajas**:
- ✅ **PITR**: Restaurar a cualquier momento (últimos 7 días)
- ✅ **Automático**: Sin intervención manual
- ✅ **Rápido**: Recuperación en minutos
- ✅ **Profesional**: Funcionalidad enterprise

**Desventajas**:
- ⚠️ **Costo**: $19/mes
- ⚠️ **Solo Neon**: No cubre DeltaWash (Vercel Postgres)

**Cuándo considerarlo**:
- ✅ Cuando tengas 3-5 clientes SaaS pagando
- ✅ Podes cobrar $10/mes extra por "Backup Premium"
- ✅ Ingresos: $30-50/mes, Costo: $19/mes → **Ganancia**

---

### Opción 7: Vercel Postgres Backups ⭐⭐⭐

**Descripción**: Vercel ofrece backups en planes Pro ($20/mes)

**Ventajas**:
- ✅ **Automático**: Daily backups
- ✅ **Integrado**: Con tu deployment actual

**Desventajas**:
- ⚠️ **Costo**: $20/mes (Vercel Pro)
- ⚠️ **Solo DeltaWash**: No cubre empresas SaaS en Neon

---

## 📋 Estrategia Recomendada (2026)

### Fase 1: INMEDIATA (Esta semana) - $0

**Prioridad CRÍTICA**:

1. ✅ **Implementar Soft Deletes**
   - Tablas: `registros_lavado`, `cuentas_corrientes`, `movimientos_cuenta_corriente`
   - Tiempo: 2-3 horas de desarrollo
   - Beneficio: Recuperación instantánea de datos

2. ✅ **Agregar Confirmaciones Dobles**
   - Todas las funciones de eliminación
   - Tiempo: 1 hora de desarrollo
   - Beneficio: Prevención de errores humanos

3. ✅ **Crear Tabla de Auditoría**
   - Para operaciones críticas (DELETE, UPDATE masivos)
   - Tiempo: 2 horas de desarrollo
   - Beneficio: Trazabilidad completa

**Resultado Fase 1**: 95% de protección contra pérdida de datos, $0 de costo

---

### Fase 2: CORTO PLAZO (Este mes) - $0

**Prioridad ALTA**:

4. ✅ **Backups Manuales de Neon**
   - Crear branch de backup semanal para LAVAPP
   - Tiempo: 5 minutos por semana
   - Beneficio: Snapshot completo semanal

5. ✅ **Documentar Procedimiento de Recuperación**
   - Cómo restaurar soft-deleted
   - Cómo usar branches de backup
   - Tiempo: 1 hora
   - Beneficio: Respuesta rápida ante incidentes

6. ✅ **Implementar Roles y Permisos**
   - Solo admins pueden eliminar
   - Tiempo: 2 horas de desarrollo
   - Beneficio: Reducir superficie de ataque

---

### Fase 3: MEDIANO PLAZO (1-3 meses) - Variable

**Prioridad MEDIA**:

7. ⏳ **Exportaciones Automáticas**
   - Script que exporta datos críticos semanalmente
   - Guardar en GitHub o Google Drive
   - Tiempo: 4-6 horas de desarrollo
   - Costo: $0 (GitHub/Drive gratis)
   - Beneficio: Backup independiente del proveedor

8. ⏳ **Dashboard de Auditoría**
   - UI para ver operaciones recientes
   - Alertas de operaciones masivas
   - Tiempo: 6-8 horas de desarrollo
   - Beneficio: Visibilidad y control

---

### Fase 4: FUTURO (Cuando tengas 5+ clientes) - $19-39/mes

**Prioridad BAJA (por ahora)**:

9. ⏰ **Upgrade Neon a Plan Launch**
   - PITR de 7 días
   - Backups automáticos
   - Costo: $19/mes
   - Cobrar a clientes: $10/mes extra por "Plan Premium"

10. ⏰ **Considerar Vercel Pro** (si DeltaWash crece mucho)
    - Daily backups automáticos
    - Costo: $20/mes

---

## 🚀 Plan de Implementación Detallado

### Semana 1: Soft Deletes

**Día 1-2: Migraciones SQL**
```sql
-- migration-add-soft-deletes.sql
-- Para DeltaWash (Vercel Postgres)
ALTER TABLE registros_lavado 
  ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMP,
  ADD COLUMN IF NOT EXISTS eliminado_por INTEGER;

ALTER TABLE cuentas_corrientes 
  ADD COLUMN IF NOT EXISTS eliminado BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS fecha_eliminacion TIMESTAMP,
  ADD COLUMN IF NOT EXISTS eliminado_por INTEGER;

-- Similar para Neon branches (LAVAPP, futuras empresas)
```

**Día 3-4: Backend**
- Modificar `/api/registros/eliminar` para hacer UPDATE en vez de DELETE
- Agregar filtro `WHERE eliminado = FALSE` en queries de listado

**Día 5: Testing**
- Probar eliminación en DeltaWash
- Probar eliminación en LAVAPP
- Verificar que soft-deleted no aparezcan en listados

---

### Semana 2: Auditoría y Confirmaciones

**Día 1-2: Tabla de Auditoría**
```sql
-- migration-add-auditoria.sql
CREATE TABLE auditoria_operaciones (
  id SERIAL PRIMARY KEY,
  empresa_id INTEGER,
  usuario_id INTEGER,
  operacion VARCHAR(50),
  tabla VARCHAR(100),
  registro_id INTEGER,
  datos_anteriores JSONB,
  fecha_operacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Día 3-4: Confirmaciones Frontend**
- Agregar confirmaciones dobles en UI
- Agregar contador de registros a eliminar
- Agregar input de confirmación para operaciones masivas

**Día 5: Testing**
- Probar flujo completo de eliminación
- Verificar auditoría se guarda correctamente

---

### Semana 3: Procedimientos y Documentación

**Día 1: Crear Branch de Backup**
- Neon Console → Create branch de "Lavadero"
- Nombre: `backup-lavapp-2026-02-01`

**Día 2-3: Documentar Recuperación**
- Procedimiento para restaurar soft-deleted
- Procedimiento para restaurar desde branch
- Procedimiento para restaurar desde auditoría

**Día 4-5: Implementar Roles**
- Modificar tabla `usuarios`
- Agregar check de permisos en APIs de eliminación

---

## 📊 Matriz de Decisión

| Escenario | Solución | Tiempo de Recuperación |
|-----------|----------|------------------------|
| **Usuario borra 1 registro por error** | Soft Delete | Instantáneo (cambiar flag) |
| **Usuario borra 100 registros por error** | Soft Delete | Instantáneo (cambiar flags) |
| **Bug en código borra toda una tabla** | Branch Backup + Auditoría | 1-2 horas |
| **Corrupción de BD** | Branch Backup | 2-4 horas |
| **Hackeo/ataque malicioso** | Branch Backup + Exportación | 2-6 horas |
| **Neon/Vercel caído** | Exportación externa | 6-12 horas |

---

## 💰 Análisis de Costos

### Año 1 (Plan Actual - FREE)

| Mes | Costo Infraestructura | Costo Desarrollo | Total |
|-----|----------------------|------------------|-------|
| 1-3 | $0 | $0* | $0 |
| 4-12 | $0 | $0 | $0 |
| **Total Año 1** | **$0** | **$0*** | **$0** |

*Asumiendo que vos desarrollás

### Año 2 (Con 5 clientes)

| Mes | Neon Launch | Ingresos Backup | Ganancia Neta |
|-----|-------------|-----------------|---------------|
| 13+ | -$19 | +$50 (5 clientes × $10) | **+$31** |

---

## ✅ Checklist de Implementación

### Fase 1: Inmediata
- [ ] Ejecutar `migration-add-soft-deletes.sql` en DeltaWash
- [ ] Ejecutar `migration-add-soft-deletes.sql` en LAVAPP (Neon)
- [ ] Modificar API `/api/registros/eliminar` para soft delete
- [ ] Agregar filtro `eliminado = FALSE` en queries de listado
- [ ] Crear tabla `auditoria_operaciones`
- [ ] Implementar logging en operaciones críticas
- [ ] Agregar confirmaciones dobles en frontend
- [ ] Testing completo

### Fase 2: Corto Plazo
- [ ] Crear primer branch de backup en Neon
- [ ] Configurar calendario para backups semanales
- [ ] Documentar procedimiento de recuperación
- [ ] Implementar roles y permisos
- [ ] Testing de recuperación

### Fase 3: Mediano Plazo
- [ ] Desarrollar script de exportación automática
- [ ] Configurar storage (GitHub/Drive)
- [ ] Programar cron job para exportaciones
- [ ] Crear dashboard de auditoría
- [ ] Testing de restauración desde exportación

---

## 🎯 Métricas de Éxito

| Métrica | Objetivo | Cómo Medir |
|---------|----------|------------|
| **Tiempo de recuperación** | < 5 minutos (soft delete) | Simular borrado y medir restauración |
| **Trazabilidad** | 100% de operaciones críticas | Verificar tabla auditoría |
| **Prevención de errores** | 0 borrados accidentales | Confirmaciones dobles funcionando |
| **Cobertura de backup** | 100% datos críticos | Verificar todas las tablas críticas |
| **Frecuencia de backup** | Semanal | Calendario de branches |

---

## 📞 Plan de Respuesta ante Incidentes

### Escenario 1: "Borré registros sin querer"

**Pasos**:
1. ✅ No entrar en pánico
2. ✅ Identificar IDs de registros borrados
3. ✅ Ejecutar: `UPDATE registros_lavado SET eliminado = FALSE WHERE id IN (...)`
4. ✅ Verificar en UI que aparecen de nuevo
5. ✅ Documentar incidente en auditoría

**Tiempo estimado**: 2-5 minutos

---

### Escenario 2: "Un bug borró datos masivamente"

**Pasos**:
1. ✅ Detener deployment (prevenir más daño)
2. ✅ Revisar tabla `auditoria_operaciones` para ver qué se borró
3. ✅ Opción A: Restaurar desde soft delete si están marcados
4. ✅ Opción B: Restaurar desde branch de backup más reciente
5. ✅ Fix el bug y redeploy
6. ✅ Postmortem

**Tiempo estimado**: 1-3 horas

---

### Escenario 3: "La BD está corrupta"

**Pasos**:
1. ✅ Contactar soporte de Vercel/Neon
2. ✅ Mientras tanto, restaurar desde branch backup (Neon)
3. ✅ O importar desde exportación externa
4. ✅ Verificar integridad de datos restaurados
5. ✅ Comunicar a clientes afectados

**Tiempo estimado**: 2-6 horas

---

## 🎓 Conclusiones

### Lo Más Importante

**Soft Deletes** + **Confirmaciones Dobles** = 95% de protección, $0 de costo

### Recomendación Final

1. **HOY**: Implementar Soft Deletes (3 horas de trabajo)
2. **ESTA SEMANA**: Agregar confirmaciones y auditoría
3. **ESTE MES**: Primer branch de backup manual
4. **DESPUÉS**: Evaluar upgrade cuando tengas ingresos

### Tranquilidad

Con Soft Deletes implementado, prácticamente **no hay forma de perder datos accidentalmente**. Todo queda marcado como eliminado pero recuperable.

---

**Próximo Paso**: ¿Querés que creemos las migraciones SQL para soft deletes y tabla de auditoría?
