# 🚀 Configurar API de Neon para Creación Automática de Bases de Datos

## 📋 ¿Qué problema resuelve esto?

Actualmente, cuando un visitante se registra desde [`/home`](app/home/page.tsx), solo se crea su cuenta en la **BD Central**, pero NO tiene una base de datos operativa. Esto significa que no puede usar la aplicación hasta que manualmente crees un branch en Neon.

Con la API de Neon configurada, el sistema **creará automáticamente** un branch nuevo para cada empresa que se registre.

---

## 🔑 Paso 1: Obtener API Key de Neon

1. **Ir a Neon Console:**
   - Abrí https://console.neon.tech
   - Inicia sesión con tu cuenta

2. **Crear API Key:**
   - Ir a **Settings** → **API Keys** (o directo: https://console.neon.tech/app/settings/api-keys)
   - Click en **"Create new API key"**
   - Darle un nombre descriptivo: `lavapp-saas-production`
   - **IMPORTANTE:** Copiá la API Key inmediatamente (solo se muestra una vez)
   - Ejemplo de API Key: `neon_api_k3y1234567890abcdef...`

---

## 🏗️ Paso 2: Obtener Project ID

1. **Ir a tu proyecto en Neon:**
   - En el dashboard principal de Neon Console
   - Seleccioná tu proyecto de LAVAPP

2. **Copiar Project ID:**
   - En la URL verás algo como: `https://console.neon.tech/app/projects/ancient-forest-12345678`
   - El Project ID es la última parte: `ancient-forest-12345678`
   - También podés verlo en **Project Settings** → **General**

---

## ⚙️ Paso 3: Configurar Variables de Entorno

Abrí tu archivo `.env.local` y agregá estas dos líneas:

```bash
# API de Neon para crear branches automáticamente
NEON_API_KEY="neon_api_k3y1234567890abcdef..."  # La API Key que copiaste
NEON_PROJECT_ID="ancient-forest-12345678"        # Tu Project ID
```

**Ejemplo completo de `.env.local`:**

```bash
# ============================================
# BD DELTAWASH (actual)
# ============================================
POSTGRES_URL="postgresql://neondb_owner:xxx@ep-xxx.aws.neon.tech/neondb?sslmode=require"
# ... resto de las variables de DeltaWash

# ============================================
# BD CENTRAL (gestión SaaS)
# ============================================
CENTRAL_DB_URL="postgresql://neondb_owner:xxx@ep-xxx-pooler.aws.neon.tech/neondb?sslmode=require"

# ============================================
# NEON API (¡NUEVO!)
# ============================================
NEON_API_KEY="neon_api_k3y1234567890abcdefghijklmnopqrstuvwxyz123456"
NEON_PROJECT_ID="ancient-forest-12345678"

# ============================================
# JWT para sesiones
# ============================================
JWT_SECRET="a8f5c9d2e1b4f7a3c8d9e2f1a5b8c3d6e9f2a7b4c1d8e5f9a2b6c3d7e1f4a8b5c2d9e6f3a7b1c4d8e2f5a9"
```

---

## 🧪 Paso 4: Probar la Configuración

1. **Reiniciar el servidor de desarrollo:**
   ```bash
   # Detener el servidor actual (Ctrl+C)
   npm run dev
   ```

2. **Crear una cuenta de prueba:**
   - Ir a http://localhost:3000/home
   - Click en **"Probar gratis"** o **"Empezar gratis"**
   - Completar el formulario con datos de prueba
   - Click en **"Crear cuenta"**

3. **Verificar en consola:**
   Deberías ver logs como estos:
   ```
   [Registro] Creando base de datos para: Mi Lavadero Test
   [Neon API] Creando branch: mi-lavadero-test
   [Neon API] Branch creado exitosamente: br_abc123xyz
   [Setup] Inicializando schema en el nuevo branch...
   [Neon API] Schema inicializado exitosamente
   [Setup] ✅ Branch completamente configurado
   [Registro] ✅ Base de datos creada exitosamente: br_abc123xyz
   ```

4. **Verificar en Neon Console:**
   - Ir a https://console.neon.tech
   - En tu proyecto, deberías ver un nuevo branch llamado `mi-lavadero-test`

5. **Intentar hacer login:**
   - Ir a http://localhost:3000/login-saas
   - Usar las credenciales de la cuenta que creaste
   - Si todo funcionó, deberías poder ingresar y ver la app

---

## 🎯 ¿Qué hace el sistema automáticamente?

Cuando alguien se registra, el sistema:

1. ✅ **Valida los datos** (email, contraseña, etc.)
2. ✅ **Crea empresa en BD Central** (tabla `empresas`)
3. ✅ **Crea usuario admin en BD Central** (tabla `usuarios_sistema`)
4. ✅ **Crea usuario operador demo** (para probar roles)
5. 🆕 **Crea branch en Neon** automáticamente vía API
6. 🆕 **Inicializa schema completo** en el nuevo branch:
   - Tabla `usuarios` (locales de la empresa)
   - Tabla `clientes`
   - Tabla `registros` (autos lavados)
   - Tabla `precios_servicios` (con precios por defecto)
   - Tabla `cuentas_corrientes`
   - Tabla `movimientos_cc`
   - Índices para rendimiento
7. ✅ **Guarda connection string** en `empresas.branch_url`
8. ✅ **Retorna token JWT** para login inmediato

---

## ⚠️ Manejo de Errores

Si la API de Neon falla por algún motivo (credenciales incorrectas, límite de branches, etc.):

- ❌ El sistema NO falla completamente
- ✅ La empresa SE CREA en BD Central de todas formas
- ⚠️ El `branch_url` queda vacío
- 🔒 El usuario NO podrá hacer login hasta configurar manualmente
- 📝 Se loguea el error para debugging

**Logs de error esperados:**
```
[Registro] ⚠️ Error al crear branch en Neon: Error al crear branch en Neon: 401 - Unauthorized
[Registro] La empresa se creará sin BD asignada (requiere configuración manual)
```

---

## 🔒 Seguridad de la API Key

**⚠️ IMPORTANTE:**

- ❌ **NUNCA** commitear el `.env.local` a Git (ya está en `.gitignore`)
- ❌ **NUNCA** compartir tu API Key en público
- ✅ Usar variables de entorno en producción (Vercel)
- ✅ Regenerar la API Key si se filtra

---

## 🚀 Configurar en Producción (Vercel)

1. **Ir a tu proyecto en Vercel Dashboard**

2. **Settings → Environment Variables**

3. **Agregar las variables:**
   - Variable: `NEON_API_KEY`
   - Value: `tu_api_key_real`
   - Environments: Production, Preview, Development

   - Variable: `NEON_PROJECT_ID`
   - Value: `tu_project_id`
   - Environments: Production, Preview, Development

4. **Redesplegar:**
   ```bash
   git push origin main
   ```

---

## 📊 Límites de Neon

**Plan Free de Neon:**
- ✅ Hasta **10 branches** por proyecto
- ✅ 0.5 GB de storage por branch
- ✅ 191.9 horas de compute por mes

**¿Qué pasa si llego al límite?**
- La creación de branch fallará
- El sistema lo manejará gracefully (empresa sin BD)
- Deberás actualizar a plan pago o crear nuevo proyecto

---

## 🛠️ Solución de Problemas

### Problema: "NEON_API_KEY no está configurada"

**Solución:**
- Verificar que agregaste `NEON_API_KEY` en `.env.local`
- Reiniciar el servidor (`npm run dev`)

### Problema: "Error al crear branch en Neon: 401 - Unauthorized"

**Solución:**
- Verificar que la API Key sea correcta
- Verificar que la API Key no haya expirado
- Regenerar una nueva API Key en Neon Console

### Problema: "Error al crear branch en Neon: 403 - Forbidden"

**Solución:**
- Verificar límite de branches (10 en plan free)
- Eliminar branches antiguos de prueba
- Actualizar a plan pago

### Problema: No veo el branch en Neon Console

**Solución:**
- Esperar unos segundos (puede tardar)
- Refrescar la página
- Verificar logs en terminal
- Verificar `NEON_PROJECT_ID` sea correcto

---

## 📝 Referencias

- **Neon API Docs:** https://api-docs.neon.tech/reference/getting-started-with-neon-api
- **Crear API Keys:** https://console.neon.tech/app/settings/api-keys
- **Neon Console:** https://console.neon.tech

---

## ✅ Checklist Final

Antes de considerar que está configurado:

- [ ] Obtuve la API Key de Neon
- [ ] Obtuve el Project ID
- [ ] Agregué `NEON_API_KEY` y `NEON_PROJECT_ID` en `.env.local`
- [ ] Reinicié el servidor de desarrollo
- [ ] Probé crear una cuenta de prueba
- [ ] Vi logs de éxito en la consola
- [ ] Verifiqué el nuevo branch en Neon Console
- [ ] Pude hacer login con la cuenta de prueba
- [ ] (Producción) Configuré las variables en Vercel

---

**¡Listo! Ahora cuando alguien se registre, tendrá su base de datos lista automáticamente.** 🎉
