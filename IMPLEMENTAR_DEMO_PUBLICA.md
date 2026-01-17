# 🎯 Implementación: Cuenta Demo Pública para Potenciales Clientes

**Fecha:** 17 de enero de 2026  
**Objetivo:** Permitir que potenciales clientes prueben la app sin registrarse

---

## 📋 Visión General

Actualmente, los potenciales clientes que visitan [`/home`](app/home/page.tsx) deben:
1. Registrarse en [`/registro`](app/registro/page.tsx)
2. Esperar 10-30 segundos (creación de branch en Neon)
3. Solo entonces pueden probar la app

**Solución propuesta:** Cuenta demo pública que cualquiera puede usar instantáneamente.

---

## 🏗️ Arquitectura de la Solución

### Componentes

```
┌─────────────────────────────────────────────────────────────┐
│                    Landing Page (/home)                      │
│                                                              │
│  [Probar gratis] ──────────────────► [Probar Demo Ahora]   │
│   (con registro)                      (sin registro)        │
└───────────────┬────────────────────────────────┬────────────┘
                │                                │
                ▼                                ▼
       ┌────────────────┐              ┌─────────────────┐
       │   /registro    │              │  Demo Automático│
       │                │              │                 │
       │ • Crear branch │              │ • Login directo │
       │ • BD privada   │              │ • BD compartida │
       └────────────────┘              │ • Sin registro  │
                                       └─────────────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │  App Principal  │
                                       │                 │
                                       │ • Banner "Demo" │
                                       │ • Limpieza 24h  │
                                       └─────────────────┘
```

---

## 🔧 Paso 1: Crear Branch Demo en Neon

### 1.1 Crear Branch Manualmente

**Opción A: Desde Neon Console**
1. Ir a: `https://console.neon.tech/app/projects/hidden-queen-29389003/branches`
2. Click en "Create Branch"
3. Nombre: `demo-publico`
4. Crear desde: `main` (o el branch principal)
5. Copiar la connection string pooled

**Opción B: Desde Terminal (con nueva API key)**
```bash
# Primero, asegurate de tener la NUEVA API key en .env.local

node -e "
const fetch = require('node-fetch');

async function createDemoBranch() {
  const NEON_API_KEY = 'napi_TU_NUEVA_API_KEY';
  const NEON_PROJECT_ID = 'hidden-queen-29389003';
  
  const response = await fetch(
    \`https://console.neon.tech/api/v2/projects/\${NEON_PROJECT_ID}/branches\`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${NEON_API_KEY}\`,
      },
      body: JSON.stringify({
        branch: { name: 'demo-publico' },
        endpoints: [{ type: 'read_write' }]
      })
    }
  );
  
  const data = await response.json();
  console.log('Branch creado:', JSON.stringify(data, null, 2));
}

createDemoBranch();
"
```

### 1.2 Inicializar Schema

Una vez creado el branch, ejecutar el schema:

```typescript
// Usar el mismo script que en lib/neon-api.ts
import { neon } from '@neondatabase/serverless';

const CONNECTION_URI = "postgresql://..."; // Connection URI del demo-publico branch

async function initializeDemoSchema() {
  const sql = neon(CONNECTION_URI);
  
  // Ejecutar el mismo schema que en lib/neon-api.ts línea 157-282
  await sql`
    -- Copiar todo el schema de initializeBranchSchema()
    -- Ver: lib/neon-api.ts líneas 157-282
  `;
  
  console.log('✅ Schema demo inicializado');
}

initializeDemoSchema();
```

---

## 🔧 Paso 2: Registrar Empresa Demo en BD Central

Ejecutar en la BD Central:

```sql
-- Insertar empresa demo
INSERT INTO empresas (
  nombre,
  slug,
  branch_name,
  branch_url,
  plan,
  estado,
  fecha_expiracion
) VALUES (
  'Demo Público',
  'demo-publico',
  'demo-publico',
  'postgresql://neondb_owner:XXX@ep-XXX-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require', -- Reemplazar con connection string real
  'demo',
  'activo',
  '2099-12-31' -- Fecha lejana para que nunca expire
) RETURNING id;

-- Guardar el ID retornado (ejemplo: 999)

-- Crear usuario admin demo
INSERT INTO usuarios_sistema (
  empresa_id,
  email,
  password_hash,
  nombre,
  rol,
  activo
) VALUES (
  999, -- Reemplazar con el ID de la empresa demo
  'demo@lavapp.io',
  '$2a$10$XYZ...', -- Hash de 'demo123' (generar con bcrypt)
  'Usuario Demo',
  'admin',
  true
);

-- Verificar
SELECT * FROM empresas WHERE slug = 'demo-publico';
SELECT * FROM usuarios_sistema WHERE email = 'demo@lavapp.io';
```

