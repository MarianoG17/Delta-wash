# Verificar Sistema de Movimientos de Cuenta Corriente

## 🔍 Pasos para Diagnosticar el Problema

### 1. Verificar que la tabla existe en Neon

Ve a tu dashboard de Neon → Query y ejecuta:

```sql
-- Verificar si existe la tabla
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'movimientos_cuenta';

-- Ver estructura de la tabla
\d movimientos_cuenta

-- Ver si hay datos
SELECT COUNT(*) FROM movimientos_cuenta;
```

### 2. Si la tabla NO existe, ejecutar la migración

En Neon → Query, ejecuta el contenido del archivo [`migration-agregar-cuenta-corriente.sql`](migration-agregar-cuenta-corriente.sql) (líneas 18-29):

```sql
CREATE TABLE IF NOT EXISTS movimientos_cuenta (
  id SERIAL PRIMARY KEY,
  cuenta_id INTEGER REFERENCES cuentas_corrientes(id),
  registro_id INTEGER REFERENCES registros(id),
  tipo VARCHAR(20) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_nuevo DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  usuario_id INTEGER REFERENCES usuarios(id)
);

CREATE INDEX IF NOT EXISTS idx_movimientos_cuenta ON movimientos_cuenta(cuenta_id);
CREATE INDEX IF NOT EXISTS idx_movimientos_fecha ON movimientos_cuenta(fecha);
```

### 3. Verificar que hay cuentas corrientes

```sql
SELECT * FROM cuentas_corrientes;
```

### 4. Probar la API directamente

Abre en el navegador (reemplaza el ID con uno real de tu base de datos):
```
https://tu-app.vercel.app/api/cuentas-corrientes/movimientos?cuenta_id=1
```

Deberías ver una respuesta JSON con la estructura:
```json
{
  "success": true,
  "cuenta": { ... },
  "movimientos": []
}
```

### 5. Si ves "Cuenta corriente no encontrada"

Significa que el ID en la URL no existe. Verifica:
- Que estés haciendo clic en el botón "Ver Movimientos" de una cuenta existente
- Que la URL tenga un ID válido: `/cuentas-corrientes/[número]`

### 6. Crear un movimiento de prueba

Si la tabla existe pero está vacía, carga saldo a una cuenta para crear el primer movimiento:

1. Ve a `/cuentas-corrientes`
2. Haz clic en "Cargar Saldo" en cualquier cuenta
3. Ingresa un monto (ej: 50000)
4. Haz clic en "Cargar"
5. Ahora haz clic en "Ver Movimientos"

## 🐛 Errores Comunes

### Error: "relation movimientos_cuenta does not exist"
**Solución**: Ejecutar la migración (paso 2)

### Error: "Cuenta corriente no encontrada"
**Solución**: Verificar que el ID en la URL sea correcto (paso 5)

### Error: "No hay movimientos registrados"
**Solución**: Es normal si nunca has cargado saldo o usado cuenta corriente. Crea un movimiento (paso 6)

## 📞 Información Adicional

- La tabla `movimientos_cuenta` se crea automáticamente con la migración de cuenta corriente
- Cada vez que cargas saldo o usas cuenta corriente en un lavado, se crea un movimiento
- Los movimientos se muestran ordenados por fecha (más recientes primero)
