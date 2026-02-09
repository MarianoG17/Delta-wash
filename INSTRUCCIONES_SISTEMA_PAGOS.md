# 📋 Sistema de Gestión de Pagos Mensuales - Instrucciones de Deployment

## ✅ Implementación Completada - Fase 1

### Archivos Creados

1. **Migración SQL**: [`migration-add-pagos-mensuales.sql`](migration-add-pagos-mensuales.sql)
   - Tabla `pagos_mensuales` con todos los campos necesarios
   - Columnas adicionales en `empresas`: `dias_mora`, `ultimo_pago_fecha`, `suspendido_por_falta_pago`
   - Índices para optimización de consultas
   - Triggers para actualizar `updated_at` automáticamente
   - Función `marcar_pagos_vencidos()` para automatización

2. **APIs Implementadas**:
   - [`GET /api/super-admin/pagos`](app/api/super-admin/pagos/route.ts) - Listar pagos con filtros y estadísticas
   - [`POST /api/super-admin/pagos/registrar`](app/api/super-admin/pagos/registrar/route.ts) - Registrar pago manualmente
   - [`POST /api/super-admin/pagos/generar-mes`](app/api/super-admin/pagos/generar-mes/route.ts) - Generar pagos para todas las empresas activas

3. **UI Super Admin Actualizada**: [`app/super-admin/page.tsx`](app/super-admin/page.tsx)
   - Nueva pestaña "💰 Pagos"
   - Dashboard con estadísticas en tiempo real
   - Tabla de pagos con filtros por estado
   - Modal para registrar pagos con todos los detalles
   - Botón para generar pagos del mes

---

## 🚀 Pasos para Deployment

### 1. Ejecutar Migración en Base de Datos Central

```bash
# Conectarse a la base de datos central de Neon
# Ejecutar el contenido de migration-add-pagos-mensuales.sql
```

**Opción A - Desde Neon Dashboard**:
1. Ir a https://console.neon.tech
2. Seleccionar el proyecto de base de datos central
3. Ir a "SQL Editor"
4. Copiar y pegar el contenido de `migration-add-pagos-mensuales.sql`
5. Ejecutar

**Opción B - Desde CLI** (si tienes configurado):
```bash
psql $CENTRAL_DB_URL < migration-add-pagos-mensuales.sql
```

### 2. Verificar la Migración

```sql
-- Verificar que la tabla se creó correctamente
SELECT * FROM pagos_mensuales LIMIT 1;

-- Verificar las nuevas columnas en empresas
SELECT id, nombre, dias_mora, ultimo_pago_fecha, suspendido_por_falta_pago 
FROM empresas LIMIT 5;

-- Verificar índices
SELECT indexname FROM pg_indexes WHERE tablename = 'pagos_mensuales';
```

### 3. Deploy del Código a Vercel

```bash
# Asegurarse de estar en la rama correcta
git add .
git commit -m "feat: Implementar sistema de gestión de pagos mensuales (Fase 1)"
git push origin main
```

Vercel detectará automáticamente los cambios y desplegará.

### 4. Verificar el Deployment

1. Acceder a https://lavapp.ar/super-admin
2. Iniciar sesión con credenciales de super admin
3. Click en la pestaña "💰 Pagos"
4. Verificar que se muestra correctamente (aunque sin datos aún)

---

## 🧪 Testing Manual

### Test 1: Generar Pagos del Mes

1. En Super Admin → Pagos
2. Seleccionar mes y año (ej: Febrero 2026)
3. Click en "Generar Pagos del Mes"
4. Verificar que se muestran los pagos generados
5. Confirmar que:
   - Se generó un pago por cada empresa activa (no en trial)
   - Los montos son correctos (con descuentos aplicados)
   - El estado inicial es "pendiente"
   - La fecha de vencimiento es día 10 del mes

### Test 2: Registrar un Pago

1. Buscar un pago con estado "Pendiente"
2. Click en "💰 Registrar Pago"
3. Completar el formulario:
   - Fecha de pago
   - Método de pago
   - Comprobante (opcional)
   - Notas (opcional)
4. Click en "Registrar Pago"
5. Verificar que:
   - El estado cambió a "Pagado" ✅
   - Se muestra la fecha de pago
   - El método de pago aparece
   - El comprobante se guardó (si se ingresó)

### Test 3: Estadísticas en Dashboard

1. Verificar que los números en las tarjetas son correctos:
   - Cantidad de pagados
   - Cantidad de pendientes
   - Cantidad de vencidos
   - Montos totales

### Test 4: Filtros

1. Probar cada filtro:
   - "📋 Todos" - muestra todos los pagos
   - "✅ Pagados" - solo pagados
   - "⏰ Pendientes" - solo pendientes
   - "❌ Vencidos" - solo vencidos (si hay alguno)

### Test 5: Cambiar de Mes

1. Cambiar el mes en el selector
2. Verificar que la tabla se actualiza
3. Verificar que las estadísticas cambian

### Test 6: Generar Pagos Duplicados (No debería permitir)

1. Intentar generar pagos para el mismo mes dos veces
2. Verificar que:
   - No se crean duplicados
   - Muestra mensaje indicando cuántos ya existían

---

## 🔍 Queries de Verificación SQL

### Ver todos los pagos generados
```sql
SELECT 
  pm.id,
  e.nombre as empresa,
  pm.mes,
  pm.anio,
  pm.monto_final,
  pm.estado,
  pm.fecha_vencimiento
FROM pagos_mensuales pm
JOIN empresas e ON pm.empresa_id = e.id
ORDER BY pm.anio DESC, pm.mes DESC, e.nombre;
```

