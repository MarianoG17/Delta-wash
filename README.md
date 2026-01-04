# 🚗 DeltaWash - Sistema de Gestión para Lavadero

Sistema de gestión para lavadero de autos con registro de clientes, seguimiento de servicios y notificaciones por WhatsApp.

**URL de producción**: https://deltawash.vercel.app

## 🌟 Características

- ✅ Registro de autos con datos del cliente
- 📱 Envío automático de mensajes por WhatsApp cuando el auto está listo
- 📊 Historial completo de servicios
- 📈 Estadísticas de clientes que no visitan hace más de 10 días
- 🔐 Sistema de autenticación
- 💾 Base de datos PostgreSQL (Neon)

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd app-lavadero
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con tus credenciales de Neon:

```env
POSTGRES_URL="postgresql://user:password@host/database"
POSTGRES_PRISMA_URL="postgresql://user:password@host/database?pgbouncer=true"
POSTGRES_URL_NO_SSL="postgresql://user:password@host/database"
POSTGRES_URL_NON_POOLING="postgresql://user:password@host/database"
POSTGRES_USER="user"
POSTGRES_HOST="host"
POSTGRES_PASSWORD="password"
POSTGRES_DATABASE="database"
```

### 4. Inicializar la base de datos

Ejecuta el script SQL en tu base de datos Neon:

```bash
# Copia el contenido de schema.sql y ejecútalo en la consola SQL de Neon
```

O usa el siguiente comando si tienes psql instalado:

```bash
psql $POSTGRES_URL -f schema.sql
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 📝 Uso

### Login

- Usuario por defecto: `admin`
- Contraseña: `admin123`

### Registro de Autos

1. Completa el formulario con:
   - Marca y modelo del auto
   - Patente
   - Tipo de limpieza
   - Nombre del cliente
   - Número de celular (formato: 5491112345678)

2. El auto quedará en estado "En proceso"

### Marcar como Listo

1. En la lista de "Autos en Proceso", haz clic en "Marcar como Listo"
2. Se abrirá WhatsApp Web con un mensaje predefinido
3. El mensaje incluye el modelo del auto para personalización

### Historial y Estadísticas

- Ver todos los registros históricos
- Estadísticas de servicios completados
- Lista de clientes que no visitan hace más de 10 días

## 🗄️ Estructura de la Base de Datos

### Tabla: usuarios
- `id`: ID único
- `username`: Nombre de usuario
- `password`: Contraseña (en producción usar hash)
- `nombre`: Nombre completo

### Tabla: registros_lavado
- `id`: ID único
- `marca_modelo`: Marca y modelo del auto
- `patente`: Patente del vehículo
- `tipo_limpieza`: Tipo de servicio
- `nombre_cliente`: Nombre del cliente
- `celular`: Número de WhatsApp
- `fecha_ingreso`: Fecha y hora de ingreso
- `fecha_listo`: Fecha y hora de finalización
- `estado`: en_proceso | listo
- `mensaje_enviado`: Boolean
- `usuario_id`: ID del usuario que registró

## 🚀 Deploy en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel
3. Deploy automático

## 📱 Formato de Número de WhatsApp

El número debe estar en formato internacional sin espacios ni guiones:
- Código de país: 549 (Argentina)
- Código de área sin 0
- Número sin 15

Ejemplo: `5491112345678`

## 🔧 Tecnologías

- **Frontend**: Next.js 15, React 19, TailwindCSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL (Neon)
- **Hosting**: Vercel
- **Iconos**: Lucide React

## 📄 Licencia

MIT
