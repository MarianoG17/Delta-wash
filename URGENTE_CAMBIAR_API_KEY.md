# 🚨 URGENTE: Cambiar API Key de Neon

**Fecha:** 17 de enero de 2026  
**Prioridad:** CRÍTICA  
**Motivo:** API key expuesta en `SOLUCION_ERROR_API_NEON.md` que se subió a GitHub

---

## 📋 Resumen del Problema

La API key de Neon está visible en:
- ❌ **`SOLUCION_ERROR_API_NEON.md`** (línea 190) - Subido a GitHub
- ✅ `.env.local` (línea 24) - NO subido (está en `.gitignore`)

Vercel también detectó la API key expuesta en el código público.

---

## ⚡ Acción Inmediata (HACER AHORA)

### 1. Generar Nueva API Key en Neon

1. **Ir a Neon Console:**
   ```
   https://console.neon.tech/app/settings/api-keys
   ```

2. **Revocar la API key comprometida:**
   - Buscar: `napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8`
   - Click en "Revoke" o eliminarla

3. **Crear nueva API key:**
   - Click en "Create new API key"
   - Darle un nombre descriptivo: `lavapp-production-api-key`
   - Copiar la nueva key (solo se muestra una vez)

---

### 2. Actualizar Variables de Entorno Local

**Archivo: `.env.local`**

Actualizar la línea 24 con la nueva API key:

```bash
# ANTES (COMPROMETIDA):
NEON_API_KEY="napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8"

# DESPUÉS (NUEVA):
NEON_API_KEY="napi_TU_NUEVA_API_KEY_AQUI"
```

---

### 3. Actualizar Variables en Vercel (PRODUCCIÓN)

⚠️ **IMPORTANTE**: Si ya deployaste a Vercel, actualizar ahí también:

1. **Ir a tu proyecto en Vercel:**
   ```
   https://vercel.com/tu-usuario/tu-proyecto/settings/environment-variables
   ```

2. **Actualizar `NEON_API_KEY`:**
   - Buscar la variable `NEON_API_KEY`
   - Click en "Edit"
   - Pegar la nueva API key
   - Guardar

3. **Re-deployar:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy after API key update"
   git push
   ```

---

### 4. Limpiar el Archivo de Documentación

**Archivo: `SOLUCION_ERROR_API_NEON.md`**

Eliminar la API key de las líneas 189-192. Reemplazar:

```bash
# ANTES (líneas 189-192):
```bash
NEON_API_KEY="napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8"
NEON_PROJECT_ID="hidden-queen-29389003"
CENTRAL_DB_URL="postgresql://neondb_owner:xxx@ep-xxx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

# DESPUÉS (usar placeholders):
```bash
NEON_API_KEY="napi_TU_API_KEY_DE_NEON"
NEON_PROJECT_ID="tu-project-id"
CENTRAL_DB_URL="postgresql://neondb_owner:xxx@ep-xxx-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
```
```

---

### 5. Limpiar Historial de Git (Opcional pero Recomendado)

Si querés eliminar la API key del historial de Git completamente:

```bash
# Usar BFG Repo Cleaner (más fácil) o git-filter-branch

# Opción 1: BFG (recomendado)
# Descargar: https://rtyley.github.io/bfg-repo-cleaner/

bfg --replace-text api-keys.txt
git reflog expire --expire=now --all && git gc --prune=now --aggressive
git push --force

# Donde api-keys.txt contiene:
napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8
```

---

## 🔒 Mejores Prácticas para el Futuro

### 1. Nunca Hardcodear API Keys en Documentación

❌ **MAL:**
```markdown
NEON_API_KEY="napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8"
```

✅ **BIEN:**
```markdown
NEON_API_KEY="napi_TU_API_KEY_AQUI"
```

### 2. Usar `.env.example` para Templates

El archivo [`.env.example`](.env.example) ya tiene el formato correcto:

```bash
NEON_API_KEY="tu_api_key_aqui"
NEON_PROJECT_ID="tu_project_id_aqui"
```

### 3. Verificar Antes de Commitear

Agregar a `.gitignore` archivos sensibles:

```
# Ya está configurado:
.env*.local
.env

# Considerar agregar:
**/NOTAS_PRIVADAS*.md
```

### 4. Escanear Automáticamente

Usar herramientas como:
- **git-secrets**: Previene commits con secretos
- **gitleaks**: Escanea repositorio
- **GitHub Secret Scanning**: Ya habilitado en GitHub (por eso te avisaron)

---

## 🧪 Verificar que Funciona

Después de cambiar la API key, probar:

1. **Test local:**
   ```bash
   npm run dev
   ```

2. **Ir a:** `http://localhost:3000/registro`

3. **Crear una empresa de prueba:**
   - Nombre: "Test Nueva API Key"
   - Email: test@example.com
   - Contraseña: test123

4. **Verificar logs:**
   ```
   [Neon API] Creando branch: test-nueva-api-key
   [Neon API] Branch creado exitosamente: br-xxx
   ✅ Empresa registrada correctamente
   ```

---

## 📊 Checklist de Seguridad

- [ ] Nueva API key generada en Neon
- [ ] API key antigua revocada en Neon
- [ ] `.env.local` actualizado con nueva key
- [ ] Variables en Vercel actualizadas
- [ ] Vercel re-deployado
- [ ] `SOLUCION_ERROR_API_NEON.md` limpiado
- [ ] Commit con cambios subido
- [ ] Historial de Git limpiado (opcional)
- [ ] Funcionamiento verificado en desarrollo
- [ ] Funcionamiento verificado en producción

---

## ❓ FAQ

### ¿Por qué Vercel detectó la API key?

Vercel (y GitHub) escanean automáticamente el código en busca de secrets. Si encuentran patrones como `napi_xxx` (formato de Neon API keys), envían alertas.

### ¿Es suficiente con revocar la key?

Sí, revocar la key hace que deje de funcionar inmediatamente. Sin embargo, limpiar el historial de Git es recomendado para que nadie pueda verla en commits antiguos.

### ¿Qué pasa si alguien ya copió la key?

Si la key ya fue expuesta públicamente en GitHub, asumir que está comprometida. Por eso es crítico:
1. Revocarla INMEDIATAMENTE
2. Generar una nueva
3. NO reutilizar nunca más esa key

---

## 📞 Contacto de Emergencia

Si tuviste algún acceso no autorizado a tu base de datos Neon:

1. **Revisar logs de Neon:**
   ```
   https://console.neon.tech/app/projects/hidden-queen-29389003/branches
   ```

2. **Verificar branches creados recientemente:**
   - Si hay branches que no reconocés, eliminarlos

3. **Cambiar también:**
   - Password de cuenta Neon
   - 2FA habilitado en Neon (recomendado)

---

## ✅ Estado Actual

**API Key Comprometida:**
```
napi_8knk7pkuq6qe7p7hmhdhnpg6yywsa16l4p8epj9xk8ppdfzhepyz88yk00t882d8
```

**Acción:** ⚠️ REVOCAR INMEDIATAMENTE

**Próximos Pasos:**
1. Generar nueva key
2. Actualizar en `.env.local` y Vercel
3. Limpiar documentación
4. Verificar funcionamiento
5. Commit y push

---

**Última actualización:** 17 de enero de 2026
