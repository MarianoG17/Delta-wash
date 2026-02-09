# 🏢 Arquitectura: Múltiples Sucursales

**Fecha**: 2026-02-09  
**Pregunta**: ¿Cómo manejar una marca con varias sucursales?

---

## 🏗️ Arquitectura Actual

**Estado actual de LAVAPP**:
```
1 Branch de Neon = 1 Empresa/Marca
```

**Tabla `empresas` (BD Central)**:
- `id`
- `nombre` (ej: "DeltaWash")
- `neon_branch_id`
- `branch_url`

**Cada empresa tiene su propia BD aislada** (branch de Neon)

---

## 🤔 El Problema de las Sucursales

**Escenario**: "DeltaWash" tiene 3 sucursales:
- DeltaWash Centro
- DeltaWash Norte
- DeltaWash Sur

**Pregunta**: ¿Cómo lo manejamos?

---

## 📊 OPCIÓN A: 1 Branch por Sucursal (Sucursales Independientes)

### Concepto
Cada sucursal es tratada como una "empresa" diferente en el sistema.

### Estructura
```
Branch 1 → DeltaWash Centro
Branch 2 → DeltaWash Norte  
Branch 3 → DeltaWash Sur
```

### Tabla `empresas`
```
| id | nombre              | neon_branch_id | branch_url            |
|----|---------------------|----------------|-----------------------|
| 1  | DeltaWash Centro    | br-xxx-111     | postgresql://xxx111   |
| 2  | DeltaWash Norte     | br-xxx-222     | postgresql://xxx222   |
| 3  | DeltaWash Sur       | br-xxx-333     | postgresql://xxx333   |
```

### ✅ Ventajas
1. **Aislamiento total** entre sucursales
2. **Facturación separada** por sucursal
3. **Usuarios independientes** por sucursal
4. **Caja independiente** por sucursal
5. **Cero cambios en el código actual** - ya funciona así
6. **Performance**: Cada sucursal tiene su propia BD
7. **Seguridad**: Si hackean una sucursal, no afecta a las otras

### ❌ Desventajas
1. **No hay reportes consolidados** entre sucursales
2. **No se comparten clientes** entre sucursales
3. **Configuración duplicada** (precios, servicios, etc.)
4. **Costo más alto** en Neon (más branches)
5. **Login separado** por sucursal (los usuarios no son compartidos)

### 💡 Cuándo usar
- Sucursales totalmente independientes (franquicias)
- Cada sucursal tiene su propio dueño/socio
- No necesitan compartir información

---

## 📊 OPCIÓN B: 1 Branch por Empresa, Múltiples Sucursales Dentro

### Concepto
Una sola BD (branch) para toda la marca, con un campo `sucursal_id` en las tablas.

### Estructura
```
Branch 1 → DeltaWash (con 3 sucursales dentro)
```

### Tabla `empresas`
```
| id | nombre     | neon_branch_id | branch_url          |
|----|------------|----------------|---------------------|
| 1  | DeltaWash  | br-xxx-111     | postgresql://xxx111 |
```

### Nueva tabla en el branch: `sucursales`
```sql
CREATE TABLE sucursales (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,        -- "Centro", "Norte", "Sur"
    direccion VARCHAR(200),
    telefono VARCHAR(20),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Modificar tablas existentes
```sql
-- Agregar sucursal_id a TODAS las tablas principales
ALTER TABLE registros_lavado ADD COLUMN sucursal_id INTEGER REFERENCES sucursales(id);
ALTER TABLE caja_movimientos ADD COLUMN sucursal_id INTEGER REFERENCES sucursales(id);
ALTER TABLE usuarios ADD COLUMN sucursal_id INTEGER; -- Usuario pertenece a una sucursal
```

### ✅ Ventajas
1. **Reportes consolidados** - Ver todas las sucursales juntas o por separado
2. **Clientes compartidos** - Un cliente puede ir a cualquier sucursal
3. **Configuración centralizada** - Mismos precios, servicios, etc.
4. **Costo más bajo** - Un solo branch de Neon
5. **Login unificado** - Un usuario puede acceder a todas las sucursales
6. **Análisis global** - "¿Qué sucursal vende más?"

### ❌ Desventajas
1. **Más complejo** - Hay que modificar muchas queries
2. **Riesgo de ver datos de otra sucursal** si no se filtra bien
3. **Performance** - Todas las sucursales en una BD (puede crecer mucho)
4. **No hay aislamiento** - Si hay un bug, afecta a todas

### Cambios necesarios en el código
```typescript
// ANTES
const registros = await sql`SELECT * FROM registros_lavado WHERE fecha = ${fecha}`;

