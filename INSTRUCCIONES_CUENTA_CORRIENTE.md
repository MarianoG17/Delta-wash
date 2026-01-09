# Sistema de Cuenta Corriente - DeltaWash

## 📋 Descripción

Sistema de saldo prepago para clientes frecuentes. Los clientes pueden cargar dinero por adelantado y cada lavado se descuenta automáticamente de su saldo.

## 🎯 Características

- **Asociado al celular**: Cada cuenta corriente está vinculada a un número de celular
- **Múltiples vehículos**: Un cliente puede traer diferentes autos, todos usan el mismo saldo
- **Detección automática**: Al ingresar el celular, se detecta si tiene cuenta corriente con saldo
- **Descuento automático**: El precio del lavado se descuenta automáticamente del saldo
- **Historial de movimientos**: Se registra cada carga y descuento

## 🔧 Migración de Base de Datos

Ejecuta este script en Vercel Postgres:

```sql
-- Crear tabla de cuentas corrientes
CREATE TABLE IF NOT EXISTS cuentas_corrientes (
  id SERIAL PRIMARY KEY,
  nombre_cliente VARCHAR(100) NOT NULL,
  celular VARCHAR(20) NOT NULL,
  saldo_inicial DECIMAL(10,2) NOT NULL DEFAULT 0,
  saldo_actual DECIMAL(10,2) NOT NULL DEFAULT 0,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activa BOOLEAN DEFAULT TRUE,
  notas TEXT,
  UNIQUE(celular)
);

-- Crear tabla de movimientos
CREATE TABLE IF NOT EXISTS movimientos_cuenta (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER REFERENCES cuentas_corrientes(id),
  registro_id INTEGER REFERENCES registros_lavado(id),
  tipo VARCHAR(20) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_nuevo DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER REFERENCES usuarios(id)
);

-- Agregar campos a registros_lavado
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS usa_cuenta_corriente BOOLEAN DEFAULT FALSE;

ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS cuenta_corriente_id INTEGER REFERENCES cuentas_corrientes(id);

-- Índices
CREATE INDEX IF NOT EXISTS idx_cuentas_celular ON cuentas_corrientes(celular);
CREATE INDEX IF NOT EXISTS idx_cuentas_activa ON cuentas_corrientes(activa);
CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta ON movimientos_cuenta(cuenta_id);
```

O simplemente ejecuta: [`migration-agregar-cuenta-corriente.sql`](migration-agregar-cuenta-corriente.sql)

## 👥 Gestión de Cuentas Corrientes (Admin)

### Acceso
- URL: `/cuentas-corrientes`
- Solo accesible para usuarios con rol **admin**

### Crear Nueva Cuenta Corriente

1. Click en "Nueva Cuenta Corriente"
2. Completar:
   - **Nombre del Cliente**: Nombre completo
   - **Celular**: Número de celular (debe ser único)
   - **Saldo Inicial**: Monto a cargar (ej: $50.000)
   - **Notas**: Información adicional (opcional)
3. Click en "Crear Cuenta Corriente"

### Cargar Saldo a Cuenta Existente

1. Buscar la cuenta en la lista
2. Click en "Cargar Saldo"
3. Ingresar el monto a cargar
4. Click en "Cargar"
5. El saldo se suma al saldo actual

## 🚗 Uso en el Formulario de Registro

### Flujo Automático

1. **Ingresar celular** en el formulario de registro
2. Si el celular tiene cuenta corriente con saldo:
   - Aparece un recuadro verde
   - Muestra: "💰 Saldo disponible: $XX.XXX"
   - Checkbox: "Usar Cuenta Corriente"
3. **Marcar el checkbox** para usar cuenta corriente
4. Se muestra el saldo después del lavado
5. Al registrar el auto:
   - Se descuenta automáticamente del saldo
   - Se registra el movimiento
   - Se muestra confirmación con nuevo saldo

### Validaciones

- ✅ Solo aparece si hay saldo disponible
- ✅ Valida que el saldo sea suficiente antes de registrar
- ✅ Muestra mensaje de error si el saldo es insuficiente
- ✅ Actualiza el saldo en tiempo real

## 📊 Ejemplo de Uso

### Caso 1: Cliente Nuevo con Cuenta Corriente

```
1. Admin crea cuenta corriente:
   - Cliente: Juan Pérez
   - Celular: 11-12345678
   - Saldo inicial: $100.000

2. Operador registra lavado:
   - Ingresa celular: 11-12345678
   - Aparece: "💰 Saldo disponible: $100.000"
   - Marca checkbox "Usar Cuenta Corriente"
   - Tipo: Auto Simple ($22.000)
   - Registra el auto
   
3. Resultado:
   - Auto registrado
   - Saldo descontado: $22.000
   - Nuevo saldo: $78.000
```

