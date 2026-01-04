# 🚫 Instrucciones: Estado Cancelado

## Resumen
Se ha implementado la funcionalidad para cancelar registros de lavado cuando un cliente se retira antes de que comience el servicio.

## ✅ Cambios Implementados

### 1. Base de Datos
- **Archivo**: `migration-agregar-estado-cancelado.sql`
- **Nuevas columnas**:
  - `fecha_cancelado` (TIMESTAMP): Registra cuándo se canceló
  - `motivo_cancelacion` (TEXT): Motivo opcional de la cancelación

### 2. API Endpoint
- **Ruta**: `/api/registros/cancelar`
- **Método**: POST
- **Parámetros**:
  - `id` (requerido): ID del registro a cancelar
  - `motivo` (opcional): Motivo de la cancelación
- **Archivo**: `app/api/registros/cancelar/route.ts`

### 3. Interfaz de Usuario
- **Archivo**: `app/page.tsx`
- **Cambios**:
  - Botón "✕" agregado en la sección "Autos en Proceso"
  - Prompt para ingresar motivo opcional
  - Actualización automática de la lista tras cancelar

### 4. Historial
- **Archivo**: `app/historial/page.tsx`
- **Cambios**:
  - Badge rojo para registros cancelados: "✕ Cancelado"
  - Estilo: `bg-red-100 text-red-700`

## 🔧 Pasos para Activar la Funcionalidad

### Paso 1: Ejecutar Migración en Neon

1. Accede a tu proyecto en [Neon Console](https://console.neon.tech)
2. Ve a la sección **SQL Editor**
3. Copia y pega el siguiente SQL:

```sql
-- Agregar columnas para estado cancelado
ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS fecha_cancelado TIMESTAMP;

ALTER TABLE registros_lavado 
ADD COLUMN IF NOT EXISTS motivo_cancelacion TEXT;
```

4. Haz clic en **Run** para ejecutar la migración
5. Verifica que las columnas se hayan creado correctamente

### Paso 2: Hacer Commit y Push

```bash
git add .
git commit -m "feat: agregar estado cancelado para registros"
git push origin main
```

### Paso 3: Verificar Deploy en Vercel

1. Vercel detectará automáticamente el push
2. Espera a que termine el deploy (1-2 minutos)
3. Verifica en tu aplicación que la funcionalidad esté disponible

## 📋 Cómo Usar la Funcionalidad

### Cancelar un Registro

1. En la página principal, ve a la sección **"Autos en Proceso"**
2. Encuentra el auto que deseas cancelar
3. Haz clic en el botón **"✕"** (rojo)
4. Opcionalmente, ingresa un motivo (ej: "Cliente se retiró antes de comenzar")
5. Confirma la cancelación
6. El registro desaparecerá de "Autos en Proceso"

### Ver Registros Cancelados

1. Ve a la página **"Historial"**
2. Los registros cancelados aparecerán con un badge rojo: **"✕ Cancelado"**
3. Puedes filtrar o buscar registros cancelados en el historial completo

## 🎨 Estados del Sistema

La aplicación ahora maneja 4 estados:

| Estado | Color | Icono | Descripción |
|--------|-------|-------|-------------|
| **en_proceso** | Azul | ⏳ | Auto ingresado, lavado en curso |
| **listo** | Naranja | ⚠ | Lavado terminado, esperando entrega |
| **entregado** | Verde | ✓ | Auto entregado al cliente |
| **cancelado** | Rojo | ✕ | Cliente se retiró antes del servicio |

## 🔍 Flujo de Estados

```
┌─────────────┐
│ en_proceso  │
└──────┬──────┘
       │
       ├──────────────┐
       │              │
       ▼              ▼
┌──────────┐   ┌────────────┐
│  listo   │   │ cancelado  │ (estado final)
└────┬─────┘   └────────────┘
     │
     ▼
┌────────────┐
│ entregado  │ (estado final)
└────────────┘
```

## 📊 Datos Almacenados

Cuando se cancela un registro, se guarda:

- **estado**: Cambia a `'cancelado'`
- **fecha_cancelado**: Timestamp automático del momento de cancelación
- **motivo_cancelacion**: Texto ingresado por el operador (o "Sin motivo especificado")

## 🚀 Próximos Pasos Sugeridos

1. **Estadísticas de Cancelaciones**: Agregar métricas en el dashboard
2. **Filtros**: Permitir filtrar por estado en el historial
3. **Reportes**: Incluir cancelaciones en exportación Excel
4. **Análisis**: Identificar patrones de cancelación para mejorar el servicio

## ⚠️ Notas Importantes

- Los registros cancelados **NO** se eliminan de la base de datos
- Se mantiene todo el historial para análisis futuro
- Los registros cancelados **NO** cuentan como "entregados" en las estadísticas
- La cancelación es **irreversible** (no se puede reactivar un registro cancelado)

## 🐛 Troubleshooting

### Error: "Column does not exist"
**Solución**: Ejecuta la migración SQL en Neon Console

### El botón "✕" no aparece
**Solución**: Verifica que el deploy en Vercel haya terminado correctamente

### Los registros cancelados no se muestran en rojo
**Solución**: Limpia la caché del navegador (Ctrl + Shift + R)

---

**Última actualización**: 2026-01-04
**Versión**: 1.0
