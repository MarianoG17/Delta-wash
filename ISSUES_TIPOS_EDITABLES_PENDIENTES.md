# Issues Pendientes: Tipos Editables (Vehículos y Servicios)

**Fecha**: 2026-02-06 02:32 AM  
**Contexto**: Después de completar sistema de encuestas SaaS  
**Prioridad**: Media (no crítico, funcionalidad secundaria)

---

## Issue 1: Tipos de Servicios no se visualizan

**Descripción**: Se pueden agregar tipos de servicios nuevos en el modal, pero NO aparecen en el formulario principal de registro.

**Comportamiento esperado**:
- Al agregar nuevo tipo de servicio → debería aparecer inmediatamente en checkboxes

**Comportamiento actual**:
- Se agrega a la BD correctamente
- NO aparece en la lista de checkboxes del formulario

**Archivos involucrados**:
- [`app/api/tipos-limpieza/route.ts`](app/api/tipos-limpieza/route.ts:1) - API GET/POST
- [`app/page.tsx`](app/page.tsx:186) - `cargarTiposLimpieza()` función
- [`app/components/ModalTiposLimpieza.tsx`](app/components/ModalTiposLimpieza.tsx:18) - Modal de gestión

**Investigar**:
1. ¿El API devuelve el tipo nuevo?
2. ¿La función `cargarTiposLimpieza()` se ejecuta después de agregar?
3. ¿Hay cache del lado del cliente?

---

## Issue 2: Tipos de Vehículos permite eliminar con historial

**Descripción**: Se puede eliminar un tipo de vehículo aunque tenga registros asociados, lo cual pierde información histórica.

**Comportamiento esperado**:
- Al intentar eliminar tipo con registros → bloquear y mostrar error

**Comportamiento actual**:
- Permite eliminar sin validar
- Se pierde referencia en registros históricos

**Archivos involucrados**:
- [`app/api/tipos-vehiculo/[id]/route.ts`](app/api/tipos-vehiculo/[id]/route.ts:1) - DELETE endpoint
- Necesita validar: `SELECT COUNT(*) FROM registros_lavado WHERE tipo_vehiculo = nombre_tipo`

**Fix sugerido**:
```typescript
// Antes de DELETE, agregar:
const registros = await sql`
  SELECT COUNT(*) as total 
  FROM registros_lavado 
  WHERE tipo_vehiculo = ${tipoNombre}
`;

if (registros[0].total > 0) {
  return NextResponse.json(
    { error: `No se puede eliminar: hay ${registros[0].total} registros con este tipo` },
    { status: 400 }
  );
}
```

---

## Issue 3 (potencial): Tipos de Servicios eliminación?

**Pregunta**: ¿Tipos de servicios también permite eliminar con historial? Verificar lo mismo.

---

## Notas adicionales:

- **Tipos de vehículos SÍ se visualizan correctamente** (funciona bien)
- Estos issues NO afectan el flujo principal de registro
- Son mejoras de UX/data integrity
- Requieren sesión separada de debugging (es tarde, 02:32 AM)

## Recomendación:

Abordar en sesión futura con tiempo para:
1. Reproducir issue de visualización de servicios
2. Ver logs de browser console
3. Ver respuesta del API en Network tab
4. Implementar validación de eliminación con pruebas
