# 📋 PENDIENTES CONSOLIDADO - LAVAPP 2026

**Fecha de consolidación**: 2026-02-09  
**Estado del proyecto**: En producción activo  
**Última actualización**: Commit 7a58740

---

## 🔴 PRIORIDAD CRÍTICA (Hacer ASAP)

### 1. ✅ **COMPLETADO**: Fix validación tipos de vehículo
- **Issue**: Permitía eliminar tipos con historial
- **Estado**: ✅ Resuelto en commit 7a58740
- **Detalles**: Corregido nombre de tabla (`registros` → `registros_lavado`)

---

## 🟠 PRIORIDAD ALTA (Próximas semanas)

### 2. ⚠️ **Sistema de Backup Automático a Google Drive**
**Estado**: Diseñado, pendiente implementación  
**Documentos**: 
- [`plans/DISEÑO_BACKUP_GOOGLE_DRIVE_2026_V2.md`](plans/DISEÑO_BACKUP_GOOGLE_DRIVE_2026_V2.md:1)
- [`plans/OPCIONES_BACKUP_COMPARATIVA.md`](plans/OPCIONES_BACKUP_COMPARATIVA.md:1)

**Qué hacer**:
1. Crear Service Account de Google Cloud
2. Configurar secrets en GitHub (no Vercel)
3. Crear scripts:
   - `scripts/backup-to-drive.js`
   - `scripts/restore-from-drive.js`
   - `scripts/validate-restore.js`
4. Crear GitHub Actions workflow `.github/workflows/backup-daily.yml`
5. Testing completo en staging

**Tiempo estimado**: 5-7 días de desarrollo + testing  
**Beneficio**: Protección completa de datos, $0 de costo  
**Urgencia**: Alta (antes de tener muchos clientes)

---

### 3. ✅ **Tipos Editables - RESUELTO**
**Documento**: [`PENDIENTES_PROXIMA_SESION.md`](PENDIENTES_PROXIMA_SESION.md:27)

**Estado**: ✅ Completamente funcional
- ✅ Tipos de servicios nuevos aparecen correctamente en formulario
- ✅ Eliminación con historial bloqueada (commit 7a58740)
- ✅ Carga dinámica funciona correctamente

**Confirmado por usuario**: "los items nuevos ya me aparecen hace unos dias. eso esta resuelto"
**Fecha de resolución**: 2026-02-09

---

### 4. ✅ **Canje de Beneficios - COMPLETADO**
**Documento**: [`IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md`](IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md:414)

**Estado**: ✅ Completamente funcional e integrado
- ✅ API de verificar beneficios: Implementada
- ✅ API de canjear beneficios: Implementada
- ✅ Integración en flujo de registro: Implementada en [`app/page.tsx`](app/page.tsx:344)
- ✅ Detección automática al buscar por celular
- ✅ UI con checkboxes para seleccionar beneficios
- ✅ Aplicación automática de descuentos

**Confirmado por usuario**: "canje de beneficios lo uso y esta ok"
**Fecha de resolución**: Febrero 2026

---

## 🟡 PRIORIDAD MEDIA (Este mes)

### 5. 💡 **Módulo de Control de Caja**
**Mencionado en**: Múltiples documentos de planificación

**Funcionalidades**:
- Apertura/cierre de caja diario
- Registro de movimientos de efectivo
- Conciliación de pagos vs caja
- Reportes de diferencias
- Auditoría de operaciones

**Qué hacer**:
1. Diseñar schema de BD
2. Crear APIs para movimientos de caja
3. UI de apertura/cierre
4. Dashboard de control
5. Reportes

**Tiempo estimado**: 15-20 horas (3-4 días)  
**Beneficio**: Control financiero profesional  
**Urgencia**: Media (útil pero no crítico)

---

### 6. 🔧 **Sincronización Automática de Usuarios**
**Documento**: [`AUDITORIA_COMPLETA_PROYECTO_SAAS.md`](AUDITORIA_COMPLETA_PROYECTO_SAAS.md:380)

**Problema**:
Al crear usuario en `/api/usuarios`, NO se sincroniza automáticamente al branch de la empresa

**Soluciones posibles**:
1. **Opción A**: Agregar sincronización en el endpoint de creación
2. **Opción B**: Lazy sync en primera carga (ya implementado como fallback)
3. **Opción C**: Cron job para sincronizar usuarios pendientes

