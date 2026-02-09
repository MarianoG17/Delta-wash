# 🚨 ERROR 500: Variables de Entorno NO Configuradas en Vercel

## 🔍 Problema Identificado

El error **500 (Internal Server Error)** significa que las variables de entorno **NO ESTÁN CONFIGURADAS** en Vercel, o están vacías.

El código está fallando en esta validación:
```javascript
if (!SUPER_ADMIN_EMAIL || !SUPER_ADMIN_PASSWORD_HASH) {
    return NextResponse.json({ error: 'Super admin not configured' }, { status: 500 });
}
```

## ✅ Solución: Verificar y Configurar Variables

### Paso 1: Ir a Variables de Entorno en Vercel

1. Abrir: https://vercel.com/marianog17s-projects/delta-wash/settings/environment-variables
   
   *(O navegar manualmente: Tu Proyecto → Settings → Environment Variables)*

2. Verificar que existan estas 2 variables:
   - `SUPER_ADMIN_EMAIL`
   - `SUPER_ADMIN_PASSWORD_HASH`

### Paso 2: Verificar Estado de las Variables

Revisá cada variable y anotá:

| Variable | ¿Existe? | ¿Tiene Valor? | Longitud Aprox |
|----------|----------|---------------|----------------|
| `SUPER_ADMIN_EMAIL` | ⬜ Sí / ⬜ No | ⬜ Sí / ⬜ No | ___ caracteres |
| `SUPER_ADMIN_PASSWORD_HASH` | ⬜ Sí / ⬜ No | ⬜ Sí / ⬜ No | ___ caracteres |

### Paso 3A: Si NO Existen → Crearlas

Si las variables no existen, necesitás crearlas:

#### 3A.1: Generar el Hash

En PowerShell local:
```bash
node scripts/generate-super-admin-hash.js
```

Te va a dar algo como:
```
Hash:
$2a$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNO
```

**Copiá el hash completo** (todo lo que está después de "Hash:")

#### 3A.2: Crear Variables en Vercel

1. En Vercel → Environment Variables → Add New

2. **Primera variable**:
   - **Key**: `SUPER_ADMIN_EMAIL`
   - **Value**: `admin@lavapp.ar` (o el email que quieras usar)
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

3. **Segunda variable**:
   - **Key**: `SUPER_ADMIN_PASSWORD_HASH`
   - **Value**: [Pegá el hash del paso 3A.1]
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
   - Click **Save**

### Paso 3B: Si SÍ Existen → Verificar Valores

Si las variables existen pero sigue fallando:

#### Verificar `SUPER_ADMIN_EMAIL`
1. Click en los 3 puntitos → Edit
2. Verificar que tenga un email válido
3. Anotar exactamente qué email es (lo vas a necesitar para el login)

#### Verificar `SUPER_ADMIN_PASSWORD_HASH`
1. Click en los 3 puntitos → Edit
2. Verificar que:
   - ✅ Tenga aproximadamente 60 caracteres
   - ✅ Empiece con `$2a$`, `$2b$` o `$2y$`
   - ✅ No tenga espacios al inicio ni al final

**Si el hash está mal**, borralo y creá uno nuevo (volver al Paso 3A.1)

### Paso 4: Verificar Environments

**IMPORTANTE**: Las variables deben estar en **Production**

Para cada variable:
1. Click en los 3 puntitos → Edit
2. Verificar que esté marcado: ✅ **Production**
3. Si no está marcado, marcarlo y Save

### Paso 5: Re-Deploy

**Después de cualquier cambio en variables**, hacer un re-deploy:

#### Opción A: Desde Vercel Dashboard
1. Ir a: Deployments
2. Click en el último deploy exitoso
3. Click en los 3 puntitos (...)
4. Click **Redeploy**
5. Confirmar

#### Opción B: Desde Git (Más rápido)
```bash
git commit --allow-empty -m "Trigger redeploy after env vars update"
git push
```

### Paso 6: Esperar y Verificar

1. Esperar 2-3 minutos a que termine el deploy
2. Ir a: https://lavapp.ar/super-admin
3. Intentar login con:
   - **Email**: El que pusiste en `SUPER_ADMIN_EMAIL`
   - **Password**: La que usaste para generar el hash

## 🔍 Verificar Logs en Vercel

Si después del re-deploy sigue fallando:

1. Ir a: Deployments → [último deploy] → View Function Logs
2. Hacer un intento de login en https://lavapp.ar/super-admin
3. Volver a los logs y buscar:

```
🔐 Super Admin Login Attempt:
   - Email provided: ...
   - Expected email: ...
   - Email match: true/false
   - Hash configured: true/false
   - Hash length: ...
```

Esto te dirá **exactamente** qué está fallando.

## 📋 Checklist Final

Antes de probar el login, verificar:

- [ ] La variable `SUPER_ADMIN_EMAIL` existe y tiene un valor
- [ ] La variable `SUPER_ADMIN_PASSWORD_HASH` existe y tiene un valor
- [ ] El hash tiene ~60 caracteres y empieza con `$2a$`, `$2b$` o `$2y$`
- [ ] Ambas variables están en **Production**
- [ ] Hiciste un re-deploy después de los cambios
- [ ] Esperaste 2-3 minutos después del re-deploy
- [ ] Sabés qué email y contraseña usar para el login

## 💡 Casos Comunes

### Caso 1: "Borré y volví a crear las variables pero sigue fallando"

**Problema**: No hiciste re-deploy después de cambiarlas

**Solución**: 
```bash
git commit --allow-empty -m "Force redeploy"
git push
```

### Caso 2: "Las variables existen pero me dice error 500"

**Problema**: Las variables no están en Production o están vacías

**Solución**: Editar cada variable → Marcar ✅ Production → Save → Re-deploy

### Caso 3: "Hice todo pero sigue sin funcionar"

**Problema**: Puede ser un issue de caché

**Solución**:
1. En Vercel → Settings → General
2. Scroll hasta "Redeploy"
3. Click "Redeploy" con la opción "Use existing Build Cache" **DESMARCADA**
4. Esperar el nuevo deploy

## 🎯 Próximo Paso

Ejecutá los pasos 1-6 en orden y avisame en qué paso encontrás algún problema.
