# 💰 Sistema de Gestión de Pagos Mensuales - Super Admin

## 📋 Objetivo

Crear un sistema completo para que el super admin pueda:
- Registrar pagos mensuales de cada empresa
- Ver qué empresas están al día y cuáles deben
- Generar reportes de ingresos
- Controlar períodos de pago y vencimientos
- Alertas automáticas de pagos pendientes

## 🗄️ Estructura de Base de Datos

### Nueva Tabla: `pagos_mensuales`

```sql
CREATE TABLE IF NOT EXISTS pagos_mensuales (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    
    -- Período del pago
    mes INTEGER NOT NULL CHECK (mes >= 1 AND mes <= 12),
    anio INTEGER NOT NULL CHECK (anio >= 2024),
    fecha_vencimiento DATE NOT NULL,
    
    -- Montos
    monto_base DECIMAL(10,2) NOT NULL, -- Precio mensual base
    descuento_porcentaje INTEGER DEFAULT 0 CHECK (descuento_porcentaje >= 0 AND descuento_porcentaje <= 100),
    monto_final DECIMAL(10,2) NOT NULL, -- Monto después del descuento
    
    -- Estado del pago
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'pagado', 'vencido', 'cancelado')),
    fecha_pago TIMESTAMP, -- Cuándo se registró el pago
    metodo_pago VARCHAR(50), -- Efectivo, transferencia, etc.
    comprobante TEXT, -- Número de comprobante o referencia
    
    -- Auditoría
    notas TEXT,
    registrado_por VARCHAR(100), -- Email del super admin que registró
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    -- Constraint: un solo registro por empresa por mes/año
    UNIQUE(empresa_id, mes, anio)
);

-- Índices para mejor rendimiento
CREATE INDEX idx_pagos_empresa ON pagos_mensuales(empresa_id);
CREATE INDEX idx_pagos_estado ON pagos_mensuales(estado);
CREATE INDEX idx_pagos_periodo ON pagos_mensuales(anio, mes);
CREATE INDEX idx_pagos_vencimiento ON pagos_mensuales(fecha_vencimiento);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_pagos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pagos_updated_at
    BEFORE UPDATE ON pagos_mensuales
    FOR EACH ROW
    EXECUTE FUNCTION update_pagos_updated_at();

-- Trigger para marcar pagos vencidos automáticamente
CREATE OR REPLACE FUNCTION marcar_pagos_vencidos()
RETURNS void AS $$
BEGIN
    UPDATE pagos_mensuales
    SET estado = 'vencido'
    WHERE estado = 'pendiente'
    AND fecha_vencimiento < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
```

### Columnas Adicionales en `empresas`

```sql
-- Agregar columna para suspender automáticamente por falta de pago
ALTER TABLE empresas
ADD COLUMN IF NOT EXISTS dias_mora INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ultimo_pago_fecha DATE,
ADD COLUMN IF NOT EXISTS suspendido_por_falta_pago BOOLEAN DEFAULT false;
```

## 🎨 UI - Panel de Pagos en Super Admin

### Vista Principal: Dashboard de Pagos

```
┌─────────────────────────────────────────────────────────────┐
│  💰 Gestión de Pagos Mensuales                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Mes Actual: Febrero 2026                                    │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 💚 Al Día     │  │ ⏰ Pendientes │  │ ❌ Vencidos   │      │
│  │              │  │              │  │              │      │
│  │    12       │  │     3        │  │     2        │      │
│  │  empresas   │  │  empresas    │  │  empresas    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │ 📊 Ingresos del Mes: $850.000                         │   │
│  │ 📈 Proyectado: $1.020.000                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  Filtros: [▼ Todos] [▼ Febrero 2026] [🔍 Buscar...]        │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Empresa                 │ Monto    │ Estado    │ Acciones  │
├─────────────────────────────────────────────────────────────┤
│  🏢 DeltaWash            │ $85.000  │ ✅ Pagado  │ [Ver]     │
│  📅 15/02/2026                        [Transf.]              │
│  ────────────────────────────────────────────────────────────│
│  🏢 LavaRápido           │ $68.000  │ ⏰ Pendiente│ [Registrar]│
│  📅 Vence: 20/02/2026     (-20%)                │ [Editar]  │
│  ────────────────────────────────────────────────────────────│
│  🏢 AutoShine            │ $85.000  │ ❌ Vencido │ [Registrar]│
│  📅 Venció: 05/02/2026    ⚠️ 4 días mora        │ [Suspender]│
│  ────────────────────────────────────────────────────────────│
│  🏢 Clean Car            │ $76.500  │ ⏰ Pendiente│ [Registrar]│
│  📅 Vence: 25/02/2026     (-10%)                │ [Editar]  │
└─────────────────────────────────────────────────────────────┘

[+ Generar Pagos del Próximo Mes] [📥 Exportar Reporte]
```

