# 💰 Diseño: Módulo de Control de Caja

**Fecha**: 2026-02-09  
**Proyecto**: LAVAPP SaaS  
**Objetivo**: Sistema de control de efectivo y conciliación de pagos

---

## 🎯 Objetivo General

Permitir a los operadores/administradores:
1. **Abrir y cerrar caja** diariamente
2. **Registrar movimientos** de efectivo (ingresos, egresos, retiros)
3. **Conciliar** con los pagos del sistema
4. **Detectar diferencias** automáticamente
5. **Auditar** operaciones de caja

---

## 📊 NIVEL 1: FUNCIONALIDADES BÁSICAS (MVP)

### ✅ Lo mínimo necesario para tener control de caja

#### 1.1 Apertura de Caja
**Pantalla**: Nueva página `/caja`

**Flujo**:
```
Usuario → Click "Abrir Caja" → Ingresa monto inicial → Guarda
```

**Campos**:
- Fecha/hora de apertura (automático)
- Usuario que abre (automático)
- Monto inicial en efectivo
- Observaciones (opcional)

**Validaciones**:
- No permitir abrir si ya hay una caja abierta
- Monto inicial debe ser >= 0

---

#### 1.2 Cierre de Caja
**Flujo**:
```
Usuario → Click "Cerrar Caja" → Ingresa monto final → Sistema calcula diferencia → Guarda
```

**Campos a ingresar**:
- Monto final contado (efectivo físico)
- Observaciones

**Cálculo automático del sistema**:
```
Monto Esperado = Monto Inicial 
                + Total Efectivo del Día (registros_lavado)
                - Total Cuenta Corriente del Día
                
Diferencia = Monto Final Contado - Monto Esperado
```

**Estados posibles**:
- ✅ **Cuadrada**: Diferencia = 0
- ⚠️ **Diferencia menor**: |Diferencia| <= $500 (configurable)
- 🔴 **Diferencia significativa**: |Diferencia| > $500

---

#### 1.3 Vista Principal de Caja

**Cuando hay caja ABIERTA**:
```
┌─────────────────────────────────────┐
│ 💵 CAJA ABIERTA                     │
│ Apertura: 09:00 - Juan Pérez        │
│                                     │
│ Monto Inicial:        $ 5,000      │
│ Ingresos del día:     $ 12,500     │
│ Total esperado:       $ 17,500     │
│                                     │
│ [Cerrar Caja]                       │
└─────────────────────────────────────┘
```

**Cuando NO hay caja abierta**:
```
┌─────────────────────────────────────┐
│ 💵 CAJA CERRADA                     │
│                                     │
│ [Abrir Caja]                        │
└─────────────────────────────────────┘
```

---

#### 1.4 Historial de Cierres

**Vista de tabla**:
| Fecha | Usuario | Inicial | Efectivo | Esperado | Contado | Diferencia | Estado |
|-------|---------|---------|----------|----------|---------|------------|--------|
| 08/02 | Juan    | $5,000  | $12,500  | $17,500  | $17,450 | -$50       | ⚠️     |
| 07/02 | María   | $3,000  | $8,000   | $11,000  | $11,000 | $0         | ✅     |

---

### 📋 Schema de Base de Datos (Básico)

