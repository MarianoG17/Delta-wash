# Resumen: Fix Registro de Autos y Redirección de Usuarios

## Fecha: 2026-01-18

## Problemas Identificados

### 1. ❌ Error al Registrar Autos (CRÍTICO)
**Error:** `insert or update on table "registros_lavado" violates foreign key constraint "registros_lavado_usuario_id_fkey"`
- **Causa:** Usuario ID 73 existe en BD Central (`usuarios_sistema`) pero NO en la tabla `usuarios` del branch de empresa 37
- **Impacto:** No se pueden registrar autos en el sistema

### 2. ❌ Redirección Incorrecta en Gestión de Usuarios
**Error:** Al volver de `/usuarios`, redirecciona a `/login-saas` 
- **Causa:** Hardcoded redirect en línea 31 de `app/usuarios/page.tsx`
- **Impacto:** Mala experiencia de usuario, pierde la sesión al navegar

## Soluciones Implementadas

### ✅ Fix 1: Redirección Correcta (app/usuarios/page.tsx)
**Antes:**
```typescript
if (!user) {
  router.push('/login-saas');  // ❌ Hardcoded
  return;
}
```

**Después:**
```typescript
import { getAuthUser, clearAuth, getLoginUrl } from '@/lib/auth-utils';

if (!user) {
  router.push(getLoginUrl());  // ✅ Detecta automáticamente tipo de usuario
  return;
}
```

**Beneficio:** Respeta la autenticación dual (SaaS vs DeltaWash legacy)

### ✅ Fix 2: Endpoint de Sincronización (app/api/admin/sincronizar-usuarios/route.ts)
**Funcionalidad:**
- Copia usuarios desde BD Central (`usuarios_sistema`) al branch dedicado de la empresa
- Evita duplicados (solo crea usuarios que NO existen en el branch)
- Actualiza la secuencia de IDs para prevenir conflictos futuros

**Proceso:**
1. Autentica al usuario con JWT
2. Consulta usuarios de la empresa en BD Central
3. Verifica cuáles ya existen en el branch
4. Inserta solo los usuarios faltantes
5. Actualiza `usuarios_id_seq` al máximo ID

**Endpoint:** `POST /api/admin/sincronizar-usuarios`
- Requiere autenticación Bearer token
- Solo para administradores SaaS
- Automático: detecta la empresa del token

## Deployment

**Commit:** `5ec104b`
**Mensaje:** "Fix: Corregir redirección en usuarios y agregar endpoint sincronización usuarios"
**Push:** ✅ Completado a `main` branch
**Vercel:** 🔄 Deploy automático en progreso

## Próximos Pasos

### 1. Esperar Deploy de Vercel ⏳
- Verificar en: https://vercel.com/dashboard
- Tiempo estimado: 2-3 minutos

### 2. Ejecutar Sincronización de Usuarios 🔧

Una vez que el deploy esté completo:

**Opción A: Desde el navegador (Recomendado)**
```javascript
// Abrir DevTools Console (F12) en https://app-lavadero-git-main-marianogonzalezs-projects.vercel.app
const authToken = localStorage.getItem('authToken');

fetch('/api/admin/sincronizar-usuarios', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${authToken}`
  }
})
  .then(res => res.json())
  .then(data => console.log('✅ Resultado:', data))
  .catch(err => console.error('❌ Error:', err));
```

**Opción B: Desde terminal con curl**
```bash
# Primero obtener tu token
# Desde la consola del navegador: console.log(localStorage.getItem('authToken'))

curl -X POST https://app-lavadero-git-main-marianogonzalezs-projects.vercel.app/api/admin/sincronizar-usuarios \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json"
```

### 3. Verificar Resultado ✅

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Sincronización completada: N usuarios creados",
  "detalles": {
    "usuarios_en_central": 2,
    "usuarios_en_branch_antes": 0,
    "usuarios_creados": 2,
    "usuarios_ya_existentes": 0
  }
}
```

### 4. Probar Registro de Autos 🚗

Después de la sincronización:
1. Ir a la página principal
2. Intentar registrar un auto
3. Verificar que se registre exitosamente sin errores de FK

## Arquitectura del Fix

```
┌─────────────────────────────────────────────────────────────┐
│                      BD CENTRAL (Neon)                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │  usuarios_sistema                                   │    │
│  │  - id: 73                                          │    │
│  │  - email: admin@empresa37.com                      │    │
│  │  - empresa_id: 37                                  │    │
│  │  - rol: admin                                       │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Sincronización
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              BRANCH DEDICADO - Empresa 37                    │
│  ┌────────────────────────────────────────────────────┐    │
│  │  usuarios (ANTES: VACÍA ❌)                        │    │
│  │  - Sin usuarios                                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  usuarios (DESPUÉS: ✅)                             │    │
│  │  - id: 73                                          │    │
│  │  - email: admin@empresa37.com                      │    │
│  │  - rol: admin                                       │    │
│  │  (+ otros usuarios si existen)                     │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  registros_lavado                                   │    │
│  │  - usuario_id (FK) → usuarios.id ✅                │    │
│  │  (Ahora puede insertar sin error FK)               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Prevención Futura

### ✅ Para Empresas NUEVAS
El fix en `/api/registro/route.ts` (commit `4530189`) ya crea usuarios automáticamente en el branch cuando se registra una empresa nueva.

### ✅ Para Empresas EXISTENTES
Usar el endpoint `/api/admin/sincronizar-usuarios` para sincronizar usuarios faltantes.

### 🔄 Consideración Futura
Si se crean usuarios nuevos en una empresa existente, ejecutar la sincronización nuevamente.

## Testing

### Test 1: Redirección de Usuarios ✅
1. Login como admin
2. Ir a `/usuarios`
3. Click en "← Volver"
4. **Resultado esperado:** Redirige a `/home` (no a `/login-saas`)

### Test 2: Registro de Autos ⏳ (Después de sincronización)
1. Login como admin (ID 73, Empresa 37)
2. Ir a página principal
3. Completar formulario de registro
4. Submit
5. **Resultado esperado:** Auto registrado exitosamente sin error de FK

## Información Técnica

**Usuario Actual:**
- ID: 73
- Empresa ID: 37
- Problema: Usuario 73 no existe en branch de empresa 37

**Archivos Modificados:**
1. `app/usuarios/page.tsx` - Fix redirección
2. `app/api/admin/sincronizar-usuarios/route.ts` - Nuevo endpoint

**Commits:**
- `5ec104b`: Fix redirección y endpoint sincronización

## Notas

- ⚠️ El endpoint de sincronización es IDEMPOTENTE (se puede ejecutar varias veces sin problemas)
- ✅ Solo crea usuarios que NO existen en el branch
- ✅ Mantiene los mismos IDs entre BD Central y branch
- ✅ Actualiza secuencia para evitar conflictos futuros
- 🔒 Requiere autenticación admin

## Contacto

Si hay problemas:
1. Verificar logs de Vercel
2. Verificar que el token sea válido
3. Verificar que el usuario sea admin
4. Revisar console.log en navegador

---

**Estado Actual:** ✅ Código pusheado, esperando deploy de Vercel
**Siguiente paso:** Ejecutar endpoint de sincronización una vez que deploy esté completo
