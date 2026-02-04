# 🚀 Sprint 1: Tipos Editables + Configuración Encuestas

**Fecha inicio:** 2026-02-04  
**Duración estimada:** 8-10 horas (1.5-2 días)  
**Opción elegida:** B - Modal Simple desde Listas de Precios  
**Alcance:** Solo SaaS, NO tocar DeltaWash Legacy

---

## 🎯 Objetivos del Sprint

1. ✅ Tipos de vehículos editables (crear, editar, eliminar)
2. ✅ Tipos de lavado editables (crear, editar, eliminar)
3. ✅ Configuración de encuestas (Google Maps link personalizable)
4. ✅ Migración de datos existentes (preservar datos demo LAVAPP)

---

## 📋 Checklist de Tareas

### Fase 1: Base de Datos (2 horas)

- [ ] **1.1. Crear migración para tipos editables**
  - Archivo: `migration-tipos-editables.sql`
  - Crear tabla `tipos_vehiculo`
  - Crear tabla `tipos_limpieza`
  - Migrar datos existentes de LAVAPP
  - Mantener columnas viejas (backward compatible)

- [ ] **1.2. Crear migración para config encuestas**
  - Archivo: `migration-config-encuestas.sql`
  - Crear tabla `configuracion_encuestas`
  - Insertar config por defecto para empresas existentes

- [ ] **1.3. Ejecutar migraciones en branch "Lavadero"**
  - Verificar que datos demo se preservan
  - Backup antes de ejecutar

### Fase 2: Backend - APIs (3 horas)

- [ ] **2.1. CRUD Tipos de Vehículo**
  - `app/api/tipos-vehiculo/route.ts` - GET (listar), POST (crear)
  - `app/api/tipos-vehiculo/[id]/route.ts` - PUT (editar), DELETE (eliminar)

- [ ] **2.2. CRUD Tipos de Limpieza**
  - `app/api/tipos-limpieza/route.ts` - GET, POST
  - `app/api/tipos-limpieza/[id]/route.ts` - PUT, DELETE

- [ ] **2.3. Config Encuestas**
  - `app/api/config-encuestas/route.ts` - GET, PUT

- [ ] **2.4. Actualizar API de listas de precios**
  - Modificar para usar nuevas tablas (con fallback a columnas viejas)

### Fase 3: Frontend - UI (3 horas)

- [ ] **3.1. Modal Gestionar Tipos de Vehículo**
  - Componente: `app/components/ModalGestionarTiposVehiculo.tsx`
  - Listar tipos actuales
  - Editar inline
  - Eliminar con confirmación
  - Agregar nuevo

- [ ] **3.2. Modal Gestionar Tipos de Limpieza**
  - Componente: `app/components/ModalGestionarTiposLimpieza.tsx`
  - Similar a vehículos

- [ ] **3.3. Integrar modales en página Listas de Precios**
  - Botones "⚙️ Gestionar Tipos" debajo de la tabla
  - Refrescar lista al cerrar modal

- [ ] **3.4. Página Config Encuestas (simple)**
  - Ruta: `/configuracion/encuestas`
  - Campo: Google Maps Link (opcional)
  - Campo: Mensaje agradecimiento
  - Preview

### Fase 4: Testing (1 hora)

- [ ] **4.1. Testing manual**
  - Crear tipo de vehículo nuevo
  - Editar tipo existente
  - Eliminar tipo (verificar que no se puede si tiene precios)
  - Mismo flujo para tipos de limpieza
  - Configurar Google Maps link

- [ ] **4.2. Verificar datos demo LAVAPP**
  - Todos los datos se mantienen
  - Precios funcionan con nuevas tablas

### Fase 5: Documentación (30 min)

- [ ] **5.1. Actualizar README con nueva feature**
- [ ] **5.2. Documentar en INDICE_BASE_CONOCIMIENTO.md**
- [ ] **5.3. Agregar a APRENDIZAJES si hay lecciones**

---

## 📊 Detalle de Implementación

### 1. Migraciones SQL

#### `migration-tipos-editables.sql`