**Estado actual**: Lazy sync funciona como workaround  
**Qué hacer**: Evaluar si el lazy sync es suficiente o implementar Opción A  
**Tiempo estimado**: 2-3 horas  
**Urgencia**: Baja (lazy sync funciona bien)

---

### 7. ✅ **Botón de Encuesta Enviada - RESUELTO**
**Documento**: [`plans/FIX_BOTON_ENCUESTA_ENVIADA.md`](plans/FIX_BOTON_ENCUESTA_ENVIADA.md:1)

**Estado**: ✅ Completamente funcional
- ✅ Interface `Survey` con campo `sentAt`
- ✅ 3 estados visuales implementados (sin enviar/enviada/respondida)
- ✅ Actualización inmediata tras envío (commit 9fe4371)

**Mejora aplicada**: Agregado delay de 300ms y await en recarga para asegurar actualización inmediata
**Fecha de resolución**: 2026-02-09

---

## 🟢 PRIORIDAD BAJA (Futuro/Cuando haya demanda)

### 8. 📱 **Sistema de Turnos a Domicilio**
**Documento**: [`plans/SISTEMA_TURNOS_DOMICILIO.md`](plans/SISTEMA_TURNOS_DOMICILIO.md:1)

**Estado**: Diseño completo, NO implementado

**Funcionalidades diseñadas**:
- Agenda de turnos
- Asignación de operadores
- Rutas optimizadas
- Notificaciones automáticas
- Confirmación por cliente

**Tiempo estimado**: 40-50 horas (2 semanas)  
**Beneficio**: Servicio diferenciado, más ingresos  
**Urgencia**: Muy baja (solo si hay demanda de clientes)

---

### 9. 🎨 **Branding Personalizado para Encuestas**
**Documento**: [`IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md`](IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md:416)

**Estado actual**:
- ✅ Sistema funciona con defaults
- ❌ Falta UI de configuración

**Qué hacer**:
1. Crear página de configuración de branding
2. Permitir subir logo
3. Elegir colores de marca
4. Preview en tiempo real

**Tiempo estimado**: 8-10 horas  
**Urgencia**: Muy baja (nice to have)

---

### 10. 📊 **Analytics Avanzado**
**Documento**: [`IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md`](IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md:417)

**Estado**: Reportes básicos implementados

**Mejoras posibles**:
- Dashboard con gráficos interactivos
- Comparativas mes a mes
- Predicciones de tendencias
- Alertas automáticas

**Tiempo estimado**: 20-30 horas  
**Urgencia**: Muy baja (actual es suficiente)

---

### 11. 🔔 **Sistema de Notificaciones Push**
**Documento**: [`IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md`](IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md:416)

**Funcionalidades**:
- Recordatorios de beneficios pendientes
- Avisos de nuevas promociones
- Notificaciones de estado de vehículo

**Tiempo estimado**: 15-20 horas
**Urgencia**: Muy baja (WhatsApp funciona bien)

---

### 12. 📊 **Reportes Consolidados Multi-Branch**
**Documento**: [`plans/REPORTES_CONSOLIDADOS_MULTI_BRANCH.md`](plans/REPORTES_CONSOLIDADOS_MULTI_BRANCH.md:1)

**Estado**: Diseñado, NO implementado

**Funcionalidades**:
- Consultar múltiples branches (sucursales) en paralelo
- Consolidar resultados de ventas, clientes, métricas
- Comparativas entre sucursales
- Dashboard consolidado
- NO requiere cambios en arquitectura base

**Qué hacer**:
1. Agregar columnas `empresa_matriz_id` y `es_sucursal` a tabla empresas
2. Crear API `/api/reportes/consolidado` que consulte N branches
3. Crear UI de reporte consolidado
4. Implementar caché para performance
5. Agregar permisos de acceso

**Tiempo estimado**: 6-10 horas
**Beneficio**: Clientes con múltiples sucursales pueden ver reportes consolidados
**Urgencia**: Muy baja (solo si un cliente lo solicita)

---

## ✅ TESTING Y VALIDACIONES PENDIENTES

### 12. 📱 **Testing Manual en Celular - PWA Fix**
**Documento**: [`VERIFICACION_DEPLOY_PWA_FIX.md`](VERIFICACION_DEPLOY_PWA_FIX.md:163)

**Estado**: Deploy confirmado ✅, testing manual pendiente ⚠️