**Generar password hash:**
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('demo123', 10));"
```

---

## 🔧 Paso 3: Actualizar Landing Page (/home)

Agregar botón de demo en [`app/home/page.tsx`](app/home/page.tsx):

### 3.1 Modificar Hero Section (línea 45)

```typescript
// ANTES (línea 45-58):
<div className="flex justify-center gap-4 flex-wrap">
  <Link
    href="/registro"
    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
  >
    Empezar gratis 15 días →
  </Link>
  <Link
    href="#features"
    className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all"
  >
    Ver funciones
  </Link>
</div>

// DESPUÉS (agregar botón de demo):
<div className="flex justify-center gap-4 flex-wrap">
  <Link
    href="/registro"
    className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
  >
    Empezar gratis 15 días →
  </Link>
  <Link
    href="/login-saas?demo=true"
    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
  >
    🎮 Probar Demo Ahora
  </Link>
  <Link
    href="#features"
    className="bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-all"
  >
    Ver funciones
  </Link>
</div>
```

### 3.2 Agregar Sección Explicativa Antes del Footer (línea 780)

```typescript
// INSERTAR ANTES DE "CTA Final" (línea 785)

{/* Demo Section */}
<section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
  <div className="max-w-4xl mx-auto px-4 text-center">
    <h3 className="text-3xl font-bold mb-6">
      🎮 Probá la App Ahora Mismo - Sin Registro
    </h3>
    <p className="text-xl mb-8 opacity-90">
      Accedé a una cuenta demo compartida y explorá todas las funciones en segundos
    </p>
    
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8 border border-white/20">
      <div className="grid md:grid-cols-2 gap-6 text-left">
        <div>
          <h4 className="font-bold text-lg mb-3 flex items-center">
            ✅ En la Demo Podés:
          </h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li>• Registrar autos y cambiar estados</li>
            <li>• Ver reportes y estadísticas</li>
            <li>• Probar cuentas corrientes</li>
            <li>• Exportar datos a Excel</li>
            <li>• Ver todos los módulos en acción</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-3 flex items-center">
            ⚠️ Limitaciones:
          </h4>
          <ul className="space-y-2 text-sm opacity-90">
            <li>• Cuenta compartida (otros usuarios también la usan)</li>
            <li>• Los datos se limpian cada 24 horas</li>
            <li>• No podés cambiar precios ni configuración</li>
          </ul>
        </div>
      </div>
    </div>
    
    <Link
      href="/login-saas?demo=true"
      className="inline-block bg-white text-purple-600 px-10 py-4 rounded-lg text-xl font-semibold hover:bg-gray-100 transition-all shadow-xl"
    >
      Acceder a Demo →
    </Link>
    
    <p className="mt-6 text-sm opacity-75">
      ¿Te gustó? <Link href="/registro" className="underline font-semibold">Creá tu cuenta privada gratis</Link>
    </p>
  </div>
</section>
```

---

## 🔧 Paso 4: Crear Auto-Login para Demo

Modificar [`app/login-saas/page.tsx`](app/login-saas/page.tsx):

### 4.1 Detectar Query Parameter `?demo=true`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginSaasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Auto-login para demo
  useEffect(() => {
    const isDemo = searchParams.get('demo') === 'true';
    if (isDemo) {
      handleDemoLogin();
    }
  }, [searchParams]);

  async function handleDemoLogin() {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login-saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'demo@lavapp.io',
          password: 'demo123'
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('empresaId', data.empresa.id);
        localStorage.setItem('empresaNombre', data.empresa.nombre);
        localStorage.setItem('userId', data.usuario.id);
        localStorage.setItem('userEmail', data.usuario.email);
        localStorage.setItem('isDemo', 'true'); // Flag especial para demo
        
        // Redirigir
        router.push('/');
      } else {
        setError('Error al acceder a la demo. Intenta nuevamente.');
      }
    } catch (err) {
      setError('Error de conexión. Verifica tu red.');
    } finally {
      setLoading(false);
    }
  }

  // ... resto del código normal de login ...
}
```

### 4.2 Mostrar Banner Durante Auto-Login