```sql
-- ============================================
-- MIGRACIÓN: Tipos Editables (Vehículos y Limpieza)
-- Fecha: 2026-02-04
-- Propósito: Permitir a cada empresa personalizar sus tipos
-- Ejecución: Branch específico de cada empresa (NO central)
-- ============================================

-- 1. CREAR TABLA TIPOS DE VEHÍCULO
CREATE TABLE IF NOT EXISTS tipos_vehiculo (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(50) NOT NULL,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(empresa_id, nombre)
);

CREATE INDEX idx_tipos_vehiculo_empresa ON tipos_vehiculo(empresa_id);
CREATE INDEX idx_tipos_vehiculo_activo ON tipos_vehiculo(empresa_id, activo);

-- 2. CREAR TABLA TIPOS DE LIMPIEZA
CREATE TABLE IF NOT EXISTS tipos_limpieza (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    orden INT DEFAULT 0,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(empresa_id, nombre)
);

CREATE INDEX idx_tipos_limpieza_empresa ON tipos_limpieza(empresa_id);
CREATE INDEX idx_tipos_limpieza_activo ON tipos_limpieza(empresa_id, activo);

-- 3. INSERTAR DATOS INICIALES PARA EMPRESAS EXISTENTES
-- (Basado en los tipos que usa DeltaWash actualmente)

DO $$
DECLARE
    empresa_record RECORD;
BEGIN
    FOR empresa_record IN SELECT id FROM empresas LOOP
        -- Tipos de Vehículo
        INSERT INTO tipos_vehiculo (empresa_id, nombre, orden)
        VALUES 
            (empresa_record.id, 'Auto', 1),
            (empresa_record.id, 'Camioneta', 2),
            (empresa_record.id, 'SUV', 3),
            (empresa_record.id, 'Pick-up', 4)
        ON CONFLICT (empresa_id, nombre) DO NOTHING;

        -- Tipos de Limpieza
        INSERT INTO tipos_limpieza (empresa_id, nombre, descripcion, orden)
        VALUES 
            (empresa_record.id, 'Lavado Básico', 'Lavado exterior + secado', 1),
            (empresa_record.id, 'Lavado Completo', 'Interior + exterior + aspirado + secado', 2),
            (empresa_record.id, 'Pulido', 'Lavado completo + pulido de pintura', 3),
            (empresa_record.id, 'Encerado', 'Lavado completo + cera protectora', 4),
            (empresa_record.id, 'Limpieza de Tapizados', 'Limpieza profunda de asientos y alfombras', 5),
            (empresa_record.id, 'Limpieza de Motor', 'Lavado y desengrase del motor', 6),
            (empresa_record.id, 'Tratamiento de Faros', 'Pulido y restauración de faros opacos', 7),
            (empresa_record.id, 'Limpieza de Chasis', 'Lavado de parte inferior del vehículo', 8)
        ON CONFLICT (empresa_id, nombre) DO NOTHING;
    END LOOP;
END $$;

-- 4. AGREGAR COLUMNAS A TABLA PRECIOS (nuevas, mantener las viejas)
ALTER TABLE precios 
ADD COLUMN IF NOT EXISTS tipo_vehiculo_id INT REFERENCES tipos_vehiculo(id),
ADD COLUMN IF NOT EXISTS tipo_limpieza_id INT REFERENCES tipos_limpieza(id);

-- 5. MIGRAR DATOS EXISTENTES (mapear strings a IDs)
-- Esto conecta los precios existentes con las nuevas tablas

UPDATE precios p
SET tipo_vehiculo_id = tv.id
FROM tipos_vehiculo tv
WHERE p.empresa_id = tv.empresa_id
  AND p.tipo_vehiculo = tv.nombre
  AND p.tipo_vehiculo_id IS NULL;

UPDATE precios p
SET tipo_limpieza_id = tl.id
FROM tipos_limpieza tl
WHERE p.empresa_id = tl.empresa_id
  AND p.tipo_limpieza = tl.nombre
  AND p.tipo_limpieza_id IS NULL;

-- 6. VERIFICACIÓN
-- Verificar que todos los precios tienen IDs asignados
SELECT COUNT(*) as precios_sin_vehiculo_id
FROM precios
WHERE tipo_vehiculo_id IS NULL;

SELECT COUNT(*) as precios_sin_limpieza_id
FROM precios
WHERE tipo_limpieza_id IS NULL;

-- Debería retornar 0 para ambos

-- ============================================
-- ROLLBACK (si algo sale mal)
-- ============================================
/*
DROP TABLE IF EXISTS tipos_limpieza CASCADE;
DROP TABLE IF EXISTS tipos_vehiculo CASCADE;
ALTER TABLE precios DROP COLUMN IF EXISTS tipo_vehiculo_id;
ALTER TABLE precios DROP COLUMN IF EXISTS tipo_limpieza_id;
*/
```

#### `migration-config-encuestas.sql`

