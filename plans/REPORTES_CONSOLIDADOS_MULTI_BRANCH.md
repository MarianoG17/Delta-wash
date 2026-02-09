# 📊 Reportes Consolidados Multi-Branch

**Fecha**: 2026-02-09  
**Objetivo**: Consultar múltiples branches para reportes consolidados SIN modificar la arquitectura base

---

## 🎯 Concepto

**Mantener**: 1 Branch = 1 Sucursal (sin cambios)  
**Agregar**: API especial que consulta N branches en paralelo y consolida resultados

---

## 🏗️ Arquitectura de Solución

### Estado Actual
```
Branch A (DeltaWash Centro)   → BD Independiente
Branch B (DeltaWash Norte)    → BD Independiente  
Branch C (DeltaWash Sur)      → BD Independiente
```

### Con Reportes Consolidados
```
                    ┌──────────────────────┐
                    │  API Consolidada     │
                    │  /api/consolidado    │
                    └──────────────────────┘
                             ↓
              ┌──────────────┼──────────────┐
              ↓              ↓              ↓
         Branch A        Branch B       Branch C
         (Centro)        (Norte)         (Sur)
              ↓              ↓              ↓
         Resultados     Resultados     Resultados
              ↓              ↓              ↓
              └──────────────┴──────────────┘
                             ↓
                    Merge + Agregación
                             ↓
                    Reporte Consolidado
```

---

## 💻 Implementación Técnica

### Paso 1: Identificar Sucursales Relacionadas

**Opción A: En tabla `empresas`** (BD Central)
```sql
ALTER TABLE empresas ADD COLUMN empresa_matriz_id INTEGER;
ALTER TABLE empresas ADD COLUMN es_sucursal BOOLEAN DEFAULT false;
```

**Ejemplo de datos**:
```
| id | nombre            | empresa_matriz_id | branch_url              |
|----|-------------------|-------------------|-------------------------|
| 1  | DeltaWash         | NULL              | NULL (es la matriz)     |
| 2  | DeltaWash Centro  | 1                 | postgresql://branch-a   |
| 3  | DeltaWash Norte   | 1                 | postgresql://branch-b   |
| 4  | DeltaWash Sur     | 1                 | postgresql://branch-c   |
```

**Query para obtener sucursales**:
```sql
SELECT id, nombre, branch_url 
FROM empresas 
WHERE empresa_matriz_id = $1 
  AND es_sucursal = true;
```

---

### Paso 2: Crear API de Reportes Consolidados

**Nueva ruta**: `/api/reportes/consolidado`

```typescript
// app/api/reportes/consolidado/route.ts
import { neon } from '@neondatabase/serverless';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const empresaMatrizId = searchParams.get('empresaMatrizId');
    const fechaDesde = searchParams.get('desde');
    const fechaHasta = searchParams.get('hasta');

    // 1. Obtener todas las sucursales de la empresa matriz
    const sucursales = await getSucursales(empresaMatrizId);

    // 2. Consultar cada branch en paralelo
    const promesas = sucursales.map(async (sucursal) => {
        const sql = neon(sucursal.branch_url);
        
        const registros = await sql`
            SELECT 
                COUNT(*) as total_registros,
                SUM(precio) as total_ventas,
                AVG(precio) as ticket_promedio
            FROM registros_lavado
            WHERE fecha >= ${fechaDesde}
              AND fecha <= ${fechaHasta}
              AND NOT anulado
        `;

        return {
            sucursal: sucursal.nombre,
            ...registros[0]
        };
    });

    // 3. Esperar todos los resultados
    const resultados = await Promise.all(promesas);

    // 4. Consolidar totales
    const consolidado = {
        sucursales: resultados,
        totales: {
            total_registros: resultados.reduce((sum, r) => sum + Number(r.total_registros), 0),
            total_ventas: resultados.reduce((sum, r) => sum + Number(r.total_ventas), 0),
            ticket_promedio: resultados.reduce((sum, r) => sum + Number(r.ticket_promedio), 0) / resultados.length
        }
    };

    return Response.json({ success: true, data: consolidado });
}

async function getSucursales(empresaMatrizId: string) {
    // Consultar BD Central para obtener sucursales
    const sql = neon(process.env.DATABASE_URL!);
    
    return await sql`
        SELECT id, nombre, branch_url 
        FROM empresas 
        WHERE empresa_matriz_id = ${empresaMatrizId}
          AND es_sucursal = true
          AND estado = 'activo'
    `;
}
```

