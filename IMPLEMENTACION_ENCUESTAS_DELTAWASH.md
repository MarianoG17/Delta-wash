# 📋 Guía de Implementación: Sistema de Encuestas en DeltaWash

## 🎯 Objetivo
Habilitar el sistema completo de encuestas y beneficios en **DeltaWash Legacy** (single-tenant).

---

## ✅ Estado Actual del Código

### **Buenas Noticias: El Código Ya Está Listo** 🎉

Las APIs y el frontend ya están diseñados para funcionar tanto en **SaaS multi-tenant** como en **DeltaWash legacy**:

✅ **APIs compatibles con legacy:**
- `/api/registros/marcar-entregado` - Genera encuestas automáticamente
- `/api/survey/[token]` - Página pública (sin auth)
- `/api/survey/[token]/submit` - Procesa respuestas y crea beneficios
- `/api/surveys/mark-sent` - Marca encuesta como enviada
- `/api/surveys/get-by-visit` - Obtiene encuesta por visit_id
- `/api/benefits/check` - Verifica beneficios pendientes
- `/api/benefits/redeem` - Canjea beneficios
- `/api/survey-config` - Gestiona configuración
- `/api/reportes/encuestas` - Reporte de encuestas
- `/api/reportes/beneficios` - Reporte de beneficios

✅ **Frontend listo:**
- Botón "📋 Enviar encuesta" en registros listos
- Detección automática de beneficios por teléfono
- Aplicación automática de descuentos
- Reportes de encuestas y beneficios

✅ **Detección automática legacy:**
```typescript
// El sistema detecta automáticamente si es DeltaWash o SaaS
const empresaId = await getEmpresaIdFromToken(request);
// Si empresaId = undefined → DeltaWash legacy
// Si empresaId = número → Empresa SaaS
```

---

## 📦 Archivos Necesarios

### **1. Migración SQL (YA CREADA)**
📄 **`migration-sistema-encuestas-deltawash.sql`**
- ✅ Sin campo `empresa_id` (single-tenant)
- ✅ Tabla `survey_config` global (no por tenant)
- ✅ Constraints simplificados
- ✅ Configuración por defecto incluida

### **2. Código Backend (YA FUNCIONA)**
Todos los endpoints ya manejan correctamente `empresaId = undefined`:

```typescript
// Ejemplo de cómo funciona:
const empresaId = await getEmpresaIdFromToken(request); // undefined en DeltaWash
const db = await getDBConnection(empresaId); // Retorna Vercel Postgres para DeltaWash

await db`INSERT INTO surveys (visit_id, client_phone, ...)
        VALUES (${visitId}, ${phone}, ...)`;
// ✅ No inserta empresa_id porque la tabla no lo tiene
```

### **3. Frontend (YA FUNCIONA)**
El botón de encuestas ya aparece en DeltaWash. Una vez que ejecutes la migración, funcionará completamente.

---

## 🚀 Pasos de Implementación

### **Paso 1: Backup de Seguridad** ⏱️ 2 minutos

1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto **DeltaWash**
3. Storage → Postgres → Backup
4. Descargar backup actual (por las dudas)

---

### **Paso 2: Ejecutar Migración** ⏱️ 5 minutos

#### **Opción A: Desde Vercel Dashboard (Recomendado)**

1. Ir a https://vercel.com/dashboard
2. Seleccionar proyecto **DeltaWash**
3. Storage → Postgres → **"Query"** o **"SQL Editor"**
4. Copiar y pegar **TODO** el contenido de `migration-sistema-encuestas-deltawash.sql`
5. Click en **"Execute"** o **"Run Query"**
6. Verificar que aparezca: `✅ Query executed successfully`

#### **Opción B: Desde Terminal (Alternativa)**

```bash
# Obtener connection string de Vercel
# Vercel Dashboard > Storage > Postgres > Connection String

# Ejecutar migración
psql "postgresql://user:pass@host/db" < migration-sistema-encuestas-deltawash.sql
```

---

