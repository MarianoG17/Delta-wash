# 📚 Base de Conocimiento - DeltaWash/LAVAPP

> **Índice de documentación específica del proyecto**
>
> ⚠️ **Nota:** Los aprendizajes de este proyecto también están incorporados en la **base de conocimiento central**:
> [`C:/Users/Mariano/Documents/dev-knowledge/`](C:/Users/Mariano/Documents/dev-knowledge/GUIA_DESARROLLO.md)
>
> Ver específicamente: [`lecciones-aprendidas/2026-02-01-aprendizajes-app-lavadero.md`](C:/Users/Mariano/Documents/dev-knowledge/lecciones-aprendidas/2026-02-01-aprendizajes-app-lavadero.md)

Última actualización: 2026-02-03

---

## 🎯 Guía de Navegación Rápida

### Por Tipo de Necesidad

- 🚀 **[Quiero implementar algo nuevo](#-guías-de-implementación)** → Ver guías paso a paso
- 🐛 **[Tengo un problema](#-soluciones-a-problemas-comunes)** → Ver soluciones documentadas
- 📖 **[Quiero entender la arquitectura](#-arquitectura-y-diseño)** → Ver análisis técnicos
- 🎓 **[Quiero aprender de experiencias pasadas](#-aprendizajes-documentados)** → Ver lecciones aprendidas
- 🔧 **[Necesito ejecutar una migración](#-migraciones-y-base-de-datos)** → Ver instrucciones SQL

---

## 🎓 Aprendizajes Documentados

### Aprendizajes Mensuales
| Documento | Descripción | Fecha | Temas Clave |
|-----------|-------------|-------|-------------|
| [**APRENDIZAJES_2026_FEBRERO.md**](APRENDIZAJES_2026_FEBRERO.md) | 6 aprendizajes clave de febrero 2026 | 2026-02-01 | Migraciones inconsistentes, Arquitectura Neon, Estados en UI, Backups sin costo, Detección de arquitectura, Debugging de BD |
| [**APRENDIZAJE_TOKEN_EXPIRACION.md**](APRENDIZAJE_TOKEN_EXPIRACION.md) | Manejo de tokens JWT expirados | 2026-01-31 | JWT, Expiración, Manejo de errores 401 |

### Lecciones Clave por Tema

#### 🏗️ Arquitectura
- **Branches Neon**: Ver [APRENDIZAJES_2026_FEBRERO.md#2-arquitectura-de-branches-neon](APRENDIZAJES_2026_FEBRERO.md#2-arquitectura-de-branches-neon)
  - Cuándo usar `central`, `Deltawash`, o `Lavadero`
  - Matriz de decisión para migraciones
  
- **Detección de Arquitectura**: Ver [APRENDIZAJES_2026_FEBRERO.md#5-patrones-de-detección-de-arquitectura](APRENDIZAJES_2026_FEBRERO.md#5-patrones-de-detección-de-arquitectura)
  - Patrón Try-Catch con Fallback
  - Código compartido Legacy/SaaS

#### 💾 Base de Datos
- **Migraciones Inconsistentes**: Ver [APRENDIZAJES_2026_FEBRERO.md#1-fix-inconsistencia-de-columnas-en-migraciones](APRENDIZAJES_2026_FEBRERO.md#1-fix-inconsistencia-de-columnas-en-migraciones)
  - Problema: `created_at` vs `submitted_at`
  - Checklist para futuras migraciones
  
- **Debugging de Conexiones**: Ver [APRENDIZAJES_2026_FEBRERO.md#6-debugging-de-conexiones-de-bd](APRENDIZAJES_2026_FEBRERO.md#6-debugging-de-conexiones-de-bd)
  - Logging detallado en capas de BD

#### 🎨 UX/UI
- **Estados Progresivos**: Ver [APRENDIZAJES_2026_FEBRERO.md#3-implementación-de-estados-en-ui](APRENDIZAJES_2026_FEBRERO.md#3-implementación-de-estados-en-ui)
  - Patrón: Sin enviar → Enviada → Respondida
  - Colores semánticos

#### 💰 Backups
- **Estrategias Sin Costo**: Ver [APRENDIZAJES_2026_FEBRERO.md#4-estrategias-de-backup-sin-costo](APRENDIZAJES_2026_FEBRERO.md#4-estrategias-de-backup-sin-costo)
  - Soft Deletes + Auditoría = 95% protección gratis
  - Comparativa de opciones

---

## 🏗️ Arquitectura y Diseño

### Análisis Completos
| Documento | Descripción | Cuándo Consultar |
|-----------|-------------|------------------|
| [AUDITORIA_COMPLETA_PROYECTO_SAAS.md](AUDITORIA_COMPLETA_PROYECTO_SAAS.md) | Auditoría exhaustiva del proyecto | Al comenzar tareas complejas |
| [EXPLICACION_ARQUITECTURA_DELTAWASH_VS_SAAS.md](EXPLICACION_ARQUITECTURA_DELTAWASH_VS_SAAS.md) | Diferencias Legacy vs SaaS | Al desarrollar funcionalidades compatibles |
| [PLAN_MULTITENANT_ANALISIS_COMPLETO.md](PLAN_MULTITENANT_ANALISIS_COMPLETO.md) | Análisis de multi-tenancy | Al trabajar con empresas/branches |
| [ESTRUCTURA_PROYECTO.md](ESTRUCTURA_PROYECTO.md) | Estructura de directorios | Al navegar el proyecto |

### Sistemas Específicos
| Documento | Sistema | Descripción |
|-----------|---------|-------------|
| [SISTEMA_UPSELLING_INTELIGENTE.md](SISTEMA_UPSELLING_INTELIGENTE.md) | Upselling | Sistema de recomendaciones |
| [SISTEMA_PROTECCION_SECRETS.md](SISTEMA_PROTECCION_SECRETS.md) | Seguridad | Protección de secrets |
| [ESTRATEGIA_BACKUPS_Y_RECUPERACION.md](ESTRATEGIA_BACKUPS_Y_RECUPERACION.md) | Backups | Plan de recuperación |

### Planes Detallados
| Documento | Plan | Estado |
|-----------|------|--------|
| [plans/PLAN_BACKUP_Y_RECUPERACION_2026.md](plans/PLAN_BACKUP_Y_RECUPERACION_2026.md) | Backup 2026 | ✅ Activo |
| [plans/OPCIONES_BACKUP_COMPARATIVA.md](plans/OPCIONES_BACKUP_COMPARATIVA.md) | Comparativa backups | ✅ Documentado |

---

## 🐛 Soluciones a Problemas Comunes

### Bases de Datos
| Problema | Solución | Archivo |
|----------|----------|---------|
| Error API Neon | Variables de entorno | [SOLUCION_ERROR_API_NEON.md](SOLUCION_ERROR_API_NEON.md) |
| Precios en cero para empresas nuevas | Datos demo e inserción | [SOLUCION_PRECIOS_CERO_EMPRESAS_NUEVAS.md](SOLUCION_PRECIOS_CERO_EMPRESAS_NUEVAS.md) |
| Listas de precios compartidas | Aislamiento por empresa | [SOLUCION_LISTAS_PRECIOS_COMPARTIDAS.md](SOLUCION_LISTAS_PRECIOS_COMPARTIDAS.md) |
| Patente AA865QG problema | Corrección específica | [SOLUCION_PATENTE_AA865QG_CORREGIDA.md](SOLUCION_PATENTE_AA865QG_CORREGIDA.md) |
| Branches con datos | Inicialización automática | [SOLUCION_BRANCHES_CON_DATOS.md](SOLUCION_BRANCHES_CON_DATOS.md) |

### Autenticación
| Problema | Solución | Archivo |
|----------|----------|---------|
| Autenticación dual (Legacy/SaaS) | Middleware unificado | [SOLUCION_AUTENTICACION_DUAL.md](SOLUCION_AUTENTICACION_DUAL.md) |
| Token SaaS | Fix de verificación | [FIX_SAAS_AUTH_TOKEN.md](FIX_SAAS_AUTH_TOKEN.md) |
| Token expirado | Manejo 401 automático | [APRENDIZAJE_TOKEN_EXPIRACION.md](APRENDIZAJE_TOKEN_EXPIRACION.md) |

### Deployment
| Problema | Solución | Archivo |
|----------|----------|---------|
| Deploy en Vercel | Configuración completa | [SOLUCION_DEPLOYMENT_VERCEL.md](SOLUCION_DEPLOYMENT_VERCEL.md) |
| Branches Neon | Arquitectura de 3 branches | [SOLUCION_ARQUITECTURA_BRANCHES.md](SOLUCION_ARQUITECTURA_BRANCHES.md) |
| Final branches | Solución definitiva | [SOLUCION_FINAL_BRANCHES.md](SOLUCION_FINAL_BRANCHES.md) |

### Encuestas
| Problema | Solución | Archivo |
|----------|----------|---------|
| Botón encuesta enviada | 3 estados progresivos | [plans/FIX_BOTON_ENCUESTA_ENVIADA.md](plans/FIX_BOTON_ENCUESTA_ENVIADA.md) |
| Encuestas SaaS | Fix columna created_at | [plans/CORRECCION_ENCUESTAS_SAAS.md](plans/CORRECCION_ENCUESTAS_SAAS.md) |
| Resumen ejecutivo | Análisis completo | [plans/RESUMEN_EJECUTIVO_FIX_ENCUESTAS.md](plans/RESUMEN_EJECUTIVO_FIX_ENCUESTAS.md) |

### Otros
| Problema | Solución | Archivo |
|----------|----------|---------|
| Lazy sync | Fix final | [FIX_FINAL_LAZY_SYNC.md](FIX_FINAL_LAZY_SYNC.md) |
| Usuarios empresa 37 | SQL específico | [FIX_USUARIOS_EMPRESA_37.sql](FIX_USUARIOS_EMPRESA_37.sql) |

---

## 📋 Guías de Implementación

### Setup Inicial
| Guía | Propósito | Cuándo Usar |
|------|-----------|-------------|
| [GUIA_SETUP_NEON_SAAS.md](GUIA_SETUP_NEON_SAAS.md) | Configurar Neon para SaaS | Al crear nueva empresa |
| [GUIA_TESTING_LOCAL.md](GUIA_TESTING_LOCAL.md) | Testing en local | Antes de deploy |
| [GUIA_RAPIDA_FIX_USUARIOS.md](GUIA_RAPIDA_FIX_USUARIOS.md) | Arreglar usuarios | Problemas de acceso |

### Funcionalidades Específicas
| Guía | Funcionalidad | Complejidad |
|------|---------------|-------------|
| [INSTRUCCIONES_LISTAS_PRECIOS.md](INSTRUCCIONES_LISTAS_PRECIOS.md) | Listas de precios | Media |
| [INSTRUCCIONES_CUENTA_CORRIENTE.md](INSTRUCCIONES_CUENTA_CORRIENTE.md) | Cuenta corriente | Media |
| [INSTRUCCIONES_UPSELLING_CONFIGURABLE.md](INSTRUCCIONES_UPSELLING_CONFIGURABLE.md) | Upselling | Alta |
| [INSTRUCCIONES_PWA.md](INSTRUCCIONES_PWA.md) | Progressive Web App | Baja |
| [INSTRUCCIONES_INSTALAR_PWA.md](INSTRUCCIONES_INSTALAR_PWA.md) | Instalación PWA | Baja |
| [INSTRUCCIONES_PRECIOS.md](INSTRUCCIONES_PRECIOS.md) | Gestión de precios | Media |
| [INSTRUCCIONES_CANCELACION.md](INSTRUCCIONES_CANCELACION.md) | Cancelar servicios | Baja |
| [INSTRUCCIONES_ANULACION.md](INSTRUCCIONES_ANULACION.md) | Anular registros | Baja |

### Implementaciones Completas
| Documento | Sistema | Fecha |
|-----------|---------|-------|
| [IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md](IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md) | Encuestas + Beneficios | - |
| [IMPLEMENTACION_ENCUESTAS_DELTAWASH.md](IMPLEMENTACION_ENCUESTAS_DELTAWASH.md) | Encuestas Legacy | - |

---

## 🗄️ Migraciones y Base de Datos

### Scripts de Migración Disponibles

#### Funcionalidades Core
| Archivo | Funcionalidad | Estado |
|---------|---------------|--------|
| [migration-sistema-encuestas-beneficios.sql](migration-sistema-encuestas-beneficios.sql) | Encuestas + Beneficios | ✅ Probado |
| [migration-sistema-encuestas-deltawash.sql](migration-sistema-encuestas-deltawash.sql) | Encuestas Legacy | ✅ Probado |
| [migration-sistema-upselling.sql](migration-sistema-upselling.sql) | Upselling | ✅ Probado |
| [migration-listas-precios.sql](migration-listas-precios.sql) | Listas de precios | ✅ Probado |
| [migration-agregar-cuenta-corriente.sql](migration-agregar-cuenta-corriente.sql) | Cuenta corriente | ✅ Probado |
| [migration-agregar-pagos.sql](migration-agregar-pagos.sql) | Sistema de pagos | ✅ Probado |

#### Estados y Operaciones
| Archivo | Funcionalidad | Estado |
|---------|---------------|--------|
| [migration-agregar-anulacion.sql](migration-agregar-anulacion.sql) | Anular registros | ✅ Probado |
| [migration-agregar-estado-cancelado.sql](migration-agregar-estado-cancelado.sql) | Estado cancelado | ✅ Probado |
| [migration-add-fecha-entregado.sql](migration-add-fecha-entregado.sql) | Fecha entregado | ✅ Probado |

#### Seguridad y Usuarios
| Archivo | Funcionalidad | Estado |
|---------|---------------|--------|
| [migration-agregar-roles.sql](migration-agregar-roles.sql) | Sistema de roles | ✅ Probado |
| [migration-bcrypt-passwords.sql](migration-bcrypt-passwords.sql) | Passwords con bcrypt | ✅ Probado |

#### Fixes y Correcciones
| Archivo | Fix | Estado |
|---------|-----|--------|
| [migration-fix-encuestas-saas.sql](migration-fix-encuestas-saas.sql) | Fix columna created_at | ✅ Probado |
| [migration-fix-encuestas-publicas.sql](migration-fix-encuestas-publicas.sql) | Encuestas públicas | ✅ Probado |
| [migration-corregir-precios-faltantes.sql](migration-corregir-precios-faltantes.sql) | Precios faltantes | ✅ Probado |

### Instrucciones de Ejecución
| Documento | Migración | Tipo |
|-----------|-----------|------|
| [INSTRUCCIONES_MIGRACION.md](INSTRUCCIONES_MIGRACION.md) | General | Guía maestra |
| [EJECUTAR_MIGRACION_ANULACION.md](EJECUTAR_MIGRACION_ANULACION.md) | Anulación | Específica |
| [plans/INSTRUCCIONES_ACTUALIZAR_MIGRACION_BASE.md](plans/INSTRUCCIONES_ACTUALIZAR_MIGRACION_BASE.md) | Base | Específica |

### Scripts SQL Operativos
| Archivo | Propósito | Uso |
|---------|-----------|-----|
| [schema.sql](schema.sql) | Schema completo | Setup inicial |
| [DATOS_DEMO_30_DIAS.sql](DATOS_DEMO_30_DIAS.sql) | Datos de prueba | Testing |
| [OBTENER_DATOS_BD_CENTRAL.sql](OBTENER_DATOS_BD_CENTRAL.sql) | Query BD Central | Diagnóstico |

---

## 🔧 Mantenimiento y Operaciones

### Limpieza y Reset
| Documento | Acción | Precaución |
|-----------|--------|------------|
| [LIMPIAR_CUENTAS_PRUEBA.md](LIMPIAR_CUENTAS_PRUEBA.md) | Eliminar cuentas test | ⚠️ Revisar antes |
| [LIMPIAR_BRANCHES_PRUEBA.md](LIMPIAR_BRANCHES_PRUEBA.md) | Eliminar branches test | ⚠️ Confirmar branches |
| [ELIMINAR_LISTA_ESTANDAR_DUPLICADA.md](ELIMINAR_LISTA_ESTANDAR_DUPLICADA.md) | Limpiar duplicados | ⚠️ Backup primero |

### Verificación y Diagnóstico
| Documento | Verificación | Cuándo Usar |
|-----------|--------------|-------------|
| [CHECKLIST_VERIFICACION_FINAL.md](CHECKLIST_VERIFICACION_FINAL.md) | Checklist completo | Antes de deploy |
| [AUDITORIA_DRIVERS_POSTGRESQL.md](AUDITORIA_DRIVERS_POSTGRESQL.md) | Drivers PostgreSQL | Problemas conexión |
| [AUDITORIA_COMPATIBILIDAD_DRIVERS.md](AUDITORIA_COMPATIBILIDAD_DRIVERS.md) | Compatibilidad | Problemas drivers |

### Análisis de Problemas
| Documento | Análisis | Tipo |
|-----------|----------|------|
| [ANALISIS_PROBLEMA_PATENTE_AA865QG.md](ANALISIS_PROBLEMA_PATENTE_AA865QG.md) | Caso específico | Debugging |
| [ANALISIS_EXHAUSTIVO_SINCRONIZACION.md](ANALISIS_EXHAUSTIVO_SINCRONIZACION.md) | Sincronización | Performance |
| [DIAGNOSTICO_ERROR_ANULACION.md](DIAGNOSTICO_ERROR_ANULACION.md) | Error anulación | Debugging |

---

## 🚀 Deploy y Branches

### Deploy
| Documento | Tipo | Complejidad |
|-----------|------|-------------|
| [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md) | Instrucciones completas | Media |
| [DEPLOY_AUTOMATICO.md](DEPLOY_AUTOMATICO.md) | Deploy automático | Baja |
| [DEPLOY_RAPIDO.md](DEPLOY_RAPIDO.md) | Deploy rápido | Baja |

### Branches Neon
| Documento | Acción | Cuándo |
|-----------|--------|--------|
| [INSTRUCCIONES_CREAR_BRANCH_DEMO.md](INSTRUCCIONES_CREAR_BRANCH_DEMO.md) | Crear demo | Antes de presentar |
| [CREAR_BRANCH_TEMPLATE.md](CREAR_BRANCH_TEMPLATE.md) | Template | Setup nuevos clientes |
| [PASOS_CREAR_TEMPLATE_SEGURO.md](PASOS_CREAR_TEMPLATE_SEGURO.md) | Template seguro | Producción |
| [RESPUESTA_BRANCHES_NEON.md](RESPUESTA_BRANCHES_NEON.md) | Info general | Consulta |

### API Keys y Secrets
| Documento | Acción | Urgencia |
|-----------|--------|----------|
| [CREAR_NUEVA_API_KEY_AHORA.md](CREAR_NUEVA_API_KEY_AHORA.md) | Crear key nueva | Alta |
| [INSTRUCCIONES_ACTUALIZAR_TU_NUEVA_KEY.md](INSTRUCCIONES_ACTUALIZAR_TU_NUEVA_KEY.md) | Actualizar key | Alta |
| [PROCESO_CORRECTO_CAMBIO_API_KEY.md](PROCESO_CORRECTO_CAMBIO_API_KEY.md) | Proceso cambio | Media |
| [URGENTE_CAMBIAR_API_KEY.md](URGENTE_CAMBIAR_API_KEY.md) | Cambio urgente | ⚠️ Crítica |

---

## 📊 Resúmenes y Estado del Proyecto

### Resúmenes Ejecutivos
| Documento | Resumen de | Fecha |
|-----------|------------|-------|
| [RESUMEN_FINAL_SOLUCION_COMPLETA.md](RESUMEN_FINAL_SOLUCION_COMPLETA.md) | Solución completa | - |
| [RESUMEN_FIX_LISTAS_PRECIOS.md](RESUMEN_FIX_LISTAS_PRECIOS.md) | Fix listas precios | - |
| [RESUMEN_FIX_REGISTRO_AUTOS.md](RESUMEN_FIX_REGISTRO_AUTOS.md) | Fix registro autos | - |
| [RESUMEN_CORRECCION_BD.md](RESUMEN_CORRECCION_BD.md) | Corrección BD | - |
| [RESUMEN_PROBLEMAS_Y_SOLUCIONES.md](RESUMEN_PROBLEMAS_Y_SOLUCIONES.md) | Problemas generales | - |

### Estado del Desarrollo
| Documento | Estado | Actualizado |
|-----------|--------|-------------|
| [SAAS_DESARROLLO_PROGRESO.md](SAAS_DESARROLLO_PROGRESO.md) | Progreso SaaS | Verificar |
| [INFORME_IMPLEMENTACION_MULTITENANT.md](INFORME_IMPLEMENTACION_MULTITENANT.md) | Multi-tenant | Verificar |
| [PASOS_SIGUIENTES.md](PASOS_SIGUIENTES.md) | Próximos pasos | Verificar |

### Advertencias Importantes
| Documento | Advertencia | Criticidad |
|-----------|-------------|------------|
| [ADVERTENCIA_BASES_DATOS.md](ADVERTENCIA_BASES_DATOS.md) | Bases de datos | ⚠️ Crítica |
| [COMPATIBILIDAD_EMPRESAS_EXISTENTES.md](COMPATIBILIDAD_EMPRESAS_EXISTENTES.md) | Empresas legacy | ⚠️ Alta |

---

## 🛠️ Herramientas y Utilidades

### Correcciones SQL
| Archivo | Corrección | Uso |
|---------|------------|-----|
| [CORREGIR_precios_cero.sql](CORREGIR_precios_cero.sql) | Precios en cero | Ejecución directa |
| [ACTUALIZAR_precios_directo.sql](ACTUALIZAR_precios_directo.sql) | Update precios | Ejecución directa |
| [INSERTAR_precios_completo.sql](INSERTAR_precios_completo.sql) | Insertar precios | Setup |
| [AGREGAR_limpieza_chasis.sql](AGREGAR_limpieza_chasis.sql) | Nuevo tipo | Feature |
| [eliminar-promocion-hardcodeada.sql](eliminar-promocion-hardcodeada.sql) | Limpiar promo | Fix |

### Verificaciones
| Archivo | Verificación | Uso |
|---------|--------------|-----|
| [VERIFICAR_precios.sql](VERIFICAR_precios.sql) | Ver precios | Diagnóstico |
| [VERIFICAR_SERVICIOS_LAVAPP.sql](VERIFICAR_SERVICIOS_LAVAPP.sql) | Ver servicios | Diagnóstico |
| [VERIFICAR_DELTAWASH.sql](VERIFICAR_DELTAWASH.sql) | Ver DeltaWash | Diagnóstico |
| [VERIFICAR_MOVIMIENTOS.md](VERIFICAR_MOVIMIENTOS.md) | Ver movimientos | Diagnóstico |

### Scripts de Diagnóstico
| Archivo | Diagnóstico | Tipo |
|---------|-------------|------|
| [DIAGNOSTICO_CONSOLA.js](DIAGNOSTICO_CONSOLA.js) | Consola browser | JavaScript |
| [DEBUG_ERROR_REGISTRO.js](DEBUG_ERROR_REGISTRO.js) | Error registro | JavaScript |
| [diagnostico.txt](diagnostico.txt) | Log general | Texto |

---

## 📖 Documentación Adicional

### Configuración
| Documento | Configuración | Componente |
|-----------|---------------|------------|
| [CONFIGURAR_NEON_API.md](CONFIGURAR_NEON_API.md) | API Neon | Backend |
| [INSTRUCCIONES_PAGINA_PRUEBA.md](INSTRUCCIONES_PAGINA_PRUEBA.md) | Página test | Frontend |
| [COMO_USAR_TERMINAL_VSCODE.md](COMO_USAR_TERMINAL_VSCODE.md) | Terminal | VSCode |

### Correcciones Específicas
| Documento | Corrección | Área |
|-----------|------------|------|
| [CORRECCION_AUTENTICACION_PAGINAS.md](CORRECCION_AUTENTICACION_PAGINAS.md) | Auth páginas | Frontend |
| [CORRECCION_PRECIOS.md](CORRECCION_PRECIOS.md) | Precios | Backend |

---

## 🎯 Mejores Prácticas del Proyecto

### Checklist General (desde Aprendizajes)

#### Para Migraciones
- [ ] Usar nombres de columnas estándar (`created_at`, no `submitted_at`)
- [ ] Verificar consistencia entre Legacy y SaaS
- [ ] Documentar en qué branch ejecutar
- [ ] Incluir rollback en el script
- [ ] Probar en ambiente de desarrollo primero

#### Para UI/UX
- [ ] Implementar estados progresivos (inicial → en progreso → completado)
- [ ] Feedback visual inmediato para acciones del usuario
- [ ] Prevenir acciones duplicadas (deshabilitar botones procesando)
- [ ] Usar colores semánticos consistentes (amarillo = esperando, verde = éxito)

#### Para Arquitectura Multi-Tenant
- [ ] Documentar propósito de cada branch
- [ ] Logging detallado de conexiones de BD
- [ ] Try-catch con fallback para compatibilidad
- [ ] Variables de entorno claras (`POSTGRES_URL` vs `CENTRAL_DB_URL`)

#### Para Backups
- [ ] Implementar soft deletes en tablas críticas
- [ ] Tabla de auditoría para operaciones importantes
- [ ] Confirmaciones dobles antes de eliminaciones
- [ ] Plan de upgrade cuando haya ingresos

---

## 🔍 Cómo Usar Esta Base de Conocimiento

### Escenarios Comunes

#### "Necesito implementar encuestas"
1. Leer [IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md](IMPLEMENTACION_SISTEMA_ENCUESTAS_BENEFICIOS.md)
2. Ejecutar [migration-sistema-encuestas-beneficios.sql](migration-sistema-encuestas-beneficios.sql)
3. Revisar [APRENDIZAJES_2026_FEBRERO.md - Estados en UI](APRENDIZAJES_2026_FEBRERO.md#3-implementación-de-estados-en-ui)

#### "Tengo un error en producción"
1. Buscar en [Soluciones a Problemas Comunes](#-soluciones-a-problemas-comunes)
2. Revisar [RESUMEN_PROBLEMAS_Y_SOLUCIONES.md](RESUMEN_PROBLEMAS_Y_SOLUCIONES.md)
3. Consultar scripts de diagnóstico

#### "Voy a crear una nueva empresa SaaS"
1. Seguir [GUIA_SETUP_NEON_SAAS.md](GUIA_SETUP_NEON_SAAS.md)
2. Usar [CREAR_BRANCH_TEMPLATE.md](CREAR_BRANCH_TEMPLATE.md)
3. Revisar [APRENDIZAJES_2026_FEBRERO.md - Arquitectura Branches](APRENDIZAJES_2026_FEBRERO.md#2-arquitectura-de-branches-neon)

#### "Necesito hacer una migración"
1. Identificar tipo usando [Matriz de decisión](APRENDIZAJES_2026_FEBRERO.md#2-arquitectura-de-branches-neon)
2. Seguir [INSTRUCCIONES_MIGRACION.md](INSTRUCCIONES_MIGRACION.md)
3. Aplicar checklist de [Mejores Prácticas](#para-migraciones)

#### "El sistema está lento/tiene bugs"
1. Revisar [ANALISIS_EXHAUSTIVO_SINCRONIZACION.md](ANALISIS_EXHAUSTIVO_SINCRONIZACION.md)
2. Ejecutar scripts de [Verificación](#verificaciones)
3. Consultar [Diagnóstico](#scripts-de-diagnóstico)

---

## 📅 Plan de Mantenimiento de la Base de Conocimiento

### Mensual
- [ ] Agregar nuevos aprendizajes a archivo mensual (ej: `APRENDIZAJES_2026_MARZO.md`)
- [ ] Actualizar este índice con nuevos documentos
- [ ] Revisar links rotos

### Trimestral
- [ ] Consolidar aprendizajes recurrentes
- [ ] Archivar documentos obsoletos
- [ ] Actualizar mejores prácticas

### Anual
- [ ] Crear resumen ejecutivo anual
- [ ] Reorganizar categorías si es necesario
- [ ] Generar métricas de uso

---

## 🤝 Contribuir a la Base de Conocimiento

### Al documentar algo nuevo:
1. Usar formato Markdown
2. Incluir fecha
3. Agregar ejemplos de código cuando aplique
4. Actualizar este índice
5. Linkear documentos relacionados

### Convenciones de nombres:
- `INSTRUCCIONES_*.md` → Guías paso a paso
- `SOLUCION_*.md` → Soluciones a problemas
- `APRENDIZAJE_*.md` → Lecciones aprendidas
- `ANALISIS_*.md` → Análisis técnicos
- `IMPLEMENTACION_*.md` → Implementaciones completas
- `migration-*.sql` → Scripts de migración

---

## 📞 Contacto y Soporte

Para dudas sobre esta documentación, revisar:
1. Este índice primero
2. Documentos específicos linkeados
3. Aprendizajes documentados

**Última revisión de este índice**: 2026-02-03

---

*Este documento es la puerta de entrada a toda la documentación del proyecto. Mantenlo actualizado.*
