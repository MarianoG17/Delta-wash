# Migración: Sistema de Anulación

## ⚠️ IMPORTANTE: Ejecutar ANTES de usar la nueva funcionalidad

## Pasos para ejecutar la migración

### 1. Acceder a Neon Console
1. Ir a https://console.neon.tech
2. Seleccionar el proyecto de DeltaWash
3. Ir a la pestaña "SQL Editor"

### 2. Ejecutar el siguiente SQL:

```sql
-- Agregar campos para sistema de anulación
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS anulado BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fecha_anulacion TIMESTAMP,
ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT,
ADD COLUMN IF NOT EXISTS usuario_anulacion_id INTEGER REFERENCES usuarios(id);

-- Crear índice para filtrar registros anulados
CREATE INDEX IF NOT EXISTS idx_anulado ON registros_lavado(anulado);

-- Comentarios para documentación
COMMENT ON COLUMN registros_lavado.anulado IS 'Indica si el registro fue anulado (no se cuenta en estadísticas ni facturación)';
COMMENT ON COLUMN registros_lavado.fecha_anulacion IS 'Fecha y hora en que se anuló el registro';
COMMENT ON COLUMN registros_lavado.motivo_anulacion IS 'Razón por la cual se anuló el registro';
COMMENT ON COLUMN registros_lavado.usuario_anulacion_id IS 'Usuario que realizó la anulación';
```

### 3. Verificar que se ejecutó correctamente

Ejecutar esta consulta para verificar:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'registros_lavado'
  AND column_name IN ('anulado', 'fecha_anulacion', 'motivo_anulacion', 'usuario_anulacion_id');
```

Deberías ver 4 filas con las nuevas columnas.

### 4. Verificar el índice

```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'registros_lavado'
  AND indexname = 'idx_anulado';
```

Deberías ver el índice creado.

## ✅ Después de ejecutar la migración

1. **Vercel desplegará automáticamente** los cambios (ya están en GitHub)
2. **Esperar 1-2 minutos** para que el deploy se complete
3. **Probar la funcionalidad**:
   - Iniciar sesión como admin
   - Buscar un registro en proceso o listo
   - Hacer clic en el botón naranja con ícono 🚫
   - Ingresar un motivo de anulación
   - Verificar que el registro desaparece de la lista
   - Verificar que el saldo se revirtió (si usó cuenta corriente)

## 🔍 Consultas útiles después de la migración

### Ver registros anulados:
```sql
SELECT 
  id,
  marca_modelo,
  patente,
  nombre_cliente,
  precio,
  anulado,
  fecha_anulacion,
  motivo_anulacion
FROM registros_lavado
WHERE anulado = TRUE
ORDER BY fecha_anulacion DESC;
```

### Contar registros anulados vs activos:
```sql
SELECT 
  CASE WHEN anulado THEN 'Anulados' ELSE 'Activos' END as estado,
  COUNT(*) as cantidad
FROM registros_lavado
GROUP BY anulado;
```

## 📝 Notas

- Esta migración es **segura** y no afecta datos existentes
- Todos los registros existentes tendrán `anulado = FALSE` por defecto
- La migración usa `IF NOT EXISTS` para evitar errores si ya se ejecutó
- No es necesario reiniciar la aplicación después de la migración

## 🆘 Si algo sale mal

Si hay algún error al ejecutar la migración:

1. Verificar que estás conectado a la base de datos correcta
2. Verificar que la tabla `registros_lavado` existe
3. Verificar que la tabla `usuarios` existe (para la foreign key)
4. Si el error persiste, contactar al desarrollador con el mensaje de error completo