```typescript
// Agregar antes del formulario de login:

{searchParams.get('demo') === 'true' && (
  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8 rounded-2xl shadow-xl mb-6">
    <div className="flex items-center justify-center mb-4">
      {loading ? (
        <>
          <svg className="animate-spin h-8 w-8 text-white mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="text-xl font-bold">Accediendo a Demo...</span>
        </>
      ) : (
        <span className="text-xl font-bold">🎮 Modo Demo</span>
      )}
    </div>
    <p className="text-center text-sm opacity-90">
      Estás ingresando a una cuenta compartida. Los datos se limpian cada 24 horas.
    </p>
  </div>
)}
```

---

## 🔧 Paso 5: Agregar Banner en App Principal

Modificar [`app/page.tsx`](app/page.tsx) para mostrar banner cuando es demo:

### 5.1 Detectar Modo Demo

```typescript
'use client';

import { useState, useEffect } from 'react';

export default function HomePage() {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    const demoFlag = localStorage.getItem('isDemo');
    setIsDemo(demoFlag === 'true');
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Banner de Demo */}
      {isDemo && (
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎮</span>
              <div>
                <p className="font-bold">Modo Demo • Cuenta Compartida</p>
                <p className="text-xs opacity-90">Los datos se limpian cada 24 horas</p>
              </div>
            </div>
            <Link
              href="/registro"
              className="bg-white text-purple-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors"
            >
              Crear Mi Cuenta →
            </Link>
          </div>
        </div>
      )}

      {/* Resto de la app */}
      {/* ... */}
    </div>
  );
}
```

---

## 🔧 Paso 6: Script de Limpieza Automática

Crear [`scripts/limpiar-demo.ts`](scripts/limpiar-demo.ts):

```typescript
/**
 * Script para limpiar la base de datos demo cada 24 horas
 * Se ejecuta como cron job en Vercel
 */

import { neon } from '@neondatabase/serverless';

const DEMO_DB_URL = process.env.DEMO_DB_URL || ''; // Connection string del branch demo-publico

async function limpiarDemoDatabase() {
  if (!DEMO_DB_URL) {
    console.error('❌ DEMO_DB_URL no configurada');
    return;
  }

  const sql = neon(DEMO_DB_URL);

  console.log('[Demo Limpieza] 🧹 Iniciando limpieza...');

  try {
    // Eliminar movimientos de cuenta corriente
    await sql`DELETE FROM movimientos_cc`;
    console.log('[Demo Limpieza] ✅ Movimientos CC eliminados');

    // Eliminar cuentas corrientes
    await sql`DELETE FROM cuentas_corrientes`;
    console.log('[Demo Limpieza] ✅ Cuentas corrientes eliminadas');

    // Eliminar registros de lavado
    await sql`DELETE FROM registros`;
    console.log('[Demo Limpieza] ✅ Registros eliminados');

    // Eliminar clientes
    await sql`DELETE FROM clientes`;
    console.log('[Demo Limpieza] ✅ Clientes eliminados');

    // Resetear secuencias (IDs vuelven a 1)
    await sql`ALTER SEQUENCE registros_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE clientes_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE cuentas_corrientes_id_seq RESTART WITH 1`;
    await sql`ALTER SEQUENCE movimientos_cc_id_seq RESTART WITH 1`;
    console.log('[Demo Limpieza] ✅ Secuencias reseteadas');

    // Insertar datos de ejemplo
    await sql`
      INSERT INTO clientes (nombre, telefono, email, tiene_cuenta_corriente) VALUES
        ('Juan Pérez', '1234567890', 'juan@example.com', false),
        ('María García', '0987654321', 'maria@example.com', true),
        ('Carlos Rodríguez', '1122334455', 'carlos@example.com', false);
    `;
    console.log('[Demo Limpieza] ✅ Clientes de ejemplo creados');

    // Insertar registros de ejemplo
    await sql`
      INSERT INTO registros (patente, marca, modelo, color, cliente_id, tipo_vehiculo, servicio, precio, metodo_pago, estado) VALUES
        ('AA 123 BC', 'Toyota', 'Corolla', 'Blanco', 1, 'auto', 'Simple + Con Cera', 12000, 'efectivo', 'en_proceso'),
        ('AB 456 CD', 'Ford', 'Focus', 'Rojo', 2, 'auto', 'Completo', 15000, 'transferencia', 'listo'),
        ('AC 789 EF', 'Chevrolet', 'Cruze', 'Negro', 3, 'auto', 'Simple', 8000, 'efectivo', 'entregado');
    `;
    console.log('[Demo Limpieza] ✅ Registros de ejemplo creados');

    console.log('[Demo Limpieza] 🎉 Limpieza completada exitosamente');
    
    return {
      success: true,
      message: 'Demo database limpiada exitosamente',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[Demo Limpieza] ❌ Error:', error);
    throw error;
  }
}

// Si se ejecuta directamente (no como API endpoint)
if (require.main === module) {
  limpiarDemoDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { limpiarDemoDatabase };
```

