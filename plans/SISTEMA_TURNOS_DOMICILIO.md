# Sistema de Turnos a Domicilio - Análisis y Propuesta

**Fecha:** 2026-02-06  
**Contexto:** Feature para lavaderos móviles (servicio a domicilio)  
**Complejidad:** ⚪⚪⚫⚫⚫ (Baja-Media, 2/5)

---

## 🎯 Concepto

Permitir a lavaderos a domicilio gestionar agenda de turnos donde **clientes finales** reservan sin registrarse, solo completando:
- Nombre
- Teléfono
- Dirección
- Tipo de lavado
- Fecha/hora deseada

---

## 💡 Propuesta Simple (MVP)

### Flujo Cliente Final

1. **Acceso público:** Cliente escanea QR o abre link `chasis.app/turnos/nombre-lavadero`
2. **Calendario visual:** Ve slots disponibles (ej: "Martes 10 Feb, 10:00 AM - LIBRE")
3. **Selecciona slot:** Click en horario disponible
4. **Formulario rápido:**
   ```
   👤 Nombre: _____________
   📱 Teléfono: ___________
   📍 Dirección: __________
   🚗 Tipo lavado: [Select ▼]
   ```
5. **Confirma:** "Reservar turno" → Recibe WhatsApp automático con confirmación
6. **Recordatorio:** 1 día antes, WhatsApp con recordatorio

### Flujo Operador (Backend)

**Vista: `/turnos` (nueva página)**

```
┌─────────────────────────────────────────────────┐
│  📅 AGENDA - Martes 10 Febrero 2026            │
├─────────────────────────────────────────────────┤
│  09:00 - 10:00  │ Juan Pérez ✅ Confirmado     │
│                 │ 📱 +54 11 1234-5678          │
│                 │ 📍 Av. Rivadavia 1234        │
│                 │ 🚗 Lavado Completo          │
│                 │ [Finalizar] [Cancelar]      │
├─────────────────────────────────────────────────┤
│  10:00 - 11:00  │ LIBRE                        │
├─────────────────────────────────────────────────┤
│  11:00 - 12:00  │ María López 🕒 Pendiente    │
│                 │ [Ver detalles]               │
└─────────────────────────────────────────────────┘
```

**Acciones:**
- Ver agenda día/semana/mes
- Bloquear horarios (vacaciones, feriados)
- Configurar disponibilidad (lunes a sábado, 9-18hs)
- Confirmar/cancelar turnos
- Marcar finalizado → Genera registro_lavado automático

---

## 🗂️ Estructura de Base de Datos

### Tabla: `turnos_config`
```sql
CREATE TABLE turnos_config (
    id SERIAL PRIMARY KEY,
    duracion_turno_minutos INT DEFAULT 60,
    horario_inicio TIME DEFAULT '09:00',
    horario_fin TIME DEFAULT '18:00',
    dias_habiles TEXT[] DEFAULT ARRAY['lun','mar','mie','jue','vie','sab'],
    anticipacion_minima_dias INT DEFAULT 1,
    zona_cobertura_km INT DEFAULT 10,
    direccion_base TEXT, -- Centro de operaciones
    requiere_confirmacion BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `turnos`
```sql
CREATE TABLE turnos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    
    -- Datos cliente (sin registro)
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_direccion TEXT NOT NULL,
    cliente_coordenadas POINT, -- Para distancia/mapeo
    
    -- Servicio
    tipo_lavado VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2),
    
    -- Estado
    estado VARCHAR(20) DEFAULT 'pendiente', 
    -- pendiente / confirmado / en_curso / finalizado / cancelado
    
    -- Tracking
    confirmado_at TIMESTAMP,
    recordatorio_enviado_at TIMESTAMP,
    finalizado_at TIMESTAMP,
    registro_lavado_id INT REFERENCES registros_lavado(id),
    
    -- Cancelaciones
    cancelado_at TIMESTAMP,
    cancelado_por VARCHAR(50), -- 'cliente' / 'operador'
    motivo_cancelacion TEXT,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

