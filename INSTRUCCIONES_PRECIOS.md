# Instrucciones para Implementar Sistema de Precios

## Cambios Realizados

Se ha agregado un sistema de precios automático que calcula el costo del lavado según:
- **Tipo de vehículo**: Auto, Mono (SUV), Camioneta, Camioneta XL, Moto
- **Tipo de lavado**: Si incluye "Con Cera" suma $2.000 adicionales

## Precios Configurados

| Tipo de Vehículo | Lavado Simple | Con Cera |
|------------------|---------------|----------|
| Auto             | $22.000       | $24.000  |
| Mono (SUV)       | $30.000       | $32.000  |
| Camioneta        | $35.000       | $37.000  |
| Camioneta XL     | $38.000       | $40.000  |
| Moto             | $15.000       | $15.000  |

## Archivos Modificados

1. **migration-agregar-tipo-vehiculo-precio.sql** - Nueva migración de base de datos
2. **app/page.tsx** - Formulario actualizado con selector de vehículo y cálculo de precio
3. **app/api/registros/route.ts** - API actualizada para guardar tipo_vehiculo y precio
4. **app/login/page.tsx** - Eliminadas credenciales visibles (mejora de seguridad)

## Pasos para Aplicar en Producción

### 1. Aplicar Migración de Base de Datos

Primero, debes ejecutar la migración en tu base de datos de Vercel Postgres:

```bash
# Opción A: Desde Vercel Dashboard
1. Ve a tu proyecto en Vercel
2. Navega a Storage > Postgres > Query
3. Copia y pega el contenido de migration-agregar-tipo-vehiculo-precio.sql
4. Ejecuta la query

# Opción B: Usando psql (si tienes acceso directo)
psql "tu-connection-string" -f migration-agregar-tipo-vehiculo-precio.sql
```

### 2. Probar Localmente Primero

```bash
# Asegúrate de tener las variables de entorno configuradas
npm run dev

# Prueba:
# 1. Crear un nuevo registro con tipo de vehículo y precio
# 2. Verificar que el precio se calcula correctamente
# 3. Verificar que se guarda en la base de datos
```

### 3. Desplegar a Vercel

Una vez probado localmente:

```bash
git add .
git commit -m "feat: agregar sistema de precios por tipo de vehículo"
git push origin main
```

## Verificación Post-Despliegue

1. **Verificar que los registros antiguos siguen funcionando**: Los registros sin tipo_vehiculo o precio tendrán valores por defecto ('auto' y 0)
2. **Crear un nuevo registro**: Debe mostrar el selector de tipo de vehículo y calcular el precio automáticamente
3. **Verificar el historial**: Los registros antiguos deben seguir mostrándose correctamente

## Rollback (Si algo sale mal)

Si necesitas revertir los cambios:

```sql
-- Eliminar las columnas agregadas
ALTER TABLE registros_lavado DROP COLUMN IF EXISTS tipo_vehiculo;
ALTER TABLE registros_lavado DROP COLUMN IF EXISTS precio;
```

Luego hacer rollback del código:
```bash
git revert HEAD
git push origin main
```

## Notas Importantes

- ✅ Los registros antiguos NO se verán afectados
- ✅ El historial existente seguirá funcionando normalmente
- ✅ Los nuevos registros incluirán tipo de vehículo y precio
- ✅ El precio se calcula automáticamente al seleccionar tipo de vehículo y servicios
- ✅ Se eliminaron las credenciales visibles en la página de login (mejora de seguridad)

## Modificar Precios en el Futuro

Para cambiar los precios, edita el objeto `preciosBase` en `app/page.tsx` (línea ~78):

```typescript
const preciosBase: { [key: string]: number } = {
    'auto': 22000,        // Cambiar aquí
    'mono': 30000,        // Cambiar aquí
    'camioneta': 35000,   // Cambiar aquí
    'camioneta_xl': 38000,// Cambiar aquí
    'moto': 15000         // Cambiar aquí
};
```

El incremento por "Con Cera" está en la línea ~86:
```typescript
const precioFinal = tieneConCera ? precioBase + 2000 : precioBase; // Cambiar 2000 aquí
```