### Ver estadísticas del mes actual
```sql
SELECT
  COUNT(*) FILTER (WHERE estado = 'pagado') as pagos_pagados,
  COUNT(*) FILTER (WHERE estado = 'pendiente') as pagos_pendientes,
  COUNT(*) FILTER (WHERE estado = 'vencido') as pagos_vencidos,
  SUM(monto_final) FILTER (WHERE estado = 'pagado') as total_pagado,
  SUM(monto_final) FILTER (WHERE estado IN ('pendiente', 'vencido')) as total_pendiente
FROM pagos_mensuales
WHERE mes = EXTRACT(MONTH FROM NOW())
  AND anio = EXTRACT(YEAR FROM NOW());
```

### Ver empresas con pagos pendientes
```sql
SELECT 
  e.nombre,
  e.email,
  pm.monto_final,
  pm.fecha_vencimiento,
  pm.estado,
  e.dias_mora
FROM pagos_mensuales pm
JOIN empresas e ON pm.empresa_id = e.id
WHERE pm.estado IN ('pendiente', 'vencido')
ORDER BY pm.fecha_vencimiento;
```

---

## 📊 Uso del Sistema

### Flujo Normal Mensual

**Día 1 del mes**:
1. Acceder a Super Admin → Pagos
2. Seleccionar el mes actual
3. Click en "Generar Pagos del Mes"
4. Confirmar la operación

**Durante el mes** (cuando llegan pagos):
1. Ir a la sección Pagos
2. Buscar la empresa que pagó
3. Click en "💰 Registrar Pago"
4. Completar:
   - Fecha exacta del pago
   - Método (transferencia, efectivo, etc.)
   - Número de comprobante si aplica
   - Notas adicionales
5. Confirmar

**Seguimiento**:
- Las estadísticas se actualizan en tiempo real
- Puedes filtrar por estado para ver quién debe
- Los pagos vencidos se marcan automáticamente en rojo

### Gestión de Pagos Vencidos

Los pagos que pasan la fecha de vencimiento automáticamente:
- Cambian de estado "pendiente" → "vencido"
- Se muestran en rojo en la tabla
- Aparecen en el filtro "❌ Vencidos"

**Para pagos vencidos**:
1. Contactar a la empresa
2. Al recibir el pago, registrarlo normalmente
3. El sistema automáticamente:
   - Actualiza `ultimo_pago_fecha` en la empresa
   - Resetea `dias_mora` a 0
   - Cambia `suspendido_por_falta_pago` a `false`

---

## 🔧 Configuración Adicional

### Variables de Entorno Necesarias

Ya configuradas en el proyecto:
- ✅ `CENTRAL_DB_URL` - Conexión a base de datos central

No se requieren variables adicionales para esta fase.

---

## 📅 Próximas Fases (No implementadas aún)

### Fase 2: Automatización con Cron Jobs
- Job diario para marcar pagos vencidos
- Job diario para calcular días de mora
- Job automático día 1 de cada mes para generar pagos

### Fase 3: Sistema de Notificaciones
- Emails de recordatorio (5 días antes de vencer)
- Emails de pago registrado
- Emails de pago vencido
- Avisos escalonados de mora

### Fase 4: Reportes Avanzados
- Exportar a Excel/PDF
- Gráficos de ingresos históricos
- Proyecciones
- Ranking de mejores pagadores

### Fase 5: Suspensión Automática
- Suspender automáticamente empresas con >15 días de mora
- Reactivación automática al pagar

---

## ✅ Checklist de Deployment

- [ ] Ejecutar migración en base de datos central
- [ ] Verificar que tabla `pagos_mensuales` existe
- [ ] Verificar columnas nuevas en `empresas`
- [ ] Push del código a Vercel
- [ ] Verificar deployment exitoso
- [ ] Acceder a Super Admin → Pagos
- [ ] Generar pagos del mes actual (test)
- [ ] Registrar un pago de prueba
- [ ] Verificar estadísticas
- [ ] Probar todos los filtros
- [ ] Documentar en equipo el nuevo flujo

---

## 🐛 Troubleshooting

### Error: "Tabla pagos_mensuales no existe"
**Solución**: Ejecutar la migración SQL en la base de datos central.

### Error: "Cannot read property 'cantidad_pagado' of undefined"
**Solución**: Asegurarse de que la tabla existe y tiene datos. Intentar generar pagos primero.

### No aparecen pagos al generar
**Posibles causas**:
1. No hay empresas activas (fuera de trial)
2. Ya se generaron pagos para ese mes (verificar con filtro "Todos")
3. Error en la conexión a la base de datos (revisar logs)

### Los pagos no se marcan como vencidos automáticamente
**Explicación**: En Fase 1, el cambio de estado a "vencido" se realiza mediante la función SQL `marcar_pagos_vencidos()`. En Fase 2 se implementará un cron job que la ejecute diariamente. Por ahora, se puede ejecutar manualmente:

```sql
SELECT marcar_pagos_vencidos();
```

---

## 📞 Soporte

Para dudas o problemas:
1. Revisar los logs en Vercel
2. Verificar la consola del navegador
3. Ejecutar queries de verificación SQL
4. Consultar este documento

---

**Fecha de Implementación**: 2026-02-09  
**Versión**: 1.0 - Fase 1 (Mínimo Viable)  
**Estado**: ✅ Listo para deployment