### **Paso 3: Verificar Instalación** ⏱️ 2 minutos

Ejecutar en SQL Editor de Vercel:

```sql
-- 1. Verificar que las tablas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('surveys', 'survey_responses', 'benefits', 'survey_config');
-- Debería retornar 4 filas

-- 2. Verificar configuración por defecto
SELECT * FROM survey_config;
-- Debería retornar 1 fila con:
-- id=1, brand_name='DeltaWash', discount_percentage=10

-- 3. Verificar que las tablas están vacías (normal en instalación nueva)
SELECT COUNT(*) as surveys FROM surveys;
SELECT COUNT(*) as benefits FROM benefits;
-- Ambas deberían retornar 0
```

---

### **Paso 4: Configurar Sistema** ⏱️ 3 minutos

1. **Abrir DeltaWash** → https://deltawash-app.vercel.app (o tu URL)
2. **Hacer login** como admin
3. **Ir a "Reportes" → "Encuestas"**
4. **Click en "⚙️ Configuración"**
5. **Personalizar:**
   - Nombre del lavadero: "DeltaWash" (o tu nombre)
   - Mensaje WhatsApp: Personalizar el texto
   - URL Google Maps: Poner la URL de tu negocio en Google Maps
   - Porcentaje de descuento: 10% (o el que prefieras)
6. **Guardar configuración**

**Ejemplo de URL Google Maps:**
```
https://maps.google.com/?q=DeltaWash+Buenos+Aires
```

---

### **Paso 5: Testing Completo** ⏱️ 10 minutos

#### **Test 1: Generar Encuesta**

1. **Registrar un auto de prueba:**
   - Patente: TEST123
   - Cliente: Juan Test
   - Celular: 1112345678
   - Tipo de limpieza: Simple

2. **Marcar como "Listo"**

3. **Marcar como "Entregado"**
   - ✅ Debería aparecer el botón "📋 Enviar encuesta"

4. **Click en "📋 Enviar encuesta"**
   - ✅ Se abre WhatsApp con mensaje pre-armado
   - ✅ El mensaje contiene el link de la encuesta
   - ✅ El botón cambia a "✅ Encuesta enviada"

#### **Test 2: Responder Encuesta**

1. **Copiar el link de la encuesta** (desde el mensaje de WhatsApp)

2. **Abrir en navegador** (puede ser en modo incógnito)

3. **Completar encuesta:**
   - Calificación: 5 estrellas
   - Comentario: "Excelente servicio"
   - Enviar

4. **Verificar redirección:**
   - ✅ Si rating 4-5: Redirige a Google Maps
   - ✅ Muestra mensaje de agradecimiento
   - ✅ Informa sobre el beneficio generado

#### **Test 3: Canjear Beneficio**

1. **Registrar nuevo auto** con el mismo celular (1112345678)

2. **Verificar detección automática:**
   - ✅ Aparece mensaje: "🎁 ¡Este cliente tiene 1 beneficio(s) pendiente(s)!"
   - ✅ Se muestra el beneficio en la sección "Beneficios Disponibles"
   - ✅ Descripción: "10% de descuento" (o el % configurado)

3. **Seleccionar el beneficio:**
   - ✅ Click en el radio button
   - ✅ El precio se recalcula automáticamente
   - ✅ Aparece mensaje: "🎁 Descuento Beneficio: -10%"

4. **Registrar el auto:**
   - ✅ Auto se registra con descuento aplicado
   - ✅ Beneficio se marca como "canjeado"

5. **Verificar que el beneficio no se puede usar dos veces:**
   - Registrar otro auto con mismo celular
   - ✅ No debería aparecer más el beneficio

#### **Test 4: Reportes**

1. **Ir a "Reportes" → "Encuestas"**
   - ✅ Ver lista de encuestas
   - ✅ Ver estadísticas (promedio, distribución)
   - ✅ Ver estados (enviada/respondida)

2. **Ir a "Reportes" → "Beneficios"** (si creaste la página)
   - ✅ Ver lista de beneficios
   - ✅ Ver estados (pendiente/canjeado)
   - ✅ Ver clientes con beneficios

