# Plan: Sistema de Archivar Empresas

## Estado Actual
- ✅ Migración creada: [`migration-add-contact-fields-and-logs.sql`](migration-add-contact-fields-and-logs.sql)
- ⏳ Pendiente: Implementar UI y lógica

## Migración SQL

Ejecutar en CENTRAL_DB_URL:
- Agrega columnas: `telefono`, `contacto_nombre`, `direccion`
- Crea tabla `empresa_logs` para auditoría
- Índices para performance

## Archivos a Modificar

### 1. API: Archivar empresa
**Archivo:** `app/api/super-admin/empresas/route.ts`

Agregar nuevo endpoint `PATCH`:
```typescript
// PATCH: Archivar empresa (elimina branch, mantiene datos)
export async function PATCH(request: Request) {
  const { empresa_id, accion } = await request.json();
  
  if (accion === 'archivar') {
    // 1. Obtener info de la empresa
    // 2. Eliminar branch de Neon con deleteBranch()
    // 3. UPDATE empresas SET estado='archivado', branch_url=NULL, neon_branch_id=NULL
    // 4. INSERT en empresa_logs
  }
  
  if (accion === 'reactivar') {
    // 1. Crear nuevo branch con createBranchForEmpresa()
    // 2. UPDATE empresas SET estado='activo', branch_url=..., neon_branch_id=...
    // 3. INSERT en empresa_logs
  }
}
```

### 2. UI: Panel Super-Admin
**Archivo:** `app/super-admin/page.tsx`

**Cambios necesarios:**

1. **Interface Empresa** - Agregar campos:
```typescript
interface Empresa {
  // ... existentes
  telefono: string | null;
  contacto_nombre: string | null;
  direccion: string | null;
}
```

2. **Estado de filtro:**
```typescript
const [filtro, setFiltro] = useState<'todos' | 'activos' | 'archivados'>('activos');
```

3. **Filtros en UI** (arriba de la tabla):
```tsx
<div className="flex gap-2 mb-4">
  <button onClick={() => setFiltro('activos')}>Activos</button>
  <button onClick={() => setFiltro('archivados')}>Archivados</button>
  <button onClick={() => setFiltro('todos')}>Todos</button>
</div>
```

4. **Función archivar:**
```typescript
const archivarEmpresa = async (id: number) => {
  await fetch('/api/super-admin/empresas', {
    method: 'PATCH',
    body: JSON.stringify({ empresa_id: id, accion: 'archivar' })
  });
  cargarEmpresas();
};
```

5. **Modal para editar contacto:**
- Agregar campos: Teléfono, Nombre Contacto, Dirección
- Guardar en PUT existente

6. **Columnas de tabla:**
- Agregar columna "Estado" (Activo/Archivado)
- Mostrar datos de contacto expandibles
- Botón "Archivar" solo para activos
- Botón "Reactivar" solo para archivados

7. **Estilo archivados:**
```tsx
className={`${empresa.estado === 'archivado' ? 'bg-gray-100 opacity-70' : ''}`}
```

### 3. Vista de Logs
**Archivo:** `app/super-admin/logs/page.tsx` (NUEVO)

Página dedicada para ver el historial de acciones:
- Filtros por empresa, acción, fecha
- Tabla con: Fecha, Empresa, Acción, Detalles, Realizado por
- Paginación

**Ruta API:** `app/api/super-admin/logs/route.ts`

## Orden de Implementación

1. ✅ Crear migración SQL
2. Ejecutar migración en CENTRAL_DB_URL
3. Agregar endpoint PATCH en `/api/super-admin/empresas/route.ts`
4. Actualizar interface y estado en `app/super-admin/page.tsx`
5. Agregar filtros UI (Activos/Archivados/Todos)
6. Agregar campos de contacto al modal de edición
7. Implementar botones "Archivar" y "Reactivar"
8. Crear página de logs (opcional pero recomendado)
9. Testing completo
10. Deploy

## Testing Manual

Después de implementar:

1. Crear empresa de prueba
2. Archivarla → Verificar:
   - Branch eliminado en Neon (count baja)
   - Empresa visible en filtro "Archivados"
   - Log creado en empresa_logs
3. Reactivarla → Verificar:
   - Nuevo branch creado
   - Empresa activa again
   - Log de reactivación

## Notas Importantes

- **No borrar datos**: El archivado SOLO elimina el branch, mantiene todo en DB
- **Logs inmutables**: La tabla `empresa_logs` nunca se borra, es el historial permanente
- **Branch names**: Al reactivar, usar mismo nombre + timestamp o sufijo
- **Email/teléfono**: Requeridos al crear empresa para poder contactar después

## Próxima Sesión

Por límite de tokens, continuar en próxima sesión con:
- Implementación completa del código
- Testing
- Deploy

**Commit preparatorio creado:** Migración lista para ejecutar.