---

### Paso 3: UI de Reporte Consolidado

**Nueva página**: `/app/reportes/consolidado/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';

interface ResultadoSucursal {
    sucursal: string;
    total_registros: number;
    total_ventas: number;
    ticket_promedio: number;
}

export default function ReporteConsolidado() {
    const [resultados, setResultados] = useState<ResultadoSucursal[]>([]);
    const [totales, setTotales] = useState<any>(null);

    const cargarReporte = async () => {
        const res = await fetch('/api/reportes/consolidado?empresaMatrizId=1&desde=2026-02-01&hasta=2026-02-28');
        const data = await res.json();
        
        if (data.success) {
            setResultados(data.data.sucursales);
            setTotales(data.data.totales);
        }
    };

    return (
        <div>
            <h1>📊 Reporte Consolidado - DeltaWash</h1>
            
            {/* Totales Generales */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-100 p-4 rounded">
                    <h3>Total Registros</h3>
                    <p className="text-2xl">{totales?.total_registros}</p>
                </div>
                <div className="bg-green-100 p-4 rounded">
                    <h3>Total Ventas</h3>
                    <p className="text-2xl">${totales?.total_ventas.toFixed(2)}</p>
                </div>
                <div className="bg-purple-100 p-4 rounded">
                    <h3>Ticket Promedio</h3>
                    <p className="text-2xl">${totales?.ticket_promedio.toFixed(2)}</p>
                </div>
            </div>

            {/* Detalle por Sucursal */}
            <table className="w-full mt-6">
                <thead>
                    <tr>
                        <th>Sucursal</th>
                        <th>Registros</th>
                        <th>Ventas</th>
                        <th>Ticket Promedio</th>
                    </tr>
                </thead>
                <tbody>
                    {resultados.map(r => (
                        <tr key={r.sucursal}>
                            <td>{r.sucursal}</td>
                            <td>{r.total_registros}</td>
                            <td>${r.total_ventas.toFixed(2)}</td>
                            <td>${r.ticket_promedio.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
```

---

## 📊 Ejemplos de Reportes Consolidados

### Reporte 1: Ventas por Sucursal
```typescript
const reporteVentas = sucursales.map(async (sucursal) => {
    const sql = neon(sucursal.branch_url);
    
    return await sql`
        SELECT 
            '${sucursal.nombre}' as sucursal,
            DATE(fecha_ingreso) as fecha,
            COUNT(*) as cantidad,
            SUM(precio) as total
        FROM registros_lavado
        WHERE fecha_ingreso >= ${fechaDesde}
          AND fecha_ingreso <= ${fechaHasta}
        GROUP BY DATE(fecha_ingreso)
        ORDER BY fecha
    `;
});
```

### Reporte 2: Top 10 Clientes Consolidado
```typescript
// Obtener top clientes de cada sucursal
const topClientesPorSucursal = await Promise.all(
    sucursales.map(async (sucursal) => {
        const sql = neon(sucursal.branch_url);
        
        return await sql`
            SELECT 
                celular,
                nombre,
                COUNT(*) as visitas,
                SUM(precio) as total_gastado
            FROM registros_lavado
            WHERE NOT anulado
            GROUP BY celular, nombre
            ORDER BY visitas DESC
            LIMIT 10
        `;
    })
);

// Consolidar y ordenar
const todosLosClientes = topClientesPorSucursal.flat();
const topGlobal = todosLosClientes
    .sort((a, b) => b.visitas - a.visitas)
    .slice(0, 10);
```

