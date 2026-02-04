# 📝 Instrucciones: Actualizar Migración Base SaaS

## 🎯 Objetivo

Actualizar la migración base para que **futuras empresas SaaS** ya tengan la columna correcta desde el inicio.

---

## 📁 Archivo a Editar

**Nombre**: `migration-sistema-encuestas-beneficios.sql`  
**Ubicación**: Raíz del proyecto (mismo nivel que `package.json`)  
**Línea**: 32

---

## ✏️ Cambio Necesario

### Código Actual (INCORRECTO)

```sql
-- Tabla de respuestas de encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    ← CAMBIAR ESTA LÍNEA
);
```

### Código Corregido

```sql
-- Tabla de respuestas de encuestas
CREATE TABLE IF NOT EXISTS survey_responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER NOT NULL REFERENCES surveys(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP    ← LÍNEA CORREGIDA
);
```

---

## 🔧 Cómo Hacerlo

### Opción 1: Editar Manualmente en VS Code

1. Abrir archivo: `migration-sistema-encuestas-beneficios.sql` (está en la raíz)
2. Ir a línea 32 (presionar `Ctrl+G` y escribir `32`)
3. Buscar: `submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
4. Reemplazar por: `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`
5. Guardar (`Ctrl+S`)

### Opción 2: Usar Code Mode

1. Cambiar a **Code Mode** (modo código)
2. Pedir: "Actualizar migration-sistema-encuestas-beneficios.sql línea 32, cambiar submitted_at por created_at"
3. Code Mode puede hacer el cambio automáticamente

### Opción 3: Buscar y Reemplazar

1. Presionar `Ctrl+H` (buscar y reemplazar)
2. En "Buscar": `submitted_at TIMESTAMP`
3. En "Reemplazar": `created_at TIMESTAMP`
4. Click en "Reemplazar" (solo en este archivo)
5. Guardar

---

## ✅ Verificación

Después del cambio, la línea 32 debe quedar así:

```sql
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

---

## 📊 Impacto

**Este cambio NO afecta**:
- ❌ LAVAPP (ya está corregido en la BD)
- ❌ DeltaWash Legacy (usa otra migración)

**Este cambio SÍ afecta**:
- ✅ Futuras empresas SaaS que se creen
- ✅ Si alguien ejecuta esta migración de nuevo

---

## 🎯 Resultado Esperado

La próxima vez que se cree una empresa SaaS:
1. Se ejecutará esta migración
2. Ya tendrá `created_at` (no `submitted_at`)
3. No necesitará el fix que aplicamos hoy

---

## ⚠️ Nota Importante

**Este paso es OPCIONAL pero RECOMENDADO**

- El sistema actual ya funciona (LAVAPP ya está corregido)
- Solo sirve para prevenir el problema en futuras empresas
- Si no lo hacés ahora, podés hacerlo después
