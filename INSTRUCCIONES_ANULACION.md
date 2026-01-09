# Sistema de Anulación de Registros

## Descripción

El sistema de anulación permite marcar registros de lavado como "anulados" sin eliminarlos de la base de datos. Esto mantiene un registro completo para auditoría mientras excluye estos registros de estadísticas y facturación.

## Características

### 1. **Anulación en lugar de Eliminación**
- Los registros NO se eliminan físicamente de la base de datos
- Se marcan con un flag `anulado = TRUE`
- Se registra la fecha, motivo y usuario que realizó la anulación
- Mantiene trazabilidad completa para auditoría

### 2. **Reversión Automática de Cuenta Corriente**
- Si el registro usó cuenta corriente, el saldo se revierte automáticamente
- El movimiento en el historial se marca como "[ANULADO]"
- El cliente recupera el crédito descontado

### 3. **Exclusión de Estadísticas**
- Los registros anulados NO se cuentan en:
  - Total de autos lavados
  - Estadísticas de clientes
  - Facturación
  - Reportes de visitas

### 4. **Interfaz de Usuario**
- Botón naranja con ícono de prohibición (🚫) visible solo para admin
- Solicita motivo de anulación antes de confirmar
- Muestra confirmación con detalles del saldo revertido

## Migración de Base de Datos

### Ejecutar en Neon Console:

```sql
-- Agregar campos para sistema de anulación
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT,
ADD COLUMN IF NOT EXISTS usuario_anulacion_id INTEGER REFERENCES usuarios(id);

-- Crear índice para filtrar registros anulados
CREATE INDEX IF NOT EXISTS idx_anulado ON registros_lavado(anulado);
```

## APIs Creadas

### 1. **POST /api/registros/anular**
Anula un registro de lavado.

**Request:**
```json
{
  "id": 123,
  "motivo": "Error en el registro",
  "usuario_id": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registro anulado correctamente",
  "saldo_revertido": 22000
}
```

### 2. **GET /api/registros?incluir_anulados=true**
Permite incluir registros anulados en la consulta (por defecto se excluyen).

## Modificaciones en APIs Existentes

### 1. **GET /api/registros**
- Por defecto excluye registros anulados
- Agregar `?incluir_anulados=true` para incluirlos

### 2. **GET /api/estadisticas/clientes**
- Excluye automáticamente registros anulados
- No cuenta visitas anuladas
- No incluye en totales de facturación

## Casos de Uso

### Caso 1: Error en el Registro
Un operador registra un auto con datos incorrectos. El admin puede anular el registro y crear uno nuevo con los datos correctos.

### Caso 2: Cliente Cancela el Servicio
Si un cliente cancela después de registrado pero antes de iniciar el lavado, se puede anular el registro manteniendo el historial.

### Caso 3: Corrección de Cuenta Corriente
Si se descontó incorrectamente de una cuenta corriente, la anulación revierte automáticamente el saldo.

## Diferencias: Anular vs Cancelar vs Eliminar

| Acción | Registro en BD | Cuenta en Estadísticas | Revierte Saldo | Auditoría |
|--------|---------------|----------------------|----------------|-----------|
| **Anular** | ✅ Se mantiene | ❌ No cuenta | ✅ Sí | ✅ Completa |
| **Cancelar** | ✅ Se mantiene | ✅ Cuenta como cancelado | ❌ No | ✅ Completa |
| **Eliminar** | ❌ Se borra | ❌ No cuenta | ✅ Sí | ❌ Se pierde |

## Recomendaciones

1. **Usar Anular** cuando:
   - Hay un error en el registro
   - El servicio no se realizó
   - Se necesita corrección de datos

2. **Usar Cancelar** cuando:
   - El cliente cancela el servicio
   - Se quiere mantener estadística de cancelaciones

3. **NO usar Eliminar** (función removida):
   - Siempre es mejor mantener registros para auditoría

## Consultas Útiles

### Ver todos los registros anulados:
```sql
SELECT * FROM registros_lavado 
WHERE anulado = TRUE 
ORDER BY fecha_anulacion DESC;
```

### Ver registros anulados con detalles:
```sql
SELECT 
  r.*,
  u.nombre as usuario_anulo
FROM registros_lavado r
LEFT JOIN usuarios u ON r.usuario_anulacion_id = u.id
WHERE r.anulado = TRUE
ORDER BY r.fecha_anulacion DESC;
```

### Estadísticas de anulaciones:
```sql
SELECT 
  COUNT(*) as total_anulados,
  COUNT(DISTINCT usuario_anulacion_id) as usuarios_que_anularon,
  DATE_TRUNC('day', fecha_anulacion) as dia
FROM registros_lavado
WHERE anulado = TRUE
GROUP BY dia
ORDER BY dia DESC;
```

## Notas Importantes

- Solo usuarios con rol **admin** pueden anular registros
- El motivo de anulación es opcional pero recomendado
- La anulación NO se puede deshacer (es permanente)
- Los registros anulados permanecen en la base de datos indefinidamente
- Se recomienda revisar periódicamente los registros anulados para detectar patrones de errores
