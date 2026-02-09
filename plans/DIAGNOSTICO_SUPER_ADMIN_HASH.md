# 🔐 Diagnóstico: Problema de Autenticación Super Admin

## 📋 Problema Reportado

Has cambiado la contraseña del super admin en Vercel usando un hash de bcrypt, pero al intentar autenticarte con la contraseña original, el sistema indica que las credenciales son incorrectas.

## 🔍 Análisis del Sistema Actual

### Código de Autenticación

El sistema usa bcrypt para comparar contraseñas:
- **Archivo**: [`app/api/super-admin/login/route.ts`](../app/api/super-admin/login/route.ts:21)
- **Método**: `bcrypt.compare(password, SUPER_ADMIN_PASSWORD_HASH)`
- **Variables de entorno requeridas**:
  - `SUPER_ADMIN_EMAIL`
  - `SUPER_ADMIN_PASSWORD_HASH`

### Proceso de Generación de Hash

- **Script**: [`scripts/generate-super-admin-hash.js`](../scripts/generate-super-admin-hash.js:39)
- **Algoritmo**: bcrypt con salt rounds = 10
- **Formato esperado**: `$2a$10$...` (60 caracteres aproximadamente)

## 🚨 Causas Posibles del Problema

### 1. Hash Truncado o Corrupto ⚠️

**Síntoma**: El hash en Vercel tiene menos de 60 caracteres

**Causa**: Al copiar y pegar el hash, se cortó en el medio

**Verificación**:
```
Hash correcto: $2a$10$abcdef... (60 chars)
Hash truncado: $2a$10$abcdef... (40 chars)
```

### 2. Contraseña Diferente ❌

**Síntoma**: La contraseña que intentás usar no es la que usaste para generar el hash

**Causa**: Confusión entre contraseñas antiguas y nuevas

### 3. Espacios en Blanco 🔴

**Síntoma**: El hash tiene espacios al inicio o al final

**Causa**: Al copiar de la terminal se agregaron espacios

**Ejemplo**:
```bash
# Correcto
$2a$10$abcdefghij...

# Incorrecto (con espacio al final)
$2a$10$abcdefghij... ⎵
```

### 4. Variable No Actualizada 🔄

**Síntoma**: Vercel sigue usando una variable vieja

**Causa**: No se hizo re-deploy después de cambiar la variable

### 5. Variable Incorrecta 🎯

**Síntoma**: Estás configurando `SUPER_ADMIN_PASSWORD` en vez de `SUPER_ADMIN_PASSWORD_HASH`

**Nota**: El sistema actual requiere `SUPER_ADMIN_PASSWORD_HASH` (con el hash), NO la contraseña en texto plano

## 🔧 Solución: Proceso de Diagnóstico

### Paso 1: Verificar el Hash Localmente

Ejecutar el script de verificación:

```bash
node scripts/verify-super-admin-hash.js
```

Este script te pedirá:
1. El hash que pusiste en Vercel
2. La contraseña que querés usar

Y te dirá si coinciden o no.

#### ✅ Si Coinciden

El problema está en Vercel. Procedé al **Paso 2**.

#### ❌ Si NO Coinciden

Necesitás generar un nuevo hash. Procedé al **Paso 3**.

### Paso 2: Verificar Variables en Vercel

