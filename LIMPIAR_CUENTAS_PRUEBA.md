# 🗑️ Cómo Limpiar Cuentas de Prueba

## 📋 Guía para Eliminar Cuentas Antiguas

Si creaste cuentas de prueba antes de implementar la creación automática de branches, aquí está cómo eliminarlas.

---

## 🔍 Paso 1: Ver Todas las Empresas Registradas

### Opción A: Desde el navegador
```
https://tu-app.vercel.app/api/admin/limpiar-cuentas
```

### Opción B: Desde terminal (local)
```bash
curl http://localhost:3000/api/admin/limpiar-cuentas
```

### Opción C: Desde terminal (producción)
```bash
curl https://tu-app.vercel.app/api/admin/limpiar-cuentas
```

**Respuesta esperada:**
```json
{
  "success": true,
  "total": 3,
  "empresas": [
    {
      "id": 3,
      "nombre": "Test Lavadero",
      "slug": "test-lavadero",
      "branch_name": "test-lavadero",
      "plan": "trial",
      "estado": "activo",
      "total_usuarios": 2
    },
    {
      "id": 2,
      "nombre": "Mi Lavadero Viejo",
      "slug": "mi-lavadero-viejo",
      "branch_name": "mi-lavadero-viejo",
      "plan": "trial",
      "estado": "activo",
      "total_usuarios": 2
    }
  ]
}
```

---

## 🗑️ Paso 2: Eliminar una Empresa Específica

Una vez que tengas el `slug` de la empresa que querés eliminar:

### Opción A: Desde Postman/Insomnia
- **Method:** POST
- **URL:** `https://tu-app.vercel.app/api/admin/limpiar-cuentas`
- **Headers:** `Content-Type: application/json`
- **Body:**
```json
{
  "confirmacion": "ELIMINAR_CUENTA",
  "empresaSlug": "test-lavadero"
}
```

### Opción B: Desde terminal (local)
```bash
curl -X POST http://localhost:3000/api/admin/limpiar-cuentas \
  -H "Content-Type: application/json" \
  -d "{\"confirmacion\":\"ELIMINAR_CUENTA\",\"empresaSlug\":\"test-lavadero\"}"
```

### Opción C: Desde terminal (producción)
```bash
curl -X POST https://tu-app.vercel.app/api/admin/limpiar-cuentas \
  -H "Content-Type: application/json" \
  -d "{\"confirmacion\":\"ELIMINAR_CUENTA\",\"empresaSlug\":\"test-lavadero\"}"
```

### Opción D: Desde PowerShell (Windows)
```powershell
$body = @{
    confirmacion = "ELIMINAR_CUENTA"
    empresaSlug = "test-lavadero"
} | ConvertTo-Json

Invoke-RestMethod -Method Post -Uri "https://tu-app.vercel.app/api/admin/limpiar-cuentas" -Body $body -ContentType "application/json"
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Empresa \"test-lavadero\" eliminada exitosamente",
  "detalles": {
    "empresaId": 3,
    "slug": "test-lavadero",
    "branchName": "test-lavadero",
    "usuariosEliminados": 2,
    "emails": ["admin@test-lavadero.demo", "operador@test-lavadero.demo"]
  },
  "advertencia": "⚠️ IMPORTANTE: El branch en Neon NO fue eliminado. Deberás eliminarlo manualmente desde Neon Console si lo deseas."
}
```

---

## 🔄 Paso 3: Eliminar Branch en Neon (Opcional)

El endpoint elimina la empresa de la BD Central, pero NO elimina el branch en Neon. Si querés liberar espacio:

1. **Ir a Neon Console:**
   - https://console.neon.tech/app/projects/hidden-queen-29389003

2. **Encontrar el branch:**
   - Buscar el branch con el nombre que aparece en `branchName`
   - Ejemplo: `test-lavadero`

3. **Eliminar el branch:**
   - Click en los tres puntos del branch
   - "Delete branch"
   - Confirmar

**⚠️ ADVERTENCIA:** NO elimines el branch "main" ni "central"

---

## 📝 Ejemplo Completo: Limpiar Todas las Cuentas de Prueba

Si querés empezar de cero y eliminar TODAS las cuentas de prueba:

```bash
# 1. Listar empresas
curl https://tu-app.vercel.app/api/admin/limpiar-cuentas

# 2. Eliminar cada una (reemplazar el slug)
curl -X POST https://tu-app.vercel.app/api/admin/limpiar-cuentas \
  -H "Content-Type: application/json" \
  -d "{\"confirmacion\":\"ELIMINAR_CUENTA\",\"empresaSlug\":\"empresa1\"}"

curl -X POST https://tu-app.vercel.app/api/admin/limpiar-cuentas \
  -H "Content-Type: application/json" \
  -d "{\"confirmacion\":\"ELIMINAR_CUENTA\",\"empresaSlug\":\"empresa2\"}"

# 3. Ir a Neon Console y eliminar los branches manualmente
```

---

## ⚠️ Sobre el Formulario de Registro

**Aclaración:** El formulario de registro NO tiene valores predeterminados. Los campos están vacíos.

Si ves texto en los campos, puede ser:
- **Placeholders** (texto gris de ejemplo) - Es normal, desaparece al escribir
- **Autofill del navegador** - Chrome/Edge pueden autocompletar con datos guardados

**Placeholders actuales:**
- Nombre: "Ej: Lavadero Express"
- Email: "tu@email.com"
- Password: "Mínimo 6 caracteres"
- Confirmar: "Repetí tu contraseña"

Estos son solo ejemplos visuales, NO son valores guardados.

---

## 🚨 Seguridad

⚠️ **IMPORTANTE:** En producción, este endpoint debería estar protegido con autenticación de superadmin.

Por ahora está abierto para facilitar el desarrollo, pero en el futuro deberías:
1. Agregar autenticación JWT con rol "superadmin"
2. O eliminarlo completamente de producción
3. O solo habilitarlo con una variable de entorno específica

---

## 🔒 Proteger el Endpoint (Futuro)

Para proteger este endpoint en producción, agregá esta validación al inicio:

```typescript
// Verificar que sea un superadmin
const authHeader = request.headers.get('authorization');
if (!authHeader || authHeader !== `Bearer ${process.env.SUPERADMIN_SECRET}`) {
  return NextResponse.json(
    { success: false, message: 'No autorizado' },
    { status: 401 }
  );
}
```

Y agregá a `.env.local`:
```bash
SUPERADMIN_SECRET="una_clave_secreta_muy_larga_y_segura"
```

---

## 📞 Resumen

1. **Listar empresas:** `GET /api/admin/limpiar-cuentas`
2. **Eliminar empresa:** `POST /api/admin/limpiar-cuentas` con body JSON
3. **Limpiar Neon:** Manual desde Neon Console
4. **Placeholders:** Son solo texto de ejemplo, no valores reales

**Listo para eliminar cuentas de prueba cuando quieras.**
