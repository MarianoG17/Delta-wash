# ⚡ Deploy Rápido - 3 Pasos Simples

## 🎯 Opción 1: Deploy Automático (Recomendado)

### Paso 1: Crear Base de Datos (2 minutos)
1. Click aquí: https://console.neon.tech/app/projects
2. Click en "New Project"
3. Nombre: `deltawash`
4. Click en "Create Project"
5. **COPIA** la cadena de conexión que aparece (empieza con `postgresql://`)

### Paso 2: Deploy a Vercel (1 click)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/TU_USUARIO/deltawash&env=POSTGRES_URL,POSTGRES_PRISMA_URL,POSTGRES_URL_NO_SSL,POSTGRES_URL_NON_POOLING,POSTGRES_USER,POSTGRES_HOST,POSTGRES_PASSWORD,POSTGRES_DATABASE&project-name=deltawash&repository-name=deltawash)

**Cuando te pida las variables de entorno:**
- Pega la cadena de conexión de Neon en cada campo
- Para `POSTGRES_PRISMA_URL`: agrega `?pgbouncer=true` al final

### Paso 3: Inicializar Base de Datos (1 click)
Una vez deployado, accede a:
```
https://deltawash.vercel.app/api/init-db
```

¡Listo! Tu app está funcionando en https://deltawash.vercel.app

---

## 🎯 Opción 2: Yo lo hago por ti (Necesito acceso)

Si me das acceso, puedo hacer todo el deploy por ti. Necesito:

### Para GitHub:
- Tu nombre de usuario de GitHub
- Un Personal Access Token con permisos de `repo`
  - Crear token: https://github.com/settings/tokens/new
  - Permisos necesarios: `repo` (todos los checkboxes)

### Para Vercel:
- Un token de Vercel
  - Crear token: https://vercel.com/account/tokens
  - Nombre: "DeltaWash Deploy"

### Para Neon:
- Lamentablemente, esto SÍ o SÍ lo tienes que hacer manualmente (2 minutos)
- Es por seguridad, Neon no permite automatización sin autenticación

---

## 🎯 Opción 3: Manual Guiada (15 minutos)

Si prefieres hacerlo manualmente, sigue el archivo [`PASOS_SIGUIENTES.md`](PASOS_SIGUIENTES.md)

---

## ❓ ¿Cuál opción elegir?

| Opción | Tiempo | Dificultad | Recomendado |
|--------|--------|------------|-------------|
| **Opción 1** | 5 min | ⭐ Fácil | ✅ Sí |
| **Opción 2** | 2 min | ⭐ Muy fácil | ✅ Si tienes tokens |
| **Opción 3** | 15 min | ⭐⭐ Media | Solo si quieres aprender |

---

## 🚀 Comandos para Opción 2 (Automatizada)

Si eliges que yo lo haga, ejecutaré estos comandos:

```bash
# 1. Crear repositorio en GitHub
gh repo create deltawash --public --source=. --remote=origin --push

# 2. Deploy a Vercel (necesita token)
vercel --prod --token=TU_TOKEN_VERCEL

# 3. Configurar variables de entorno
vercel env add POSTGRES_URL production
# ... (repetir para cada variable)
```

**¿Quieres que lo haga yo?** Dame los tokens y lo hago en 2 minutos.

---

## 📝 Credenciales por Defecto

Una vez deployado, accede con:
- **Usuario**: admin
- **Contraseña**: admin123

---

## ✅ Verificación Final

Después del deploy, verifica:
- [ ] Login funciona
- [ ] Puedes registrar un auto
- [ ] Puedes marcar como listo
- [ ] Se abre WhatsApp correctamente
- [ ] El historial muestra datos

---

**¿Qué opción prefieres?** Dime y continuamos.
