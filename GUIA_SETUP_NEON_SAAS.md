# 🚀 Guía de Setup en Neon para LAVAPP SaaS

Esta guía te explica **exactamente** qué hacer en Neon para preparar la infraestructura multi-tenant.

---

## 📋 RESUMEN

Vas a crear:
1. ✅ Un branch "central" para gestión de empresas/usuarios
2. ✅ Tu BD actual se convierte en branch "deltawash"
3. ✅ Nuevos clientes tendrán sus propios branches

**⚠️ IMPORTANTE:** DeltaWash NO se va a ver afectado durante este proceso.

---

## 🎯 PASO 1: Preparar Branch Central (10 minutos)

### 1.1. Ir a Neon Console

```
1. Abrir: https://console.neon.tech
2. Seleccionar tu proyecto actual (el de DeltaWash)
3. Click en pestaña "Branches" en el menú lateral
```

### 1.2. Crear Branch "central"

```
1. Click en "Create Branch"
2. Configuración:
   - Branch name: central
   - Parent branch: main (el actual)
   - Type: Development
3. Click "Create Branch"
```

### 1.3. Obtener Connection String de "central"

```
1. En la lista de branches, click en "central"
2. En la sección "Connection Details"
3. Copiar la "Connection string"
   
   Ejemplo:
   postgresql://user:pass@ep-xxx-123.us-east-2.aws.neon.tech/neondb?sslmode=require
   
4. GUARDAR esta URL, la vas a necesitar después
```

### 1.4. Ejecutar Schema en Branch "central"

```
1. En Neon Console, branch "central"
2. Click en "SQL Editor" (o usar tu cliente SQL favorito)
3. Abrir archivo: scripts/schema-bd-central-saas.sql
4. Copiar TODO el contenido
5. Pegar en SQL Editor
6. Click "Run"
7. Verificar: "Query executed successfully"
```

---

## 🎯 PASO 2: Preparar Branch DeltaWash (5 minutos)

### Opción A: Renombrar branch actual (RECOMENDADO)

```
1. En Neon Console, branches
2. Tu branch actual (probablemente "main")
3. Click en settings (⚙️)
4. Cambiar nombre a: deltawash
5. Guardar
```

### Opción B: Crear branch nuevo y copiar

```
1. Create Branch
2. Nombre: deltawash
3. Parent: main
4. Esto crea una COPIA de tu BD actual
```

### Obtener Connection String de "deltawash"

```
1. Click en branch "deltawash"
2. Copiar Connection String
3. GUARDAR (es la que ya tenés, pero confirmá)
```

---

## 🎯 PASO 3: Configurar Variables de Entorno (5 minutos)

### 3.1. Crear archivo `.env.local` (si no existe)

```bash
# Copiar desde .env.local.example o crear nuevo
```

### 3.2. Agregar nuevas variables

```bash
# ============================================
# BD CENTRAL (nuevo - para gestión SaaS)
# ============================================
CENTRAL_DB_URL="postgresql://user:pass@ep-central-xxx.neon.tech/neondb?sslmode=require"

# ============================================
# BD DELTAWASH (actual - NO cambiar si ya existe)
# ============================================
POSTGRES_URL="postgresql://user:pass@ep-deltawash-xxx.neon.tech/neondb?sslmode=require"

# ============================================
# JWT para sesiones (generar nuevo)
# ============================================
JWT_SECRET="tu-secret-super-seguro-cambiar-esto-123456"

# ============================================
# Neon API (para crear branches automáticamente)
# ============================================
# Estos los sacamos después, no son urgentes por ahora
# NEON_API_KEY="..."
# NEON_PROJECT_ID="..."
```

### 3.3. Generar JWT_SECRET

**Opción A: Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Opción B: Online**
```
Ir a: https://generate-secret.vercel.app/32
Copiar el resultado
```

**Opción C: Manual**
```
Cualquier string largo y aleatorio:
mi-super-secret-key-lavapp-2026-abc123xyz789
```

---

## 🎯 PASO 4: Obtener Neon API Key (OPCIONAL - para después)

Esto es solo necesario cuando quieras que el sistema cree branches automáticamente.
Por ahora podés crear branches manualmente para probar.

### Cómo obtener API Key:

```
1. Neon Console: https://console.neon.tech
2. Click en tu avatar (arriba derecha)
3. "Account Settings"
4. Pestaña "API Keys"
5. "Generate new API Key"
6. Copiar y guardar (solo se muestra una vez)
```

### Obtener Project ID:

```
1. En cualquier branch de tu proyecto
2. La URL dice: console.neon.tech/app/projects/xxx-yyy-zzz
3. El "xxx-yyy-zzz" es tu PROJECT_ID
```

---

## ✅ VERIFICACIÓN: ¿Todo Listo?

### Checklist antes de continuar:

```
[ ] Branch "central" creado en Neon
[ ] Schema ejecutado en branch "central" (tabla empresas, usuarios_sistema)
[ ] Branch "deltawash" existe (renombrado o copiado)
[ ] Connection string de "central" copiada
[ ] Connection string de "deltawash" confirmada
[ ] Archivo .env.local actualizado con CENTRAL_DB_URL
[ ] JWT_SECRET generado y configurado
[ ] DeltaWash sigue funcionando normalmente ✅
```

---

## 🔧 TESTING: Verificar Que Todo Funciona

### Test 1: BD Central

```sql
-- Conectarte al branch "central" y ejecutar:
SELECT * FROM empresas;
-- Debería estar vacío (0 rows)

SELECT * FROM usuarios_sistema;
-- Debería estar vacío (0 rows)
```

### Test 2: BD DeltaWash

```sql
-- Conectarte al branch "deltawash" y ejecutar:
SELECT * FROM tareas LIMIT 5;
-- Debería mostrar las tareas de DeltaWash

SELECT COUNT(*) FROM facturas;
-- Debería mostrar el conteo actual
```

### Test 3: App funcionando

```
1. Abrir tu app en localhost
2. Ir a /tareas o cualquier página
3. Verificar que todo carga normalmente
4. ✅ Si funciona, PERFECTO
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Se van a perder datos de DeltaWash?

**NO.** Estamos creando branches NUEVOS, no modificando el actual.

### ¿Cuánto cuesta esto en Neon?

```
Plan FREE: 10 branches gratis
Branches usado ahora: 2 (central + deltawash)
Branches disponibles: 8 más
Costo: $0
```

### ¿Puedo seguir usando DeltaWash mientras configuro?

**SÍ.** Todo este proceso es NO-DISRUPTIVO.

### ¿Qué pasa si algo sale mal?

```
1. Tu BD actual NO se toca
2. Podés borrar branch "central" y empezar de nuevo
3. Peor caso: seguís usando como ahora
```

### ¿Necesito hacer backup?

**Recomendado pero no crítico.** Neon hace backups automáticos, pero nunca está de más:

```
1. Neon Console > Branch "deltawash"
2. "Backup & Restore"
3. "Create Backup"
```

---

## 🚀 PRÓXIMOS PASOS

Una vez completados estos pasos:

1. ✅ Infraestructura de Neon lista
2. ➡️ Crear sistema de autenticación
3. ➡️ Crear landing page
4. ➡️ Crear formulario de registro
5. ➡️ Probar con empresa de prueba

---

## 📞 AYUDA

Si algo no funciona o tenés dudas:
1. Verificá que las Connection Strings sean correctas
2. Probá con SQL Editor directo en Neon
3. Revisá los logs de errores en la consola

---

**¡Listo! Una vez hagas esto, avisame y seguimos con el código.** 🚀