---

## 🐛 Troubleshooting

### **Error: "Tabla surveys no existe"**

**Causa:** La migración no se ejecutó correctamente

**Solución:**
```sql
-- Verificar si la tabla existe
SELECT * FROM information_schema.tables WHERE table_name = 'surveys';

-- Si no existe, re-ejecutar la migración completa
```

---

### **Error: "No se puede crear encuesta (FK violation)"**

**Causa:** `visit_id` referencia un registro que no existe

**Solución:**
- Asegurarte de marcar como "entregado" un registro válido
- Verificar que el registro existe en `registros_lavado`

---

### **Encuesta no se envía por WhatsApp**

**Causa:** Formato de número incorrecto

**Solución:**
- Verificar que el celular tenga formato: `1112345678` (sin guiones, sin +54)
- El sistema agrega automáticamente `549` al inicio

---

### **Beneficio no se detecta automáticamente**

**Causa:** El celular es diferente (espacios, guiones)

**Solución:**
- Usar siempre el mismo formato de celular
- Sin espacios, sin guiones
- Ejemplo correcto: `1112345678`

---

### **El botón de encuestas no aparece**

**Causa:** El registro no está en estado "listo" o ya fue entregado

**Solución:**
- Solo aparece en registros con `estado = 'listo'`
- Después de marcar como "entregado" desaparece (normal)

---

## 📊 Estructura de Tablas (Referencia)

### **`surveys`**
```
id | survey_token | visit_id | client_phone | vehicle_marca | vehicle_patente | vehicle_servicio | created_at | sent_at | responded_at
```

### **`survey_responses`**
```
id | survey_id | rating | comment | created_at
```

### **`benefits`**
```
id | survey_id | client_phone | benefit_type | discount_percentage | status | created_at | redeemed_at | redeemed_visit_id
```

### **`survey_config`**
```
id | brand_name | logo_url | google_maps_url | whatsapp_message | discount_percentage | created_at | updated_at
```

---

## 🔄 Flujo Completo del Sistema