```sql
-- ============================================
-- MIGRACIÓN: Configuración de Encuestas
-- Fecha: 2026-02-04
-- Propósito: Permitir personalizar config de encuestas por empresa
-- Ejecución: Branch específico de cada empresa
-- ============================================

CREATE TABLE IF NOT EXISTS configuracion_encuestas (
    id SERIAL PRIMARY KEY,
    empresa_id INT REFERENCES empresas(id) ON DELETE CASCADE,
    google_maps_link VARCHAR(500),
    mensaje_agradecimiento TEXT DEFAULT 'Gracias por tu opinión, nos ayuda a mejorar',
    texto_invitacion TEXT DEFAULT '¿Cómo fue tu experiencia?',
    dias_para_responder INT DEFAULT 7,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(empresa_id)
);

CREATE INDEX idx_config_encuestas_empresa ON configuracion_encuestas(empresa_id);

-- Insertar configuración por defecto para empresas existentes
INSERT INTO configuracion_encuestas (empresa_id, google_maps_link, mensaje_agradecimiento)
SELECT id, NULL, 'Gracias por tu opinión, nos ayuda a mejorar'
FROM empresas
ON CONFLICT (empresa_id) DO NOTHING;

-- ROLLBACK
/*
DROP TABLE IF EXISTS configuracion_encuestas;
*/
```

---

## 🔌 APIs Backend

### `app/api/tipos-vehiculo/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { getDBConnection } from '@/lib/db-saas';

