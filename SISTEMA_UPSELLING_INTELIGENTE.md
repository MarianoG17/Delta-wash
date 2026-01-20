# 🎯 Sistema de Upselling Inteligente - Documentación Completa

## 📋 Descripción General

Sistema inteligente que detecta automáticamente a los clientes del top 20% (más frecuentes) que nunca han contratado servicios premium (chasis, motor, pulido) y les muestra un banner promocional con descuentos exclusivos durante el proceso de registro.

---

## 🎨 Características Principales

### ✅ Detección Automática de Clientes Elegibles
- **Criterio de elegibilidad:**
  - Cliente debe estar en el top 20% de visitas frecuentes
  - Nunca debe haber usado servicios premium (chasis, motor, pulido)
  - No debe haber rechazado la oferta en los últimos 30 días

### 🎁 Banner Promocional Interactivo
- Aparece automáticamente al ingresar el celular de un cliente elegible
- Muestra descuentos personalizados (porcentaje o monto fijo)
- Diseño atractivo con animaciones
- Información clara de los servicios premium incluidos

### 🎬 Acciones del Cliente
1. **Aceptar:** Aplica el descuento inmediatamente al registro actual
2. **Rechazar:** No muestra el banner nuevamente por 30 días
3. **Interés Futuro:** Guarda el interés para próximas visitas

### 🛠️ Panel de Administración
- Crear/editar/eliminar promociones
- Activar/desactivar promociones en tiempo real
- Configurar descuentos porcentuales o fijos
- Establecer fechas de inicio/fin (opcional)
- Seleccionar servicios premium objetivo

---

## 📁 Archivos Creados

### 1. Base de Datos
- **`migration-sistema-upselling.sql`** - Migración SQL con tablas y estructura

### 2. APIs (Backend)
- **`app/api/upselling/detectar/route.ts`** - Detecta clientes elegibles
- **`app/api/upselling/interaccion/route.ts`** - Registra acciones del cliente
- **`app/api/upselling/promociones/route.ts`** - CRUD de promociones (admin)

### 3. Componentes (Frontend)
- **`app/components/UpsellBanner.tsx`** - Banner modal de oferta
- **`app/admin/upselling/page.tsx`** - Panel admin de promociones
- **`app/page.tsx`** - Integración en página principal (MODIFICADO)

---

## 🗄️ Estructura de Base de Datos

### Tabla: `promociones_upselling`
```sql
- id: SERIAL PRIMARY KEY
- nombre: VARCHAR(200) - Título de la promoción
- descripcion: TEXT - Descripción completa para el cliente
- servicios_objetivo: VARCHAR(500) - JSON array ["chasis", "motor", "pulido"]
- descuento_porcentaje: INTEGER - Descuento en % (0 si no aplica)
- descuento_fijo: DECIMAL(10,2) - Descuento en $ (0 si no aplica)
- activa: BOOLEAN - Estado de la promoción
- fecha_inicio: DATE - Inicio de vigencia (NULL = siempre)
- fecha_fin: DATE - Fin de vigencia (NULL = siempre)
- empresa_id: INTEGER - NULL para DeltaWash, ID para SaaS
- created_at, updated_at: TIMESTAMP
```

### Tabla: `upselling_interacciones`
```sql
- id: SERIAL PRIMARY KEY
- cliente_nombre: VARCHAR(100)
- cliente_celular: VARCHAR(20)
- promocion_id: INTEGER FK -> promociones_upselling(id)
- accion: VARCHAR(50) - 'aceptado', 'rechazado', 'interes_futuro'
- descuento_aplicado: DECIMAL(10,2) - Monto de descuento si aceptó
- registro_id: INTEGER FK -> registros_lavado(id) - Si aceptó
- empresa_id: INTEGER - NULL para DeltaWash, ID para SaaS
- fecha_interaccion: TIMESTAMP
- notas: TEXT - Información adicional
```

---

## 🚀 Instrucciones de Instalación

### Paso 1: Ejecutar Migración SQL