// DESPUÉS
const registros = await sql`
    SELECT * FROM registros_lavado 
    WHERE fecha = ${fecha} 
    AND sucursal_id = ${sucursalId}
`;
```

**Esto hay que hacerlo en TODAS las queries** 🔴

### 💡 Cuándo usar
- Sucursales de un mismo dueño
- Quieren compartir clientes y ver reportes consolidados
- Gestión centralizada

---

## 🎯 Comparación Directa

| Criterio | Opción A (Branch x Sucursal) | Opción B (Sucursales en Branch) |
|----------|------------------------------|----------------------------------|
| **Implementación** | ✅ Ya funciona | 🔴 Requiere mucho código |
| **Aislamiento** | ✅ Total | ⚠️ Parcial |
| **Reportes consolidados** | ❌ No | ✅ Sí |
| **Clientes compartidos** | ❌ No | ✅ Sí |
| **Costo mensual Neon** | 🔴 Alto (N branches) | ✅ Bajo (1 branch) |
| **Performance** | ✅ Excelente | ⚠️ Puede degradarse |
| **Complejidad código** | ✅ Simple | 🔴 Complejo |
| **Riesgo de bugs** | ✅ Bajo | 🔴 Alto (filtros mal hechos) |
| **Tiempo desarrollo** | ✅ 0 días | 🔴 5-7 días |

---

## 🎨 Mockups de UI

### Opción A: Selector de Empresa
```
┌─────────────────────────────┐
│ Seleccionar Lavadero        │
├─────────────────────────────┤
│ ○ DeltaWash Centro          │
│ ○ DeltaWash Norte           │
│ ○ DeltaWash Sur             │
└─────────────────────────────┘
```
(Login en cada uno por separado)

### Opción B: Selector de Sucursal
```
┌─────────────────────────────┐
│ 🏢 DeltaWash                │
│                             │
│ Sucursal: [Centro ▼]       │
│           - Centro          │
│           - Norte           │
│           - Sur             │
│           - Todas           │
└─────────────────────────────┘
```
(Un solo login, cambias de sucursal con dropdown)

---

## 💡 OPCIÓN C: Híbrida (Recomendación)

### Concepto
Empezar con **Opción A** (más simple), pero preparar para futuro:

```sql
-- En la tabla empresas, agregar:
ALTER TABLE empresas ADD COLUMN empresa_matriz_id INTEGER;
ALTER TABLE empresas ADD COLUMN es_sucursal BOOLEAN DEFAULT false;
```

**Beneficios**:
1. Funciona YA con lo actual (Opción A)
2. En el futuro, si un cliente quiere reportes consolidados:
   - Marcamos sus sucursales con `empresa_matriz_id`
   - Creamos endpoints especiales para reportes consolidados
   - NO hace falta migrar datos

**Ejemplo de estructura**:
```
| id | nombre            | empresa_matriz_id | es_sucursal |
|----|-------------------|-------------------|-------------|
| 1  | DeltaWash         | NULL              | false       |
| 2  | DeltaWash Centro  | 1                 | true        |
| 3  | DeltaWash Norte   | 1                 | true        |
| 4  | DeltaWash Sur     | 1                 | true        |
```

**Query para reporte consolidado** (solo si el cliente lo pide):
```sql
SELECT * FROM reportes 
WHERE empresa_id IN (
    SELECT id FROM empresas 
    WHERE empresa_matriz_id = 1 OR id = 1
);
```

---

## 🚀 Recomendación Final

### Para 95% de los casos: **OPCIÓN A** ✅

**Razones**:
1. Ya está implementado
2. Es más simple y robusto
3. Cada sucursal es independiente (lo cual es bueno)
4. Cero riesgo de ver datos de otra sucursal
5. Más escalable (si una sucursal crece mucho, no afecta a las otras)

### Solo usar Opción B si:
- El cliente NECESITA reportes consolidados
- El cliente NECESITA clientes compartidos
- El cliente está dispuesto a pagar por el desarrollo (5-7 días)
- El cliente entiende los riesgos

---

## 📋 Implementación Opción A (Actual)

**Pasos para un cliente con sucursales**:

1. **Crear 3 empresas en Super Admin**:
   - DeltaWash Centro
   - DeltaWash Norte
   - DeltaWash Sur

2. **Cada sucursal tiene**:
   - Su propio branch de Neon
   - Sus propios usuarios
   - Su propia caja
   - Sus propios clientes

3. **Si quieren reportes consolidados** (futuro):
   - Crear un script externo que consulte los 3 branches
   - Generar reporte consolidado en Excel
   - No afecta la app principal

---

## 🎯 Respuesta a la Pregunta Original

> "Si una misma marca de lavadero tiene sucursales, la app hay que manejarla como un branch?"

**Respuesta**: Sí, la forma más simple y robusta es:

```
1 Branch de Neon = 1 Sucursal
```

Cada sucursal opera independientemente. Si en el futuro necesitan reportes consolidados, podemos agregarlo sin cambiar la arquitectura base.

---

## 💼 Consideraciones de Negocio

### Pricing por Sucursal
**Opción A**: Cobrar por sucursal ($X por sucursal/mes)  
**Opción B**: Cobrar por empresa con N sucursales ($X + $Y por sucursal adicional)

**Recomendación**: Opción A es más justo y escalable

---

## 🔄 Path de Migración (Si cambian de opinión)

Si empezás con Opción A y luego querés ir a Opción B:

**NO es necesario migrar** - Podés:
1. Dejar las sucursales como branches separados
2. Crear APIs "consolidadas" que consulten múltiples branches
3. Mostrar reportes consolidados en una vista especial
4. Lo mejor de ambos mundos

---

## ✅ Conclusión

**Mantener la arquitectura actual (Opción A)**:
- 1 Branch = 1 Sucursal
- Simple, robusto, ya funciona
- Fácil de escalar
- Sin riesgo de bugs

**En el futuro, si lo necesitan**:
- Agregar reportes consolidados como feature opcional
- No cambiar la arquitectura base
