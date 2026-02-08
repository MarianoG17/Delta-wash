# Tareas Pendientes - Próxima Sesión

**Fecha:** 2026-02-08
**Estado:** Sistema de Archivar Empresas en curso

## 🎯 Objetivo Principal

Completar implementación del **Sistema de Archivar Empresas** en el panel super-admin.

## ✅ Ya Completado

- ✅ Migración SQL ejecutada ([`migration-add-contact-fields-and-logs.sql`](migration-add-contact-fields-and-logs.sql))
  - Campos: telefono, contacto_nombre, direccion
  - Tabla empresa_logs
- ✅ Plan detallado creado ([`PLAN_SISTEMA_ARCHIVAR.md`](PLAN_SISTEMA_ARCHIVAR.md))
- ✅ Panel super-admin base funcionando

## 🔨 Tareas Pendientes Inmediatas

### 1. **API: Endpoint PATCH para Archivar/Reactivar**

**Archivo:** `app/api/super-admin/empresas/route.ts`

Agregar después de DELETE:

```typescript
// PATCH: Archivar o reactivar empresa
export async function PATCH(request: Request) {
  try {
    const { empresa_id, accion, admin_email } = await request.json();
    
    if (!process.env.CENTRAL_DB_URL) {
      return NextResponse.json({ error: 'DB no configurada' }, { status: 500 });
    }

    const sql = neon(process.env.CENTRAL_DB_URL);

    if (accion === 'archivar') {
      // 1. Obtener empresa
      const empresaResult = await sql`SELECT * FROM empresas WHERE id = ${empresa_id}`;
      const empresa = empresaResult[0];

      if (!empresa) {
        return NextResponse.json({ error: 'Empresa no encontrada' }, { status: 404 });
      }

      // 2. Eliminar branch de Neon
      if (empresa.neon_branch_id) {
        try {
          await deleteBranch(empresa.neon_branch_id);
          console.log(`✓ Branch ${empresa.neon_branch_id} eliminado`);
        } catch (err) {
          console.error('Error eliminando branch:', err);
        }
      }

      // 3. Actualizar estado a archivado y limpiar branch info
      await sql`
        UPDATE empresas 
        SET estado = 'archivado',
            branch_url = NULL,
            neon_branch_id = NULL,
            updated_at = NOW()
        WHERE id = ${empresa_id}
      `;

      // 4. Log de auditoría
      await sql`
        INSERT INTO empresa_logs (empresa_id, empresa_nombre, accion, detalles, realizado_por)
        VALUES (${empresa_id}, ${empresa.nombre}, 'archivado', 
                'Branch eliminado de Neon para liberar espacio', ${admin_email})
      `;

      return NextResponse.json({ 
        success: true, 
        message: 'Empresa archivada y branch eliminado' 
      });
    }

    if (accion === 'reactivar') {
      // TODO: Implementar reactivación (crear nuevo branch)
      return NextResponse.json({ 
        error: 'Reactivación aún no implementada' 
      }, { status: 501 });
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });

  } catch (error) {
    console.error('Error en PATCH empresas:', error);
    return NextResponse.json({ error: 'Error en la operación' }, { status: 500 });
  }
}
```

### 2. **UI: Actualizar Super-Admin Page**

**Archivo:** `app/super-admin/page.tsx`

**Cambios necesarios:**

#### A. Actualizar Interface Empresa (línea 8-19):
```typescript
interface Empresa {
  id: number;
  nombre: string;
  email: string | null;
  neon_branch_id: string | null;
  created_at: string;
  trial_end_date: string | null;
  precio_mensual: number;
  descuento_porcentaje: number;
  precio_final: number;
  nota_descuento: string | null;
  // NUEVOS CAMPOS:
  telefono: string | null;
  contacto_nombre: string | null;
  direccion: string | null;
  estado: string; // 'activo' | 'archivado'
}
```

#### B. Agregar estado de filtro (después de línea 36):
```typescript
const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'archivados'>('activos');
```

#### C. Función para archivar (después de eliminarEmpresa):
```typescript
const archivarEmpresa = async (empresa: Empresa) => {
  const confirmacion = confirm(
    `¿ARCHIVAR empresa "${empresa.nombre}"?\n\n` +
    `Esto hará:\n` +
    `✓ Eliminar el branch de Neon (libera espacio)\n` +
    `✓ Mantener los datos de contacto\n` +
    `✓ Cambiar estado a "archivado"\n\n` +
    `Podrás reactivarla después si es necesario.`
  );

  if (!confirmacion) return;

  setLoading(true);
  try {
    const res = await fetch('/api/super-admin/empresas', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        empresa_id: empresa.id,
        accion: 'archivar',
        admin_email: 'admin@lavapp.ar' // O desde sessionStorage
      })
    });

    if (res.ok) {
      alert('Empresa archivada correctamente. Branch liberado.');
      await cargarEmpresas();
      await cargarBranchesCount();
    } else {
      const data = await res.json();
      alert(`Error: ${data.error}`);
    }
  } catch (err) {
    alert('Error al archivar empresa');
  } finally {
    setLoading(false);
  }
};
```

