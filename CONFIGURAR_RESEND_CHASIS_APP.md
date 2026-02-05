# Configurar Resend para chasis.app - GUÍA PASO A PASO

## 📋 Registros DNS que necesitás agregar en DonWeb

Resend te muestra 4 registros que debes copiar a DonWeb:

---

## ✅ PASO 1: Registro DKIM (TXT)

**Ir a DonWeb → Zona DNS → Agregar Registro**

```
Tipo:    TXT
Nombre:  resend._domainkey.chasis.app
Contenido: p=MIGfMA0GCSqGSIb3DQEB...
TTL:     Auto (o 3600)
```

**⚠️ IMPORTANTE:** Copiar el contenido COMPLETO que empieza con `p=MIGf...` (todo el texto largo)

---

## ✅ PASO 2: Registro SPF MX

**Agregar otro registro:**

```
Tipo:    MX
Nombre:  send.chasis.app
Contenido: feedback-smtp.us-east-...
Prioridad: 10
TTL:     Auto
```

**⚠️ IMPORTANTE:** Copiar el servidor SMTP completo (ej: `feedback-smtp.us-east-1.amazonses.com`)

---

## ✅ PASO 3: Registro SPF TXT

**Agregar otro registro:**

```
Tipo:    TXT
Nombre:  send.chasis.app
Contenido: v=spf1 include:amazons...
TTL:     Auto
```

**⚠️ IMPORTANTE:** Copiar el contenido COMPLETO que empieza con `v=spf1 include:...`

---

## ✅ PASO 4: Registro DMARC (Opcional pero recomendado)

**Agregar último registro:**

```
Tipo:    TXT
Nombre:  _dmarc.chasis.app
Contenido: v=DMARC1; p=none;
TTL:     Auto
```

---

## 🎯 Cómo agregar cada registro en DonWeb

### Para cada registro arriba:

1. **Ir a:** DonWeb → Mis Dominios → chasis.app → Zona DNS
2. **Click en:** "Agregar Registro" o botón "+"
3. **Seleccionar el Tipo:** TXT, MX, etc. (según el registro)
4. **Nombre:** 
   - Si dice `resend._domainkey` → escribir: `resend._domainkey.chasis.app`
   - Si dice `send` → escribir: `send.chasis.app`
   - Si dice `_dmarc` → escribir: `_dmarc.chasis.app`
5. **Contenido:** Copiar y pegar EXACTAMENTE de Resend (botón copy)
6. **TTL:** Dejar en Auto o poner 3600
7. **Prioridad:** Solo para MX, poner 10
8. **Guardar**

---

## 📝 Cómo copiar los valores de Resend

En la pantalla de Resend que estás viendo:

1. **DKIM:** El contenido que empieza con `p=MIGfMA0GCSqGSIb3DQEB...` (habrá un botón para copiar)
2. **SPF MX:** El servidor `feedback-smtp.us-east-...` (copiar completo)
3. **SPF TXT:** El valor `v=spf1 include:amazons...` (copiar completo)
4. **DMARC:** Simplemente: `v=DMARC1; p=none;`

---

## ⏱️ Después de agregar los registros

1. **Volver a Resend**
2. **Click en el botón negro "I've added the records"** (que veo en tu screenshot)
3. **Esperar verificación** (puede tardar de 5 minutos a 24 horas)
4. **Cuando veas ✅**, Resend está listo

---

## 🎊 Resultado final

Una vez verificado:
- ✅ Podrás enviar emails desde: `noreply@chasis.app`
- ✅ Emails de recuperación de contraseña funcionarán
- ✅ Notificaciones automáticas a clientes
- ✅ Sin límites del dominio de prueba

---

## 🆘 Si DonWeb no acepta el nombre completo

Algunos proveedores DNS solo quieren el prefijo:

**En lugar de:** `resend._domainkey.chasis.app`  
**Probar con:** `resend._domainkey`

**En lugar de:** `send.chasis.app`  
**Probar con:** `send`

**En lugar de:** `_dmarc.chasis.app`  
**Probar con:** `_dmarc`

DonWeb debería agregar automáticamente `.chasis.app` al final.

---

## ✅ Checklist

- [ ] Registro DKIM (TXT) agregado
- [ ] Registro SPF MX agregado
- [ ] Registro SPF TXT agregado
- [ ] Registro DMARC (TXT) agregado
- [ ] Click en "I've added the records" en Resend
- [ ] Esperar verificación
- [ ] ✅ Dominio verificado en Resend

---

## 🎯 Próximo paso AHORA

1. **Abrir DonWeb** en otra pestaña
2. **Ir a:** Zona DNS de chasis.app
3. **Agregar los 4 registros** (uno por uno)
4. **Volver a Resend** y hacer click en "I've added the records"