### Modal: Registrar Pago

```
┌─────────────────────────────────────────┐
│  💰 Registrar Pago                      │
├─────────────────────────────────────────┤
│                                         │
│  Empresa: LavaRápido                    │
│  Período: Febrero 2026                  │
│                                         │
│  Monto Base:     $85.000                │
│  Descuento:      20%                    │
│  ────────────────────────────           │
│  Monto Final:    $68.000                │
│                                         │
│  Fecha de Pago: [📅 15/02/2026]         │
│                                         │
│  Método de Pago:                        │
│  ⚪ Efectivo                             │
│  ⚫ Transferencia                        │
│  ⚪ Tarjeta de Crédito                   │
│  ⚪ MercadoPago                          │
│  ⚪ Otro                                 │
│                                         │
│  Comprobante/Referencia:                │
│  [__________________________]           │
│                                         │
│  Notas (opcional):                      │
│  [__________________________]           │
│  [__________________________]           │
│                                         │
│         [Cancelar]  [Registrar Pago]    │
└─────────────────────────────────────────┘
```

### Vista: Historial de Pagos por Empresa

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 LavaRápido - Historial de Pagos                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Total Pagado (Histórico): $204.000                          │
│  Promedio Mensual: $68.000                                   │
│  Estado Actual: ⏰ Pago Pendiente                             │
│                                                               │
├─────────────────────────────────────────────────────────────┤
│  Período        │ Monto    │ Estado   │ Fecha Pago │ Método  │
├─────────────────────────────────────────────────────────────┤
│  Febrero 2026   │ $68.000  │ ⏰ Pendiente │ -         │ -      │
│  Enero 2026     │ $68.000  │ ✅ Pagado   │ 15/01/26  │ Transf. │
│  Diciembre 2025 │ $68.000  │ ✅ Pagado   │ 10/12/25  │ Efectivo│
│  Noviembre 2025 │ $68.000  │ ✅ Pagado   │ 05/11/25  │ Transf. │
└─────────────────────────────────────────────────────────────┘

[← Volver] [📥 Exportar PDF]
```

## 🔄 Flujos de Trabajo

### 1. Generación Automática de Pagos Mensuales

**Trigger**: Cron job que corre el día 1 de cada mes

**Proceso**:
```javascript
// Pseudocódigo
function generarPagosDelMes(mes, anio) {
  // 1. Obtener todas las empresas activas
  const empresasActivas = await getEmpresasActivas();
  
  // 2. Para cada empresa
  for (const empresa of empresasActivas) {
    // Verificar que no exista ya un pago para este período
    const pagoExistente = await getPago(empresa.id, mes, anio);
    
    if (!pagoExistente) {
      // 3. Crear registro de pago
      await crearPago({
        empresa_id: empresa.id,
        mes: mes,
        anio: anio,
        fecha_vencimiento: new Date(anio, mes - 1, 10), // Día 10 de cada mes
        monto_base: empresa.precio_mensual,
        descuento_porcentaje: empresa.descuento_porcentaje,
        monto_final: calcularMontoFinal(empresa),
        estado: 'pendiente'
      });
    }
  }
  
  // 4. Enviar recordatorios por email
  await enviarRecordatoriosPagoPendiente();
}
```

### 2. Registro Manual de Pago

```
Usuario hace click en "Registrar Pago"
    ↓
Mostrar modal con datos del pago
    ↓
Usuario ingresa:
  - Fecha de pago
  - Método de pago
  - Comprobante (opcional)
  - Notas (opcional)
    ↓
Sistema actualiza:
  - estado = 'pagado'
  - fecha_pago = ahora
  - metodo_pago, comprobante, notas
    ↓
Actualizar estadísticas y mostrar confirmación
    ↓