```
┌─────────────────────────────────────────────────────────────┐
│ 1. REGISTRO DEL AUTO                                         │
├─────────────────────────────────────────────────────────────┤
│  Cliente deja su auto → Operador registra en sistema        │
│  Estado: "en_proceso"                                        │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. AUTO LISTO                                                │
├─────────────────────────────────────────────────────────────┤
│  Lavado terminado → Operador marca como "listo"             │
│  Estado: "listo"                                             │
│  📋 Aparece botón "Enviar encuesta"                         │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. AUTO ENTREGADO                                            │
├─────────────────────────────────────────────────────────────┤
│  Cliente retira → Operador marca como "entregado"           │
│  ✅ Se genera encuesta automáticamente                      │
│  ✅ Se crea registro en tabla "surveys"                     │
│  ✅ Se asigna token UUID único                              │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. ENVÍO DE ENCUESTA (Manual)                                │
├─────────────────────────────────────────────────────────────┤
│  Operador click en "📋 Enviar encuesta"                     │
│  ✅ Se abre WhatsApp con mensaje + link                     │
│  ✅ Se marca "sent_at" en base de datos                     │
│  ✅ Link: https://tu-app.com/survey/[token]                 │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. CLIENTE COMPLETA ENCUESTA                                 │
├─────────────────────────────────────────────────────────────┤
│  Cliente abre link → Página pública (sin login)             │
│  ✅ Selecciona rating (1-5 estrellas)                       │
│  ✅ Escribe comentario (opcional)                           │
│  ✅ Envía respuesta                                         │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. GENERACIÓN DE BENEFICIO (Automático)                     │
├─────────────────────────────────────────────────────────────┤
│  Sistema verifica rating:                                    │
│  - Si rating >= 4 → Crea beneficio en tabla "benefits"      │
│  - Si rating < 4 → No crea beneficio                         │
│                                                              │
│  Si rating 4-5:                                              │
│  ✅ Redirige a Google Maps (calificar el negocio)           │
│  ✅ Muestra mensaje: "Ganaste 10% OFF en tu próxima visita" │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. PRÓXIMA VISITA DEL CLIENTE                                │
├─────────────────────────────────────────────────────────────┤
│  Cliente vuelve con mismo celular                           │
│  ✅ Sistema detecta beneficio pendiente automáticamente     │
│  ✅ Muestra: "🎁 Cliente tiene 1 beneficio pendiente"       │
│  ✅ Operador selecciona beneficio                           │
│  ✅ Descuento se aplica al precio                           │
└────────────┬────────────────────────────────────────────────┘
             ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. CANJE DE BENEFICIO                                        │
├─────────────────────────────────────────────────────────────┤
│  Al registrar el auto con beneficio:                         │
│  ✅ Precio calculado con descuento                          │
│  ✅ Beneficio marcado como "redeemed"                       │
│  ✅ Se guarda redeemed_at y redeemed_visit_id               │
│  ✅ Beneficio ya no aparece en próximas visitas             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 Diferencias DeltaWash vs SaaS

| Aspecto | DeltaWash Legacy | SaaS Multi-Tenant |
|---------|------------------|-------------------|
| **Campo empresa_id** | ❌ No existe | ✅ En todas las tablas |
| **Configuración** | `survey_config` (1 fila global) | `tenant_survey_config` (1 por empresa) |
| **Constraint UNIQUE** | `UNIQUE(visit_id)` | `UNIQUE(visit_id, empresa_id)` |
| **Base de datos** | Vercel Postgres (única) | Neon Branches (1 por empresa) |
| **Autenticación** | Token legacy | JWT con empresaId |
| **Aislamiento** | Single-tenant | Multi-tenant |

---

## ✅ Checklist de Implementación

- [ ] Backup de base de datos DeltaWash
- [ ] Ejecutar `migration-sistema-encuestas-deltawash.sql`
- [ ] Verificar que las 4 tablas existen
- [ ] Verificar configuración por defecto en `survey_config`
- [ ] Configurar mensaje WhatsApp personalizado
- [ ] Configurar URL de Google Maps
- [ ] Ajustar porcentaje de descuento si es necesario
- [ ] Test: Registrar auto → Marcar listo → Marcar entregado
- [ ] Test: Enviar encuesta por WhatsApp
- [ ] Test: Responder encuesta (rating 5)
- [ ] Test: Verificar redirección a Google Maps
- [ ] Test: Registrar nuevo auto con mismo celular
- [ ] Test: Verificar detección automática de beneficio
- [ ] Test: Canjear beneficio (aplicar descuento)
- [ ] Test: Ver reportes de encuestas
- [ ] Test: Ver reportes de beneficios
- [ ] Capacitar al equipo sobre el nuevo sistema

---

## 📞 Soporte

Si encontrás problemas durante la implementación:

1. **Verificar logs de Vercel:**
   - Dashboard > Runtime Logs
   - Buscar errores relacionados con "survey" o "benefit"

2. **Verificar estado de las tablas:**
   ```sql
   SELECT * FROM surveys ORDER BY id DESC LIMIT 5;
   SELECT * FROM benefits WHERE status = 'pending';
   SELECT * FROM survey_config;
   ```

3. **Revisar configuración:**
   - Ir a /reportes/encuestas → ⚙️ Configuración
   - Verificar que todos los campos estén completos

---

## 🎉 ¡Listo!

Una vez completados todos los pasos, DeltaWash tendrá el sistema de encuestas completamente funcional, idéntico al de la versión SaaS pero adaptado para single-tenant.

**Ventajas del sistema:**
- ✅ Feedback directo de clientes
- ✅ Fidelización con beneficios automáticos
- ✅ Aumento de calificaciones en Google Maps
- ✅ Detección automática de beneficios (sin esfuerzo del operador)
- ✅ Reportes de satisfacción del cliente
- ✅ Sistema configurable (mensaje, descuento, etc.)
