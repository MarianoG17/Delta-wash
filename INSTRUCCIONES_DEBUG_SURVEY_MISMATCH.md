# Instrucciones: Diagnosticar por qué survey no se encuentra

## Paso 1: Ver qué se guardó en survey_lookup

1. Ir a Neon Console (neon.tech)
2. Seleccionar proyecto: **Deltawash / App lavadero**
3. Seleccionar branch: **central** (importante!)
4. Click en "SQL Editor"
5. Ejecutar esta query:

```sql
SELECT 
    survey_token,
    empresa_id,
    branch_url,
    created_at
FROM survey_lookup
WHERE survey_token = 'ac943322-11b2-486a-a41a-8f1ade9577fe';
```

6. **Copiar el resultado** (especialmente el branch_url completo)

---

## Paso 2: Verificar si la encuesta existe en lo-de-nano

1. En Neon Console, cambiar branch a: **lo-de-nano**
2. SQL Editor
3. Ejecutar:

```sql
SELECT 
    id,
    survey_token,
    visit_id,
    client_phone,
    vehicle_marca,
    created_at
FROM surveys
WHERE survey_token = 'ac943322-11b2-486a-a41a-8f1ade9577fe';
```

4. **Decirme si encontró la encuesta o no** (0 rows vs 1 row)

---

## ¿Qué buscamos?

**Hipótesis**: El `branch_url` que se guardó en survey_lookup (del JWT) puede no coincidir con el branch donde realmente se creó la encuesta (donde getDBConnection conectó).

**Si Query 1 muestra branch_url X pero Query 2 no encuentra la encuesta:**
→ La encuesta se creó en otro branch, hay un mismatch

**Si Query 2 SÍ encuentra la encuesta:**
→ El problema está en /api/survey/[token] al leer survey_lookup o conectarse

---

## Resultado esperado

Necesito que me copies:
1. El `branch_url` completo del Paso 1
2. Si el Paso 2 encontró la encuesta (sí/no)
3. Si no, en qué branch está (probar: Deltawash, mariano, mariano-coques)
