# 🔑 Actualizar Tu Nueva API Key

**Tu nueva API key es:**
```
napi_swpn69jisz7m3g0tfo4tp5u85o3p2u62r5nqcursbn89vec9hcb6qpo0d6bxtyyy
```

⚠️ **IMPORTANTE:** Esta key NO se sube a GitHub. Solo va en archivos locales y Vercel.

---

## 📝 Paso 1: Actualizar .env.local (Archivo Local)

### 1.1 Abrir el archivo

En tu proyecto, abrir el archivo:
```
.env.local
```

(Está en la raíz del proyecto, al mismo nivel que `package.json`)

### 1.2 Buscar esta línea (alrededor de línea 24):

```bash
NEON_API_KEY="napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8"
```

### 1.3 Reemplazar con tu nueva key:

```bash
NEON_API_KEY="napi_swpn69jisz7m3g0tfo4tp5u85o3p2u62r5nqcursbn89vec9hcb6qpo0d6bxtyyy"
```

### 1.4 Guardar el archivo

**Ctrl+S** (Windows/Linux) o **Cmd+S** (Mac)

---

## 🧪 Paso 2: Probar en Local

### 2.1 Si tenés el servidor corriendo, reiniciarlo

```bash
# Detener (Ctrl+C)
# Luego iniciar de nuevo:
npm run dev
```

### 2.2 Probar registro

1. Ir a: `http://localhost:3000/registro`
2. Crear cuenta de prueba:
   - Nombre: "Test API Nueva"
   - Email: test@test.com
   - Password: test123
   - Confirmar: test123
3. Click "Crear cuenta gratis"

### 2.3 Verificar en los logs

En la terminal donde corre `npm run dev`, deberías ver:

```
[Registro] 🚀 INICIO: Creación de base de datos en Neon
[Registro] NEON_API_KEY: ✅ Configurada (napi_swpn6...)
[Neon API] Creando branch: test-api-nueva
[Neon API] Branch creado exitosamente: br-xxx
✅ Empresa registrada correctamente
```

**Si ves esto → Perfecto, funciona en local. Continuar al Paso 3.**

**Si da error → Verificar que:**
- Copiaste la key completa (sin espacios al inicio/final)
- Guardaste el archivo .env.local
- Reiniciaste npm run dev

---

## ☁️ Paso 3: Actualizar en Vercel

### 3.1 Ir a Vercel Dashboard

1. Abrir: https://vercel.com
2. Hacer login si es necesario
3. Click en tu proyecto (debería llamarse algo como "app-lavadero" o similar)

### 3.2 Ir a Environment Variables

1. Click en **"Settings"** (en la barra superior)
2. En el menú lateral, click en **"Environment Variables"**

### 3.3 Buscar NEON_API_KEY

Scroll hacia abajo hasta encontrar la variable `NEON_API_KEY`

### 3.4 Editar la variable

1. Click en el ícono de **3 puntos (⋮)** al lado derecho de `NEON_API_KEY`
2. Click en **"Edit"**
3. En el campo de valor, borrar la key antigua y pegar la nueva:
   ```
   napi_swpn69jisz7m3g0tfo4tp5u85o3p2u62r5nqcursbn89vec9hcb6qpo0d6bxtyyy
   ```
4. Asegurate que esté marcado **"Production"**
5. Click en **"Save"**

---

## 🚀 Paso 4: Re-deployar Vercel

### Opción A: Desde tu proyecto (Recomendado)

```bash
git add .
git commit -m "docs: actualizar documentación API key"
git push
```

Esto hará un deploy automático en Vercel.

### Opción B: Desde Vercel Dashboard

1. Ir a la pestaña **"Deployments"**
2. Click en el deploy más reciente
3. Click en el botón **"..."** (3 puntos)
4. Click en **"Redeploy"**
5. Confirmar

**Esperar 2-3 minutos** a que termine el deploy.

---

## ✅ Paso 5: Verificar Producción

### 5.1 Ir a tu app en Vercel

Ir a tu URL de producción:
```
https://tu-proyecto.vercel.app/registro
```

(Reemplazar con tu URL real)

### 5.2 Crear cuenta de prueba en producción

Llenar el formulario y crear una cuenta de prueba.

**Si funciona → ¡PERFECTO! Todo actualizado correctamente ✅**

**Si da error:**
1. Ir a Vercel > Deployments
2. Click en el último deploy
3. Click en "Runtime Logs"
4. Buscar errores de Neon API
5. Verificar que la variable NEON_API_KEY esté bien guardada

---

## 📊 Resumen de Archivos a Modificar

```
✅ .env.local (LOCAL - NO se sube a GitHub)
   ↓
   Pegar: napi_swpn69jisz7m3g0tfo4tp5u85o3p2u62r5nqcursbn89vec9hcb6qpo0d6bxtyyy

✅ Vercel Environment Variables (PRODUCCIÓN)
   ↓
   Pegar: napi_swpn69jisz7m3g0tfo4tp5u85o3p2u62r5nqcursbn89vec9hcb6qpo0d6bxtyyy

❌ NO modificar ningún archivo .md o .ts
   ↓
   Estos se suben a GitHub y expondrían la key otra vez
```

---

## 🎯 Checklist Final

```
[ ] 1. Abrir .env.local
[ ] 2. Reemplazar NEON_API_KEY con la nueva
[ ] 3. Guardar .env.local
[ ] 4. Reiniciar npm run dev
[ ] 5. Probar localhost:3000/registro
[ ] 6. Ver logs - debería crear branch exitosamente
[ ] 7. Ir a Vercel Dashboard
[ ] 8. Settings > Environment Variables
[ ] 9. Editar NEON_API_KEY
[ ] 10. Pegar la nueva key
[ ] 11. Save
[ ] 12. Git commit + push
[ ] 13. Esperar deploy (2-3 min)
[ ] 14. Probar en producción
[ ] 15. ✅ TODO FUNCIONANDO
```

---

## ❓ ¿Por Qué No Puedo Cambiarla Directamente?

Porque `.env.local` está en `.gitignore`, lo que significa:
- ✅ Es un archivo local tuyo
- ✅ NO se sube a GitHub (por seguridad)
- ❌ No puedo acceder a él para modificarlo

Esto es CORRECTO - así debe ser para mantener las API keys seguras.

Lo mismo con Vercel - solo vos tenés acceso a tu cuenta de Vercel.

---

**¡Ahora sí, seguí los pasos y listo!** 🚀

Cualquier problema que tengas en el proceso, avisame y te ayudo a resolverlo.
