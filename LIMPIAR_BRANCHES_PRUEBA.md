# Limpiar Branches de Prueba en Neon

## 🚨 Problema
Error: `BRANCHES_LIMIT_EXCEEDED` - Llegaste al límite de branches en el plan de Neon.

## ✅ Solución
Eliminar los branches de prueba que creamos durante el testing.

---

## 📋 Lista de Branches

### ❌ ELIMINAR (Branches de Prueba)
Estos fueron creados durante las pruebas y tienen los 217 registros de DeltaWash:

1. `test1`
2. `mariano-wash` 
3. `mariano-wash-1768710136390` (si existe)
4. `las-time`
5. `otra-vez`
6. `lpm`
7. `no-va-mas`

### ✅ MANTENER (Branches Necesarios)
**NO eliminar estos:**

- **`main`** o **`Deltawash`** → Producción de DeltaWash
- **`central`** → BD central del sistema SaaS (tabla empresas)
- **`saas-template`** → Template vacío (br-dawn-dream-ahfwrieh)

---

## 🔧 Paso a Paso para Eliminar

### 1. Abrir Neon Console
https://console.neon.tech/app/projects/hidden-queen-29389003

### 2. Ir a Branches
Click en **"Branches"** en el menú lateral izquierdo

### 3. Para CADA branch de prueba:

**a.** Click en el nombre del branch (ej: `test1`)

**b.** Se abre la página del branch

**c.** Scroll hasta el final de la página

**d.** Buscar el botón **"Delete branch"** (generalmente es rojo)

**e.** Click en **"Delete branch"**

**f.** Confirmar la eliminación (puede pedir escribir el nombre del branch)

**g.** Repetir con el siguiente branch de la lista

### 4. Verificar
Después de eliminar todos, deberías tener solo 3 branches:
- main/Deltawash
- central  
- saas-template

---

## 🧹 Después de Limpiar Branches

También necesitás eliminar la empresa "ultima" de la BD central porque quedó inconsistente:

```sql
-- Ejecutar en la BD central
DELETE FROM empresas WHERE slug = 'ultima';
```

---

## ✅ Probar de Nuevo

Una vez limpio, podés crear una empresa nueva y debería funcionar:
1. Ir a https://lavapp-pi.vercel.app/home
2. Registrar nueva empresa
3. Debería tener 0 registros
4. Debería tardar ~5 segundos

---

## 📊 Límites del Plan

El plan Free de Neon permite un número limitado de branches (generalmente 10).

Si necesitás crear muchas empresas de prueba en el futuro, considerá:
- Eliminar empresas de prueba cuando ya no las necesites
- O upgrade al plan Scale de Neon para más branches