1. Ir a [Vercel Dashboard](https://vercel.com)
2. Seleccionar tu proyecto
3. Settings → Environment Variables
4. Verificar que exista: `SUPER_ADMIN_PASSWORD_HASH`

**Checklist**:
- [ ] La variable se llama exactamente `SUPER_ADMIN_PASSWORD_HASH`
- [ ] El valor tiene aproximadamente 60 caracteres
- [ ] No hay espacios al inicio ni al final
- [ ] Empieza con `$2a$`, `$2b$` o `$2y$`

**Acción**:
1. Borrar la variable `SUPER_ADMIN_PASSWORD_HASH`
2. Crearla de nuevo copiando el hash SIN espacios
3. Hacer un re-deploy:
   - Opción A: Deployments → ... → Redeploy
   - Opción B: `git commit --allow-empty -m "Redeploy" && git push`

### Paso 3: Generar un Nuevo Hash

Si el hash actual no funciona, generá uno nuevo:

```bash
node scripts/generate-super-admin-hash.js
```

**Proceso**:
1. El script te pedirá la contraseña que querés usar
2. Te dará un hash de 60 caracteres
3. Copiá ese hash COMPLETO (sin espacios extra)
4. Andá a Vercel → Environment Variables
5. Actualizar `SUPER_ADMIN_PASSWORD_HASH` con el nuevo hash
6. Hacer re-deploy

**⚠️ IMPORTANTE**: Guardá la contraseña en un lugar seguro. Si la perdés, tendrás que generar un nuevo hash.

## 📝 Proceso Correcto de Actualización

### Método Recomendado

```bash
# 1. Generar el hash
node scripts/generate-super-admin-hash.js

# Salida ejemplo:
# Hash:
# $2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO

# 2. Copiar el hash COMPLETO (seleccionar todo, Ctrl+C)

# 3. Ir a Vercel
# - Settings → Environment Variables
# - Buscar: SUPER_ADMIN_PASSWORD_HASH
# - Editar o crear nueva
# - Pegar el hash (Ctrl+V)
# - VERIFICAR que no haya espacios extra
# - Save

# 4. Re-deploy
git commit --allow-empty -m "Update super admin credentials"
git push

# 5. Esperar que termine el deploy (2-3 minutos)

# 6. Probar en: https://lavapp.ar/super-admin
```

## 🧪 Testing Local (Opcional)

Si querés probar localmente antes de subir a Vercel:

```bash
# 1. Crear archivo .env.local
echo 'SUPER_ADMIN_EMAIL="admin@lavapp.ar"' > .env.local
echo 'SUPER_ADMIN_PASSWORD_HASH="[tu_hash_aqui]"' >> .env.local

# 2. Iniciar servidor local
npm run dev

# 3. Ir a: http://localhost:3000/super-admin

# 4. Probar login con tu email y contraseña
```

## 🛡️ Mejores Prácticas

### ✅ Hacer

- ✅ Usar contraseñas fuertes (mínimo 12 caracteres)
- ✅ Guardar la contraseña en un gestor de contraseñas
- ✅ Verificar el hash localmente antes de subirlo
- ✅ Hacer re-deploy después de cambiar variables
- ✅ Probar el login inmediatamente después del deploy

### ❌ Evitar

- ❌ Copiar el hash con espacios extras
- ❌ Usar contraseñas débiles o predecibles
- ❌ Compartir las credenciales por chat/email
- ❌ Dejar la contraseña en texto plano en Vercel
- ❌ Usar la misma contraseña que otros servicios

## 📊 Matriz de Diagnóstico Rápido

| Síntoma | Causa Probable | Solución |
|---------|---------------|----------|
| "Invalid credentials" | Hash no coincide | Verificar con script → Generar nuevo hash |
| "Super admin not configured" | Variables no configuradas | Agregar `SUPER_ADMIN_EMAIL` y `SUPER_ADMIN_PASSWORD_HASH` |
| Hash tiene < 60 chars | Hash truncado | Copiar hash completo de nuevo |
| Funciona local, falla en Vercel | Variables no actualizadas | Re-deploy de la aplicación |
| Hash empieza con `$2` pero falla | Contraseña incorrecta | Verificar que uses la contraseña correcta |

## 🔄 Diagrama de Flujo de Solución

```
¿Tenés el hash que pusiste en Vercel?
│
├─ SÍ → Ejecutar: node scripts/verify-super-admin-hash.js
│       │
│       ├─ ✅ Coincide → Problema está en Vercel
│       │               └─ Verificar variables + Re-deploy
│       │
│       └─ ❌ No coincide → Generar nuevo hash
│                           └─ node scripts/generate-super-admin-hash.js
│
└─ NO → Generar nuevo hash desde cero
        └─ node scripts/generate-super-admin-hash.js
```

## 📞 Siguiente Paso Inmediato

**Acción Recomendada**:

1. Ejecutá el script de verificación:
   ```bash
   node scripts/verify-super-admin-hash.js
   ```

2. Seguí las instrucciones que te dé el script

3. Si necesitás generar un nuevo hash, usá:
   ```bash
   node scripts/generate-super-admin-hash.js
   ```

## 📚 Archivos Relacionados

- Script de verificación: [`scripts/verify-super-admin-hash.js`](../scripts/verify-super-admin-hash.js)
- Script de generación: [`scripts/generate-super-admin-hash.js`](../scripts/generate-super-admin-hash.js)
- API de login: [`app/api/super-admin/login/route.ts`](../app/api/super-admin/login/route.ts)
- Página de login: [`app/super-admin/page.tsx`](../app/super-admin/page.tsx)
- Instrucciones generales: [`INSTRUCCIONES_SUPER_ADMIN.md`](../INSTRUCCIONES_SUPER_ADMIN.md)

## ✨ Resumen

El problema más común es que el hash en Vercel está truncado, corrupto o la contraseña no es la correcta. El script [`verify-super-admin-hash.js`](../scripts/verify-super-admin-hash.js) te permitirá diagnosticar exactamente cuál es el problema y te guiará en la solución.

**No importa si no recordás la contraseña exacta**: simplemente generá un nuevo hash con una nueva contraseña y actualizá Vercel.