**Qué testear**:
1. Instalar PWA en celular
2. Hacer logout
3. Cerrar app completamente
4. Reabrir PWA
5. Verificar que muestre login correcto (no Legacy)

**Tiempo estimado**: 15 minutos  
**Urgencia**: Baja (fix ya está en producción, solo falta confirmar)

---

### 13. 🧪 **Testing Completo Tipos Editables**
**Qué testear**:
1. Crear tipo de vehículo nuevo
2. Crear tipo de servicio nuevo
3. Verificar que aparecen en formulario de registro
4. Crear precios para nuevos tipos
5. Registrar auto con tipos nuevos
6. Intentar eliminar tipo con historial (debe fallar ahora ✅)

**Tiempo estimado**: 30 minutos  
**Urgencia**: Media (confirmar que fix funciona)

---

## 🔧 TAREAS TÉCNICAS / MANTENIMIENTO

### 14. 🔐 **Actualizar Migración Base de Encuestas**
**Documento**: [`plans/INSTRUCCIONES_ACTUALIZAR_MIGRACION_BASE.md`](plans/INSTRUCCIONES_ACTUALIZAR_MIGRACION_BASE.md:1)

**Qué hacer**:
1. Editar [`migration-sistema-encuestas-beneficios.sql`](migration-sistema-encuestas-beneficios.sql:32) línea 32
2. Cambiar `submitted_at` → `created_at`
3. Afecta solo a nuevas empresas (LAVAPP ya corregido)

**Tiempo estimado**: 5 minutos  
**Urgencia**: Baja (solo afecta futuras empresas)

---

### 15. 📦 **Limpiar Archivos SQL Obsoletos**
**Documento**: [`ELIMINAR_LISTA_ESTANDAR_DUPLICADA.md`](ELIMINAR_LISTA_ESTANDAR_DUPLICADA.md:135)

**Archivos a revisar/eliminar**:
- ❌ `migration-listas-precios.sql` - Crea "Lista Estándar" obsoleta
- ❌ `INSERTAR_precios_completo.sql` - Para "Lista Estándar" obsoleta
- ❌ `ACTUALIZAR_precios_directo.sql` - Para "Lista Estándar" obsoleta

**Qué hacer**:
1. Revisar si estos archivos aún se usan
2. Documentar cuáles son obsoletos
3. Mover a carpeta `/legacy` o eliminar

**Tiempo estimado**: 30 minutos  
**Urgencia**: Muy baja (limpieza de código)

---

### 16. ⚙️ **Configuraciones DNS Pendientes** (Si aplica)

**Documentos relevantes**:
- [`ACTUALIZAR_DOMINIO_LAVAPP_AR.md`](ACTUALIZAR_DOMINIO_LAVAPP_AR.md:318)
- [`REGISTROS_DNS_LAVAPP_AR.md`](REGISTROS_DNS_LAVAPP_AR.md:150)
- [`CONFIGURAR_SEGUNDO_DOMINIO_RESEND.md`](CONFIGURAR_SEGUNDO_DOMINIO_RESEND.md:152)

**Estado**: Depende de los dominios que tengas activos

**Verificar**:
1. ¿`lavapp.ar` tiene todos los registros DNS?
2. ¿`chasis.app` está completamente configurado?
3. ¿Los emails funcionan desde los dominios?

**Tiempo estimado**: Variable (depende del estado actual)  
**Urgencia**: Variable (solo si los dominios están en uso)

---

## 📊 RESUMEN POR CATEGORÍA

### Por Urgencia
| Urgencia | Cantidad | Tiempo Total Estimado |
|----------|----------|----------------------|
| 🔴 Crítica | 0 | 0 horas (todo resuelto) |
| 🟠 Alta | 1 | 5-7 días (~40 horas) |
| 🟡 Media | 2 | 17-23 horas |
| 🟢 Baja | 4 | 85-110 horas (~3 semanas) |
| ✅ Testing | 2 | 45 minutos |
| 🔧 Técnico | 3 | 1-2 horas |
| ✅ Completado recientemente | 4 | N/A |

### Por Tipo
| Tipo | Cantidad |
|------|----------|
| Módulos nuevos | 2 (Control de Caja, Turnos) |
| Mejoras UI/UX | 3 (Branding, Analytics, Notificaciones) |
| Infraestructura | 2 (Backup Google Drive, Reportes Consolidados) |
| Testing | 2 |
| Mantenimiento | 3 |
| ✅ Completado | 4 (Validación, Auto→Vehículo, Tipos editables, Beneficios, Botón encuesta) |

