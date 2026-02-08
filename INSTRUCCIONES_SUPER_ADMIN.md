# Panel Super-Admin - LAVAPP

## 📋 Descripción

Panel de administración para gestionar todas las empresas del SaaS LAVAPP. Permite:
- Ver todas las empresas registradas
- Editar precios personalizados y descuentos
- Extender fechas de trial
- Eliminar empresas y liberar branches de Neon
- Monitorear uso de branches (X/10)

## 🔐 Acceso

**URL:** `https://lavapp.ar/super-admin`

**Credenciales:** Configuradas en variables de entorno

## ⚙️ Configuración

### 1. Agregar variables de entorno

Añadir a Vercel (o `.env.local` para desarrollo):

```bash
SUPER_ADMIN_EMAIL="tu-email@lavapp.ar"
SUPER_ADMIN_PASSWORD="tu-password-seguro-aqui"
```

**Importante:** Usar credenciales fuertes y no compartirlas.

### 2. Ejecutar migración de base de datos

Ejecutar [`migration-add-pricing-fields.sql`](migration-add-pricing-fields.sql) en la base de datos central SaaS:

```sql
-- Este archivo agrega las columnas:
-- - precio_mensual (default: 85000)
-- - descuento_porcentaje (0-100)
-- - precio_final (calculado automáticamente)
-- - nota_descuento (opcional)
```

**Pasos:**
1. Conectarse a la base de datos central (`saas.db`)
2. Ejecutar el archivo `migration-add-pricing-fields.sql`
3. Verificar con: `SELECT * FROM empresas LIMIT 1;`

### 3. Re-deploy en Vercel

```bash
git add .
git commit -m "Implementar panel super-admin con gestión de precios"
git push
```

O forzar re-deploy desde el dashboard de Vercel.

## 🎯 Funcionalidades

### Ver empresas
- Listado completo de todas las empresas registradas
- Información: ID, nombre, email, fecha de alta, trial, pricing
- Dashboard con métricas: total empresas, ingresos potenciales, descuentos activos

### Editar precios
1. Click en "✏️ Editar" en la fila de la empresa
2. Modificar:
   - **Precio mensual** (default: $85.000)
   - **Descuento %** (0-100)
   - **Nota descuento** (ej: "Promo lanzamiento", "Cliente referido")
   - **Fecha fin trial** (extender período de prueba)
3. El **precio final** se calcula automáticamente
4. Click en "✓" para guardar

**Ejemplos:**
- Precio $85.000, descuento 10% → Precio final: $76.500
- Precio $85.000, descuento 20% → Precio final: $68.000
- Precio $70.000, descuento 0% → Precio final: $70.000

### Eliminar empresas

**⚠️ ACCIÓN IRREVERSIBLE**

1. Click en "🗑️ Eliminar"
2. Confirmar en el diálogo
3. Escribir el nombre exacto de la empresa para confirmar
4. El sistema:
   - Elimina el branch de Neon (libera espacio)
   - Borra el registro de la DB central
   - Actualiza el contador de branches

**Usar cuando:**
- Una empresa cancela y no volverá
- Trial expirado sin conversión
- Necesitas liberar espacio de branches (límite: 10 en plan gratuito)

### Monitorear branches

En la esquina superior derecha verás:
```
Branches Neon
X / 10
```

Indica cuántos branches están en uso del límite de 10.

## 🏗️ Arquitectura

### Rutas creadas

```
app/
  super-admin/
    page.tsx                    → UI del panel
  api/
    super-admin/
      login/
        route.ts               → Autenticación
      empresas/
        route.ts               → GET, PUT, DELETE empresas
      branches-count/
        route.ts               → Contador de branches activos
```

### Seguridad

- ✅ Autenticación mediante variables de entorno
- ✅ Session Storage (solo client-side)
- ✅ No expuesto en navegación
- ✅ Doble confirmación para eliminaciones
- ✅ No hay credenciales en la DB

### Base de datos

**Tabla:** `empresas`

Nuevas columnas agregadas:
```sql
precio_mensual        DECIMAL(10,2)  DEFAULT 85000.00
descuento_porcentaje  INTEGER        DEFAULT 0  CHECK (0-100)
precio_final          DECIMAL(10,2)  (calculado automáticamente)
nota_descuento        TEXT           (opcional)
```

**Triggers:** Calculan automáticamente `precio_final` al insertar o actualizar.

## 📊 Casos de uso

### Descuento por lanzamiento
```
Precio: $85.000
Descuento: 20%
Nota: "Promo Early Bird"
Precio final: $68.000
```

### Cliente referido
```
Precio: $85.000
Descuento: 15%
Nota: "Referido por DeltaWash"
Precio final: $72.250
```

### Precio especial permanente
```
Precio: $60.000
Descuento: 0%
Nota: "Acuerdo comercial anual"
Precio final: $60.000
```

### Extender trial
Usar el campo "Trial hasta" para darle más tiempo sin cargo.

## 🔍 Verificación

### Después de la migración

```sql
-- Ver estructura de la tabla
PRAGMA table_info(empresas);

-- Ver empresas con sus precios
SELECT 
  nombre,
  precio_mensual,
  descuento_porcentaje,
  precio_final,
  nota_descuento
FROM empresas;
```

### Probar el panel

1. Ir a `https://lavapp.ar/super-admin`
2. Ingresar con las credenciales configuradas
3. Verificar que se cargan las empresas
4. Probar editar precios (usar empresa de prueba)
5. Verificar que el precio final se calcula correctamente

## 🚨 Troubleshooting

### No puedo acceder al panel
- Verificar que `SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_PASSWORD` están en Vercel
- Revisar consola del navegador para errores
- Verificar que se hizo re-deploy después de agregar las variables

### Las columnas de precio no aparecen
- Ejecutar la migración `migration-add-pricing-fields.sql` en la DB central
- Verificar con: `PRAGMA table_info(empresas);`

### Error al eliminar empresa
- Verificar que `NEON_API_KEY` esté configurada
- Revisar logs de Vercel para detalles del error
- La eliminación en DB continúa aunque falle Neon

### Contador de branches incorrecto
- Verificar columna `neon_branch_id` en tabla empresas
- Actualizar conteo: `SELECT COUNT(*) FROM empresas WHERE neon_branch_id IS NOT NULL;`

## 📚 Documentación relacionada

- [`migration-add-pricing-fields.sql`](migration-add-pricing-fields.sql) - Script de migración
- [`lib/neon-api.ts`](lib/neon-api.ts:601) - Función `deleteBranch()`
- [`.env.example`](.env.example) - Variables de entorno requeridas

## 🎉 Listo

Ya tenés un panel super-admin completo para gestionar tu SaaS con:
- Control total sobre empresas y pricing
- Gestión de descuentos personalizados
- Liberación de branches cuando sea necesario
- Visibilidad de métricas importantes

**Próximos pasos sugeridos:**
- Implementar logs de actividad del super-admin
- Agregar filtros y búsqueda en el listado
- Exportar reporte de empresas a Excel
- Notificaciones cuando se acerca al límite de branches
