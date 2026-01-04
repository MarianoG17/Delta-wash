# Instrucciones para Actualizar la Base de Datos

## ¿Por qué necesitas hacer esto?

Agregamos una nueva funcionalidad al sistema: ahora los autos tienen 3 estados en lugar de 2:
- **En Proceso** → **Listo** → **Entregado** (NUEVO)

Para que esto funcione, necesitamos agregar una columna nueva en la base de datos que guarde la fecha cuando el auto fue entregado.

## Pasos Simples:

### 1. Ir a Neon Console
- Abre tu navegador y ve a: https://console.neon.tech/
- Inicia sesión con tu cuenta

### 2. Seleccionar tu Proyecto
- Busca el proyecto "DeltaWash" o el nombre que le hayas puesto
- Haz clic en él

### 3. Abrir el SQL Editor
- En el menú lateral izquierdo, busca y haz clic en "SQL Editor"
- Se abrirá un editor de texto donde puedes escribir comandos SQL

### 4. Copiar y Pegar este Comando
Copia exactamente este texto y pégalo en el editor:

```sql
ALTER TABLE registros_lavado ADD COLUMN IF NOT EXISTS fecha_entregado TIMESTAMP;
```

### 5. Ejecutar el Comando
- Haz clic en el botón "Run" o "Ejecutar" (generalmente es un botón verde o azul)
- Deberías ver un mensaje de éxito

### 6. Verificar que Funcionó
Copia y pega este otro comando para verificar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'registros_lavado' 
ORDER BY ordinal_position;
```

Deberías ver en la lista una columna llamada `fecha_entregado` de tipo `timestamp without time zone`.

## ¡Listo!

Una vez que hagas esto, la aplicación funcionará correctamente con el nuevo flujo de 3 estados. Vercel ya desplegó automáticamente el código nuevo, solo faltaba actualizar la base de datos.

## Si algo sale mal

Si ves algún error, no te preocupes. El comando tiene `IF NOT EXISTS` que significa que si la columna ya existe, no hará nada. Es seguro ejecutarlo varias veces.
