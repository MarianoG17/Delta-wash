# 🚀 Instrucciones para Commit y Deploy

## ✅ Verificación Pre-Commit

### 1️⃣ Verificar que `.env.local` NO se va a subir

El archivo `.env.local` debe estar en `.gitignore` (ya está configurado). Verificar:

```bash
cat .gitignore | grep .env
```

Debería mostrar:
```
.env*.local
```

---

## 📦 Archivos Modificados/Creados

### 🆕 Archivos NUEVOS creados:

**Autenticación Dual:**
- `lib/auth-utils.ts` - Utilidades de autenticación dual

**Gestión de Usuarios:**
- `app/api/usuarios/route.ts` - API de gestión de usuarios
- `app/usuarios/page.tsx` - Página de administración de usuarios

**Sistema de Limpieza:**
- `app/api/admin/limpiar-registros/route.ts` - API para limpiar registros operativos
- `app/api/admin/limpiar-todo-sistema/route.ts` - API para reset completo
- `app/admin/limpiar/page.tsx` - Página para limpiar registros
- `app/admin/reset-sistema/page.tsx` - Página para reset completo

**Documentación:**
- `SOLUCION_PRECIOS_CERO_EMPRESAS_NUEVAS.md`
- `COMPATIBILIDAD_EMPRESAS_EXISTENTES.md`
- `SOLUCION_AUTENTICACION_DUAL.md`
- `URLS_DEPLOYMENT.md`
- `INSTRUCCIONES_COMMIT_Y_DEPLOY.md` (este archivo)

### ✏️ Archivos MODIFICADOS:

**Sistema de Precios:**
- `lib/neon-api.ts` - Precios iniciales en $0 para nuevas empresas
- `app/page.tsx` - Agregado botón "Usuarios" en menú admin
- `app/listas-precios/page.tsx` - Sistema expandido a 6 servicios

**APIs corregidas (Neon driver):**
- `app/api/reportes/ventas/route.ts`
- `app/api/reportes/horarios/route.ts`
- `app/api/reportes/caja/route.ts`
- `app/api/listas-precios/route.ts`
- `app/api/listas-precios/obtener-precios/route.ts`

**Páginas con autenticación dual:**
- `app/cuentas-corrientes/page.tsx`
- `app/reportes/page.tsx`
- `app/clientes/page.tsx`
- `app/historial/page.tsx`
- `app/cuentas-corrientes/[id]/page.tsx`

---

## 🔧 Pasos para Commit

### 1️⃣ Verificar estado de Git

```bash
git status
```

### 2️⃣ Agregar todos los archivos

```bash
git add .
```

### 3️⃣ Hacer commit con mensaje descriptivo

```bash
git commit -m "feat: Sistema completo SaaS multi-tenant con mejoras

- Autenticación dual (DeltaWash + lavapp SaaS)
- Gestión de usuarios con roles (admin/operador)
- Precios iniciales en $0 para nuevas empresas
- Sistema de limpieza y reset completo
- Correcciones para Neon driver en APIs de reportes
- Expandido sistema de precios a 6 servicios
- Documentación completa del sistema

Fixes:
- API key de Neon actualizada y asegurada
- Navegación entre páginas SaaS corregida
- Reportes funcionando correctamente con Neon
- Sistema de precios dinámicos implementado

Breaking changes:
- Empresas nuevas empiezan con precios en $0
- Requiere configuración manual de precios"
```

### 4️⃣ Push a GitHub

```bash
git push origin main
```

O si tu rama es `master`:

```bash
git push origin master
```

---

## ☁️ Deploy a Vercel

### Opción A: Deploy Automático (Recomendado)

Si tu proyecto está conectado a GitHub en Vercel, el deploy se hará **automáticamente** después del push.

**Verificar:**
1. Ir a https://vercel.com/dashboard
2. Seleccionar tu proyecto
3. Ver "Deployments" - debería aparecer un nuevo deployment
4. Esperar a que el estado sea "Ready" (✓)

### Opción B: Deploy Manual

```bash
# Instalar Vercel CLI (si no está instalado)
npm i -g vercel

# Login (si no estás logueado)
vercel login

# Deploy a producción
vercel --prod
```

---

## 🔐 Configurar Variables de Entorno en Vercel

**IMPORTANTE:** Las variables de entorno NO se suben a Git. Debes configurarlas manualmente en Vercel.

### 1️⃣ Ir a Vercel Dashboard

```
https://vercel.com/dashboard
```

### 2️⃣ Seleccionar tu proyecto → Settings → Environment Variables

### 3️⃣ Agregar/Verificar estas variables:

#### Para DeltaWash (Legacy):
```
POSTGRES_URL = (tu connection string de Vercel Postgres)
JWT_SECRET = (tu secret para tokens)
```

#### Para lavapp (SaaS):
```
CENTRAL_DB_URL = (tu connection string de BD Central SaaS)
NEON_API_KEY = (tu NUEVA API key de Neon - la que acabamos de configurar)
NEON_PROJECT_ID = (tu project ID de Neon)
```

**⚠️ IMPORTANTE: NEON_API_KEY**

Usar la **NUEVA** API key que configuramos, NO la antigua que estaba expuesta.

Si no la tenés anotada:
1. Ir a https://console.neon.tech
2. Account Settings → API Keys
3. Crear una nueva si es necesario
4. Copiar y pegar en Vercel

### 4️⃣ Aplicar cambios

