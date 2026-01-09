# Instrucciones para Usar la Página de Prueba

## 📍 Acceso a la Página de Prueba

La página de prueba está disponible en: **`/prueba`**

Ejemplo: `https://tu-dominio.vercel.app/prueba`

## 🎨 Características de la Página de Prueba

La página de prueba tiene un diseño diferente (colores morado/rosa/rojo) para distinguirla fácilmente de la página principal. Incluye todas las nuevas funcionalidades:

### ✨ Nuevas Funcionalidades Implementadas

1. **Selector de Tipo de Vehículo**
   - Auto
   - Mono (SUV)
   - Camioneta
   - Camioneta XL
   - Moto

2. **Tipos de Lavado Actualizados**
   - Simple Exterior (solo por fuera)
   - Simple (completo)
   - Con Cera
   - Pulido
   - Limpieza de Chasis
   - Limpieza de Motor

3. **Sistema de Precios Automático**
   - Calcula el precio según tipo de vehículo
   - Suma $2.000 si incluye "Con Cera"
   - Muestra desglose detallado del precio

4. **Campo de Extras (Opcional)**
   - Descripción del servicio adicional
   - Valor del extra
   - Se suma automáticamente al precio total

## 📋 Pasos para Probar

### 1. Aplicar la Migración de Base de Datos

**IMPORTANTE**: Antes de usar la página de prueba, debes aplicar la migración:

```sql
-- Ejecuta esto en tu base de datos de Vercel Postgres
-- (Ve a Vercel Dashboard > Storage > Postgres > Query)

-- Agregar columna tipo_vehiculo
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS tipo_vehiculo VARCHAR(20) DEFAULT 'auto';

-- Agregar columna precio
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS precio DECIMAL(10,2) DEFAULT 0;

-- Agregar columna extras (descripción de servicios adicionales)
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS extras TEXT;

-- Agregar columna extras_valor (precio de los extras)
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS extras_valor DECIMAL(10,2) DEFAULT 0;
```

O simplemente copia y pega el contenido de [`migration-agregar-tipo-vehiculo-precio.sql`](migration-agregar-tipo-vehiculo-precio.sql)

### 2. Desplegar a Vercel

```bash
git add .
git commit -m "feat: agregar página de prueba con nuevas funcionalidades"
git push origin main
```

### 3. Acceder a la Página de Prueba

1. Inicia sesión normalmente en `/login`
2. Navega a `/prueba` o usa el botón "Volver" para regresar a la home
3. La página de prueba tiene un banner amarillo que dice "⚠️ Modo de Prueba"

## 🧪 Casos de Prueba Sugeridos

### Caso 1: Auto Simple
- Tipo: Auto
- Lavado: Simple
- Precio esperado: $22.000

### Caso 2: Auto con Cera
- Tipo: Auto
- Lavado: Simple + Con Cera
- Precio esperado: $24.000

### Caso 3: Mono (SUV) con Cera
- Tipo: Mono (SUV)
- Lavado: Simple + Con Cera
- Precio esperado: $32.000

### Caso 4: Camioneta con Extras
- Tipo: Camioneta
- Lavado: Simple
- Extras: "Lavado de tapizados" - $5.000
- Precio esperado: $40.000 ($35.000 + $5.000)

### Caso 5: Moto
- Tipo: Moto
- Lavado: Simple
- Precio esperado: $15.000

## 🔍 Qué Verificar

### En el Formulario
- ✅ El selector de tipo de vehículo funciona
- ✅ Los nuevos tipos de lavado aparecen correctamente
- ✅ El precio se calcula automáticamente al seleccionar opciones
- ✅ El desglose de precio muestra cada componente
- ✅ Los extras se suman correctamente al total
- ✅ El campo de extras es opcional (se puede dejar vacío)

### En las Tarjetas de Registros
- ✅ Se muestra el tipo de vehículo con emoji (🚗 🚙 🚐 🏍️)
- ✅ Se muestra el precio total
- ✅ Se muestran los extras si existen
- ✅ Los registros antiguos (sin tipo_vehiculo) siguen funcionando

### Compatibilidad con Historial
- ✅ Los registros antiguos se muestran correctamente
- ✅ Los nuevos registros incluyen toda la información
- ✅ No hay errores en la consola del navegador

## 🚀 Migrar a Producción

Una vez que hayas probado todo y estés satisfecho:

1. **Aplicar los cambios a la página principal** ([`app/page.tsx`](app/page.tsx))
   - Copia los cambios de [`app/prueba/page.tsx`](app/prueba/page.tsx) a [`app/page.tsx`](app/page.tsx)
   - Mantén los colores originales (azul/cyan/teal)

2. **Opcional: Eliminar la página de prueba**
   ```bash
   rm -rf app/prueba
   git add .
   git commit -m "chore: eliminar página de prueba"
   git push origin main
   ```

## 📊 Tabla de Precios Actual

| Tipo de Vehículo | Simple | Con Cera | Diferencia |
|------------------|--------|----------|------------|
| Auto             | $22.000 | $24.000 | +$2.000 |
| Mono (SUV)       | $30.000 | $32.000 | +$2.000 |
| Camioneta        | $35.000 | $37.000 | +$2.000 |
| Camioneta XL     | $38.000 | $40.000 | +$2.000 |
| Moto             | $15.000 | $15.000 | - |

**Nota**: Los extras se suman al precio base según el valor ingresado.

## 🔧 Modificar Precios

Para cambiar los precios, edita el objeto `preciosBase` en [`app/prueba/page.tsx`](app/prueba/page.tsx:85):

```typescript
const preciosBase: { [key: string]: number } = {
    'auto': 22000,        // Cambiar aquí
    'mono': 30000,        // Cambiar aquí
    'camioneta': 35000,   // Cambiar aquí
    'camioneta_xl': 38000,// Cambiar aquí
    'moto': 15000         // Cambiar aquí
};
```

## ⚠️ Notas Importantes

- La página de prueba usa la **misma base de datos** que la página principal
- Los registros creados en `/prueba` aparecerán en `/` y viceversa
- Los registros antiguos (sin tipo_vehiculo/precio) tendrán valores por defecto
- La página de prueba NO afecta el funcionamiento de la página principal
- Puedes usar ambas páginas simultáneamente sin problemas

## 🐛 Solución de Problemas

### Error: "Column does not exist"
- Asegúrate de haber ejecutado la migración de base de datos

### Los precios no se calculan
- Verifica que hayas seleccionado un tipo de vehículo
- Verifica que hayas seleccionado al menos un tipo de limpieza

### Los extras no se suman
- Asegúrate de ingresar un valor numérico en el campo "Valor ($)"
- El campo acepta números con o sin decimales

### No puedo acceder a /prueba
- Verifica que hayas hecho push de los cambios a Vercel
- Intenta hacer un hard refresh (Ctrl+Shift+R o Cmd+Shift+R)