Enviar email de confirmación a la empresa
```

### 3. Manejo de Pagos Vencidos

**Cron job diario**:
```javascript
function manejarPagosVencidos() {
  // 1. Marcar pagos como vencidos
  await marcarPagosVencidos(); // Trigger SQL
  
  // 2. Calcular días de mora
  const empresasConMora = await getEmpresasConMora();
  
  for (const empresa of empresasConMora) {
    const diasMora = calcularDiasMora(empresa);
    
    // 3. Actualizar días de mora
    await updateEmpresa(empresa.id, { dias_mora: diasMora });
    
    // 4. Suspender si supera el límite (ej: 15 días)
    if (diasMora > 15 && !empresa.suspendido_por_falta_pago) {
      await suspenderEmpresa(empresa.id);
      await enviarEmailSuspension(empresa);
    }
    
    // 5. Enviar recordatorios escalonados
    if (diasMora === 3) {
      await enviarRecordatorioAmistoso(empresa);
    } else if (diasMora === 7) {
      await enviarRecordatorioUrgente(empresa);
    } else if (diasMora === 14) {
      await enviarAvisoSuspensionProxima(empresa);
    }
  }
}
```

## 📊 Reportes e Informes

### 1. Reporte Mensual de Ingresos

```sql
-- Ingresos del mes actual
SELECT
  COUNT(*) FILTER (WHERE estado = 'pagado') as pagos_recibidos,
  COUNT(*) FILTER (WHERE estado = 'pendiente') as pagos_pendientes,
  COUNT(*) FILTER (WHERE estado = 'vencido') as pagos_vencidos,
  SUM(monto_final) FILTER (WHERE estado = 'pagado') as total_ingresado,
  SUM(monto_final) FILTER (WHERE estado IN ('pendiente', 'vencido')) as total_pendiente
FROM pagos_mensuales
WHERE mes = EXTRACT(MONTH FROM NOW())
  AND anio = EXTRACT(YEAR FROM NOW());
```

### 2. Proyección de Ingresos

```sql
-- Ingresos proyectados si todas las empresas activas pagaran
SELECT
  SUM(precio_final) as ingresos_proyectados
FROM empresas
WHERE estado = 'activo'
  AND suspendido_por_falta_pago = false;
```

### 3. Empresas con Mejor Historial de Pago

```sql
-- Empresas que siempre pagan a tiempo
SELECT
  e.nombre,
  COUNT(*) as pagos_realizados,
  SUM(pm.monto_final) as total_pagado,
  AVG(EXTRACT(DAY FROM (pm.fecha_pago - pm.fecha_vencimiento))) as promedio_dias_adelanto