### Caso 2: Cliente con Múltiples Vehículos

```
Cliente: María González (11-98765432)
Saldo inicial: $150.000

Lavado 1: Auto Simple ($22.000)
Saldo restante: $128.000

Lavado 2: Camioneta con Cera ($37.000)
Saldo restante: $91.000

Lavado 3: Moto ($15.000)
Saldo restante: $76.000
```

### Caso 3: Recarga de Saldo

```
Cliente tiene: $5.000
Necesita lavar: Auto ($22.000)

Admin:
1. Va a /cuentas-corrientes
2. Busca al cliente
3. Click "Cargar Saldo"
4. Ingresa: $50.000
5. Nuevo saldo: $55.000

Ahora el cliente puede usar su cuenta corriente.
```

## 🔍 Visualización en Registros

Los registros que usaron cuenta corriente muestran:
- ✅ Indicador visual (puede agregarse)
- ✅ Vinculación a la cuenta corriente
- ✅ Historial de movimientos

## 📈 Historial de Movimientos

Cada movimiento registra:
- **Tipo**: "carga" o "descuento"
- **Monto**: Cantidad cargada o descontada
- **Saldo anterior**: Saldo antes del movimiento
- **Saldo nuevo**: Saldo después del movimiento
- **Descripción**: Detalle del movimiento
- **Fecha**: Timestamp del movimiento
- **Usuario**: Quién realizó la operación
- **Registro**: Vinculación al lavado (si es descuento)

## ⚠️ Consideraciones Importantes

### Seguridad
- Solo admin puede crear y cargar cuentas corrientes
- Los operadores solo pueden usar cuentas existentes
- El celular es único (no se pueden duplicar cuentas)

### Saldo
- El saldo nunca puede ser negativo
- Si el saldo es insuficiente, no se permite usar cuenta corriente
- Cuando el saldo llega a 0, la cuenta se marca como inactiva

### Celular
- Debe ser único en el sistema
- Se usa como identificador principal
- Formato sugerido: XX-XXXXXXXX

## 🚀 Ventajas del Sistema

1. **Para el Negocio**:
   - Fidelización de clientes
   - Cobro anticipado
   - Flujo de caja mejorado
   - Menos manejo de efectivo

2. **Para el Cliente**:
   - Comodidad (no necesita pagar cada vez)
   - Descuentos por volumen (opcional)
   - Servicio más rápido
   - Control de gastos

3. **Para los Operadores**:
   - Proceso más rápido
   - Menos errores en cobros
   - Registro automático
   - Menos manejo de dinero

## 📱 Accesos Rápidos

- **Gestionar Cuentas**: `/cuentas-corrientes` (solo admin)
- **Usar en Registro**: `/prueba` (todos los usuarios)
- **Ver Historial**: Próximamente

## 🔄 Flujo Completo

```
┌─────────────────────────────────────────┐
│  ADMIN: Crear Cuenta Corriente          │
│  - Nombre: Juan Pérez                   │
│  - Celular: 11-12345678                 │
│  - Saldo: $100.000                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  OPERADOR: Registrar Lavado             │
│  - Ingresa celular: 11-12345678         │
│  - Sistema detecta cuenta corriente     │
│  - Muestra saldo: $100.000              │
│  - Marca "Usar Cuenta Corriente"        │
│  - Precio: $22.000                      │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  SISTEMA: Procesar                      │
│  - Valida saldo suficiente ✓            │
│  - Registra el lavado                   │
│  - Descuenta $22.000                    │
│  - Nuevo saldo: $78.000                 │
│  - Registra movimiento                  │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│  RESULTADO                              │
│  ✅ Auto registrado                     │
│  💰 Saldo descontado: $22.000           │
│  💳 Nuevo saldo: $78.000                │
└─────────────────────────────────────────┘
```

## 🐛 Solución de Problemas

### No aparece el checkbox de cuenta corriente
- Verificar que el celular tenga 8 o más dígitos
- Verificar que exista una cuenta con ese celular
- Verificar que la cuenta tenga saldo > 0

### Error "Saldo insuficiente"
- El saldo actual es menor al precio del lavado
- Admin debe cargar más saldo a la cuenta

### No puedo crear cuenta (celular duplicado)
- Ya existe una cuenta con ese celular
- Usar la cuenta existente o cargar saldo a ella

### La cuenta no se muestra en la lista
- Verificar que se haya creado correctamente
- Refrescar la página
- Verificar permisos de admin
