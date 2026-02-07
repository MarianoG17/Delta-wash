# PENDIENTES PARA PRÓXIMA SESIÓN

**Fecha:** 2026-02-06 03:07 AM  
**Última sesión:** Crisis multitenant surveys RESUELTA ✅

---

## 🎯 TAREAS PENDIENTES

### 1. ✅ Brecha de Seguridad PWA Login (RESUELTA)
**Ubicación:** [`ESTADO_BRECHA_SEGURIDAD_PWA.md`](ESTADO_BRECHA_SEGURIDAD_PWA.md)

**Status:** ✅ Implementado y desplegado en producción (commit 73b5099, 2026-02-04)

**Qué se arregló:**
- PWA ahora recuerda el tipo de login (SaaS vs Legacy) después de logout
- Flag `preferredLoginType` persiste en localStorage
- Usuario siempre ve la pantalla de login correcta

**Testing pendiente:**
- ⚠️ Test manual en celular para confirmar funcionamiento

**Impacto:** ✅ Sin cambios en funcionalidad existente (cambios aditivos únicamente)

---

### 2. ⚠️ Feature Tipos Editables (Issue conocido)
**Ubicación:** [`ISSUES_TIPOS_EDITABLES_PENDIENTES.md`](ISSUES_TIPOS_EDITABLES_PENDIENTES.md)

**Problemas:**
- ✅ Tipos de vehículos: se agregan y visualizan correctamente
- ❌ Tipos de servicios: se agregan pero NO se visualizan en formulario
- ❌ Tipos de vehículos: permite eliminar aunque haya registros históricos (pérdida de data)

**Impacto:** Media (no bloquea operación pero es confuso para usuario)

**Tiempo estimado:** 2-3 horas

---

### 3. 🆕 Sistema Turnos Domicilio (Feature nueva)
**Ubicación:** [`plans/SISTEMA_TURNOS_DOMICILIO.md`](plans/SISTEMA_TURNOS_DOMICILIO.md)

**Status:** Análisis completo documentado, listo para implementar

**Decisión pendiente:**
- ¿Implementar MVP ahora o esperar feedback de clientes?
- ¿Hay demanda confirmada de lavaderos móviles?

**Tiempo estimado MVP:** 8-12 horas (1-2 días)

---

### 4. 📚 Actualizar Base de Conocimiento
**Archivo:** [`../../dev-knowledge/lecciones-aprendidas/2026-02-06-crisis-multitenant-surveys.md`](../../dev-knowledge/lecciones-aprendidas/2026-02-06-crisis-multitenant-surveys.md)

**Status:** Archivo creado pero no committeado a repo global

**Acción:**
```bash
cd ../../dev-knowledge
git add lecciones-aprendidas/2026-02-06-crisis-multitenant-surveys.md
git commit -m "docs: crisis multitenant surveys - 8 lecciones aprendidas"
git push
```

---

## ✅ LO QUE YA ESTÁ FUNCIONANDO

- ✅ Encuestas Legacy (deltawash-app.vercel.app)
- ✅ Encuestas SaaS (lavapp-pi.vercel.app / chasis.app)
- ✅ survey_lookup automático
- ✅ Beneficios creados y canjeables
- ✅ Arquitectura híbrida robusta (IS_SAAS_PROJECT + table detection)

---

## 🚀 PRÓXIMOS PASOS SUGERIDOS

**Orden de prioridad:**

1. **Urgente (si cliente reporta):** Tipos de servicios editables
2. **Importante (negocio):** Validar demanda de turnos a domicilio
3. **Nice to have:** Commit lecciones aprendidas a repo global

---

## 📊 ESTADO ACTUAL DEL SISTEMA

```
Legacy (deltawash-app):
├─ Estado: 🟢 Operativo
├─ Última actualización: 2026-02-06 02:46 (commit cdbdf4e)
└─ Próximo deploy: Solo si hay issues reportados

SaaS (lavapp-pi/chasis.app):
├─ Estado: 🟢 Operativo
├─ Branch activo: lo-de-nano (empresa_id: 52)
├─ Última actualización: 2026-02-06 02:46
└─ Features funcionando: Login, registros, encuestas, beneficios

Central DB:
├─ Estado: 🟢 Operativo
├─ survey_lookup: Poblándose automáticamente
└─ empresas: branch_url corregido (direct URL)
```

---

## 💡 RECORDATORIOS

- ⚠️ Siempre testear Legacy Y SaaS después de cada deploy
- ⚠️ Código compartido requiere protecciones (IS_SAAS_PROJECT, try/catch)
- ⚠️ Rollback es válido si > 50% funcionalidades afectadas
- ✅ Logs detallados salvaron la sesión nocturna (02:35 crisis)

---

**IMPORTANTE:** Cliente usa encuestas Legacy mañana. Sistema está operativo y testeado ✅