### 6.1 Crear API Endpoint para Cron

Crear [`app/api/admin/limpiar-demo/route.ts`](app/api/admin/limpiar-demo/route.ts):

```typescript
import { NextResponse } from 'next/server';
import { limpiarDemoDatabase } from '@/scripts/limpiar-demo';

/**
 * API endpoint para limpiar demo database
 * Se ejecuta via Vercel Cron
 * 
 * Configuración en vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/admin/limpiar-demo",
 *     "schedule": "0 3 * * *"
 *   }]
 * }
 */
export async function GET(request: Request) {
  // Verificar token de autorización (Vercel Cron lo provee automáticamente)
  const authHeader = request.headers.get('authorization');
  
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const result = await limpiarDemoDatabase();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Failed to clean demo database',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
```

### 6.2 Configurar Vercel Cron

Crear [`vercel.json`](vercel.json) en la raíz:

```json
{
  "crons": [
    {
      "path": "/api/admin/limpiar-demo",
      "schedule": "0 3 * * *"
    }
  ]
}
```

Esto ejecutará la limpieza todos los días a las 3:00 AM.

### 6.3 Agregar Variables de Entorno en Vercel

```bash
# En Vercel Dashboard > Settings > Environment Variables:

DEMO_DB_URL="postgresql://..." # Connection string del branch demo-publico
CRON_SECRET="[generar-secret-aleatorio]" # Para proteger el endpoint
```

---

## 📊 Checklist de Implementación

### Fase 1: Configuración Inicial
- [ ] Cambiar API key de Neon (ver [`URGENTE_CAMBIAR_API_KEY.md`](URGENTE_CAMBIAR_API_KEY.md))
- [ ] Crear branch `demo-publico` en Neon
- [ ] Copiar connection string pooled
- [ ] Inicializar schema en el branch demo
- [ ] Registrar empresa demo en BD Central
- [ ] Crear usuario demo@lavapp.io

### Fase 2: Código Frontend
- [ ] Actualizar [`app/home/page.tsx`](app/home/page.tsx) con botón demo
- [ ] Modificar [`app/login-saas/page.tsx`](app/login-saas/page.tsx) para auto-login
- [ ] Agregar banner demo en [`app/page.tsx`](app/page.tsx)
- [ ] Probar flujo completo de demo

### Fase 3: Limpieza Automática
- [ ] Crear script [`scripts/limpiar-demo.ts`](scripts/limpiar-demo.ts)
- [ ] Crear endpoint [`app/api/admin/limpiar-demo/route.ts`](app/api/admin/limpiar-demo/route.ts)
- [ ] Configurar [`vercel.json`](vercel.json) con cron
- [ ] Agregar variables de entorno en Vercel
- [ ] Probar limpieza manualmente

### Fase 4: Testing y Deploy
- [ ] Probar en desarrollo local
- [ ] Deploy a Vercel
- [ ] Verificar cron job funciona
- [ ] Probar flujo completo en producción
- [ ] Monitorear por 48 horas

---

## 🎯 Resultado Esperado

Después de implementar todo:

1. **Usuario visita /home:**
   - Ve botón atractivo "🎮 Probar Demo Ahora"
   - Click lleva a auto-login

2. **Auto-login:**
   - Muestra banner "Accediendo a Demo..."
   - Login automático con demo@lavapp.io
   - Redirige a app principal

3. **Usando la app:**
   - Banner superior indica "Modo Demo"
   - Puede usar todas las funciones
   - Datos se comparten con otros usuarios demo

4. **Conversión:**
   - Banner siempre muestra botón "Crear Mi Cuenta"
   - Si le gusta, registro es 1 click

5. **Mantenimiento:**
   - Cada 24 horas, BD se limpia automáticamente
   - Datos de ejemplo se recrean
   - Sin intervención manual

---

## 📈 Métricas a Monitorear

Después de implementar, monitorear:

- **Conversión:** % de usuarios demo que se registran
- **Engagement:** Tiempo promedio en modo demo
- **Acciones:** Qué funciones prueban más
- **Problemas:** Errores o confusiones reportadas

---

**Siguiente paso:** Decidir si implementar esto antes o después de cambiar la API key.

**Recomendación:** Cambiar API key PRIMERO, luego implementar demo.
