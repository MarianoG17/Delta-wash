# Diagnóstico: Error al Anular Venta en Historial Legacy

## 🔍 Problema Reportado
- **Error:** "Registro no encontrado" al intentar anular una venta desde el historial
- **Sistema:** DeltaWash Legacy (deltawash-app.vercel.app/historial)
- **Usuario:** Modo Legacy (sin empresaId)

## 🔧 Cambios Realizados

### 1. Endpoint de Anulación Mejorado
**Archivo:** `app/api/registros/anular/route.ts`

He agregado logging detallado que mostrará:
- El `empresaId` detectado (debería ser `undefined` para legacy)
- La conexión DB utilizada
- Los datos recibidos (ID, usuario, motivo)
- Resultado de la búsqueda del registro
- Cada paso del proceso de anulación

## 📋 Pasos para Diagnosticar

### 1. Abrir la Consola del Servidor
- Abre la terminal donde está corriendo `npm run dev`
- Mantén visible esta terminal

### 2. Intentar Anular una Venta
- Ve a: `https://deltawash-app.vercel.app/historial`
- Busca una venta completada
- Haz clic en el botón "Anular"
- Ingresa un motivo de anulación

### 3. Revisar los Logs del Servidor
Busca líneas que comiencen con `[Anular]`. Deberías ver algo como:

```
[Anular] 🚀 Inicio de anulación de registro
[Anular] EmpresaId obtenido: (undefined - DeltaWash Legacy)
[Anular] Conexión DB obtenida exitosamente
[Anular] Datos recibidos: ID=123, Usuario=1, Motivo="..."
[Anular] 🔍 Buscando registro con ID: 123...
[Anular] Resultados de búsqueda: { esArray: true, cantidad: 1 }
[Anular] ✅ Registro encontrado: { id: 123, patente: '...', ... }
```

### 4. Copiar y Analizar los Logs
**Si ves "Registro no encontrado":**
- Busca esta línea: `[Anular] EmpresaId usado: ...`
- Verifica cuál base de datos se está usando
- Copia TODOS los logs con prefijo `[Anular]`

**Si ves otro error:**
- Copia el stack trace completo
- Copia el mensaje de error

## 🐛 Posibles Causas del Error

### Causa 1: Token Incorrecto o Sesión Expirada
**Síntoma:** El empresaId no es `undefined` cuando debería serlo
**Solución:** 
- Cierra sesión completamente
- Borra el localStorage
- Vuelve a iniciar sesión en `/login`

```javascript
// Ejecutar en consola del navegador:
localStorage.clear();
location.reload();
```

### Causa 2: Conexión a BD Incorrecta
**Síntoma:** Los logs muestran que se está conectando a un branch de empresa en lugar de POSTGRES_URL
**Solución:** Verificar variables de entorno

### Causa 3: Registro Realmente No Existe
**Síntoma:** El ID del registro no existe en la base de datos
**Verificación:**
```sql
-- Ejecutar en la consola de Vercel Postgres:
SELECT id, patente, nombre_cliente, anulado 
FROM registros_lavado 
WHERE id = [ID_DEL_REGISTRO]
ORDER BY id DESC 
LIMIT 20;
```

### Causa 4: Problema de Autenticación del Frontend
**Síntoma:** El header Authorization se envía pero no debería
**Verificación en Navegador:**
1. Abre DevTools (F12)
2. Ve a la pestaña "Network"
3. Intenta anular un registro
4. Busca la petición a `/api/registros/anular`
5. Revisa los "Request Headers"
6. Verifica si hay un header `Authorization: Bearer ...`
   - ✅ **NO debería estar** para usuarios legacy
   - ❌ **Si está** es el problema

## ✅ Solución Rápida

Si el problema es la sesión o localStorage corrupto:

1. **Limpiar Navegador:**
```javascript
// Ejecutar en consola del navegador (F12):
localStorage.clear();
sessionStorage.clear();
location.href = '/login';
```

2. **Reiniciar Sesión:**
- Ve a `/login`
- Ingresa credenciales: `admin` / `admin123`
- Ve al historial e intenta anular de nuevo

## 📊 Información de Debug para Reportar

Si el problema persiste, copia esta información:

```
=== INFORMACIÓN DE DEBUG ===
1. URL: [URL donde ocurre el error]
2. Navegador: [Chrome/Firefox/Safari + versión]
3. Logs del servidor con prefijo [Anular]:
[Pegar aquí los logs]

4. Network Request (DevTools):
   - URL: /api/registros/anular
   - Method: POST
   - Headers: [Copiar todos los headers]
   - Request Body: [Copiar el body]
   - Response Status: [200/404/500/etc]
   - Response Body: [Copiar el response]

5. Estado de localStorage:
[Ejecutar en consola: console.log(localStorage)]
===========================
```

## 🎯 Próximos Pasos

1. **Prueba el sistema** con el logging mejorado
2. **Copia los logs** que aparecen en la terminal del servidor
3. **Analiza** dónde exactamente está fallando
4. Si el problema persiste, proporciona los logs para análisis más profundo

## 💡 Notas Técnicas

### Flujo Normal de Anulación (Legacy):
```
1. Usuario hace clic en "Anular" → Prompt pide motivo
2. Frontend envía POST a /api/registros/anular
   - Body: { id: 123, motivo: "...", usuario_id: 1 }
   - Headers: NO incluye Authorization (modo legacy)
3. Backend recibe la petición
   - getEmpresaIdFromToken() retorna undefined (sin token)
   - getDBConnection(undefined) retorna sql (POSTGRES_URL legacy)
4. Backend busca el registro en registros_lavado
5. Backend actualiza el registro: anulado = TRUE
6. Backend retorna success: true
7. Frontend recarga la lista de registros
```

### Cambios en el Código:
- ✅ Logging detallado en cada paso
- ✅ Mejor manejo de errores
- ✅ Información de debug clara
- ✅ Compatible con modo legacy (sin cambios funcionales)

---

**Fecha:** 2026-01-19
**Archivo:** `app/api/registros/anular/route.ts`
**Estado:** Mejorado con logging para diagnóstico
