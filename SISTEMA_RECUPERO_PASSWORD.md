# Sistema de Recupero de Contraseña - LAVAPP SaaS

## 📋 Descripción General

Sistema completo de recuperación de contraseña con tokens seguros de un solo uso, válidos por 1 hora.

## 🏗️ Arquitectura

### Base de Datos (Central)

**Nueva tabla**: `password_reset_tokens`
```sql
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES usuarios_sistema(id),
    token VARCHAR(100) UNIQUE,
    expires_at TIMESTAMP,
    used BOOLEAN DEFAULT FALSE,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### APIs Backend

#### 1. POST `/api/auth/forgot-password`
**Input**: `{ email: string }`
**Output**: Siempre success (por seguridad)

**Proceso**:
1. Busca usuario por email en BD Central
2. Genera token UUID v4 único
3. Guarda token con expiración de 1 hora
4. Envía email con link de reseteo (o lo loguea en development)

**Seguridad**: No revela si el email existe (previene enumeración de usuarios)

#### 2. POST `/api/auth/reset-password`
**Input**: `{ token: string, newPassword: string }`
**Output**: `{ success: boolean, message: string, email?: string }`

**Proceso**:
1. Valida que el token existe
2. Verifica que no haya sido usado
3. Verifica que no haya expirado
4. Hashea la nueva contraseña con bcrypt
5. Actualiza password_hash del usuario
6. Marca el token como usado

**Validaciones**:
- Token válido y no expirado
- Contraseña mínimo 6 caracteres
- Token no usado previamente

### Frontend

#### 1. `/forgot-password` - Solicitar recuperación
- Formulario simple con email
- Mensaje de confirmación sin revelar si existe
- Link de vuelta al login

#### 2. `/reset-password/[token]` - Cambiar contraseña
- Formulario con nueva contraseña y confirmación
- Validación en tiempo real
- Redirige al login automáticamente después de éxito

#### 3. `/login-saas` - Login actualizado
- Link funcional a "¿Olvidaste tu contraseña?"
- Redirige a `/forgot-password`

## 🔐 Seguridad

### Tokens
- **UUID v4**: Imposible de adivinar (128 bits de entropía)
- **Un solo uso**: Marcado como `used` después de utilizarse
- **Tiempo limitado**: Válido por 1 hora desde creación
- **Stored hashed**: Aunque UUID ya es seguro

### Privacidad
- **No revela emails**: Siempre retorna éxito
- **Rate limiting**: (TODO: implementar para producción)

### Contraseñas
- **Bcrypt con salt**: Factor 10
- **Validación mínima**: 6 caracteres
- **Hash irreversible**: No se puede recuperar la contraseña anterior

## 📧 Integración con Email

### Development Mode
Por ahora, el link se loguea en consola del servidor:
```javascript
console.log('Link de reseteo:', resetLink);
```

### Production Mode (Resend)
Descomentar en [`/api/auth/forgot-password/route.ts`](app/api/auth/forgot-password/route.ts:62):

```typescript
const { Resend } = await import('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

await resend.emails.send({
  from: 'LAVAPP <noreply@lavapp.com.ar>',
  to: email,
  subject: 'Recuperá tu contraseña - LAVAPP',
  html: `...`
});
```

**Variables de entorno necesarias**:
```env
RESEND_API_KEY=re_xxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://lavapp-pi.vercel.app
```

## 📦 Archivos Creados

### Migración SQL
- [`migration-password-reset-tokens.sql`](migration-password-reset-tokens.sql:1) - Crear tabla

### APIs Backend
- [`app/api/auth/forgot-password/route.ts`](app/api/auth/forgot-password/route.ts:1) - Solicitar recuperación
- [`app/api/auth/reset-password/route.ts`](app/api/auth/reset-password/route.ts:1) - Resetear contraseña

### Frontend
- [`app/forgot-password/page.tsx`](app/forgot-password/page.tsx:1) - Página solicitar recuperación
- [`app/reset-password/[token]/page.tsx`](app/reset-password/[token]/page.tsx:1) - Página cambiar contraseña
- [`app/login-saas/page.tsx`](app/login-saas/page.tsx:131) - Actualizado con link funcional

## 🚀 Pasos para Deploy

### 1. Ejecutar migración en Neon
```bash
# Conectar a Neon (branch "central")
# Ejecutar migration-password-reset-tokens.sql
```

### 2. Hacer commit y push
```bash
git add .
git commit -m "feat: password reset system with secure tokens"
git push
```

### 3. Configurar Resend (opcional, para emails)
1. Crear cuenta en https://resend.com
2. Obtener API key
3. Agregar a Vercel:
   - `RESEND_API_KEY=re_xxxxxxxxxxxx`
   - `NEXT_PUBLIC_APP_URL=https://lavapp-pi.vercel.app`

### 4. Testing

#### En Development:
1. Ir a `/forgot-password`
2. Ingresar email
3. Ver link en consola del servidor
4. Copiar y pegar en navegador
5. Cambiar contraseña

#### En Production (sin Resend):
- Mismo flujo, pero el link estará en los logs de Vercel
- Podés verlo en: Vercel Dashboard → Deployments → Functions

#### En Production (con Resend):
- El email llegará a la casilla del usuario
- Link funcional por 1 hora

## 🧪 Testing Manual

### Test 1: Flujo completo exitoso
```
1. POST /api/auth/forgot-password con email válido
   ✓ Success: true
   ✓ Message: "Si el email existe..."
   
2. Copiar token del log/email

3. GET /reset-password/[token]
   ✓ Página carga correctamente
   
4. POST /api/auth/reset-password con token y password
   ✓ Success: true
   ✓ Contraseña actualizada
   
5. Login con nueva contraseña
   ✓ Login exitoso
```

### Test 2: Token expirado
```
1. Crear token con expires_at en el pasado
2. Intentar resetear
   ✓ Error: "Este link ha expirado"
```

### Test 3: Token ya usado
```
1. Usar un token exitosamente
2. Intentar usarlo de nuevo
   ✓ Error: "Este link ya fue utilizado"
```

### Test 4: Email no existe
```
1. POST /api/auth/forgot-password con email inexistente
   ✓ Success: true (no revela que no existe)
   ✓ No se envía email
```

### Test 5: Contraseña débil
```
1. Intentar password con < 6 caracteres
   ✓ Error: "debe tener al menos 6 caracteres"
```

## 🎯 Mejoras Futuras

### Seguridad
- [ ] Rate limiting (máx 3 intentos por hora por IP)
- [ ] CAPTCHA para prevenir bots
- [ ] 2FA opcional

### UX
- [ ] Fuerza de contraseña visual
- [ ] Requisitos de contraseña configurables
- [ ] Historial de contraseñas (no permitir reutilizar)

### Notificaciones
- [ ] Email cuando se cambia la contraseña exitosamente
- [ ] Alerta si se intenta recuperar sin solicitarlo

### Monitoreo
- [ ] Logs de intentos de recuperación
- [ ] Alertas por intentos sospechosos
- [ ] Métricas en dashboard admin

## 📊 Métricas

Una vez en producción, monitorear:
- Cantidad de recuperaciones exitosas vs fallidas
- Tiempo promedio entre solicitud y uso del token
- Tokens expirados sin usar
- Intentos de uso de tokens inválidos

## 🔗 Links Relacionados

- [FIX_PWA_LOGIN_ISSUE.md](FIX_PWA_LOGIN_ISSUE.md:1) - Fix del problema de login en PWA
- [SPRINT_1_PLAN_IMPLEMENTACION.md](plans/SPRINT_1_PLAN_IMPLEMENTACION.md:1) - Plan de mejoras SaaS

---

**Fecha de implementación**: 2026-02-04  
**Versión**: v1.0  
**Status**: ✅ Listo para deploy
