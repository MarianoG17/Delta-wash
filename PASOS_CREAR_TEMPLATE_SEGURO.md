# Crear Template - Pasos Seguros (NO afecta DeltaWash)

## ✅ Garantías de Seguridad

1. **DeltaWash sigue en branch `main`** - No se toca
2. **Template es branch separado** - Solo para empresas SaaS nuevas
3. **Empresas SaaS existentes** - Siguen usando sus branches
4. **Zero downtime** - Todo funciona durante el proceso

---

## 🔧 Paso 1: Crear Branch Template en Neon Console

### Ir a Neon Console
https://console.neon.tech/app/projects/hidden-queen-29389003

### Crear el Branch
1. Click **"Branches"** en menú lateral
2. Click **"Create Branch"** (botón verde)
3. Configurar:
   ```
   Branch name: saas-template
   Parent branch: main
   ✅ Create new compute endpoint
   ```
4. Click **"Create Branch"**

**TIEMPO:** ~30 segundos

---

## 🗑️ Paso 2: Limpiar Datos del Template

### Seleccionar el branch en SQL Editor
1. En la consola, ir a **"SQL Editor"**
2. En el selector de branch (arriba a la izquierda), elegir **"saas-template"**

### Ejecutar Script de Limpieza

```sql
-- VERIFICAR QUE ESTÁS EN saas-template
SELECT current_database();

-- Limpiar datos (respeta foreign keys)
DELETE FROM movimientos_cc;
DELETE FROM cuentas_corrientes;
DELETE FROM precios;
DELETE FROM listas_precios;
DELETE FROM registros;
DELETE FROM precios_servicios;
DELETE FROM clientes;
DELETE FROM usuarios WHERE email != 'admin@inicial.com';

-- VERIFICACIÓN: Debe retornar 0
SELECT 
  (SELECT COUNT(*) FROM registros) as registros,
  (SELECT COUNT(*) FROM clientes) as clientes,
  (SELECT COUNT(*) FROM usuarios) as usuarios;
```

**RESULTADO ESPERADO:**
```
registros | clientes | usuarios
    0     |    0     |    0
```

**TIEMPO:** ~10 segundos

---

## 🔑 Paso 3: Obtener Branch ID del Template

### Desde Neon Console
1. En **"Branches"**, click en **"saas-template"**
2. En la URL o en los detalles, copiar el Branch ID
3. Formato: `br-xxxxx-xxxxxxxx`

### O desde la lista de branches
Buscar "saas-template" y copiar el ID que aparece debajo del nombre

**GUARDAR ESTE ID** - Lo necesitaremos en el paso 4

**TIEMPO:** ~5 segundos

---

## 📝 Paso 4: Configurar Variable de Entorno

### En archivo local (.env.local)
Agregar al final del archivo:

```env
NEON_TEMPLATE_BRANCH_ID=br-xxxxx-xxxxxxxx
```

(Reemplazar con el ID real del paso 3)

### En Vercel (Environment Variables)
1. Ir a https://vercel.com/marianos-projects-7b8bdb06/app-lavadero/settings/environment-variables
2. Click **"Add New"**
3. Configurar:
   ```
   Key: NEON_TEMPLATE_BRANCH_ID
   Value: br-xxxxx-xxxxxxxx
   Environments: ✅ Production ✅ Preview ✅ Development
   ```
4. Click **"Save"**

**TIEMPO:** ~2 minutos

---

## 💻 Paso 5: Actualizar Código

Yo me encargo de esto. Te avisaré cuando esté listo para commit + deploy.

**TIEMPO:** ~5 minutos

---

## ✅ Verificación Final

Después de deploy:
1. Crear empresa de prueba desde /home
2. Debería tardar ~5 segundos (vs 60-90 anterior)
3. Empresa debe tener 0 registros

---

## 🚨 Rollback (si algo sale mal)

Si hay algún problema, simplemente:
```bash
# Remover la variable de entorno
# El sistema volverá a crear desde main como antes
```

---

## ⏱️ Tiempo Total Estimado

- Paso 1: 30 segundos
- Paso 2: 10 segundos  
- Paso 3: 5 segundos
- Paso 4: 2 minutos
- Paso 5: 5 minutos
- **TOTAL: ~8 minutos**

---

## 📞 Estoy Contigo

Voy a guiarte paso a paso. Empecemos con el Paso 1. ¿Listo?
