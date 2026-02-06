# ¿Por qué cambiar de URL pooled a direct?

## Tu pregunta
**"¿Tendrá pooled por algún motivo? ¿No cambiará otra cosa que funciona bien con pooled?"**

## Respuesta corta
**SÍ es seguro cambiar**, porque:
1. El resto de la app usa `@vercel/postgres` que acepta AMBOS tipos de URL
2. Solo `neon()` driver (para encuestas públicas) requiere URL directa
3. Lo de Nano ya está funcionando con este change (el resto de la app)

---

## Explicación técnica

### Dos drivers, dos tipos de URL

| Driver | Acepta pooled | Acepta direct | Dónde se usa |
|--------|---------------|---------------|--------------|
| `@vercel/postgres` (createPool) | ✅ Sí | ✅ Sí | Toda la app SaaS (login, registros, reportes, etc) |
| `@neondatabase/serverless` (neon) | ❌ No | ✅ Sí | Solo encuestas públicas (/survey/[token]) |

### ¿Por qué pooled?
**Ventaja**: Vercel pooler maneja conexiones automáticamente, mejor para serverless
**Desventaja**: Solo funciona con `@vercel/postgres`

### ¿Por qué direct?
**Ventaja**: Funciona con AMBOS drivers (`@vercel/postgres` Y `neon()`)
**Desventaja**: Sin pooling automático de Vercel (pero Neon tiene su propio pooling)

---

## ¿Qué pasa si cambiamos a direct?

### ✅ Lo que SIGUE funcionando
- Login SaaS → usa `@vercel/postgres` → acepta ambas URLs
- Registros, clientes, reportes → usa `@vercel/postgres` → acepta ambas URLs
- Toda la app actual → usa `@vercel/postgres` → acepta ambas URLs

### ✅ Lo que EMPIEZA a funcionar
- Encuestas públicas `/survey/[token]` → usa `neon()` → AHORA SÍ funciona

### ❌ Lo que NO funciona
- Nada. Ambos drivers aceptan URLs directas.

---

## Verificación práctica

**Lo de Nano YA ESTÁ FUNCIONANDO** con la app completa:
- Podés loguear
- Crear registros
- Ver reportes
- Marcar entregado

¿Por qué funciona? Porque `@vercel/postgres` acepta URL directa SIN problemas.

La única parte que NO funcionaba era `/survey/[token]` porque usaba `neon()` que NO acepta pooled.

---

## Conclusión

**Es seguro** cambiar de pooled → direct porque:

1. ✅ `@vercel/postgres` funciona con ambas (pooled Y direct)
2. ✅ `neon()` solo funciona con direct
3. ✅ Ya probamos que Lo de Nano funciona con todo excepto encuestas públicas
4. ✅ Cambiando a direct, AMBOS drivers funcionan

**No perderemos ninguna funcionalidad**, solo ganamos compatibilidad con encuestas públicas.

---

## Alternativa (si querés mantener pooled)

Si REALMENTE querés mantener pooled, tendríamos que:
1. Guardar DOS URLs en tabla empresas (branch_url_pooled y branch_url_direct)
2. Usar pooled para toda la app
3. Usar direct solo para encuestas públicas

**Pero es innecesario** porque direct funciona para AMBOS casos.