Después de agregar/modificar variables:
- Hacer un nuevo deploy (o esperar al automático)
- Las variables estarán disponibles en el próximo deployment

---

## ✅ Verificación Post-Deploy

### 1️⃣ Verificar que el deploy fue exitoso

```
https://vercel.com/dashboard → Tu proyecto → Deployments
```

Estado debe ser: **✓ Ready**

### 2️⃣ Probar URLs principales

#### DeltaWash Legacy:
```bash
curl https://app-lavadero.vercel.app/login
# Debería retornar HTML de la página de login
```

#### lavapp SaaS:
```bash
curl https://app-lavadero.vercel.app/home
# Debería retornar HTML de la landing page

curl https://app-lavadero.vercel.app/registro
# Debería retornar HTML del formulario de registro
```

### 3️⃣ Probar funcionalidad clave

**Registrar una nueva empresa:**
1. Ir a: `https://app-lavadero.vercel.app/registro`
2. Completar formulario
3. Verificar que se crea la empresa
4. Verificar que se crea el branch en Neon

**Login:**
1. Ir a: `https://app-lavadero.vercel.app/login-saas`
2. Ingresar con las credenciales
3. Verificar que entra a la app

**Ver usuarios:**
1. Login como admin
2. Ir a: `https://app-lavadero.vercel.app/usuarios`
3. Verificar que muestra los usuarios

**Configurar precios:**
1. Ir a: `https://app-lavadero.vercel.app/listas-precios`
2. Verificar que todos los precios están en $0
3. Editar un precio y guardar
4. Verificar que se guardó correctamente

---

## 🐛 Troubleshooting

### Error: "NEON_API_KEY is not defined"

**Solución:**
1. Ir a Vercel Dashboard → Settings → Environment Variables
2. Agregar `NEON_API_KEY` con tu nueva API key
3. Hacer redeploy

### Error: "Database connection failed"

**Solución:**
1. Verificar que `CENTRAL_DB_URL` está configurada
2. Verificar que la connection string es correcta
3. Probar la conexión desde Vercel logs

### Error 404 en `/usuarios` o `/admin/reset-sistema`

**Solución:**
1. Verificar que los archivos se subieron correctamente a GitHub
2. Ver logs de build en Vercel
3. Verificar que no hay errores de TypeScript

### Branches de Neon no se crean

**Solución:**
1. Verificar `NEON_API_KEY` en Vercel
2. Verificar `NEON_PROJECT_ID` en Vercel
3. Ver logs de la API `/api/registro` en Vercel

---

## 📊 Monitoreo Post-Deploy

### Ver Logs en Vercel

```
Vercel Dashboard → Tu proyecto → Deployments → Latest → Functions
```

**Filtrar por:**
- `/api/registro` - Para ver creación de empresas
- `/api/usuarios` - Para ver gestión de usuarios
- `/api/listas-precios` - Para ver configuración de precios

### Ver Branches en Neon

```
https://console.neon.tech → Tu proyecto → Branches
```

Deberías ver:
- `main` (branch principal)
- Un branch por cada empresa registrada (ej: `empresa-demo-123`)

---

## 🎯 Checklist Final

Antes de dar por terminado el deploy:

- [ ] Código subido a GitHub (`git push`)
- [ ] Deploy automático completado en Vercel (estado: Ready)
- [ ] Variables de entorno configuradas en Vercel
- [ ] NEON_API_KEY actualizada con la nueva key
- [ ] Página `/home` funciona correctamente
- [ ] Página `/registro` funciona correctamente
- [ ] Página `/login-saas` funciona correctamente
- [ ] Página `/usuarios` funciona (solo admin)
- [ ] Página `/listas-precios` muestra precios en $0
- [ ] Crear empresa de prueba y verificar que funciona
- [ ] Branch se crea correctamente en Neon
- [ ] Precios empiezan en $0 para empresa nueva
- [ ] Login con operador funciona (`operador@{slug}.demo` / `demo123`)
- [ ] Sistema de limpieza `/admin/reset-sistema` funciona

---

## 📝 Notas Importantes

### Sobre .env.local

El archivo `.env.local` **NO se sube a Git** (está en `.gitignore`).

Las variables de entorno para producción se configuran en Vercel Dashboard.

### Sobre la API Key de Neon

**Antigua (EXPUESTA):** `napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8`
- ⚠️ Esta key fue revocada
- ❌ NO usar más

**Nueva:** La que generaste y configuraste en `.env.local`
- ✅ Esta es la que debe estar en Vercel
- ✅ Nunca la subas a Git

### Sobre Branches de Neon

- Cada empresa SaaS tiene su propio branch
- Los branches NO se eliminan automáticamente
- Usar `/admin/reset-sistema` te dará la lista de branches a eliminar manualmente

---

## 🚀 Comandos Resumidos

```bash
# 1. Verificar estado
git status

# 2. Agregar todo
git add .

# 3. Commit
git commit -m "feat: Sistema completo SaaS multi-tenant con mejoras"

# 4. Push
git push origin main

# 5. Verificar en Vercel
# Ir a https://vercel.com/dashboard

# 6. Configurar variables de entorno (si es necesario)
# Ir a Vercel Dashboard → Settings → Environment Variables

# 7. Esperar deploy automático o hacer manual
vercel --prod
```

---

**¡Listo para deploy! 🎉**

Seguí estos pasos y tu sistema estará en producción con todas las mejoras implementadas.
