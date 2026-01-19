# Guía Rápida: Fix Usuarios Empresa 37 con SQL Directo

## 🎯 Objetivo
Sincronizar usuarios de empresa 37 desde BD Central al branch dedicado, sin tener que registrarte de nuevo.

## 📋 Pasos

### PASO 1: Obtener datos de BD Central ⚡

1. Ir a **Neon Console** → Tu proyecto → **SQL Editor**
2. **Importante:** Seleccionar la BD **CENTRAL** (no el branch)
3. Ejecutar este query:

```sql
-- Ver usuarios de empresa 37 en BD Central
SELECT 
  id,
  email,
  password_hash,
  nombre,
  rol
FROM usuarios_sistema
WHERE empresa_id = 37
ORDER BY id ASC;
```

4. **COPIAR** los resultados (especialmente `id`, `email`, `password_hash`, `nombre`, `rol`)

**Ejemplo de resultado:**
```
id  | email              | password_hash                        | nombre      | rol
----|--------------------|------------------------------------- |-------------|-------
73  | admin@test.com     | $2a$10$xyz...abc                       | Admin 37    | admin
74  | operador@test.demo | $2a$10$def...ghi                       | Operador    | operador
```

---

### PASO 2: Insertar usuarios en el branch dedicado 🔧

1. En **Neon Console**, cambiar a tu **branch de empresa 37**
   - Buscar branch con nombre similar al slug de tu empresa
   - O buscar en la tabla `empresas` de BD Central el campo `branch_name`
   
2. En el **SQL Editor** del branch, ejecutar:

```sql
-- Verificar estado actual (debería estar vacío o incompleto)
SELECT id, email, nombre, rol FROM usuarios ORDER BY id;

-- Insertar usuarios (REEMPLAZAR con tus valores del PASO 1)
INSERT INTO usuarios (id, email, password_hash, nombre, rol, activo, fecha_creacion)
VALUES 
  (73, 'TU_EMAIL_AQUI', 'TU_PASSWORD_HASH_AQUI', 'TU_NOMBRE_AQUI', 'admin', true, NOW()),
  (74, 'operador@tuslug.demo', 'PASSWORD_HASH_OPERADOR', 'Operador Demo', 'operador', true, NOW())
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  nombre = EXCLUDED.nombre,
  rol = EXCLUDED.rol,
  activo = EXCLUDED.activo;

-- Actualizar secuencia
SELECT setval('usuarios_id_seq', 74);

-- Verificar que se insertaron
SELECT id, email, nombre, rol, activo FROM usuarios ORDER BY id;
```

---

### PASO 3: Probar el registro de autos 🚗

1. Refrescar tu app en el navegador
2. Ir a la página principal
3. Intentar registrar un auto
4. **✅ Debería funcionar sin error de FK**

---

## 🆘 Si no tenés acceso a Neon Console

### Alternativa: Usar el endpoint de sincronización

Una vez que Vercel termine el deploy (verificá en https://vercel.com/dashboard):

1. Abrir **DevTools Console (F12)** en tu app
2. Ejecutar:

```javascript
const authToken = localStorage.getItem('authToken');

fetch('/api/admin/sincronizar-usuarios', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${authToken}` }
})
  .then(res => res.json())
  .then(data => {
    console.log('✅ Resultado:', data);
    if (data.success) {
      alert('✅ Usuarios sincronizados! Ahora podés registrar autos.');
      location.reload();
    }
  });
```

---

## 🔍 Debugging: ¿Por qué falló la sincronización automática?

El código de [`app/api/registro/route.ts`](app/api/registro/route.ts:206) tiene un `try/catch` en las líneas 206-248 que:

1. **Intenta** crear usuarios en el branch después de crear la empresa
2. **Si falla** (por ejemplo, error de conexión, timeout, etc.), solo logea el error
3. **No detiene** el registro de la empresa (para no bloquear al usuario)

**Posibles razones del fallo:**
- Timeout en la conexión al branch
- Branch URL no disponible inmediatamente después de crearse
- Error en la importación dinámica de `@neondatabase/serverless`
- Permisos insuficientes en el branch recién creado

**Log esperado en Vercel:** 
```
[Registro] ⚠️ Error al crear usuarios en branch: [mensaje del error]
```

---

## 📊 Verificación Final

Después de ejecutar el SQL, verificá:

```sql
-- En el branch dedicado
SELECT 
  COUNT(*) as total_usuarios,
  COUNT(*) FILTER (WHERE rol = 'admin') as admins,
  COUNT(*) FILTER (WHERE rol = 'operador') as operadores
FROM usuarios;

-- Debería mostrar:
-- total_usuarios | admins | operadores
-- ---------------|--------|------------
-- 2              | 1      | 1
```

---

## ✅ Checklist

- [ ] Ejecuté query en BD Central y copié los datos
- [ ] Identifiqué el branch correcto de mi empresa
- [ ] Ejecuté el INSERT en el branch dedicado
- [ ] Verifiqué que los usuarios se insertaron correctamente
- [ ] Actualicé la secuencia con `setval`
- [ ] Probé registrar un auto en la app
- [ ] ✅ Funciona sin error de FK

---

## 🚀 Prevención Futura

Para empresas NUEVAS que se registren después del próximo deploy, el código automático debería funcionar porque:

1. Ya está implementado en `/api/registro` (commit `4530189`)
2. Los cambios de hoy mejoran la compatibilidad
3. El endpoint `/api/admin/sincronizar-usuarios` está disponible como fallback

Para tu empresa 37, una vez que ejecutes el SQL manual, quedará sincronizada permanentemente.