// GET - Listar tipos de vehículo de la empresa
export async function GET(request: NextRequest) {
    try {
        const user = getAuthUser();
        if (!user?.isSaas || !user?.empresaId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const sql = await getDBConnection(user.empresaId);

        const tipos = await sql`
            SELECT id, nombre, orden, activo, created_at
            FROM tipos_vehiculo
            WHERE empresa_id = ${user.empresaId}
            ORDER BY orden ASC, nombre ASC
        `;

        return NextResponse.json({ success: true, tipos });
    } catch (error: any) {
        console.error('[API tipos-vehiculo GET] Error:', error);
        return NextResponse.json(
            { error: 'Error al obtener tipos de vehículo' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo tipo de vehículo
export async function POST(request: NextRequest) {
    try {
        const user = getAuthUser();
        if (!user?.isSaas || !user?.empresaId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { nombre } = await request.json();

        if (!nombre || nombre.trim() === '') {
            return NextResponse.json(
                { error: 'Nombre es requerido' },
                { status: 400 }
            );
        }

        const sql = await getDBConnection(user.empresaId);

        // Verificar que no exista ya
        const existe = await sql`
            SELECT id FROM tipos_vehiculo
            WHERE empresa_id = ${user.empresaId}
            AND nombre = ${nombre.trim()}
        `;

        if (existe.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe un tipo con ese nombre' },
                { status: 400 }
            );
        }

        // Obtener próximo orden
        const maxOrden = await sql`
            SELECT COALESCE(MAX(orden), 0) as max_orden
            FROM tipos_vehiculo
            WHERE empresa_id = ${user.empresaId}
        `;

        const nuevoOrden = (maxOrden[0]?.max_orden || 0) + 1;

        // Crear
        const resultado = await sql`
            INSERT INTO tipos_vehiculo (empresa_id, nombre, orden)
            VALUES (${user.empresaId}, ${nombre.trim()}, ${nuevoOrden})
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            tipo: resultado[0]
        });
    } catch (error: any) {
        console.error('[API tipos-vehiculo POST] Error:', error);
        return NextResponse.json(
            { error: 'Error al crear tipo de vehículo' },
            { status: 500 }
        );
    }
}
```

### `app/api/tipos-vehiculo/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-utils';
import { getDBConnection } from '@/lib/db-saas';

// PUT - Editar tipo de vehículo
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthUser();
        if (!user?.isSaas || !user?.empresaId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { nombre } = await request.json();
        const tipoId = parseInt(params.id);

        if (!nombre || nombre.trim() === '') {
            return NextResponse.json(
                { error: 'Nombre es requerido' },
                { status: 400 }
            );
        }

        const sql = await getDBConnection(user.empresaId);

        // Verificar que el tipo pertenece a la empresa
        const tipo = await sql`
            SELECT id FROM tipos_vehiculo
            WHERE id = ${tipoId}
            AND empresa_id = ${user.empresaId}
        `;

        if (tipo.length === 0) {
            return NextResponse.json(
                { error: 'Tipo no encontrado' },
                { status: 404 }
            );
        }

        // Verificar unicidad del nombre
        const existe = await sql`
            SELECT id FROM tipos_vehiculo
            WHERE empresa_id = ${user.empresaId}
            AND nombre = ${nombre.trim()}
            AND id != ${tipoId}
        `;

        if (existe.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe un tipo con ese nombre' },
                { status: 400 }
            );
        }

        // Actualizar
        const resultado = await sql`
            UPDATE tipos_vehiculo
            SET nombre = ${nombre.trim()},
                updated_at = NOW()
            WHERE id = ${tipoId}
            AND empresa_id = ${user.empresaId}
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            tipo: resultado[0]
        });
    } catch (error: any) {
        console.error('[API tipos-vehiculo PUT] Error:', error);
        return NextResponse.json(
            { error: 'Error al actualizar tipo' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar tipo de vehículo
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const user = getAuthUser();
        if (!user?.isSaas || !user?.empresaId) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const tipoId = parseInt(params.id);
        const sql = await getDBConnection(user.empresaId);

        // Verificar que no tenga precios asociados
        const preciosAsociados = await sql`
            SELECT COUNT(*) as count
            FROM precios
            WHERE tipo_vehiculo_id = ${tipoId}
            AND empresa_id = ${user.empresaId}
        `;

        if (parseInt(preciosAsociados[0]?.count || '0') > 0) {
            return NextResponse.json(
                { 
                    error: 'No se puede eliminar: tiene precios asociados',
                    detalles: `Hay ${preciosAsociados[0].count} precio(s) usando este tipo`
                },
                { status: 400 }
            );
        }

        // Eliminar
        await sql`
            DELETE FROM tipos_vehiculo
            WHERE id = ${tipoId}
            AND empresa_id = ${user.empresaId}
        `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[API tipos-vehiculo DELETE] Error:', error);
        return NextResponse.json(
            { error: 'Error al eliminar tipo' },
            { status: 500 }
        );
    }
}
```

*Nota: APIs para `tipos-limpieza` son análogas, cambiar tabla y validaciones.*

---

## 🎨 Componentes Frontend

### `app/components/ModalGestionarTiposVehiculo.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { X, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

interface TipoVehiculo {
    id: number;
    nombre: string;
    orden: number;
    activo: boolean;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void; // Callback para refrescar lista
}

export default function ModalGestionarTiposVehiculo({ isOpen, onClose, onUpdate }: Props) {
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [editando, setEditando] = useState<number | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [nombreEditar, setNombreEditar] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            cargarTipos();
        }
    }, [isOpen]);

    const cargarTipos = async () => {
        try {
            const res = await fetch('/api/tipos-vehiculo');
            const data = await res.json();
            if (data.success) {
                setTipos(data.tipos);
            }
        } catch (err) {
            console.error('Error al cargar tipos:', err);
        }
    };

    const agregarTipo = async () => {
        if (!nuevoNombre.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/tipos-vehiculo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nuevoNombre.trim() })
            });

            const data = await res.json();

            if (data.success) {
                setNuevoNombre('');
                await cargarTipos();
                onUpdate();
            } else {
                setError(data.error || 'Error al crear tipo');
            }
        } catch (err) {
            setError('Error al crear tipo');
        } finally {
            setLoading(false);
        }
    };

    const editarTipo = async (id: number) => {
        if (!nombreEditar.trim()) return;

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/tipos-vehiculo/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombreEditar.trim() })
            });

            const data = await res.json();

            if (data.success) {
                setEditando(null);
                setNombreEditar('');
                await cargarTipos();
                onUpdate();
            } else {
                setError(data.error || 'Error al editar tipo');
            }
        } catch (err) {
            setError('Error al editar tipo');
        } finally {
            setLoading(false);
        }
    };

    const eliminarTipo = async (id: number, nombre: string) => {
        if (!confirm(`¿Eliminar "${nombre}"? Solo se puede eliminar si no tiene precios asociados.`)) {
            return;
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/tipos-vehiculo/${id}`, {
                method: 'DELETE'
            });

            const data = await res.json();

            if (data.success) {
                await cargarTipos();
                onUpdate();
            } else {
                setError(data.error || 'Error al eliminar tipo');
            }
        } catch (err) {
            setError('Error al eliminar tipo');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">
                        🚗 Gestionar Tipos de Vehículo
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-start">
                            <AlertTriangle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Lista de tipos actuales */}
                    <div className="mb-6">
                        <h3 className="font-semibold text-gray-700 mb-3">Tipos Actuales:</h3>
                        <div className="space-y-2">
                            {tipos.map((tipo) => (
                                <div
                                    key={tipo.id}
                                    className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg"
                                >
                                    {editando === tipo.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={nombreEditar}
                                                onChange={(e) => setNombreEditar(e.target.value)}
                                                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        editarTipo(tipo.id);
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={() => editarTipo(tipo.id)}
                                                disabled={loading}
                                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditando(null);
                                                    setNombreEditar('');
                                                }}
                                                className="px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 text-gray-900">{tipo.nombre}</span>
                                            <button
                                                onClick={() => {
                                                    setEditando(tipo.id);
                                                    setNombreEditar(tipo.nombre);
                                                    setError('');
                                                }}
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                                title="Editar"
                                            >
                                                <Pencil size={18} />
                                            </button>
                                            <button
                                                onClick={() => eliminarTipo(tipo.id, tipo.nombre)}
                                                disabled={loading}
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Agregar nuevo */}
                    <div className="border-t pt-4">
                        <h3 className="font-semibold text-gray-700 mb-3">Agregar Nuevo:</h3>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoNombre}
                                onChange={(e) => setNuevoNombre(e.target.value)}
                                placeholder="Ej: Sedan, Moto, Furgón..."
                                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        agregarTipo();
                                    }
                                }}
                            />
                            <button
                                onClick={agregarTipo}
                                disabled={loading || !nuevoNombre.trim()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Plus size={20} />
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
```

*Nota: `ModalGestionarTiposLimpieza.tsx` es análogo, agregando campo `descripcion`.*

---

## 🔗 Integración en Listas de Precios

### Modificar `app/listas-precios/page.tsx`

Agregar después de la tabla de precios:

```typescript
'use client';

import { useState } from 'react';
import ModalGestionarTiposVehiculo from '@/app/components/ModalGestionarTiposVehiculo';
import ModalGestionarTiposLimpieza from '@/app/components/ModalGestionarTiposLimpieza';

export default function ListasPreciosPage() {
    const [modalVehiculos, setModalVehiculos] = useState(false);
    const [modalLimpieza, setModalLimpieza] = useState(false);

    const handleRefresh = () => {
        // Refrescar lista de precios
        cargarPrecios();
    };

    return (
        <div>
            {/* ... tabla de precios existente ... */}

            {/* Botones de gestión */}
            <div className="mt-6 flex gap-4 justify-center">
                <button
                    onClick={() => setModalVehiculos(true)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                    ⚙️ Gestionar Tipos de Vehículo
                </button>
                <button
                    onClick={() => setModalLimpieza(true)}
                    className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                    ⚙️ Gestionar Tipos de Lavado
                </button>
            </div>

            {/* Modales */}
            <ModalGestionarTiposVehiculo
                isOpen={modalVehiculos}
                onClose={() => setModalVehiculos(false)}
                onUpdate={handleRefresh}
            />
            <ModalGestionarTiposLimpieza
                isOpen={modalLimpieza}
                onClose={() => setModalLimpieza(false)}
                onUpdate={handleRefresh}
            />
        </div>
    );
}
```

---

## ⚠️ Consideraciones Importantes

### Backward Compatibility

Mantener las columnas viejas (`tipo_vehiculo`, `tipo_limpieza`) en tabla `precios` temporalmente:

```typescript
// En API de precios, usar fallback
const tipoVehiculoDisplay = precio.tipo_vehiculo_id 
    ? await getTipoVehiculoNombre(precio.tipo_vehiculo_id)
    : precio.tipo_vehiculo; // Fallback a columna vieja
```

### No Romper DeltaWash Legacy

Las migraciones se ejecutan SOLO en branches SaaS, NO en branch "Deltawash".

### Validaciones

- No eliminar tipo si tiene precios asociados
- Nombres únicos por empresa
- Confirmación antes de eliminar

---

## 📅 Timeline

| Día | Horas | Tareas |
|-----|-------|--------|
| **Día 1 (AM)** | 4h | Fase 1 + Fase 2.1-2.2 |
| **Día 1 (PM)** | 4h | Fase 2.3-2.4 + Fase 3.1-3.2 |
| **Día 2 (AM)** | 2h | Fase 3.3-3.4 + Fase 4 |

**Total:** ~10 horas

---

## ✅ Criterios de Aceptación

- [ ] Usuario puede ver tipos de vehículo actuales
- [ ] Usuario puede crear nuevo tipo de vehículo
- [ ] Usuario puede editar nombre de tipo existente
- [ ] Usuario puede eliminar tipo (si no tiene precios)
- [ ] Mismo flujo para tipos de lavado
- [ ] Config de encuestas permite editar Google Maps link
- [ ] Datos demo de LAVAPP se preservan
- [ ] Todo funciona solo en SaaS, Legacy no se toca

---

**¿Listo para empezar? ¿Alguna pregunta antes de comenzar con la implementación?**