#### D. Actualizar GET en cargarEmpresas (agregar estado):
```typescript
// En la query SQL, agregar:
SELECT 
  id,
  nombre,
  email,
  neon_branch_id,
  created_at,
  trial_end_date,
  precio_mensual,
  descuento_porcentaje,
  precio_final,
  nota_descuento,
  telefono,
  contacto_nombre,
  direccion,
  COALESCE(estado, 'activo') as estado  // AGREGAR ESTO
FROM empresas
ORDER BY created_at DESC
```

#### E. Filtrar empresas antes de renderizar:
```typescript
const empresasFiltradas = empresas.filter(e => {
  if (filtroEstado === 'activos') return e.estado === 'activo';
  if (filtroEstado === 'archivados') return e.estado === 'archivado';
  return true; // 'todos'
});
```

#### F. Agregar botones de filtro (antes de la tabla):
```tsx
<div className="flex gap-2 mb-4">
  <button
    onClick={() => setFiltroEstado('activos')}
    className={`px-4 py-2 rounded ${
      filtroEstado === 'activos' 
        ? 'bg-blue-600 text-white' 
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Activos ({empresas.filter(e => e.estado === 'activo').length})
  </button>
  <button
    onClick={() => setFiltroEstado('archivados')}
    className={`px-4 py-2 rounded ${
      filtroEstado === 'archivados' 
        ? 'bg-gray-600 text-white' 
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Archivados ({empresas.filter(e => e.estado === 'archivado').length})
  </button>
  <button
    onClick={() => setFiltroEstado('todos')}
    className={`px-4 py-2 rounded ${
      filtroEstado === 'todos' 
        ? 'bg-purple-600 text-white' 
        : 'bg-gray-200 text-gray-700'
    }`}
  >
    Todos ({empresas.length})
  </button>
</div>
```

#### G. Actualizar render de filas (cambiar `empresas.map` por `empresasFiltradas.map`):
```tsx
{empresasFiltradas.map((empresa) => (
  <tr key={empresa.id} 
      className={`hover:bg-gray-50 ${
        empresa.estado === 'archivado' ? 'bg-gray-100 opacity-60' : ''
      }`}>
    {/* ... columnas existentes ... */}
    
    {/* AGREGAR COLUMNA ESTADO antes de ACCIONES */}
    <td className="px-4 py-4 text-sm">
      {empresa.estado === 'archivado' ? (
        <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
          📦 Archivado
        </span>
      ) : (
        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
          ✓ Activo
        </span>
      )}
    </td>
    
    {/* ACCIONES: Cambiar botón según estado */}
    <td className="px-4 py-4">
      {empresa.estado === 'activo' ? (
        <div className="flex gap-2">
          <button onClick={() => iniciarEdicion(empresa)}>
            ✏️ Editar
          </button>
          <button onClick={() => archivarEmpresa(empresa)}>
            📦 Archivar
          </button>
        </div>
      ) : (
        <div className="text-gray-500 text-sm">
          Archivado - Branch liberado
        </div>
      )}
    </td>
  </tr>
))}
```

### 3. **Agregar Campos de Contacto al Modal de Edición**

En el formulario de edición, agregar campos:
- Teléfono
- Nombre Contacto  
- Dirección

Y actualizar el PUT para guardar estos valores.

### 4. **Testing**

1. Archivar una empresa de prueba
2. Verificar en Neon que el branch se eliminó
3. Verificar que aparece en filtro "Archivados"
4. Verificar log en tabla empresa_logs
5. Verificar contador de branches (debe bajar)

## 📚 Referencias

- Plan completo: [`PLAN_SISTEMA_ARCHIVAR.md`](PLAN_SISTEMA_ARCHIVAR.md)
- Migración ejecutada: [`migration-add-contact-fields-and-logs.sql`](migration-add-contact-fields-and-logs.sql)
- Función deleteBranch: [`lib/neon-api.ts:601`](lib/neon-api.ts:601)

## 🚀 Orden de Implementación Sugerido

1. Agregar endpoint PATCH en API
2. Actualizar interface Empresa en UI
3. Agregar estado filtro y función archivar
4. Agregar botones de filtro
5. Actualizar render de tabla (estado y acciones)
6. Testing completo
7. Commit y deploy

## ⚠️ Importante

- Los branches archivados NO ocupan espacio en Neon
- Los datos se mantienen para follow-up comercial
- Los logs permiten auditoría completa de acciones
