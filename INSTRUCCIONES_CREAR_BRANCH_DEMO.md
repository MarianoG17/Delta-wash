# 🎯 INSTRUCCIONES: Crear Branch de Demostración en Neon

## ⚠️ IMPORTANTE: No ejecutes el script en el branch "Lavadero"

- **Proyecto Neon**: `deltawash` ✅
- **Branch actual**: `Lavadero` ⚠️ (Este tiene datos reales de producción)
- **Branch para demo**: Debes crear uno nuevo 🆕

El branch "Lavadero" (dentro del proyecto deltawash) tiene tus datos reales de producción.
El script de demo debe ejecutarse en un branch SEPARADO.

---

## 📋 Pasos para Crear Branch de Demo

### 1️⃣ Ve a la sección "Branches" en Neon Console

En el menú lateral izquierdo de Neon Console:
- Click en **"Branches"** (está debajo de Dashboard)

### 2️⃣ Crear un nuevo branch

- Click en el botón **"Create Branch"** (arriba a la derecha)
- Configura el branch:
  - **Name**: `demo-clientes` (o el nombre que prefieras)
  - **Parent branch**: Selecciona `main` o `Lavadero` (para copiar el esquema)
  - **Copy data**: ❌ **Desactiva esta opción** (queremos un branch vacío)
  - Click en **"Create Branch"**

### 3️⃣ Selecciona el nuevo branch

- En la lista de branches, verás tu nuevo branch `demo-clientes`
- Click en el nombre del branch para seleccionarlo
- Verifica que en la parte superior diga **"demo-clientes"** (no "Lavadero")

### 4️⃣ Ve al SQL Editor

- Click en **"SQL Editor"** en el menú lateral
- Verifica que arriba diga el branch correcto: **"demo-clientes"**

### 5️⃣ Ejecuta el script

Ahora SÍ puedes ejecutar el script `DATOS_DEMO_30_DIAS.sql`:

1. **Copia todo el contenido** del archivo `DATOS_DEMO_30_DIAS.sql`
2. **Pégalo** en el SQL Editor de Neon
3. Verifica que el branch sea **"demo-clientes"** (arriba a la derecha)
4. Click en **"Run"**

---

## 💡 Sobre el Mensaje de Truncamiento

El mensaje que viste:
> "This query will still run OK, but the last 23415 characters will be truncated from query history"

**Esto NO es un problema:**
- ✅ La query se ejecutará **completa y correctamente**
- ✅ Todos los datos se insertarán
- ⚠️ Solo el **historial visual** en Neon Console se truncará
- 💾 Los datos estarán completos en la base de datos

Puedes ignorar este mensaje de forma segura. Es solo una limitación de la interfaz visual de Neon Console.

---

## 🎯 Resultado Final

Después de ejecutar el script en el branch `demo-clientes`, tendrás:

### ✅ Branch Separado para Demos
- **Lavadero**: Sistema legacy con datos reales (intacto)
- **demo-clientes**: Sistema de demostración con datos ficticios

### ✅ Datos de Demostración Completos
- Lista de precios configurada
- 70+ registros de lavado de 30 días
- Clientes variados
- Métodos de pago realistas
- Estados: pendientes, en proceso, entregados

### ✅ Listo para Mostrar a Clientes
Podrás demostrar:
- Formulario de registro con cálculo automático
- Historial completo de 30 días
- Reportes de ingresos
- Gestión de listas de precios
- Todo el flujo del sistema

---

## 🔗 Connection String del Branch Demo

Después de crear el branch, en la página de "Branches":
1. Click en el branch `demo-clientes`
2. Copia el **Connection String** (lo necesitarás si quieres conectar este branch a una app de demo)

---

## ❓ Preguntas Frecuentes

### ¿Puedo tener múltiples branches?
Sí, Neon te permite tener múltiples branches en el plan gratuito (hasta 10 branches).

### ¿Los branches comparten datos?
No, cada branch es independiente. Los datos en `demo-clientes` NO afectarán a `Lavadero`.

### ¿Puedo eliminar el branch de demo después?
Sí, puedes eliminar branches cuando quieras desde la sección "Branches".

### ¿Cómo cambio entre branches?
En cualquier página de Neon Console (SQL Editor, Tables, etc.), verás un selector de branch arriba. Click ahí y selecciona el branch que quieras usar.

---

## 🆘 Si Algo Sale Mal

Si por error ejecutaste el script en el branch "Lavadero":
1. **NO entres en pánico**
2. El script usa `ON CONFLICT DO NOTHING/UPDATE`, así que no debería duplicar datos
3. Pero tus registros legacy ahora tendrán datos de demo mezclados
4. Puedes eliminar los registros de demo manualmente o restaurar un backup

**Por eso es importante usar un branch separado para demos.**

---

¡Listo! Ahora puedes crear tu branch de demostración de forma segura.
