# Corrección de Autenticación en Páginas SaaS

## Problema Detectado

Las páginas `/reportes` y `/listas-precios` NO estaban enviando el token de autenticación en sus peticiones a las APIs, lo que causaba que:
- Las APIs no pudieran identificar a qué empresa pertenecía la solicitud
- Se generaban errores al intentar acceder a datos

## Solución Implementada

### Páginas Corregidas

#### 1. `app/reportes/page.tsx`
Se agregó el token de autenticación a las 3 peticiones de reportes:
- `/api/reportes/ventas`
- `/api/reportes/horarios`
- `/api/reportes/caja`

**Código agregado:**
```typescript
const user = getAuthUser();
const authToken = user?.isSaas 
    ? localStorage.getItem('authToken')
    : localStorage.getItem('lavadero_token');

const res = await fetch(`/api/reportes/ventas?...`, {
    headers: {
        'Authorization': `Bearer ${authToken}`
    }
});
```

#### 2. `app/listas-precios/page.tsx`
Se agregó el token de autenticación a las 4 funciones:
- `cargarListas()` - GET para obtener listas
- `crearNuevaLista()` - POST para crear nueva lista
- `eliminarLista()` - DELETE para eliminar lista
- `guardarPrecios()` - POST para actualizar precios

**Código agregado:**
```typescript
const user = getAuthUser();
const authToken = user?.isSaas 
    ? localStorage.getItem('authToken')
    : localStorage.getItem('lavadero_token');

const res = await fetch('/api/listas-precios', {
    headers: {
        'Authorization': `Bearer ${authToken}`
    }
});
```

## Resumen de Páginas con Autenticación Dual

Ahora TODAS las páginas importantes envían correctamente el token:

✅ **Páginas Corregidas:**
- `/clientes` → `app/clientes/page.tsx`
- `/historial` → `app/historial/page.tsx`
- `/reportes` → `app/reportes/page.tsx` ⭐ **NUEVA**
- `/listas-precios` → `app/listas-precios/page.tsx` ⭐ **NUEVA**
- `/cuentas-corrientes` → `app/cuentas-corrientes/page.tsx`
- `/cuentas-corrientes/[id]` → `app/cuentas-corrientes/[id]/page.tsx`

## Sistema de Precios en $0 para Empresas Nuevas

### ¿Cómo Funciona?

Cuando se registra una nueva empresa desde `/registro`, el sistema automáticamente:

1. **Crea la tabla `listas_precios`** con una lista default llamada "Precios Actuales"
2. **Crea 30 registros de precios en $0**:
   - 5 tipos de vehículos: Auto, Mono, Camioneta, Camioneta XL, Moto
   - 6 tipos de servicio: Simple Exterior, Simple, Con Cera, Pulido, Limpieza Chasis, Limpieza Motor
   - 5 × 6 = 30 precios, todos inicializados en $0

### ¿Por Qué en $0?

- **Flexibilidad total**: Cada empresa puede configurar sus propios precios desde cero
- **No hay precios predefinidos**: Evita confusiones con precios que no corresponden
- **Fácil configuración**: Desde `/listas-precios` se pueden editar todos los precios

### ¿Cómo Configurar los Precios?

1. La empresa se registra en `/registro`
2. Inicia sesión en `/home`
3. Va a **Listas de Precios** desde el menú
4. Hace clic en **✏️ Editar** en la lista "Precios Actuales"
5. Ingresa los precios de cada servicio para cada tipo de vehículo
6. Hace clic en **Guardar**

### Funcionalidad de Aumento de Precios

El sistema incluye una herramienta para aplicar aumentos:
- Botón **📈 Aplicar Aumento** en cada lista
- Permite ingresar un porcentaje (ejemplo: 10%)
- Opción de **redondear** a la centena más cercana
- Vista previa del resultado antes de aplicar

**Ejemplo:**
- Precio actual: $22,000
- Aumento: 10%
- Sin redondear: $24,200
- Con redondear: $24,200 (ya está redondeado)

## Commits Realizados

### Commit 1: `740c3ba`
**Mensaje:** "fix: Agregar autenticación a páginas clientes e historial"
**Archivos:**
- `app/clientes/page.tsx`
- `app/historial/page.tsx`

### Commit 2: `1c5cef8` ⭐ **ACTUAL**
**Mensaje:** "fix: Agregar autenticación a páginas reportes y listas de precios"
**Archivos:**
- `app/reportes/page.tsx`
- `app/listas-precios/page.tsx`

## Estado del Deploy

✅ **Push completado a GitHub**
- Branch: `main`
- Commit: `1c5cef8`
- Archivos modificados: 2
- Líneas agregadas: +56
- Líneas eliminadas: -6

🔄 **Vercel Deploy Automático**
- El deploy se iniciará automáticamente
- Esperar a que Vercel termine el build
- Verificar en `https://vercel.com/[tu-proyecto]/deployments`

## Próximos Pasos

1. **Esperar el deploy de Vercel** (automático)
2. **Probar en producción:**
   - Crear una nueva empresa desde `/registro`
   - Login en `/home`
   - Verificar que `/reportes` funcione correctamente
   - Verificar que `/listas-precios` muestre la tabla de precios
3. **Configurar precios:**
   - Editar los precios desde $0 a los valores reales de tu negocio
   - Probar el sistema de aumento de precios

## Notas Importantes

⚠️ **Empresas creadas ANTES de este cambio:**
- Si ya tenías empresas creadas antes, es posible que no tengan la tabla `listas_precios`
- Solución: Crear una empresa nueva desde cero
- O ejecutar la migración manual en Neon

✅ **Empresas creadas DESPUÉS de este cambio:**
- Tendrán automáticamente todo configurado
- Solo necesitan editar los precios desde $0

## Archivos de Referencia

- **Implementación de precios en $0:** `lib/neon-api.ts` (líneas 258-336)
- **Documentación sistema SaaS:** `GUIA_SETUP_NEON_SAAS.md`
- **Compatibilidad empresas existentes:** `COMPATIBILIDAD_EMPRESAS_EXISTENTES.md`