```sql
CREATE TABLE caja_movimientos (
    id SERIAL PRIMARY KEY,
    fecha_apertura TIMESTAMP NOT NULL,
    fecha_cierre TIMESTAMP,
    usuario_apertura VARCHAR(100) NOT NULL,
    usuario_cierre VARCHAR(100),
    monto_inicial DECIMAL(10,2) NOT NULL,
    monto_final_contado DECIMAL(10,2),
    monto_esperado DECIMAL(10,2),
    diferencia DECIMAL(10,2),
    estado VARCHAR(20), -- 'abierta', 'cerrada_ok', 'cerrada_diferencia'
    observaciones_apertura TEXT,
    observaciones_cierre TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 NIVEL 2: FUNCIONALIDADES INTERMEDIAS

### ✅ Mejoras sobre el MVP

#### 2.1 Desglose de Pagos en Cierre

Al cerrar caja, mostrar detalle:
```
┌─────────────────────────────────────┐
│ DESGLOSE DEL DÍA                    │
├─────────────────────────────────────┤
│ 💵 Pagos en Efectivo:      $ 12,000 │
│ 💳 Pagos con Transferencia: $ 3,500 │
│ 📋 Cuenta Corriente:       $ 2,000  │
│                                     │
│ Total Efectivo Esperado:   $ 12,000 │
├─────────────────────────────────────┤
│ Monto Inicial:             $ 5,000  │
│ + Efectivo del día:        $ 12,000 │
│ = Esperado en Caja:        $ 17,000 │
└─────────────────────────────────────┘
```

---

#### 2.2 Movimientos Adicionales

**Casos de uso**:
- Retiro de efectivo (llevar al banco)
- Gasto de caja chica (comprar insumos)
- Ingreso extra (venta de producto)

**Nueva tabla**:
```sql
CREATE TABLE caja_movimientos_extra (
    id SERIAL PRIMARY KEY,
    caja_id INTEGER REFERENCES caja_movimientos(id),
    tipo VARCHAR(20) NOT NULL, -- 'retiro', 'ingreso', 'gasto'
    monto DECIMAL(10,2) NOT NULL,
    concepto VARCHAR(200) NOT NULL,
    usuario VARCHAR(100) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**UI**:
```
┌─────────────────────────────────────┐
│ MOVIMIENTOS DE CAJA                 │
├─────────────────────────────────────┤
│ [Registrar Retiro]                  │
│ [Registrar Gasto]                   │
│ [Registrar Ingreso Extra]           │
│                                     │
│ Historial de hoy:                   │
│ 10:30 - Retiro $5,000 (Juan)       │
│ 14:00 - Gasto $500 (Insumos)       │
└─────────────────────────────────────┘
```

**Cálculo ajustado**:
```
Esperado = Inicial + Efectivo - Cuenta Corriente - Retiros - Gastos + Ingresos Extra
```

---

#### 2.3 Filtros en Historial

- Por fecha (desde/hasta)
- Por usuario
- Por estado (solo con diferencias / solo cuadradas)
- Exportar a Excel

---

## 📊 NIVEL 3: FUNCIONALIDADES AVANZADAS

### ✅ Para operaciones más complejas

#### 3.1 Múltiples Cajas por Turno

**Caso de uso**: Lavadero con varios turnos o sucursales

**Funcionalidad**:
- Permitir múltiples cajas abiertas simultáneamente
- Diferenciar por usuario/turno
- Cada usuario solo ve su caja

**Ajuste en schema**:
```sql
ALTER TABLE caja_movimientos ADD COLUMN turno VARCHAR(50);
ALTER TABLE caja_movimientos ADD COLUMN usuario_responsable VARCHAR(100);
```

---

#### 3.2 Arqueo de Caja Detallado

**Al cerrar, registrar billetes y monedas**:
```
┌─────────────────────────────────────┐
│ ARQUEO DETALLADO                    │
├─────────────────────────────────────┤
│ Billetes de $1,000: [___] = $_____ │
│ Billetes de $500:   [___] = $_____ │
│ Billetes de $200:   [___] = $_____ │
│ Billetes de $100:   [___] = $_____ │
│ Monedas de $10:     [___] = $_____ │
│ Monedas de $5:      [___] = $_____ │
│                                     │
│ Total Contado:           $ 17,450  │
└─────────────────────────────────────┘
```

**Beneficio**: Mayor precisión y trazabilidad

---

#### 3.3 Alertas Automáticas

**Configuraciones**:
- Alerta si diferencia > $500
- Alerta si caja abierta más de 12 horas
- Alerta si hay 3 cierres con diferencias seguidas

**Envío**:
- Email al administrador
- Notificación en la app

---

#### 3.4 Dashboard de Caja

**Métricas**:
- % de cierres sin diferencias (último mes)
- Diferencia promedio cuando hay error
- Usuario con más diferencias
- Total retirado en el mes
- Tendencia de efectivo vs transferencias

**Gráficos**:
- Línea de tiempo: diferencias por día
- Pie chart: distribución de métodos de pago
- Barra: comparación por usuario

---

#### 3.5 Conciliación con Transferencias

**Problema**: Cliente dice que transfirió, pero aún no llegó al banco

**Solución**: 
```sql
CREATE TABLE transferencias_pendientes (
    id SERIAL PRIMARY KEY,
    registro_id INTEGER REFERENCES registros_lavado(id),
    monto DECIMAL(10,2),
    fecha_declarada TIMESTAMP,
    estado VARCHAR(20), -- 'pendiente', 'confirmada', 'rechazada'
    fecha_confirmacion TIMESTAMP,
    observaciones TEXT
);
```

**Workflow**:
1. Cliente paga con transferencia → se marca como "pendiente"
2. Al día siguiente, admin confirma que llegó → se marca "confirmada"
3. Si no llegó en 3 días → alerta al admin

---

## 🎨 Mockups de UI

### Vista Principal - Caja Abierta
```
┌──────────────────────────────────────────────────┐
│ 💰 Control de Caja                               │
├──────────────────────────────────────────────────┤
│                                                  │
│  🟢 CAJA ABIERTA                                │
│                                                  │
│  Apertura:  09:00 hs - Juan Pérez               │
│  Tiempo:    7h 30m                              │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │ Monto Inicial:         $  5,000.00     │    │
│  │ Ingresos Efectivo:     $ 12,500.00     │    │
│  │ Retiros:               $ -3,000.00     │    │
│  │ Gastos:                $   -200.00     │    │
│  │                        ────────────     │    │
│  │ ESPERADO EN CAJA:      $ 14,300.00     │    │
│  └────────────────────────────────────────┘    │
│                                                  │
│  [📊 Ver Movimientos]  [💵 Cerrar Caja]         │
│                                                  │
├──────────────────────────────────────────────────┤
│                                                  │
│  📋 ÚLTIMOS CIERRES                             │
│                                                  │
│  08/02 | Juan   | $17,500 | -$50  | ⚠️         │
│  07/02 | María  | $11,000 | $0    | ✅         │
│  06/02 | Juan   | $15,200 | +$100 | ⚠️         │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🚀 Recomendación de Implementación

### Fase 1: MVP (2-3 días)
✅ **Implementar NIVEL 1 completo**
- Apertura/cierre simple
- Cálculo automático
- Vista principal
- Historial básico

**Beneficio**: Ya tendrías control de caja funcional

---

### Fase 2: Mejoras (1-2 días)
✅ **Agregar NIVEL 2**
- Desglose de pagos
- Movimientos extra (retiros, gastos)
- Filtros en historial

**Beneficio**: Más flexible y completo

---

### Fase 3: Profesional (2-3 días) - Opcional
✅ **Agregar NIVEL 3** (solo si lo necesitás)
- Múltiples cajas
- Arqueo detallado
- Alertas
- Dashboard

**Beneficio**: Nivel bancario/profesional

---

## 📋 Checklist de Decisión

Marcá lo que querés:

### NIVEL 1 - Básico (Obligatorio)
- [ ] Apertura de caja con monto inicial
- [ ] Cierre de caja con conteo
- [ ] Cálculo automático de diferencias
- [ ] Historial de cierres
- [ ] Estados visuales (cuadrada/diferencia)

### NIVEL 2 - Intermedio (Recomendado)
- [ ] Desglose de pagos (efectivo/transferencia/cuenta corriente)
- [ ] Registrar retiros de efectivo
- [ ] Registrar gastos de caja chica
- [ ] Registrar ingresos extras
- [ ] Filtros en historial
- [ ] Exportar a Excel

### NIVEL 3 - Avanzado (Opcional)
- [ ] Múltiples cajas simultáneas
- [ ] Arqueo detallado (billetes/monedas)
- [ ] Alertas automáticas por email
- [ ] Dashboard con métricas
- [ ] Conciliación de transferencias pendientes
- [ ] Gráficos y reportes avanzados

---

## 💡 Sugerencias Adicionales

### Integración con Reportes Existentes
- Agregar al menú de Reportes → "Caja"
- Link desde Reporte de Caja a ver el cierre de ese día

### Permisos
- **Operador**: Solo puede abrir/cerrar su propia caja
- **Admin**: Puede ver todas las cajas, editar cierres anteriores

### Auditoría
- Todas las operaciones de caja se registran con usuario y timestamp
- No se pueden eliminar cierres (solo agregar observaciones)

---

## 🎯 ¿Qué Nivel Implementamos?

**Opción A - Rápido (2-3 días)**: NIVEL 1  
✅ MVP funcional, control básico de caja

**Opción B - Completo (4-5 días)**: NIVEL 1 + NIVEL 2  
✅ Sistema robusto con movimientos extras

**Opción C - Profesional (7-8 días)**: NIVEL 1 + NIVEL 2 + NIVEL 3  
✅ Sistema bancario completo con todas las campanas

---

## 📝 Próximos Pasos

1. **Decidir nivel de funcionalidad**
2. Crear schema de BD (migración SQL)
3. Crear APIs backend
4. Crear UI frontend
5. Testing
6. Deploy

**¿Con cuál empezamos?** 🚀
