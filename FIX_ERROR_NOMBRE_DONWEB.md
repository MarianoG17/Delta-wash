# ❌ Error en Campo "Nombre" de DonWeb

## 🔴 Problema

El campo "Nombre" muestra error:
```
Nombre inválido.
Debe contener el nombre de su dominio, ejemplo: "example.com"
Puede tener un prefijo, ejemplo: "prefix.example.com"
```

## ✅ Solución

DonWeb quiere el **dominio completo**, no solo el prefijo.

### ❌ Incorrecto:
```
Nombre: www
```

### ✅ Correcto:
```
Nombre: www.chasis.app
```

---

## 📋 Cómo Completar el Formulario

### Para el Registro CNAME de www:

```
Tipo:       CNAME
Nombre:     www.chasis.app        ← Dominio completo
Contenido:  cname.vercel-dns.com  ← Está bien
TTL:        14400                  ← Está bien
```

---

## 🎯 Pasos Exactos

1. **Borrar "www" del campo Nombre**

2. **Escribir completo:**
   ```
   www.chasis.app
   ```

3. **Verificar que Contenido sea:**
   ```
   cname.vercel-dns.com
   ```

4. **Click en "Guardar"**

---

## 📝 Todos los Registros a Agregar

### 1️⃣ Registro A (dominio raíz)

```
Tipo:       A
Nombre:     chasis.app        ← Dominio completo (o @ si lo acepta)
Contenido:  76.76.21.21
TTL:        14400
```

### 2️⃣ Registro CNAME (www)

```
Tipo:       CNAME
Nombre:     www.chasis.app    ← Dominio completo con prefijo
Contenido:  cname.vercel-dns.com
TTL:        14400
```

---

## 💡 Regla General para DonWeb

En DonWeb, el campo "Nombre" siempre debe incluir tu dominio:

| Vercel te dice | En DonWeb ponés |
|----------------|-----------------|
| @ | chasis.app |
| www | www.chasis.app |
| mail | mail.chasis.app |
| resend._domainkey | resend._domainkey.chasis.app |
| _dmarc | _dmarc.chasis.app |

**Siempre agregá ".chasis.app" al final del valor que te dan otros servicios.**

---

## ⚠️ Importante

Algunos proveedores de DNS aceptan "@" para la raíz y "www" solo, pero **DonWeb necesita el dominio completo**.

---

## 🚀 Siguiente Paso

1. Cambiá "www" por "www.chasis.app"
2. Click "Guardar"
3. El registro se creará correctamente
4. Esperá 5-10 minutos para propagación
5. Verificá en Vercel que el dominio se verifique

---

## ✅ Resultado Final

Después de agregar los 2 registros correctamente:
- chasis.app → apuntará a tu app en Vercel
- www.chasis.app → también funcionará

Propagación DNS: 5 minutos a 24 horas (usualmente < 1 hora)
