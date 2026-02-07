# Agregar Segundo Dominio (lavapp.ar) en Resend

## 🎯 Situación

- ✅ Ya agregaste `chasis.app` en Resend
- 🆕 Ahora querés agregar `lavapp.ar`
- ❓ ¿Necesitás crear una nueva API Key?

---

## ✅ Respuesta Rápida

**NO necesitás crear una nueva API Key.**

- ✅ La API Key que ya tenés funciona para **TODOS** los dominios de tu cuenta
- ✅ Podés tener múltiples dominios verificados con la misma API Key
- ✅ Solo necesitás agregar el nuevo dominio y verificarlo

---

## 📋 Pasos para Agregar lavapp.ar

### Paso 1: Agregar Dominio en Resend

1. **Ir a Resend Domains:**
   ```
   https://resend.com/domains
   ```

2. **Click en "Add Domain"** (arriba a la derecha)

3. **Ingresar el dominio:**
   ```
   lavapp.ar
   ```

4. **Click "Add"**

5. **Resend te mostrará 3 registros DNS** para agregar en tu proveedor (DonWeb)

---

### Paso 2: Copiar los Registros DNS

Resend te mostrará algo similar a esto (los valores exactos pueden variar):

#### 1️⃣ SPF Record (TXT)
```
Tipo:      TXT
Nombre:    lavapp.ar        (o @ en algunos proveedores)
Valor:     v=spf1 include:resend.net ~all
TTL:       3600
```

#### 2️⃣ DKIM Record (CNAME)
```
Tipo:      CNAME
Nombre:    resend._domainkey.lavapp.ar
Valor:     resend.wl.resend.com
TTL:       3600
```

#### 3️⃣ DMARC Record (TXT)
```
Tipo:      TXT
Nombre:    _dmarc.lavapp.ar
Valor:     v=DMARC1; p=none; rua=mailto:tu@email.com
TTL:       3600
```

⚠️ **IMPORTANTE:** Copiá los valores **EXACTOS** que te muestra Resend, pueden ser ligeramente diferentes.

---

### Paso 3: Agregar Registros en DonWeb

1. **Ir a DonWeb** → Tu dominio `lavapp.ar` → Zona DNS

2. **Agregar cada uno de los 3 registros** que te dio Resend

**Recordá:** En DonWeb, el campo "Nombre" necesita el dominio completo:

| Resend te dice | En DonWeb ponés |
|----------------|-----------------|
| @ | lavapp.ar |
| resend._domainkey | resend._domainkey.lavapp.ar |
| _dmarc | _dmarc.lavapp.ar |

3. **Click "Guardar" para cada registro**

---

### Paso 4: Verificar en Resend

1. **Volver a Resend** → Domains

2. **Buscar lavapp.ar** en la lista

3. **Click en "Verify"** (puede tardar unos minutos en aparecer el botón)

4. **Esperar** (5 minutos a 24 horas para propagación DNS)

5. **Cuando veas ✅**, el dominio está verificado y listo para enviar

---

## 🔑 Sobre la API Key

### ¿Necesito una API Key nueva?

**NO.** La API Key funciona así:

```
Tu Cuenta Resend
    ├── API Key (1 sola) ← Funciona para todo
    ├── Dominio: chasis.app ✅
    └── Dominio: lavapp.ar ✅
```

### ¿Cuándo SÍ necesitaría una nueva API Key?

Solo si:
- ❌ La perdiste o la borraste
- ❌ Querés rotar por seguridad
- ❌ Necesitás diferentes permisos (raramente necesario)

Para agregar más dominios, **NO hace falta**.

---

## 📧 Cómo Usar Cada Dominio en tu Código

Una vez ambos dominios verificados, podés usar cualquiera en tu código:

### Opción 1: Enviar desde chasis.app
```typescript
from: 'LAVAPP <noreply@chasis.app>',
```

### Opción 2: Enviar desde lavapp.ar
```typescript
from: 'LAVAPP <noreply@lavapp.ar>',
```

**La misma API Key funciona para ambos.** Solo cambias el `from` en el código.

---

## 🎯 Plan de Acción Completo

### Para chasis.app (Ya agregado)
- ✅ Dominio agregado en Resend
- ⏳ Configurar registros DNS en DonWeb
- ⏳ Verificar en Resend
- ⏳ Actualizar código para usar `noreply@chasis.app`

### Para lavapp.ar (Nuevo)
- ✅ Dominio agregado en Resend
- ⏳ Configurar registros DNS en DonWeb
- ⏳ Verificar en Resend
- ⏳ Actualizar código para usar `noreply@lavapp.ar`

**La misma API Key sirve para ambos dominios.**

---

## ⚠️ Importante

### Límites del Plan Free de Resend
- ✅ **3,000 emails/mes** en total (entre todos los dominios)
- ✅ **Dominios verificados ilimitados** (en planes Pro, Free puede tener límite)
- ✅ **1 API Key** es suficiente

Si enviás muchos emails:
- 0 - 3,000 emails/mes → Free Plan ✅
- 3,000+ emails/mes → Considerar Plan Pro ($20/mes para 50,000 emails)

---

## 📋 Checklist Final

### Para lavapp.ar:

- [ ] Agregar dominio en Resend
- [ ] Copiar 3 registros DNS (SPF, DKIM, DMARC)
- [ ] Ir a DonWeb → lavapp.ar → Zona DNS
- [ ] Agregar registro TXT (SPF)
- [ ] Agregar registro CNAME (DKIM)
- [ ] Agregar registro TXT (DMARC)
- [ ] Esperar propagación DNS (5 min - 24 hrs)
- [ ] Verificar en Resend
- [ ] Usar en código con la misma API Key

---

## 🎊 Resultado Final

Cuando termines:

```
Tu Cuenta Resend
├── API Key: re_xxxxx (una sola) ✅
├── Dominio: chasis.app ✅ verificado
│   └── Enviar: noreply@chasis.app
└── Dominio: lavapp.ar ✅ verificado
    └── Enviar: noreply@lavapp.ar
```

**Ambos dominios usan la misma API Key que ya tenés configurada en Vercel.**

---

## 🔧 Variables de Entorno (NO cambiar)

En Vercel, tu variable `RESEND_API_KEY` **NO necesita cambios**:

```bash
RESEND_API_KEY=re_tu_api_key_actual
```

Esta misma key funciona para chasis.app y lavapp.ar.

---

## 📝 Registros TXT para DonWeb

Para el registro TXT de SPF en DonWeb:

```
Tipo:       TXT
Nombre:     lavapp.ar        ← Dominio completo
Contenido:  v=spf1 include:resend.net ~all
TTL:        3600 (o Auto)
```

Para el registro TXT de DMARC:

```
Tipo:       TXT
Nombre:     _dmarc.lavapp.ar        ← Con el prefijo _dmarc
Contenido:  v=DMARC1; p=none; rua=mailto:tu@email.com
TTL:        3600 (o Auto)
```

⚠️ **Copiá los valores exactos de Resend**, pueden variar ligeramente.

---

## ✅ Siguiente Paso

1. En Resend, **copiá los 3 registros DNS** que te muestra para lavapp.ar
2. Abrí DonWeb → lavapp.ar → Zona DNS
3. Agregá los 3 registros (recordando usar dominio completo)
4. Esperá verificación
5. Listo para enviar desde ambos dominios con la misma API Key