### Reporte 3: Comparativa Entre Sucursales
```typescript
const comparativa = await Promise.all(
    sucursales.map(async (sucursal) => {
        const sql = neon(sucursal.branch_url);
        
        const [ventas] = await sql`
            SELECT 
                COUNT(*) as total_lavados,
                SUM(precio) as ingresos,
                AVG(precio) as ticket_promedio,
                COUNT(DISTINCT celular) as clientes_unicos
            FROM registros_lavado
            WHERE fecha_ingreso >= ${fechaDesde}
        `;

        return {
            sucursal: sucursal.nombre,
            ...ventas
        };
    })
);
```

---

## 🎨 Mockup UI - Reporte Consolidado

```
┌──────────────────────────────────────────────────────────────┐
│ 📊 Reporte Consolidado - DeltaWash                           │
│ Período: Febrero 2026                                        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  TOTALES GENERALES                                          │
│  ┌─────────────┬─────────────┬─────────────┐              │
│  │ 📋 Lavados  │ 💰 Ventas   │ 🎫 Ticket   │              │
│  │   1,250     │  $450,000   │   $360      │              │
│  └─────────────┴─────────────┴─────────────┘              │
│                                                              │
│  COMPARATIVA POR SUCURSAL                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Sucursal  │ Lavados │ Ventas    │ Ticket │ Share  │    │
│  ├────────────────────────────────────────────────────┤    │
│  │ Centro    │   550   │ $198,000  │ $360   │  44%   │    │
│  │ Norte     │   420   │ $151,200  │ $360   │  33%   │    │
│  │ Sur       │   280   │ $100,800  │ $360   │  22%   │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  📈 GRÁFICO DE TENDENCIAS                                   │
│  [Gráfico de líneas comparando las 3 sucursales]           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## ⚡ Performance y Optimización

### Problema: Consultas Lentas
Si tenés muchas sucursales o mucha data, puede tardar.

### Solución 1: Caché
```typescript
import { unstable_cache } from 'next/cache';