#### Para DeltaWash (Base de datos única):
```bash
# Conectarse a la base de datos
psql -U usuario -d nombre_bd

# Ejecutar el archivo de migración
\i migration-sistema-upselling.sql
```

#### Para SaaS Multi-tenant:
```bash
# Ejecutar en la base de datos central
psql -h tu-proyecto.neon.tech -U usuario -d neondb

# Luego ejecutar en cada branch de empresa activa
# (o usar el sistema de sincronización automática)
```

### Paso 2: Verificar Instalación
```sql
-- Verificar que las tablas existan
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('promociones_upselling', 'upselling_interacciones');

-- Verificar promoción de ejemplo
SELECT * FROM promociones_upselling;
```

### Paso 3: Desplegar Cambios
```bash
# Si usas Vercel
vercel --prod

# O git deploy normal
git add .
git commit -m "feat: Sistema de upselling inteligente"
git push origin main
```

---

## 🧪 Guía de Testing

### Test 1: Crear Promoción desde Admin

1. **Acceder al panel:**
   - Ingresar como admin
   - Click en botón "Upselling" (púrpura) en el header
   - URL: `/admin/upselling`

2. **Crear promoción:**
   - Click en "Nueva Promoción"
   - Completar formulario:
     * Nombre: "🌟 Upgrade Premium VIP"
     * Descripción: "¡Sos uno de nuestros mejores clientes! Te ofrecemos 20% OFF en servicios premium"
     * Servicios: ☑️ chasis, ☑️ motor, ☑️ pulido
     * Descuento: 20%
     * Estado: ✅ Activa
   - Click "Crear Promoción"

3. **Verificar:**
   - Debe aparecer en la lista
   - Estado: 🟢 Activa

### Test 2: Simular Cliente Frecuente (Top 20%)

#### Opción A: Datos de Prueba en SQL
```sql
-- Crear cliente con muchas visitas (top 20%)
INSERT INTO registros_lavado (marca_modelo, patente, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, estado, usuario_id, precio)
SELECT 
    'Toyota Corolla',
    'TEST001',
    'simple',
    'Juan Test',
    '11-98765432',
    NOW() - INTERVAL '1 day' * n,
    'entregado',
    1,
    20000
FROM generate_series(1, 15) n;  -- 15 visitas = probablemente top 20%

-- Verificar que NO tenga servicios premium
SELECT * FROM registros_lavado 
WHERE celular = '11-98765432' 
AND (tipo_limpieza ILIKE '%chasis%' OR tipo_limpieza ILIKE '%motor%' OR tipo_limpieza ILIKE '%pulido%');
-- Debe retornar 0 filas
```

#### Opción B: Cliente Real Existente
- Buscar un cliente frecuente real desde `/clientes`
- Verificar que tenga 8+ visitas
- Confirmar que nunca pidió chasis/motor/pulido

### Test 3: Probar Detección Automática

1. **Registrar auto:**
   - Ir a página principal `/`
   - En "Nuevo Registro", ingresar patente: `TEST001`
   - El sistema autocompleta: `Juan Test`, `11-98765432`

2. **Verificar aparición del banner:**
   - Debe aparecer automáticamente un modal púrpura/rosa/naranja
   - Título: "🌟 Upgrade Premium VIP"
   - Muestra: "Sos uno de nuestros mejores clientes! (15 visitas)"
   - Descuento: "20%" en grande
   - Servicios: Chasis, Motor, Pulido

### Test 4: Interacciones del Cliente

#### A) Aceptar Descuento:
1. Click en "✓ ¡Aplicar descuento!"
2. Banner se cierra
3. Mensaje verde: "✅ ¡Descuento aplicado! Ahorrás $..."
4. Precio en formulario se reduce automáticamente
5. Completar registro normalmente

**Verificar en DB:**
```sql
SELECT * FROM upselling_interacciones 
WHERE cliente_celular = '11-98765432' 
AND accion = 'aceptado'
ORDER BY fecha_interaccion DESC LIMIT 1;
```

#### B) Rechazar Oferta:
1. Click en "No, gracias"
2. Banner se cierra
3. Mensaje: "👍 Entendido..."
4. Continuar registro normal