### Tabla: `bloqueos_horarios`
```sql
CREATE TABLE bloqueos_horarios (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    motivo VARCHAR(100), -- 'Vacaciones', 'Feriado', 'Mantenimiento'
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 APIs Necesarias

### Públicas (Cliente)

**GET `/api/turnos/disponibles`**
```typescript
// Query: ?fecha=2026-02-10
// Response:
{
    "slots": [
        { "hora": "09:00", "disponible": false },
        { "hora": "10:00", "disponible": true },
        { "hora": "11:00", "disponible": true },
        { "hora": "12:00", "disponible": false }
    ]
}
```

**POST `/api/turnos/reservar`**
```typescript
// Body:
{
    "fecha": "2026-02-10",
    "hora_inicio": "10:00",
    "cliente_nombre": "Juan Pérez",
    "cliente_telefono": "+54 11 1234-5678",
    "cliente_direccion": "Av. Rivadavia 1234, CABA",
    "tipo_lavado": "lavado_completo"
}

// Response:
{
    "success": true,
    "turno_id": 123,
    "confirmacion_enviada": true,
    "mensaje": "Tu turno fue reservado. Te enviaremos un WhatsApp de confirmación."
}
```

### Privadas (Operador)

**GET `/api/turnos`**
```typescript
// Query: ?fecha=2026-02-10
// Response: Lista de turnos del día con detalles completos
```

**PATCH `/api/turnos/:id/confirmar`**
```typescript
// Marca turno como confirmado
```

**PATCH `/api/turnos/:id/finalizar`**
```typescript
// Marca finalizado + crea registro_lavado automático
```

**POST `/api/turnos/bloquear`**
```typescript
// Bloquea rango de fechas/horarios
```

---

## 🎨 Frontend Necesario

### 1. Página Pública: `/app/turnos/[slug]/page.tsx`

**Componentes:**
- Calendar view (react-calendar o similar)
- Time slot picker
- Form de datos básicos
- Confirmación visual
- WhatsApp link para consultas

**Mobile-first:** Cliente lo ve en su celular

### 2. Página Privada: `/app/turnos/page.tsx`

**Vista Agenda (por default):**
- Timeline view del día actual
- Botones: [Hoy] [Semana] [Mes]
- Acciones rápidas por turno
- Filtros: Todos / Pendientes / Confirmados

**Vista Configuración:**
- Horarios de trabajo
- Duración por turno
- Zona de cobertura
- Días no laborables

---

## ⚡ Features Adicionales Sugeridas

### 1. 🗺️ Validación de Zona de Cobertura
```typescript
// Al reservar turno, validar que dirección esté dentro del radio
import { getDistance } from 'geolib';

const distanciaKm = getDistance(
    { lat: direccionBase.lat, lng: direccionBase.lng },
    { lat: direccionCliente.lat, lng: direccionCliente.lng }
) / 1000;

if (distanciaKm > config.zona_cobertura_km) {
    return { error: "No llegamos a esa zona" };
}
```

**Implementación simple:** Usar Google Maps Geocoding API (gratis hasta 28k requests/mes)

### 2. 📱 WhatsApp Integración

**Mensajes automáticos:**
```
CONFIRMACIÓN (inmediato):
"✅ Tu turno fue reservado!
📅 Martes 10 Feb, 10:00 AM
🚗 Lavado Completo
📍 Av. Rivadavia 1234
💰 $5000
Si necesitás cancelar, respondé CANCELAR"

RECORDATORIO (1 día antes):
"⏰ Recordatorio: Tu turno es mañana!
📅 Martes 10 Feb, 10:00 AM
📍 Av. Rivadavia 1234
Nos vemos ahí 👋"

FINALIZADO (después de lavar):
"✅ Gracias por elegirnos!
¿Nos dejarías tu opinión? [Link encuesta]"
```

### 3. 🔄 Reprogramación Fácil

**Cliente:**
- Recibe link único: `chasis.app/turno/abc123/modificar`
- Ve su turno actual
- Puede elegir nueva fecha/hora
- Confirmación automática

**Límites:**
- Solo hasta 2 horas antes del turno
- Máximo 1 reprogramación por turno

### 4. 📊 Analytics para Operador

**Dashboard simple:**
```
Esta semana:
├─ 24 turnos reservados
├─ 22 confirmados (92%)
├─ 2 cancelaciones
└─ Horario más popular: 10:00 AM (7 turnos)

