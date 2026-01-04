# 📁 Estructura del Proyecto DeltaWash

## 🗂️ Árbol de Archivos

```
app-lavadero/
├── app/                          # Directorio principal de Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── login/
│   │   │       └── route.ts      # API de autenticación
│   │   ├── init-db/
│   │   │   └── route.ts          # API para inicializar BD
│   │   └── registros/
│   │       ├── route.ts          # CRUD de registros
│   │       └── marcar-listo/
│   │           └── route.ts      # API para marcar listo y WhatsApp
│   ├── historial/
│   │   └── page.tsx              # Página de historial y estadísticas
│   ├── login/
│   │   └── page.tsx              # Página de login
│   ├── globals.css               # Estilos globales con Tailwind
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página principal (home)
├── lib/
│   └── db.ts                     # Utilidades de base de datos
├── .env.example                  # Ejemplo de variables de entorno
├── .gitignore                    # Archivos ignorados por Git
├── DEPLOY_INSTRUCTIONS.md        # Instrucciones detalladas de deploy
├── ESTRUCTURA_PROYECTO.md        # Este archivo
├── next.config.ts                # Configuración de Next.js
├── package.json                  # Dependencias del proyecto
├── PASOS_SIGUIENTES.md           # Guía rápida de próximos pasos
├── postcss.config.mjs            # Configuración de PostCSS
├── README.md                     # Documentación principal
├── schema.sql                    # Schema de la base de datos
├── tailwind.config.ts            # Configuración de Tailwind CSS
└── tsconfig.json                 # Configuración de TypeScript
```

## 📄 Descripción de Archivos Principales

### Páginas (Frontend)

| Archivo | Descripción | Ruta |
|---------|-------------|------|
| [`app/page.tsx`](app/page.tsx) | Página principal con formulario de registro y lista de autos en proceso | `/` |
| [`app/login/page.tsx`](app/login/page.tsx) | Página de inicio de sesión | `/login` |
| [`app/historial/page.tsx`](app/historial/page.tsx) | Historial completo y estadísticas de clientes | `/historial` |

### APIs (Backend)

| Archivo | Descripción | Endpoint |
|---------|-------------|----------|
| [`app/api/auth/login/route.ts`](app/api/auth/login/route.ts) | Autenticación de usuarios | `POST /api/auth/login` |
| [`app/api/registros/route.ts`](app/api/registros/route.ts) | CRUD de registros de lavado | `GET/POST /api/registros` |
| [`app/api/registros/marcar-listo/route.ts`](app/api/registros/marcar-listo/route.ts) | Marcar auto como listo y generar link de WhatsApp | `POST /api/registros/marcar-listo` |
| [`app/api/init-db/route.ts`](app/api/init-db/route.ts) | Inicializar base de datos | `GET /api/init-db` |

### Configuración

| Archivo | Propósito |
|---------|-----------|
| [`package.json`](package.json) | Dependencias y scripts del proyecto |
| [`tsconfig.json`](tsconfig.json) | Configuración de TypeScript |
| [`tailwind.config.ts`](tailwind.config.ts) | Configuración de Tailwind CSS |
| [`next.config.ts`](next.config.ts) | Configuración de Next.js |
| [`.env.example`](.env.example) | Plantilla de variables de entorno |

### Base de Datos

| Archivo | Descripción |
|---------|-------------|
| [`schema.sql`](schema.sql) | Schema completo de la base de datos PostgreSQL |
| [`lib/db.ts`](lib/db.ts) | Utilidades para conexión a la base de datos |

### Documentación

| Archivo | Contenido |
|---------|-----------|
| [`README.md`](README.md) | Documentación principal del proyecto |
| [`DEPLOY_INSTRUCTIONS.md`](DEPLOY_INSTRUCTIONS.md) | Guía detallada de deploy paso a paso |
| [`PASOS_SIGUIENTES.md`](PASOS_SIGUIENTES.md) | Checklist de pasos para completar el deploy |
| [`ESTRUCTURA_PROYECTO.md`](ESTRUCTURA_PROYECTO.md) | Este archivo - estructura del proyecto |

## 🗄️ Base de Datos

### Tablas

#### `usuarios`
- `id` (SERIAL PRIMARY KEY)
- `username` (VARCHAR UNIQUE)
- `password` (VARCHAR)
- `nombre` (VARCHAR)
- `created_at` (TIMESTAMP)

#### `registros_lavado`
- `id` (SERIAL PRIMARY KEY)
- `marca_modelo` (VARCHAR)
- `patente` (VARCHAR)
- `tipo_limpieza` (VARCHAR)
- `nombre_cliente` (VARCHAR)
- `celular` (VARCHAR)
- `fecha_ingreso` (TIMESTAMP)
- `fecha_listo` (TIMESTAMP)
- `estado` (VARCHAR: 'en_proceso' | 'listo')
- `mensaje_enviado` (BOOLEAN)
- `usuario_id` (INTEGER FK)
- `created_at` (TIMESTAMP)

## 🎨 Tecnologías Utilizadas

- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS
- **Base de Datos**: PostgreSQL (Neon)
- **ORM**: @vercel/postgres
- **Iconos**: Lucide React
- **Deploy**: Vercel
- **Control de Versiones**: Git

## 🔄 Flujo de la Aplicación

1. **Login** → Usuario ingresa con credenciales
2. **Home** → Formulario para registrar nuevos autos
3. **Registro** → Auto queda en estado "en_proceso"
4. **Proceso** → Auto aparece en lista de "Autos en Proceso"
5. **Finalización** → Click en "Marcar como Listo"
6. **WhatsApp** → Se abre WhatsApp con mensaje personalizado
7. **Historial** → Registro queda guardado para estadísticas

## 📊 Funcionalidades Principales

### ✅ Gestión de Autos
- Registro de autos con datos completos
- Tipos de limpieza: Simple, Con Cero, Pulido, Limpieza de Chasis, Limpieza de Motor
- Seguimiento de estado (en proceso / listo)

### 📱 Integración WhatsApp
- Generación automática de mensaje personalizado
- Apertura de WhatsApp Web/App con un click
- Formato: "Hola [Cliente]! Tu [Auto] ya está listo..."

### 📈 Estadísticas
- Total de registros
- Servicios completados
- Clientes sin visitar hace más de 10 días
- Historial completo con filtros

### 🔐 Seguridad
- Sistema de autenticación
- Sesiones en localStorage
- Protección de rutas

## 🚀 Comandos Útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar en producción
npm start

# Linter
npm run lint
```

## 📝 Notas Importantes

- Este proyecto es **independiente** del proyecto Coques
- Usa su **propia base de datos** en Neon
- Tiene su **propio repositorio** en GitHub
- Se despliega en **deltawash.vercel.app**
- Las credenciales por defecto son: admin/admin123