**Verificar:**
- No debe aparecer banner en próximos 30 días para ese cliente
```sql
SELECT * FROM upselling_interacciones 
WHERE cliente_celular = '11-98765432' 
AND accion = 'rechazado'
AND fecha_interaccion > NOW() - INTERVAL '30 days';
```

#### C) Interés Futuro:
1. Click en "⏰ Próxima vez"
2. Banner se cierra
3. Mensaje: "📝 Perfecto! Te lo ofreceremos en su próxima visita"

**Verificar:**
```sql
SELECT * FROM upselling_interacciones 
WHERE cliente_celular = '11-98765432' 
AND accion = 'interes_futuro';
```

### Test 5: Casos No Elegibles

#### Cliente ya usó servicios premium:
```sql
-- Agregar registro con servicio premium
INSERT INTO registros_lavado (marca_modelo, patente, tipo_limpieza, nombre_cliente, celular, fecha_ingreso, estado, usuario_id, precio)
VALUES ('Toyota', 'TEST001', 'limpieza_chasis', 'Juan Test', '11-98765432', NOW(), 'entregado', 1, 20000);
```
- Ahora al registrar con ese celular: NO debe aparecer banner

#### Cliente no es top 20%:
- Usar celular de cliente con solo 2-3 visitas
- Banner NO debe aparecer

#### Cliente rechazó recientemente:
- Cliente que rechazó hace menos de 30 días
- Banner NO debe aparecer

---

## 🎯 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│ 1. ADMIN CONFIGURA PROMOCIÓN                                │
│    • Ingresa a /admin/upselling                             │
│    • Crea promoción con descuento y servicios objetivo      │
│    • Activa la promoción                                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. OPERADOR REGISTRA AUTO                                   │
│    • Ingresa patente → Autocompleta datos                   │
│    • Ingresa celular completo (8+ dígitos)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SISTEMA DETECTA ELEGIBILIDAD                             │
│    • Query: ¿Es top 20% en visitas?                         │
│    • Query: ¿Nunca usó servicios premium?                   │
│    • Query: ¿No rechazó en últimos 30 días?                 │
│    • Query: ¿Hay promoción activa?                          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. MUESTRA BANNER (si elegible)                             │
│    • Modal animado con oferta personalizada                 │
│    • 3 opciones: Aceptar / Rechazar / Próxima vez          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CLIENTE DECIDE                                           │
│                                                             │
│  A) ACEPTA:                                                 │
│     • Descuento se aplica al precio actual                  │
│     • Se registra interacción                               │
│     • Se completa registro con descuento                    │
│                                                             │
│  B) RECHAZA:                                                │
│     • Se registra rechazo                                   │
│     • No se muestra por 30 días                             │
│     • Continúa registro normal                              │
│                                                             │
│  C) INTERÉS FUTURO:                                         │
│     • Se registra interés                                   │
│     • Se mostrará en próxima visita                         │
│     • Continúa registro normal                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. ANÁLISIS Y REPORTES                                      │
│    • Admin puede ver estadísticas de conversión             │
│    • Tabla upselling_interacciones guarda todo el historial │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Queries Útiles para Análisis

### Tasa de Conversión
```sql
SELECT 
    COUNT(*) FILTER (WHERE accion = 'aceptado') as aceptados,
    COUNT(*) FILTER (WHERE accion = 'rechazado') as rechazados,
    COUNT(*) FILTER (WHERE accion = 'interes_futuro') as interes,
    COUNT(*) as total,
    ROUND(100.0 * COUNT(*) FILTER (WHERE accion = 'aceptado') / COUNT(*), 2) as tasa_conversion
FROM upselling_interacciones
WHERE fecha_interaccion > NOW() - INTERVAL '30 days';
```

### Top Clientes que Aceptaron
```sql
SELECT 
    cliente_nombre,
    cliente_celular,
    COUNT(*) as veces_acepto,
    SUM(descuento_aplicado) as total_ahorrado
FROM upselling_interacciones
WHERE accion = 'aceptado'
GROUP BY cliente_nombre, cliente_celular
ORDER BY veces_acepto DESC, total_ahorrado DESC
LIMIT 10;
```

