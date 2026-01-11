# 📋 Instrucciones: Sistema de Listas de Precios

## ⚠️ IMPORTANTE: Ejecutar Migración Primero

La página de Listas de Precios aparece vacía porque las tablas aún no existen en la base de datos.

## 🔧 Pasos para Activar el Sistema

### 1. Acceder a Neon Dashboard
1. Ve a https://console.neon.tech
2. Selecciona tu proyecto DeltaWash
3. Click en **SQL Editor** o **Query**

### 2. Ejecutar la Migración
1. Abre el archivo [`migration-listas-precios.sql`](migration-listas-precios.sql)
2. Copia TODO el contenido del archivo
3. Pégalo en el SQL Editor de Neon
4. Click en **Run** o **Execute**

### 3. Verificar la Instalación
Deberías ver:
- ✅ "Sistema de listas de precios creado exitosamente"
- ✅ Una lista llamada "Lista Estándar"
- ✅ 10 precios creados (5 tipos de vehículos × 2 servicios)

### 4. Refrescar la Aplicación
1. Ve a tu app DeltaWash
2. Click en el botón **Precios** en el menú
3. Ahora deberías ver la "Lista Estándar" con todos los precios

## 📊 ¿Qué Crea la Migración?

### Tablas Nuevas:
- **`listas_precios`**: Almacena las diferentes listas (Estándar, VIP, Corporativa, etc.)
- **`precios`**: Almacena los precios específicos de cada lista

### Modificaciones:
- Agrega columna `lista_precio_id` a `cuentas_corrientes`
- Asigna automáticamente la lista estándar a todas las cuentas existentes

### Datos Iniciales:
**Lista Estándar** con precios actuales:
- 🚗 Auto: $22,000 (simple) + $2,000 (cera)
- 🚙 Mono: $30,000 (simple) + $2,000 (cera)
- 🚐 Camioneta: $35,000 (simple) + $5,000 (cera)
- 🚐 Camioneta XL: $38,000 (simple) + $4,000 (cera)
- 🏍️ Moto: $15,000 (simple)

## 🎯 Funcionalidades Disponibles

Una vez ejecutada la migración:

### 1. **Ver Listas de Precios**
- Accede desde el botón "Precios" en el menú principal
- Solo visible para administradores

### 2. **Editar Precios**
- Click en el botón azul de edición (lápiz)
- Modifica los precios manualmente
- Guarda los cambios

### 3. **Aplicar Aumentos Masivos** ⭐ NUEVO
- Click en el botón naranja (tendencia)
- Ingresa el porcentaje de aumento (ej: 10%)
- Activa/desactiva redondeo automático
- Los precios se redondean a la centena más cercana
  - Ejemplo: $23,470 → $23,500
  - Ejemplo: $23,420 → $23,400
- Vista previa antes de aplicar
- Aplica el aumento a todos los precios de la lista

### 4. **Crear Nuevas Listas**
- Click en "Nueva Lista"
- Ingresa nombre y descripción
- Se crea con los mismos precios de la lista estándar
- Puedes modificarlos después

### 5. **Eliminar Listas**
- Solo se pueden eliminar listas personalizadas
- La "Lista Estándar" no se puede eliminar

## 🚀 Próximos Pasos (Opcional)

Para completar la integración:

1. **Asignar listas a clientes**: Modificar página de cuentas corrientes para seleccionar lista
2. **Usar precios dinámicos**: Modificar página principal para obtener precios desde la API
3. **Crear listas especiales**: VIP, Corporativa, Promocional, etc.

## ❓ Solución de Problemas

### La página sigue vacía después de ejecutar la migración
1. Verifica que la migración se ejecutó sin errores
2. Refresca la página (Ctrl + F5)
3. Verifica en Neon que las tablas existen:
   ```sql
   SELECT * FROM listas_precios;
   SELECT * FROM precios;
   ```

### Error al ejecutar la migración
- Si ya ejecutaste la migración antes, es normal que algunos comandos fallen
- Los comandos usan `IF NOT EXISTS` y `ON CONFLICT DO NOTHING` para evitar duplicados
- Verifica que las tablas se crearon correctamente

### No veo el botón "Precios" en el menú
- Solo es visible para usuarios con rol "admin"
- Verifica tu rol en la base de datos:
   ```sql
   SELECT * FROM usuarios WHERE nombre = 'tu_usuario';
   ```

## 📝 Notas Importantes

- ⚠️ **Ejecuta la migración solo UNA vez**
- ✅ La migración es segura: no elimina ni modifica datos existentes
- 🔄 Todos los clientes actuales quedan con la lista estándar por defecto
- 💾 Los cambios en GitHub ya están pusheados y Vercel los desplegará automáticamente
