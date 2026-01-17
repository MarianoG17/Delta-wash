# 🌐 URLs de Deployment - DeltaWash & lavapp

## 📍 URLs Completas del Sistema

### 🔷 Sistema DeltaWash (Legacy - Single Tenant)

**URL de Producción en Vercel:**
```
https://app-lavadero.vercel.app
```

**Páginas principales:**
- Login: `https://app-lavadero.vercel.app/login`
- App principal: `https://app-lavadero.vercel.app/` (requiere login)
- Historial: `https://app-lavadero.vercel.app/historial`
- Reportes: `https://app-lavadero.vercel.app/reportes`
- Cuentas Corrientes: `https://app-lavadero.vercel.app/cuentas-corrientes`

**Base de datos:** PostgreSQL de Vercel (POSTGRES_URL)

---

### 🔶 Sistema lavapp (SaaS Multi-Tenant)

**URL de Producción en Vercel:**
```
https://app-lavadero.vercel.app
```
(Mismo deployment, pero rutas diferentes)

**Páginas SaaS:**
- Landing page: `https://app-lavadero.vercel.app/home`
- Registro: `https://app-lavadero.vercel.app/registro`
- Login SaaS: `https://app-lavadero.vercel.app/login-saas`
- App SaaS (después de login): `https://app-lavadero.vercel.app/`
- Gestión de Usuarios: `https://app-lavadero.vercel.app/usuarios`
- Listas de Precios: `https://app-lavadero.vercel.app/listas-precios`

**Base de datos:** 
- BD Central SaaS: PostgreSQL de Vercel (CENTRAL_DB_URL)
- BDs por empresa: Branches de Neon (dinámicas)

---

### 🛠️ Herramientas de Administración

**Reset del sistema SaaS:**
```
https://app-lavadero.vercel.app/admin/reset-sistema
```

**Limpiar registros de una empresa:**
```
https://app-lavadero.vercel.app/admin/limpiar
```

**Gestión de empresas:**
```
https://app-lavadero.vercel.app/admin/empresas
```

---

## 🔐 Variables de Entorno en Vercel

Asegúrate de que estas variables estén configuradas en Vercel Dashboard:

### DeltaWash Legacy:
- `POSTGRES_URL` - Base de datos de DeltaWash
- `JWT_SECRET` - Secret para tokens

### lavapp SaaS:
- `CENTRAL_DB_URL` - Base de datos central del SaaS
- `NEON_API_KEY` - API key de Neon (la nueva que configuramos)
- `NEON_PROJECT_ID` - ID del proyecto en Neon
- `JWT_SECRET` - Secret para tokens

---

## 📱 PWA (Progressive Web App)

**Instalar como app:**
1. Abrir en Chrome/Safari: `https://app-lavadero.vercel.app`
2. En el menú del navegador → "Instalar aplicación"
3. La app se instalará en tu dispositivo

**Manifest:**
```
https://app-lavadero.vercel.app/manifest.json
```

---

## 🔍 Verificar Deployment

### En Local (Development):
```bash
npm run dev
# http://localhost:3000
```

### En Vercel (Production):
1. Ir a [Vercel Dashboard](https://vercel.com/dashboard)
2. Seleccionar proyecto `app-lavadero`
3. Ver deployments y logs

### Verificar que funciona:
```bash
# DeltaWash Legacy
curl https://app-lavadero.vercel.app/login

# lavapp SaaS
curl https://app-lavadero.vercel.app/home
curl https://app-lavadero.vercel.app/registro
```

---

## 🚀 Proceso de Deploy

### Automático (con Git):
1. Hacer commit de los cambios
2. Push a GitHub
3. Vercel detecta y hace deploy automático

### Manual:
```bash
# Instalar Vercel CLI (si no está instalado)
npm i -g vercel

# Deploy
vercel --prod
```

---

## ⚠️ Importante sobre el Reset en Producción

**NUNCA uses `/admin/reset-sistema` en producción** a menos que:
- ✅ Estés 100% seguro de que NO hay clientes reales
- ✅ Hayas hecho backup de la BD
- ✅ Sepas que es un ambiente de testing

**Para producción real:**
- ✅ Elimina empresas individualmente desde `/admin/empresas`
- ✅ Usa `/admin/limpiar` para limpiar registros de una empresa específica
- ✅ Mantén siempre backups

---

## 📊 Estructura de URLs

```
app-lavadero.vercel.app/
├── /                          → App principal (detecta auth)
├── /login                     → Login DeltaWash
├── /login-saas                → Login lavapp SaaS
├── /home                      → Landing page lavapp
├── /registro                  → Registro lavapp
├── /usuarios                  → Gestión usuarios (admin)
├── /listas-precios            → Config precios (admin)
├── /historial                 → Historial registros
├── /reportes                  → Reportes y stats
├── /cuentas-corrientes        → Gestión CC
├── /clientes                  → Gestión clientes
└── /admin/
    ├── /reset-sistema         → Reset completo SaaS
    ├── /limpiar               → Limpiar registros
    └── /empresas              → Gestión empresas
```

---

## 🔗 Links Útiles

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Neon Console:** https://console.neon.tech
- **GitHub Repo:** (tu repositorio)
- **Documentación Next.js:** https://nextjs.org/docs

---

## 📝 Notas

- **Mismo dominio, dos sistemas:** DeltaWash y lavapp conviven en el mismo deployment
- **Detección automática:** El sistema detecta qué autenticación usar según el token
- **BDs separadas:** DeltaWash usa POSTGRES_URL, lavapp usa CENTRAL_DB_URL + Neon branches
- **Branches dinámicos:** Cada empresa SaaS tiene su propio branch en Neon

---

**Última actualización:** 2026-01-17
