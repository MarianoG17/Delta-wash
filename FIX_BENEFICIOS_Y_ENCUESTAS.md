# Fix: Sistema de Beneficios y Links de Encuestas

## Problema Identificado

El sistema de beneficios no estaba funcionando porque la tabla `benefits` le faltaba la columna `redeemed_visit_id`, necesaria para registrar qué lavado usó el cupón.

**Error en base de datos:**
```
ERROR: column b.redeemed_visit_id does not exist (SQLSTATE 42703)
```

## Soluciones Implementadas

### 1. Migración de Base de Datos

Creado archivo: `migration-fix-benefits-table.sql`

Esta migración agrega:
- ✅ Columna `redeemed_visit_id` para vincular el beneficio con el registro de lavado
- ✅ Índices para mejorar performance de consultas
- ✅ Verificación de que `discount_percentage` existe

**Ejecutar en Neon (SQL Editor):**
```sql
-- Agregar columna faltante
ALTER TABLE benefits
ADD COLUMN IF NOT EXISTS redeemed_visit_id INTEGER REFERENCES registros_lavado(id) ON DELETE SET NULL;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_benefits_redeemed_visit_id ON benefits(redeemed_visit_id);
```

### 2. Variables de Entorno

Actualizado `.env.example` para documentar variables necesarias:

```env
# URL de la aplicación (para emails y encuestas)
NEXT_PUBLIC_APP_URL="https://lavapp.ar"

# Resend API (para envío de emails)
RESEND_API_KEY="tu_resend_api_key_aqui"
```

**IMPORTANTE:** Verificar en Vercel que estas variables estén configuradas:
- `NEXT_PUBLIC_APP_URL` = `https://lavapp.ar`
- `RESEND_API_KEY` = (tu key de Resend)

## Sobre los Links de Encuestas

### ¿Por qué aparece chasis.app?

Las encuestas **nuevas** usarán `lavapp.ar` automáticamente si la variable de entorno está configurada.

Las encuestas **viejas** que se crearon cuando el dominio era `chasis.app` mantendrán ese link en la base de datos porque el link se genera al crear la encuesta y no se actualiza.

### ¿Cómo se genera el link?

Cuando se marca un auto como "entregado", se crea una encuesta con un token único:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const surveyUrl = `${baseUrl}/survey/${survey.survey_token}`;
```

Si `NEXT_PUBLIC_APP_URL` está configurado como `https://lavapp.ar`, todas las **nuevas** encuestas usarán ese dominio.

### Para actualizar encuestas viejas (opcional)

Si querés actualizar los links de encuestas antiguas en la base de datos, podés ejecutar:

```sql
-- Ver cuántas encuestas tienen el dominio viejo
SELECT COUNT(*) 
FROM surveys 
WHERE survey_token IS NOT NULL;

-- Las encuestas no guardan el link completo, solo el token
-- El link se genera dinámicamente cuando se consulta
-- Por lo tanto, solo configurar NEXT_PUBLIC_APP_URL es suficiente
```

**NOTA:** Los links se generan dinámicamente en el backend cuando se acceden, así que configurar correctamente `NEXT_PUBLIC_APP_URL` en Vercel es suficiente para que todos los links (nuevos y viejos) funcionen con lavapp.ar.

## Pasos Siguientes

### 1. Verificar Variables de Entorno en Vercel

```bash
# Ir a: https://vercel.com/tu-proyecto/settings/environment-variables
# Verificar que existan:
NEXT_PUBLIC_APP_URL = https://lavapp.ar
RESEND_API_KEY = re_...
```

### 2. Ejecutar Migración en Neon

```sql
-- Conectar a tu branch en Neon SQL Editor
-- Copiar y ejecutar el contenido de: migration-fix-benefits-table.sql
```

### 3. Verificar el Deploy

El código ya fue pusheado a GitHub. Vercel debería deployar automáticamente.

Verificar en: https://vercel.com/tu-proyecto/deployments

### 4. Probar la Funcionalidad

1. **Crear una encuesta nueva:**
   - Registrar un auto
   - Marcarlo como listo
   - Marcarlo como entregado (esto genera la encuesta)
   - Verificar que el link use `lavapp.ar`

2. **Redimir un beneficio:**
   - Buscar un cliente con beneficios pendientes
   - Seleccionar el cupón
   - Registrar un nuevo lavado
   - Verificar que el cupón cambie de "pending" a "redeemed"

### 5. Consultas de Diagnóstico

Para verificar que todo funciona:

```sql
-- Ver estructura de la tabla benefits
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'benefits';

-- Ver beneficios y su estado
SELECT 
    b.id,
    b.status,
    b.redeemed_at,
    b.redeemed_visit_id,
    s.customer_phone,
    r.patente
FROM benefits b
LEFT JOIN surveys s ON s.id = b.survey_id
LEFT JOIN registros_lavado r ON r.id = b.redeemed_visit_id
ORDER BY b.id DESC
LIMIT 10;
```

## Archivos Modificados

- ✅ `migration-fix-benefits-table.sql` (nueva migración)
- ✅ `.env.example` (documentación de variables)
- ✅ `.husky/pre-commit` (permitir commits de .env.example)
- ✅ `DIAGNOSTICO_BENEFICIOS.sql` (queries de diagnóstico)
- ✅ `DIAGNOSTICO_REGISTROS_RECIENTES.sql` (queries de diagnóstico)

## Commit

```
Fix: Agregar columna redeemed_visit_id a benefits y documentar variables de entorno
Commit: a7b35ba
```
