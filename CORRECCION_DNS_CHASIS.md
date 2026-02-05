# ⚠️ CORREGIR antes de hacer click en "Continuar"

## ❌ Problema detectado:

En el formulario de DonWeb, el campo **"Nombre"** tiene:
```
chasis.app
```

## ✅ Debe ser:

```
@
```

O **dejar el campo VACÍO** (dependiendo de cómo funcione DonWeb)

---

## 🎯 Por qué:

- El **@** significa "la raíz del dominio" (chasis.app)
- Si ponés "chasis.app", estarías creando un registro para "chasis.app.chasis.app" ❌
- Vercel te muestra **@** en la columna "Name"

---

## ✅ Configuración CORRECTA:

En el formulario de DonWeb debería quedar así:

```
Tipo:          A
Nombre:        @        ← CAMBIAR ESTO (o dejarlo vacío)
Contenido:     216.198.79.1
TTL:           14400 (está bien)
```

---

## 🔧 Qué hacer AHORA:

1. **Borrar "chasis.app" del campo Nombre**
2. **Escribir solo:** `@`
3. **O dejarlo completamente VACÍO** (si DonWeb acepta vacío para la raíz)
4. **Verificar que Contenido sea:** `216.198.79.1` ✅ (esto está bien)
5. **Click "Continuar"**

---

## 📋 Después necesitarás agregar otro registro para www:

```
Tipo:          CNAME
Nombre:        www
Contenido:     cname.vercel-dns.com
TTL:           14400
```

Esto hace que www.chasis.app también funcione.
