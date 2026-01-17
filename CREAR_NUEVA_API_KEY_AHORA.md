# ✅ Crear Nueva API Key en Neon (Ya Revocaste la Antigua)

**Situación actual:** Ya revocaste la API key antigua, ahora necesitás crear la nueva.

---

## 🚀 Paso 1: Crear Nueva API Key en Neon

### 1.1 Ir a Neon Console

Abrí este link:
```
https://console.neon.tech/app/settings/api-keys
```

### 1.2 Crear Nueva Key

1. Click en el botón **"Create new API key"**

2. **Nombre de la key (opcional pero recomendado):**
   ```
   lavapp-production-2026
   ```

3. Click en **"Create"**

4. **⚠️ IMPORTANTE: Copiar la key AHORA**
   
   Se mostrará algo como:
   ```
   napi_abc123def456ghi789...
   ```
   
   **Esta es tu ÚNICA oportunidad de verla.**
   
   Copiala y pegala temporalmente en un lugar seguro (Notepad, etc.)

---

## 🔧 Paso 2: Actualizar .env.local

### 2.1 Abrir el archivo

Archivo: `.env.local` (en la raíz del proyecto)

### 2.2 Actualizar la línea de NEON_API_KEY

Buscar esta línea (debería estar alrededor de la línea 24):

```bash
NEON_API_KEY="napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8"
```

Reemplazar con tu nueva key:

```bash
NEON_API_KEY="napi_TU_NUEVA_KEY_AQUI"
```

### 2.3 Guardar el archivo

⚠️ **Asegurate de guardar el archivo** (Ctrl+S o Cmd+S)

---

## ✅ Paso 3: Probar en Desarrollo Local

### 3.1 Reiniciar el servidor

Si tenés el servidor corriendo (`npm run dev`), detenerlo (Ctrl+C) y volver a iniciarlo:

```bash
npm run dev
```

### 3.2 Probar creación de empresa

1. Ir a: `http://localhost:3000/registro`

2. Llenar el formulario:
   - **Nombre empresa:** "Test Nueva Key"
   - **Email:** test@example.com
   - **Password:** test123
   - **Confirmar password:** test123

3. Click en "Crear cuenta gratis"

4. **Observar los logs en la terminal**

**Si funciona correctamente, verás:**
```
[Registro] 🚀 INICIO: Creación de base de datos en Neon
[Registro] Empresa: Test Nueva Key
[Neon API] Creando branch: test-nueva-key
[Neon API] Branch creado exitosamente: br-xxxx
[Setup] ✅ Branch completamente configurado
```

**Si ves esto → ¡Perfecto! Continuar al Paso 4**

**Si da error:**
```
[Registro] NEON_API_KEY: ❌ NO configurada
```
→ Verificar que:
- Copiaste bien la key (sin espacios)
- Guardaste el archivo .env.local
- Reiniciaste el servidor npm run dev

---

## 🌐 Paso 4: Actualizar Vercel (Producción)

### 4.1 Ir a Variables de Entorno en Vercel

1. Abrir: `https://vercel.com`

2. Ir a tu proyecto (App lavadero o como se llame)

3. Click en **"Settings"** (arriba)

4. En el menú lateral, click en **"Environment Variables"**

### 4.2 Actualizar NEON_API_KEY

1. Buscar la variable `NEON_API_KEY`

2. Click en el ícono de **3 puntos (⋮)** al lado derecho

3. Click en **"Edit"**

4. **Pegar la MISMA key que pusiste en .env.local**
   ```
   napi_TU_NUEVA_KEY_AQUI
   ```

5. Asegurate que esté marcado **"Production"**

6. Click en **"Save"**

---

## 🚀 Paso 5: Re-deployar en Vercel

### Opción A: Desde Terminal (Recomendado)

```bash
git add .
git commit -m "chore: actualizar con nueva API key de Neon"
git push
```

### Opción B: Desde Vercel Dashboard

1. Ir a la pestaña **"Deployments"**
2. Click en el deploy más reciente
3. Click en **"..."** (3 puntos)
4. Click en **"Redeploy"**

**Esperar 2-3 minutos** a que termine el deploy.

---

## ✅ Paso 6: Verificar que Funciona en Producción

### 6.1 Ir a tu app en producción

```
https://tu-app.vercel.app/registro
```

(Reemplazar con tu URL real de Vercel)

### 6.2 Crear cuenta de prueba

Llenar formulario con datos de prueba y crear cuenta.

**Si se crea exitosamente → ¡TODO LISTO! ✅**

**Si da error:**
1. Ir a Vercel Dashboard > Deployments
2. Click en el último deploy
3. Ver los "Runtime Logs"
4. Buscar errores relacionados con Neon API

---

## 📊 Checklist Rápido

```
[ ] 1. Ir a Neon Console > API Keys
[ ] 2. Click "Create new API key"
[ ] 3. Darle nombre: "lavapp-production-2026"
[ ] 4. COPIAR la key (se muestra 1 sola vez)
[ ] 5. Abrir .env.local
[ ] 6. Pegar nueva key en NEON_API_KEY
[ ] 7. Guardar archivo .env.local
[ ] 8. Reiniciar npm run dev
[ ] 9. Probar en localhost:3000/registro
[ ] 10. Ir a Vercel > Settings > Environment Variables
[ ] 11. Editar NEON_API_KEY
[ ] 12. Pegar la misma key nueva
[ ] 13. Save
[ ] 14. Git commit + push (o redeploy manual)
[ ] 15. Esperar deploy (2-3 min)
[ ] 16. Probar en tu-app.vercel.app/registro
[ ] 17. ✅ LISTO
```

---

## ❓ ¿Qué Pasa Ahora con la App?

### Empresas Existentes
- ✅ **Siguen funcionando normalmente**
- Cada empresa usa su propia base de datos (branch)
- La API key solo se usa para CREAR nuevas empresas

### Creación de Nuevas Empresas
- ❌ **NO funciona hasta que actualices la key**
- En producción, si alguien intenta registrarse ahora, dará error
- Una vez actualices Vercel y re-deployes, volverá a funcionar

### Tu Desarrollo Local
- Una vez actualices .env.local, funcionará normalmente

---

## 💡 Consejos para el Futuro

### Guardar la Nueva Key de Forma Segura

Una vez creada, guardala en un lugar seguro:
- 1Password
- Bitwarden
- LastPass
- O un documento encriptado

**NO en:**
- ❌ Archivos de código que se suben a GitHub
- ❌ Documentación que se sube a GitHub
- ❌ Emails sin encriptar

### Crear Key de Respaldo (Opcional)

Podés crear una segunda key de respaldo:
1. Ir a Neon Console > API Keys
2. Crear otra key: "lavapp-backup-2026"
3. Guardarla en lugar seguro
4. Usarla solo si perdés la principal

---

## 🎯 Estado Final Esperado

Después de completar todos los pasos:

```
✅ Nueva API key creada en Neon
✅ .env.local actualizado
✅ Desarrollo local funciona
✅ Variables en Vercel actualizadas
✅ Producción re-deployada
✅ Producción funciona correctamente
✅ Key antigua revocada (ya lo hiciste)
```

---

**¡Empezá por el Paso 1 ahora!** 🚀

El proceso completo te tomará unos 10 minutos.