Zonas más frecuentes:
├─ Palermo: 8 turnos
├─ Belgrano: 6 turnos
└─ Caballito: 4 turnos
```

### 5. 🚗 Optimización de Ruta

**Para múltiples turnos en un día:**
- Ver turnos en mapa
- Sugerencia de orden óptimo
- Calcular tiempo de viaje entre turnos

**Integración:** Google Maps Directions API

### 6. 💰 Seña/Anticipo Online (Opcional)

**Problema:** No-shows (cliente reserva y no aparece)

**Solución:**
- Pedir seña del 20% al reservar
- Integración Mercado Pago
- Si cancela con > 24hs, se devuelve
- Si cancela con < 24hs o no-show, se retiene

---

## 🛠️ Complejidad de Implementación

### Versión MVP (Simple)
**Tiempo:** 8-12 horas  
**Incluye:**
- ✅ Tabla turnos + config
- ✅ API reservar turno (público)
- ✅ API listar turnos (operador)
- ✅ Página pública con calendario
- ✅ Página privada lista simple
- ✅ WhatsApp manual (operador copia mensaje)

### Versión Standard
**Tiempo:** 20-30 horas  
**Agrega:**
- ✅ WhatsApp automático (confirmación + recordatorio)
- ✅ Zona de cobertura (validación básica)
- ✅ Bloqueo de horarios
- ✅ Timeline view agenda
- ✅ Reprogramación por cliente

### Versión Premium
**Tiempo:** 40-50 horas  
**Agrega:**
- ✅ Mapa con turnos
- ✅ Optimización de ruta
- ✅ Analytics dashboard
- ✅ Seña online (Mercado Pago)
- ✅ App móvil nativa (opcional)

---

## 📋 Schema de Migración

```sql
-- migration-sistema-turnos-domicilio.sql

