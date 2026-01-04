# 🚀 Deploy Automático - Solo 3 Pasos

## Paso 1: Crear Repositorio en GitHub (1 minuto)

1. Ve a: https://github.com/new
2. Nombre del repositorio: **deltawash**
3. Descripción: **Sistema de gestión para lavadero DeltaWash**
4. Visibilidad: **Public** o **Private** (tu elección)
5. **NO marques** ninguna opción de inicializar (README, .gitignore, etc.)
6. Click en **"Create repository"**
7. **COPIA** la URL que aparece (algo como: `https://github.com/TU_USUARIO/deltawash.git`)

## Paso 2: Subir el Código (30 segundos)

Abre la terminal en VSCode y ejecuta estos comandos (reemplaza TU_URL con la que copiaste):

```bash
git remote add origin TU_URL_AQUI
git branch -M main
git push -u origin main
```

Ejemplo:
```bash
git remote add origin https://github.com/mariano/deltawash.git
git branch -M main  
git push -u origin main
```

## Paso 3: Deploy en Vercel (2 minutos)

### 3.1 Crear Base de Datos en Neon
1. Ve a: https://console.neon.tech/app/projects
2. Click en **"New Project"**
3. Nombre: **deltawash**
4. Click en **"Create Project"**
5. **COPIA** todas las credenciales que aparecen (guárdalas en un archivo temporal)

### 3.2 Deploy a Vercel
1. Ve a: https://vercel.com/new
2. Click en **"Import Git Repository"**
3. Busca y selecciona el repositorio **deltawash**
4. En **"Project Name"** pon: **deltawash**
5. Click en **"Environment Variables"**
6. Agrega estas variables con los datos de Neon:

```
POSTGRES_URL=postgresql://...
POSTGRES_PRISMA_URL=postgresql://...?pgbouncer=true
POSTGRES_URL_NO_SSL=postgresql://...
POSTGRES_URL_NON_POOLING=postgresql://...
POSTGRES_USER=...
POSTGRES_HOST=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...
```

7. Click en **"Deploy"**
8. Espera 2-3 minutos

### 3.3 Inicializar Base de Datos
Una vez que termine el deploy, accede a:
```
https://deltawash.vercel.app/api/init-db
```

Deberías ver: `{"success":true,"message":"Base de datos inicializada correctamente"}`

## ✅ ¡Listo!

Tu aplicación está funcionando en: **https://deltawash.vercel.app**

**Credenciales de acceso:**
- Usuario: **admin**
- Contraseña: **admin123**

---

## 🔧 Si algo falla:

### Error al hacer push a GitHub:
```bash
# Si te pide autenticación, usa:
git config --global credential.helper wincred
# Luego intenta el push de nuevo
```

### Error en Vercel:
- Verifica que las variables de entorno estén correctas
- Revisa los logs en Vercel Dashboard

### Error de base de datos:
- Asegúrate de haber ejecutado `/api/init-db`
- Verifica que las credenciales de Neon sean correctas

---

## 📊 Resumen Visual

```
┌─────────────────┐
│  1. GitHub      │  ← Crear repo y copiar URL
│  (1 minuto)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  2. Git Push    │  ← 3 comandos en terminal
│  (30 segundos)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  3. Neon + Ver  │  ← Crear BD + Deploy
│  (2 minutos)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ✅ LISTO!      │  ← deltawash.vercel.app
└─────────────────┘
```

**Tiempo total: ~4 minutos**
