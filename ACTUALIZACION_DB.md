# Actualización de Base de Datos - Flujo de 3 Estados

## Cambios Implementados

Se ha implementado un nuevo flujo de trabajo con 3 estados para los autos:

1. **En Proceso** - Auto recién ingresado, se está trabajando en él
2. **Listo** - Auto terminado, esperando que el cliente lo retire
3. **Entregado** - Auto entregado al cliente

## Cambios en la Base de Datos

Se agregó una nueva columna a la tabla `registros_lavado`:
- `fecha_entregado TIMESTAMP` - Almacena la fecha y hora cuando el auto fue entregado

## Cambios en la Aplicación

### APIs Nuevas:
1. **`/api/registros/enviar-whatsapp`** - Genera el link de WhatsApp sin cambiar el estado
2. **`/api/registros/marcar-entregado`** - Marca el auto como entregado

### API Modificada:
- **`/api/registros/marcar-listo`** - Ahora solo cambia el estado a "listo" sin enviar WhatsApp

### Interfaz de Usuario:

#### Página Principal (`/`):
- **Autos en Proceso**: Muestra solo el botón "Marcar como Listo"
- **Autos Listos**: Nueva sección que muestra:
  - Botón "WhatsApp" - Abre WhatsApp Web con mensaje predefinido
  - Botón "Entregado" - Marca el auto como entregado y lo quita de la vista

#### Página de Historial (`/historial`):
- Nueva columna "Entregado" que muestra la fecha de entrega
- Estadística actualizada: ahora muestra "Entregados" en lugar de "Completados"
- Estados con colores:
  - 🟡 En proceso (amarillo)
  - 🟢 Listo (verde)
  - 🟣 Entregado (púrpura)

## Pasos para Actualizar la Base de Datos en Producción

### Opción 1: Usando Neon Console (Recomendado)

1. Ir a [Neon Console](https://console.neon.tech/)
2. Seleccionar tu proyecto
3. Ir a la pestaña "SQL Editor"
4. Ejecutar el siguiente comando:

```sql
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS fecha_entregado TIMESTAMP;
```

5. Verificar que se agregó correctamente:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado' 
ORDER BY ordinal_position;
```

### Opción 2: Usando el archivo de migración

Ejecutar el archivo `migration-add-fecha-entregado.sql` en tu cliente SQL preferido conectado a la base de datos de Neon.

## Verificación

Después de actualizar la base de datos:

1. Vercel debería haber desplegado automáticamente los cambios (el push a GitHub activa el deploy)
2. Visita tu aplicación en producción
3. Verifica que:
   - Los autos en proceso muestran solo el botón "Marcar como Listo"
   - Al marcar como listo, aparecen en la sección "Autos Listos"
   - En "Autos Listos" se pueden enviar WhatsApp o marcar como entregado
   - El historial muestra correctamente los 3 estados

## Rollback (si es necesario)

Si necesitas revertir los cambios en la base de datos:

```sql
ALTER TABLE registros_lavado 
DROP COLUMN IF EXISTS fecha_entregado;
```

Luego hacer rollback del código:
```bash
git revert HEAD
git push origin main
```

## Notas Importantes

- Los registros existentes tendrán `fecha_entregado = NULL` hasta que sean marcados como entregados
- El flujo es unidireccional: en_proceso → listo → entregado (no se puede retroceder)
- Los autos entregados no aparecen en la página principal, solo en el historial