### Promociones Más Efectivas
```sql
SELECT 
    p.nombre,
    COUNT(*) FILTER (WHERE i.accion = 'aceptado') as conversiones,
    COUNT(*) as total_mostrado,
    ROUND(100.0 * COUNT(*) FILTER (WHERE i.accion = 'aceptado') / COUNT(*), 2) as conversion_rate
FROM promociones_upselling p
LEFT JOIN upselling_interacciones i ON p.id = i.promocion_id
GROUP BY p.id, p.nombre
ORDER BY conversion_rate DESC;
```

---

## 🔧 Solución de Problemas

### Banner no aparece:

1. **Verificar promoción activa:**
```sql
SELECT * FROM promociones_upselling WHERE activa = true;
```

2. **Verificar elegibilidad del cliente:**
```bash
# Usar POST /api/upselling/detectar con body:
{
  "celular": "11-98765432"
}
```

3. **Revisar logs del navegador:**
```javascript
// En DevTools Console debe aparecer:
// "Detectando upselling para: 11-98765432"
```

### Banner aparece pero no guarda interacción:

1. **Verificar endpoint de interacción:**
```bash
# Probar manualmente:
curl -X POST /api/upselling/interaccion \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "cliente_nombre": "Juan Test",
    "cliente_celular": "11-98765432",
    "promocion_id": 1,
    "accion": "aceptado",
    "descuento_aplicado": 4000
  }'
```

2. **Revisar permisos de autenticación**

### Descuento no se aplica:

1. **Verificar cálculo en handler:**
```javascript
// En app/page.tsx, handleUpsellAceptar debe:
// - Calcular descuento correctamente
// - Actualizar precio con setPrecio()
```

---

## 🎨 Personalización

### Cambiar colores del banner:
```tsx
// app/components/UpsellBanner.tsx línea 75
className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500"
// Cambiar a tus colores de marca
```

### Cambiar texto de servicios premium:
```tsx
// app/components/UpsellBanner.tsx línea 137
{servicio === 'chasis' ? 'Limpieza de Chasis' : 
 servicio === 'motor' ? 'Limpieza de Motor' : 
 'Pulido de Ópticas'}
```

### Agregar más servicios objetivo:
```sql
-- Modificar migration-sistema-upselling.sql
servicios_objetivo VARCHAR(500) NOT NULL, 
-- Puede incluir: ["chasis", "motor", "pulido", "encerado", "otro"]
```

---

## 📈 Próximas Mejoras Sugeridas

1. **Dashboard de Métricas:**
   - Gráficos de conversión
   - ROI de promociones
   - A/B testing de ofertas

2. **Segmentación Avanzada:**
   - Por tipo de vehículo (SUVs más propensos)
   - Por zona geográfica
   - Por temporada

3. **Notificaciones Push:**
   - Recordar oferta pendiente
   - Avisar de nuevas promociones

4. **Gamificación:**
   - Badges por aceptar N ofertas
   - Puntos de fidelidad

---

## 📞 Soporte

Si tienes problemas con la implementación:
1. Revisar esta documentación
2. Verificar logs del navegador (F12)
3. Revisar logs del servidor
4. Ejecutar queries de debug mostrados arriba

---

## ✅ Checklist de Implementación

- [x] Migración SQL ejecutada
- [x] Verificar tablas creadas
- [x] Crear al menos 1 promoción de prueba
- [x] Probar detección con cliente frecuente
- [x] Probar las 3 acciones del banner
- [x] Verificar que rechazos bloquean por 30 días
- [x] Verificar aplicación correcta de descuentos
- [x] Probar panel admin completo
- [ ] Entrenar al equipo en uso del sistema
- [ ] Documentar promociones activas

---

**🎉 ¡Sistema de Upselling Inteligente Implementado Exitosamente!**

El sistema está listo para incrementar tus ventas de servicios premium detectando automáticamente a tus mejores clientes y ofreciéndoles ofertas personalizadas en el momento justo. 🚀
