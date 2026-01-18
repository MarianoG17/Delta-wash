# Sistema de Protección de Secrets

Este documento explica el sistema multinivel implementado para evitar la exposición accidental de secrets (API keys, passwords, tokens) en el repositorio.

## ⚠️ Por Qué es Importante

GitGuardian y otros servicios escanean repositorios públicos buscando secrets expuestos. Si detectan una API key:
- ✉️ Envían alertas de seguridad
- 🚨 La key queda comprometida públicamente
- 🔄 Hay que revocarla y actualizarla en todos los servicios

## 🛡️ Capas de Protección Implementadas

### 1. `.gitignore` - Primera Línea de Defensa

Archivo: [`.gitignore`](.gitignore)

```gitignore
# Archivos de entorno (NUNCA deben subirse)
.env*.local
.env
```

**Qué hace:** Previene que archivos con secrets se agreguen a Git.

**Limitación:** Solo funciona si NUNCA agregas el archivo manualmente con `git add -f`

### 2. `.gitattributes` - Protección Extra

Archivo: [`.gitattributes`](.gitattributes)

```gitattributes
# Archivos de configuración sensibles
.env filter=git-secrets
.env.local filter=git-secrets
.env.*.local filter=git-secrets

# Documentos que podrían contener keys
*KEY*.md filter=git-secrets-docs
*SECRET*.md filter=git-secrets-docs
```

**Qué hace:** Marca archivos específicos para aplicar filtros personalizados.

### 3. Pre-Commit Hook con Husky - Detección Automática

Archivo: [`.husky/pre-commit`](.husky/pre-commit)

**Qué hace:** 
- Se ejecuta ANTES de cada commit
- Escanea los archivos que vas a commitear
- Detecta patrones de secrets (API keys, tokens, passwords)
- BLOQUEA el commit si detecta algo sospechoso

**Patrones detectados:**
- `napi_[a-zA-Z0-9]{40,}` - Neon API keys
- `postgresql://user:password@host` - Connection strings con password
- `JWT_SECRET: "value"` - JWT secrets
- `Bearer xxxxx` - Bearer tokens
- `sk_live_xxxx` - Stripe keys
- `AKIA...` - AWS Access Keys

**Uso:**
```bash
git add archivo.ts
git commit -m "mensaje"
# → El hook se ejecuta automáticamente
# → Si detecta un secret, BLOQUEA el commit
```

## 🔧 Activar el Sistema

### Instalación (Ya hecha)

```bash
# Paquete instalado
npm install --save-dev husky

# Hook creado en .husky/pre-commit
# Git configurado para usar hooks
```

### Configurar Husky (Si es necesario)

```bash
# Inicializar Husky
npx husky install

# Hacer el hook ejecutable (Linux/Mac)
chmod +x .husky/pre-commit
```

## ✅ Buenas Prácticas

### ❌ NUNCA Hacer Esto

```typescript
// ❌ MAL - API key hardcodeada
const apiKey = "napi_abc123...";

// ❌ MAL - Connection string con password
const db = "postgresql://user:password@host/db";

// ❌ MAL - Secret en archivo .md
# Mi API Key: napi_abc123...
```

### ✅ SIEMPRE Hacer Esto

```typescript
// ✅ BIEN - Usar variable de entorno
const apiKey = process.env.NEON_API_KEY;

// ✅ BIEN - Connection string sin exponer password
const db = process.env.DATABASE_URL;

// ✅ BIEN - Documentar SIN el valor real
# Configurar NEON_API_KEY en Vercel
```

### Dónde Guardar Secrets

1. **Desarrollo Local**: `.env.local` (ignorado por Git)
2. **Producción**: Vercel Environment Variables
3. **Documentación**: `README.md` con INSTRUCCIONES, sin valores

## 🚨 Si el Hook Detecta un Secret

Verás esto:

```bash
❌ ALERTA: Posible secret detectado en lib/config.ts
   Patrón: napi_[a-zA-Z0-9]{40,}

🚫 COMMIT BLOQUEADO - Se detectaron posibles secrets

📝 Soluciones:
1. Remover el secret del archivo
2. Usar variables de entorno (process.env.VARIABLE_NAME)
3. Agregar el archivo a .gitignore si contiene secrets
4. Si es un falso positivo, revisar manualmente
```

**Qué hacer:**
1. **NO ignores la alerta**
2. Revisá el archivo mencionado
3. Reemplazá el secret por `process.env.NOMBRE_VARIABLE`
4. Agregá la variable a `.env.local` (local) y Vercel (producción)
5. Volvé a intentar el commit

## 🔄 Qué Hacer Si Ya Expusiste un Secret

### 1. Revocar INMEDIATAMENTE

- **Neon API Key**: 
  - Ir a Neon Console → Settings → API Keys
  - Revocar la key expuesta
  - Generar nueva key

### 2. Actualizar en Vercel

- Ir a Vercel → Settings → Environment Variables
- Actualizar con la nueva key
- Redeploy

### 3. NUNCA hacer esto

❌ NO intentes "arreglar" el commit:
```bash
# ❌ MAL - El secret ya está en el historial de Git
git commit --amend
git push --force
```

El secret ya está en el historial público de GitHub. Hay que:
1. Revocar el secret
2. Generar uno nuevo
3. Seguir adelante

## 📋 Checklist de Seguridad

Antes de cada commit, verificá:

- [ ] No hay API keys hardcodeadas
- [ ] No hay passwords en el código
- [ ] No hay connection strings con credenciales
- [ ] Archivos `.env*` están en `.gitignore`
- [ ] Variables sensibles usan `process.env.X`
- [ ] Documentación NO contiene valores reales

## 🔍 Verificación Manual

Si querés verificar manualmente antes de commitear:

```bash
# Buscar posibles API keys de Neon
git diff --cached | grep -i "napi_"

# Buscar connection strings
git diff --cached | grep -i "postgresql://"

# Buscar secrets en archivos staged
git diff --cached | grep -i "secret"
```

## 📚 Más Información

- [GitHub: Removing sensitive data](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [GitGuardian: Best practices](https://www.gitguardian.com/secrets-detection)
- [Vercel: Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 🎯 Resultado

Con este sistema multinivel:
- ✅ Pre-commit hook detecta secrets ANTES de subir
- ✅ `.gitignore` previene archivos sensibles
- ✅ `.gitattributes` marca archivos problemáticos
- ✅ Buenas prácticas documentadas
- ✅ Checklist de seguridad disponible

**El sistema NO es infalible**, pero reduce drásticamente el riesgo de exposición accidental.