FROM empresas e
JOIN pagos_mensuales pm ON e.id = pm.empresa_id
WHERE pm.estado = 'pagado'
GROUP BY e.id, e.nombre
HAVING AVG(EXTRACT(DAY FROM (pm.fecha_pago - pm.fecha_vencimiento))) <= 0
ORDER BY pagos_realizados DESC
LIMIT 10;
```

## 🔔 Sistema de Notificaciones

### Emails Automáticos

1. **Recordatorio de Pago Próximo** (5 días antes del vencimiento)
   ```
   Asunto: Recordatorio: Tu pago de LAVAPP vence el [fecha]
   ```

2. **Pago Registrado** (cuando el super admin registra un pago)
   ```
   Asunto: ✅ Pago recibido - LAVAPP [Mes/Año]
   ```

3. **Pago Vencido** (día del vencimiento si no pagó)
   ```
   Asunto: ⚠️ Tu pago de LAVAPP está vencido
   ```

4. **Recordatorio Amistoso** (3 días de mora)
   ```
   Asunto: Recordatorio: Pago pendiente de LAVAPP
   ```

5. **Aviso Urgente** (7 días de mora)
   ```
   Asunto: 🔴 Urgente: Pago pendiente - Riesgo de suspensión
   ```

6. **Aviso de Suspensión Próxima** (14 días de mora)
   ```
   Asunto: ⚠️ Última oportunidad: Tu cuenta será suspendida mañana
   ```

7. **Cuenta Suspendida** (15 días de mora)
   ```
   Asunto: 🔒 Tu cuenta LAVAPP ha sido suspendida
   ```

## 🛠️ APIs Necesarias

### GET `/api/super-admin/pagos`

**Query params**:
- `mes`: número del mes (1-12)
- `anio`: año
- `estado`: 'pendiente' | 'pagado' | 'vencido' | 'todos'
- `empresa_id`: filtrar por empresa

**Response**:
```json
{
  "pagos": [...],
  "estadisticas": {
    "total_pagado": 850000,
    "total_pendiente": 204000,
    "total_vencido": 170000,
    "cantidad_pagado": 10,
    "cantidad_pendiente": 3,
    "cantidad_vencido": 2
  }
}
```

### POST `/api/super-admin/pagos/registrar`

**Body**:
```json
{
  "pago_id": 123,
  "fecha_pago": "2026-02-15",
  "metodo_pago": "transferencia",
  "comprobante": "REF-12345",
  "notas": "Pago recibido por transferencia bancaria"
}
```

### POST `/api/super-admin/pagos/generar-mes`

**Body**:
```json
{
  "mes": 3,
  "anio": 2026
}
```

Genera pagos para todas las empresas activas del mes especificado.

### GET `/api/super-admin/pagos/historial/:empresa_id`

Retorna historial completo de pagos de una empresa.

### PATCH `/api/super-admin/pagos/:id/editar`

Permite editar monto, descuento, fecha de vencimiento de un pago pendiente.

## 📅 Implementación por Fases

### Fase 1: Base de Datos y APIs (Prioritario)

- ✅ Crear migración para tabla `pagos_mensuales`
- ✅ Crear triggers y funciones SQL
- ✅ Implementar API GET `/api/super-admin/pagos`
- ✅ Implementar API POST `/api/super-admin/pagos/registrar`
- ✅ Implementar API POST `/api/super-admin/pagos/generar-mes`

### Fase 2: UI Super Admin

- ✅ Crear sección "Pagos" en super admin
- ✅ Dashboard con estadísticas del mes
- ✅ Tabla de pagos con filtros
- ✅ Modal para registrar pago
- ✅ Vista de historial por empresa

### Fase 3: Automatización

- ✅ Cron job para generar pagos mensuales (día 1)
- ✅ Cron job para marcar vencidos (diario)
- ✅ Cron job para calcular mora (diario)
- ✅ Sistema de suspensión automática

### Fase 4: Notificaciones

- ✅ Template de emails
- ✅ Envío automático de recordatorios
- ✅ Confirmaciones de pago
- ✅ Avisos de suspensión

### Fase 5: Reportes Avanzados

- ✅ Exportar a Excel/PDF
- ✅ Gráficos de ingresos mensuales
- ✅ Proyecciones de ingresos
- ✅ Ranking de mejores pagadores

## 💡 Consideraciones Importantes

### Manejo de Descuentos

- Los descuentos se congelan al momento de generar el pago
- Si cambias el descuento de una empresa, solo afecta pagos futuros
- Los pagos ya generados mantienen el monto original

### Cambio de Precio Mensual

- Similar a descuentos, los cambios solo afectan pagos futuros
- Los pagos pendientes mantienen el monto con el que fueron generados
- Opción de "Regenerar pago" si se necesita ajustar

### Trial vs Plan Pago

- Durante el trial: NO se generan pagos mensuales
- Al finalizar trial: Se genera primer pago automáticamente
- Si empresa sigue en trial, se ignora al generar pagos mensuales

### Suspensión por Falta de Pago

- `suspendido_por_falta_pago = true` → No puede acceder al sistema
- Se mantiene la base de datos (no se elimina)
- Al pagar, se reactiva automáticamente
- Plazo de gracia: 15 días de mora antes de suspender

## 🎯 Beneficios del Sistema

1. **Control Total**: Sabés exactamente quién debe y quién está al día
2. **Automatización**: Menos trabajo manual, menos errores
3. **Recordatorios**: Los clientes reciben avisos automáticos
4. **Reportes**: Visibilidad de ingresos reales vs proyectados
5. **Suspensión Controlada**: Protege tu negocio de clientes morosos
6. **Historial**: Registro completo de todos los pagos
7. **Flexibilidad**: Diferentes métodos de pago y descuentos personalizados

## 📝 Próximos Pasos

1. Revisar y aprobar este diseño
2. Crear migración SQL
3. Implementar APIs
4. Crear UI en super admin
5. Configurar cron jobs
6. Testear con datos reales
7. Deploy a producción

¿Te parece bien este diseño? ¿Algo que quieras agregar o modificar?