-- Config de turnos
CREATE TABLE IF NOT EXISTS turnos_config (
    id SERIAL PRIMARY KEY,
    duracion_turno_minutos INT DEFAULT 60,
    horario_inicio TIME DEFAULT '09:00',
    horario_fin TIME DEFAULT '18:00',
    dias_habiles TEXT[] DEFAULT ARRAY['lun','mar','mie','jue','vie','sab'],
    anticipacion_minima_dias INT DEFAULT 1,
    zona_cobertura_km INT DEFAULT 10,
    direccion_base TEXT,
    lat_base DECIMAL(10, 7),
    lng_base DECIMAL(10, 7),
    requiere_confirmacion BOOLEAN DEFAULT FALSE,
    whatsapp_confirmacion TEXT DEFAULT 'Tu turno fue reservado exitosamente',
    whatsapp_recordatorio TEXT DEFAULT 'Recordatorio: Tu turno es mañana',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Turnos
CREATE TABLE IF NOT EXISTS turnos (
    id SERIAL PRIMARY KEY,
    fecha DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_telefono VARCHAR(20) NOT NULL,
    cliente_direccion TEXT NOT NULL,
    cliente_lat DECIMAL(10, 7),
    cliente_lng DECIMAL(10, 7),
    tipo_lavado VARCHAR(50) NOT NULL,
    precio DECIMAL(10,2),
    notas TEXT,
    estado VARCHAR(20) DEFAULT 'pendiente',
    confirmado_at TIMESTAMP,
    recordatorio_enviado_at TIMESTAMP,
    finalizado_at TIMESTAMP,
    registro_lavado_id INT REFERENCES registros_lavado(id),
    cancelado_at TIMESTAMP,
    cancelado_por VARCHAR(50),
    motivo_cancelacion TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_turnos_fecha ON turnos(fecha);
CREATE INDEX idx_turnos_estado ON turnos(estado);
CREATE INDEX idx_turnos_telefono ON turnos(cliente_telefono);

-- Bloqueos
CREATE TABLE IF NOT EXISTS bloqueos_horarios (
    id SERIAL PRIMARY KEY,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    hora_inicio TIME,
    hora_fin TIME,
    motivo VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Constraint: No overlapping
ALTER TABLE turnos 
ADD CONSTRAINT no_overlapping_turnos 
EXCLUDE USING gist (
    fecha WITH =, 
    tsrange(
        (fecha + hora_inicio)::timestamp, 
        (fecha + hora_fin)::timestamp
    ) WITH &&
) WHERE (estado != 'cancelado');

-- Datos iniciales
INSERT INTO turnos_config (id, direccion_base, lat_base, lng_base) 
VALUES (1, 'Dirección del lavadero', -34.6037, -58.3816)
ON CONFLICT (id) DO NOTHING;
```

---

## 🎨 Mockup UI (Página Pública)

```
┌─────────────────────────────────────────────────┐
│  🚗 Reservá tu turno - Lavadero XYZ            │
├─────────────────────────────────────────────────┤
│  📅 Seleccioná fecha:                          │
│                                                 │
│   [<]  Febrero 2026  [>]                       │
│   ┌─────────────────────────────┐             │
│   │ L  M  M  J  V  S  D         │             │
│   │       1  2  3  4  5         │             │
│   │ 6  7  8  9 [10] 11 12       │  ← Click    │
│   │ 13 14 15 16 17 18 19        │             │
│   └─────────────────────────────┘             │
│                                                 │
│  ⏰ Elegí horario:                             │
│   ○ 09:00 - 10:00                              │
│   ● 10:00 - 11:00  ← Seleccionado             │
│   ○ 11:00 - 12:00                              │
│   ⊗ 12:00 - 13:00  (ocupado)                  │
│                                                 │
│  👤 Tus datos:                                 │
│   Nombre:    [_____________________]           │
│   Teléfono:  [_____________________]           │
│   Dirección: [_____________________]           │
│   Tipo:      [Lavado Completo ▼]              │
│                                                 │
│   [   RESERVAR TURNO   ]                       │
│                                                 │
│  💬 ¿Dudas? Escribinos al WhatsApp             │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Plan de Implementación Sugerido

### Fase 1: MVP (Validación)
**Semana 1-2:**
1. DB schema + migraciones
2. API reservar turno (público)
3. API listar turnos (privado)
4. Página pública simple (formulario)
5. Página privada lista básica
6. Testing con 1 cliente piloto

**Objetivo:** Validar que el concepto es útil antes de invertir más

### Fase 2: Automatización
**Semana 3-4:**
1. WhatsApp automático (confirmación)
2. Zona de cobertura
3. Calendario visual mejorado
4. Bloqueo de horarios
5. Confirmación/cancelación

### Fase 3: Optimización
**Semana 5-6:**
1. Recordatorios automáticos
2. Reprogramación por cliente
3. Analytics básico
4. Mapa de turnos
5. Optimización de ruta (si hay múltiples turnos/día)

### Fase 4: Premium (Opcional)
**Mes 2+:**
1. Seña online
2. App móvil
3. Integración completa con registro_lavado
4. Multi-operador (varios lavadores simultáneos)

---

## 💰 Modelo de Negocio

### Pricing Sugerido

**Plan Básico (Lavadero físico):** $0  
- Sin turnos online

**Plan Móvil (Lavadero a domicilio):** +$15-20/mes  
- Sistema de turnos
- WhatsApp automático
- Hasta 100 turnos/mes

**Plan Móvil Pro:** +$35-40/mes  
- Todo lo anterior
- Analytics
- Mapa + optimización ruta
- Turnos ilimitados
- Seña online

---

## ✅ Conclusión

**Complejidad real:** ⚪⚪⚫⚫⚫ (2/5 - Baja-Media)

**¿Es viable?** ✅ Totalmente. Con la arquitectura actual (multi-tenant) es directo agregarlo.

**¿Vale la pena?** ✅ Sí, si hay demanda de lavaderos móviles. Es un diferenciador fuerte.

**Tiempo estimado MVP:** 8-12 horas (1-2 días full-time)

**Riesgo:** ⚪ Bajo. Es una feature aislada que no rompe nada existente.

**Recomendación:** Empezar con MVP simple, validar con 2-3 clientes, y escalar según feedback.
