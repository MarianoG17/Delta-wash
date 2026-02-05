# ✅ NOMBRES CORRECTOS para DonWeb

## 🎯 Usar SOLO el prefijo (sin .chasis.app al final)

DonWeb agrega automáticamente `.chasis.app` al final.

---

## 📋 Registro 1: DKIM

```
Tipo:     TXT
Nombre:   resend._domainkey
Contenido: p=MIGfMA0GCSqGSIb3DQEB... (copiar TODO el texto largo de Resend)
TTL:      Auto
```

**⚠️ Solo escribir:** `resend._domainkey` (sin .chasis.app)

---

## 📧 Registro 2: SPF (MX)

```
Tipo:      MX
Nombre:    send
Contenido: feedback-smtp.us-east-1.amazonses.com (copiar de Resend)
Prioridad: 10
TTL:       Auto
```

**⚠️ Solo escribir:** `send` (sin .chasis.app)

---

## 📧 Registro 3: SPF (TXT)

```
Tipo:     TXT
Nombre:   send
Contenido: v=spf1 include:amazonses.com ~all (copiar de Resend)
TTL:      Auto
```

**⚠️ Solo escribir:** `send` (sin .chasis.app)

---

## 🔒 Registro 4: DMARC

```
Tipo:     TXT
Nombre:   _dmarc
Contenido: v=DMARC1; p=none;
TTL:      Auto
```

**⚠️ Solo escribir:** `_dmarc` (sin .chasis.app)

---

## 🎯 IMPORTANTE

### ❌ NO escribir:
- `resend._domainkey.chasis.app` 
- `send.chasis.app`
- `_dmarc.chasis.app`

### ✅ SÍ escribir solo:
- `resend._domainkey`
- `send`
- `_dmarc`

DonWeb agregará `.chasis.app` automáticamente.

---

## 📝 Si aún da error

Algunos proveedores usan `@` para subdominio:

**Probar:**
- Nombre: `@.resend._domainkey`
- Nombre: `@.send`
- Nombre: `@._dmarc`

O simplemente dejar el campo nombre **VACÍO** y poner el prefijo en otro campo si DonWeb lo permite.
