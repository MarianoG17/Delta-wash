# 🚀 Instrucciones de Deploy - DeltaWash

Este proyecto es **completamente independiente** del proyecto Coques. Tiene su propia base de datos, su propio deploy en Vercel y su propia configuración.

## 📋 Pasos para Deploy

### 1. Crear Base de Datos en Neon (NUEVA)

1. Ve a https://neon.tech
2. Crea un **NUEVO proyecto** llamado `deltawash` (NO uses la base de datos de coques)
3. Copia las credenciales de conexión

### 2. Ejecutar el Schema SQL

1. En la consola de Neon, ve a la pestaña SQL Editor
2. Copia y pega el contenido completo del archivo `schema.sql`
3. Ejecuta el script
4. Verifica que se crearon las tablas:
   - `usuarios`
   - `registros_lavado`

### 3. Crear Repositorio en GitHub

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit inicial
git commit -m "Initial commit - DeltaWash App"

# Crear repositorio en GitHub llamado "deltawash" o "app-lavadero"
# Luego conectar:
git remote add origin https://github.com/TU_USUARIO/deltawash.git
git branch -M main
git push -u origin main
```

### 4. Deploy en Vercel

1. Ve a https://vercel.com
2. Click en "Add New Project"
3. Importa el repositorio de GitHub que acabas de crear
4. **IMPORTANTE**: En "Project Name" pon: `deltawash`
5. Configura las variables de entorno (ver sección siguiente)
6. Click en "Deploy"

### 5. Configurar Variables de Entorno en Vercel

En la configuración del proyecto en Vercel, agrega estas variables de entorno con los datos de tu **NUEVA** base de datos Neon:

```
POSTGRES_URL=postgresql://user:password@host/database
POSTGRES_PRISMA_URL=postgresql://user:password@host/database?pgbouncer=true
POSTGRES_URL_NO_SSL=postgresql://user:password@host/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host/database
POSTGRES_USER=user
POSTGRES_HOST=host
POSTGRES_PASSWORD=password
POSTGRES_DATABASE=database
```

**NOTA**: Estos valores son DIFERENTES a los del proyecto Coques.

### 6. Configurar Dominio Personalizado (Opcional)

Si quieres usar `deltawash.vercel.app`:

1. En Vercel, ve a Settings → Domains
2. El dominio `deltawash.vercel.app` debería estar disponible automáticamente
3. Si no, puedes agregarlo manualmente

### 7. Verificar el Deploy

1. Accede a https://deltawash.vercel.app
2. Deberías ver la página de login
3. Usa las credenciales por defecto:
   - Usuario: `admin`
   - Contraseña: `admin123`

## 🔄 Actualizaciones Futuras

Para hacer cambios y deployar:

```bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de los cambios"
git push

# Vercel detectará automáticamente el push y hará el deploy
```

## ✅ Checklist de Verificación

- [ ] Base de datos Neon creada (NUEVA, no la de coques)
- [ ] Schema SQL ejecutado correctamente
- [ ] Repositorio GitHub creado
- [ ] Proyecto en Vercel creado con nombre "deltawash"
- [ ] Variables de entorno configuradas en Vercel
- [ ] Deploy exitoso
- [ ] Login funciona correctamente
- [ ] Registro de autos funciona
- [ ] WhatsApp se abre correctamente al marcar como listo

## 🆘 Solución de Problemas

### Error de conexión a base de datos
- Verifica que las variables de entorno estén correctamente configuradas
- Asegúrate de usar las credenciales de la base de datos NUEVA (deltawash)

### Error 404 en rutas
- Verifica que el build se completó correctamente
- Revisa los logs en Vercel

### WhatsApp no se abre
- Verifica el formato del número de celular (debe ser 549 + código de área + número)
- Ejemplo: 5491112345678

## 📞 Contacto

Si tienes problemas con el deploy, revisa los logs en Vercel o la consola de Neon.