const getReporteConsolidado = unstable_cache(
    async (empresaId, fechaDesde, fechaHasta) => {
        // ... consultas a branches
    },
    ['reporte-consolidado'],
    { revalidate: 3600 } // Cache 1 hora
);
```

### Solución 2: Consultas en Paralelo (Ya lo hacemos con Promise.all)
✅ Ya está en el código anterior

### Solución 3: Pre-agregación
Crear una tabla en BD Central que guarde totales diarios:
```sql
CREATE TABLE metricas_diarias (
    id SERIAL PRIMARY KEY,
    empresa_id INTEGER,
    fecha DATE,
    total_lavados INTEGER,
    total_ventas DECIMAL(10,2),
    updated_at TIMESTAMP
);
```

Actualizar cada noche con un cron job:
```typescript
// Cada noche a las 2am
export async function actualizarMetricas() {
    const sucursales = await getSucursales();
    
    for (const sucursal of sucursales) {
        const sql = neon(sucursal.branch_url);
        const [metricas] = await sql`
            SELECT 
                COUNT(*) as total_lavados,
                SUM(precio) as total_ventas
            FROM registros_lavado
            WHERE DATE(fecha_ingreso) = CURRENT_DATE
        `;
        
        // Guardar en BD Central
        await guardarMetricas(sucursal.id, metricas);
    }
}
```

---

## 🔒 Seguridad y Permisos

### Control de Acceso
Solo usuarios con permiso `ver_consolidado` pueden acceder:

```typescript
export async function GET(request: Request) {
    const user = getAuthUser();
    
    // Verificar que el usuario tiene permiso
    if (!user.permisos.includes('ver_consolidado')) {
        return Response.json(
            { error: 'No autorizado' }, 
            { status: 403 }
        );
    }
    
    // ... resto del código
}
```

### Nueva tabla de permisos
```sql
ALTER TABLE usuarios ADD COLUMN puede_ver_consolidado BOOLEAN DEFAULT false;
```

Solo admins o gerentes generales tendrían este permiso activado.

---

## 💡 Ventajas de Este Enfoque

### ✅ Pro
1. **No modifica arquitectura base** - Cada sucursal sigue independiente
2. **Bajo riesgo** - Si falla consolidado, cada sucursal funciona normal
3. **Opcional** - Solo lo implementás si un cliente lo pide
4. **Escalable** - Agregás más sucursales sin problemas
5. **Flexible** - Podés hacer cualquier tipo de reporte consolidado

### ⚠️ Consideraciones
1. **Performance** - Con muchas sucursales (10+) puede ser lento
   - **Solución**: Usar caché y pre-agregación
2. **Costos Neon** - Más conexiones simultáneas
   - **Impacto**: Mínimo con Plan Pro de Neon
3. **Complejidad código** - Más código que mantener
   - **Mitigación**: Bien documentado y testeado

---

## 📋 Checklist de Implementación

### Fase 1: Setup Básico (1-2 horas)
- [ ] Agregar columnas `empresa_matriz_id` y `es_sucursal` a tabla empresas
- [ ] Marcar sucursales existentes con su matriz

### Fase 2: API (2-3 horas)
- [ ] Crear `/api/reportes/consolidado/route.ts`
- [ ] Función para obtener sucursales
- [ ] Función para consultar múltiples branches
- [ ] Función para consolidar resultados

### Fase 3: UI (2-3 horas)
- [ ] Crear página `/reportes/consolidado`
- [ ] Mostrar totales generales
- [ ] Mostrar tabla por sucursal
- [ ] Agregar gráficos (opcional)

### Fase 4: Testing (1-2 horas)
- [ ] Probar con 2-3 sucursales
- [ ] Verificar performance
- [ ] Probar filtros de fecha

### Fase 5: Optimización (Opcional, 1-2 horas)
- [ ] Agregar caché
- [ ] Pre-agregación nocturna
- [ ] Índices en BD

**Total**: 6-10 horas de desarrollo

---

## 🎯 Ejemplo Concreto

### Caso de Uso: DeltaWash con 3 Sucursales

**Setup**:
```sql
-- BD Central
UPDATE empresas SET empresa_matriz_id = NULL WHERE nombre = 'DeltaWash';
UPDATE empresas SET empresa_matriz_id = 1, es_sucursal = true WHERE nombre IN ('DeltaWash Centro', 'DeltaWash Norte', 'DeltaWash Sur');
```

**Consulta**:
```
GET /api/reportes/consolidado?empresaMatrizId=1&desde=2026-02-01&hasta=2026-02-28
```

**Respuesta**:
```json
{
  "success": true,
  "data": {
    "sucursales": [
      {
        "sucursal": "DeltaWash Centro",
        "total_registros": 550,
        "total_ventas": 198000,
        "ticket_promedio": 360
      },
      {
        "sucursal": "DeltaWash Norte",
        "total_registros": 420,
        "total_ventas": 151200,
        "ticket_promedio": 360
      },
      {
        "sucursal": "DeltaWash Sur",
        "total_registros": 280,
        "total_ventas": 100800,
        "ticket_promedio": 360
      }
    ],
    "totales": {
      "total_registros": 1250,
      "total_ventas": 450000,
      "ticket_promedio": 360
    }
  }
}
```

---

## ✅ Conclusión

**SÍ, se puede hacer reportes consolidados sin cambiar la arquitectura base.**

**Método**:
1. Agregar identificación de sucursales relacionadas (BD Central)
2. Crear API que consulta múltiples branches en paralelo
3. Consolidar resultados en el backend
4. Mostrar en UI especial

**Beneficio**: Lo mejor de ambos mundos - sucursales independientes + reportes consolidados cuando se necesitan.

**Tiempo**: 6-10 horas de desarrollo  
**Complejidad**: Media  
**Riesgo**: Bajo