---

## 🎯 RECOMENDACIÓN DE ROADMAP

### Sprint 1 (Esta semana) - ✅ COMPLETADO
1. ✅ Fix validación tipos de vehículo - Resuelto (commit 7a58740)
2. ✅ Cambio "Auto" → "Vehículo" en historial - Resuelto
3. ✅ Tipos editables funcionando correctamente - Confirmado
4. ✅ Canje de beneficios integrado - Confirmado en uso

**Total Sprint 1**: ✅ Completado - 2026-02-09

### Sprint 2 (Próxima semana)
1. 🛡️ Implementar backup Google Drive - 5-7 días completos

**Total Sprint 2**: ~40 horas

### Sprint 3 (Semana siguiente)
1. 💰 Módulo Control de Caja - 15-20 horas
2. 🔧 Fix botón encuesta - 1 hora
3. 🔧 Sincronización usuarios - 2-3 horas

**Total Sprint 3**: ~20-25 horas

### Futuro (Solo si hay demanda)
- Sistema de Turnos a Domicilio
- Branding personalizado
- Analytics avanzado
- Notificaciones push

---

## 📝 NOTAS IMPORTANTES

### Sobre Soft Deletes y Auditoría
**Documento**: [`plans/PLAN_BACKUP_Y_RECUPERACION_2026.md`](plans/PLAN_BACKUP_Y_RECUPERACION_2026.md:1)

El plan de backup original proponía:
- Soft Deletes (borrado lógico)
- Tabla de Auditoría
- Confirmaciones dobles

**Decisión tomada**: Se optó por backup externo (Google Drive) en lugar de soft deletes para no modificar el schema existente.

**Consideración futura**: Si se implementa soft deletes, sería una capa adicional de protección muy valiosa.

---

### Sobre Arquitectura Multitenant
**Estado actual**: ✅ Funcionando correctamente

**Puntos clave**:
- Branch por empresa funciona bien
- Lazy sync resuelve problemas de usuarios
- Fix de validación aplicado correctamente

**No modificar** a menos que sea necesario.

---

### Sobre Encuestas y Beneficios
**Estado actual**: ✅ Sistema funcionando

**Pendiente**: Solo integración de canje en flujo de registro

**No urgente**: Sistema actual ya genera y detecta beneficios correctamente.

---

## 🚀 PRIORIZACIÓN SUGERIDA

### ✅ Completado hoy (2026-02-09):
1. ✅ Fix validación eliminación tipos de vehículo (commit 7a58740)
2. ✅ Cambio "Auto" → "Vehículo" en historial (commit 7a58740)
3. ✅ Tipos editables confirmado funcional
4. ✅ Canje de beneficios confirmado funcional
5. ✅ Fix botón encuesta enviada - actualización inmediata (commit 9fe4371)

### 🎯 Próximos pasos recomendados:

**Si tenés poco tiempo (30-45 minutos)**:
1. Testing PWA en celular (15 min) - Confirmar fix login
2. Testing tipos de vehículo con historial (15 min) - Confirmar no se pueden borrar
3. Testing botón encuesta enviada (15 min) - Confirmar cambio de estado inmediato

**Si tenés una semana completa**:
1. ⭐ **Implementar backup Google Drive** (5-7 días completos)
   - Máxima prioridad antes de tener más clientes
   - Diseño ya listo en [`plans/DISEÑO_BACKUP_GOOGLE_DRIVE_2026_V2.md`](plans/DISEÑO_BACKUP_GOOGLE_DRIVE_2026_V2.md:1)

**Si tenés dos semanas**:
1. Completar backup Google Drive (5-7 días)
2. Módulo Control de Caja (3-4 días)
3. Sincronización automática usuarios (2-3 horas, opcional)

---

## 📞 CONTACTO Y SEGUIMIENTO

**Última revisión**: 2026-02-09  
**Próxima revisión sugerida**: Después de completar Sprint 1

**Para actualizar este documento**:
1. Marcar tareas completadas con ✅
2. Agregar nuevos pendientes según surjan
3. Ajustar prioridades según necesidad del negocio

---

**DOCUMENTO VIVO** - Actualizar regularmente conforme se completen tareas o surjan nuevas necesidades.
