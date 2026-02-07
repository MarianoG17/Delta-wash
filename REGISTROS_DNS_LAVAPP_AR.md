# Registros DNS para lavapp.ar en DonWeb

## 📋 Registros que Resend te está pidiendo

Según la captura, Resend necesita **4 registros** (no 3):

---

## 1️⃣ DKIM (Verificación de Dominio)

```
Tipo:       TXT
Nombre:     resend._domainkey.lavapp.ar
Contenido:  p=MIGfMA0GCSqG[...]RHHpM2wIDAQAB
TTL:        Auto (o 3600)
```

⚠️ **Importante:** Copiá el valor completo de "Content" en Resend. El valor es largo y empieza con `p=MIGfMA0GCS...`

---

## 2️⃣ SPF - Registro MX (Permite envío de emails)

```
Tipo:       MX
Nombre:     send.lavapp.ar
Contenido:  feedback-smtp.[...]amazonses.com
Prioridad:  10
TTL:        Auto (o 3600)
```

⚠️ **Importante:** Copiá el valor completo de "Content" en Resend.

---

## 3️⃣ SPF - Registro TXT (Autenticación)

```
Tipo:       TXT
Nombre:     send.lavapp.ar
Contenido:  v=spf1 include [...]nses.com ~all
TTL:        Auto (o 3600)
```

⚠️ **Importante:** Copiá el valor completo de "Content" en Resend.

---

## 4️⃣ DMARC (Opcional pero Recomendado)

```
Tipo:       TXT
Nombre:     _dmarc.lavapp.ar
Contenido:  v=DMARC1; p=none;
TTL:        Auto (o 3600)
```

---

## 🎯 Pasos para Agregar en DonWeb

### Para cada registro:

1. **Ir a DonWeb** → Dominios → lavapp.ar → Zona DNS

2. **Click en "Agregar Registro"** o botón "+"

3. **Seleccionar el Tipo** (TXT, MX, etc.)

4. **En el campo "Nombre"** poner el dominio completo:
   - Para DKIM: `resend._domainkey.lavapp.ar`
   - Para SPF MX: `send.lavapp.ar`
   - Para SPF TXT: `send.lavapp.ar`
   - Para DMARC: `_dmarc.lavapp.ar`

5. **En el campo "Contenido"**:
   - ⚠️ **Copiar EXACTAMENTE** lo que dice en la columna "Content" de Resend
   - Click en el botón de copiar (📋) en Resend si está disponible
   - Pegarlo completo, sin modificar nada

6. **TTL:** Auto o 3600

7. **Priority** (solo para el registro MX): 10

8. **Click "Guardar"**

9. **Repetir para los 4 registros**

---

## 🔍 Cómo Copiar los Valores Correctamente

### Método 1: Desde la Interfaz de Resend

En cada fila de la tabla, buscar el valor en la columna "Content":

**DKIM:**
```
p=MIGfMA0GCSqG[...texto largo...]RHHpM2wIDAQAB
```
👆 Copiar TODO este texto (es muy largo, asegúrate de copiarlo completo)

**SPF MX:**
```
feedback-smtp.[...].amazonses.com
```
👆 Copiar este valor completo

**SPF TXT:**
```
v=spf1 include [...]nses.com ~all
```
👆 Copiar este valor completo

**DMARC:**
```
v=DMARC1; p=none;
```
👆 Este es corto, copiarlo tal cual

---

## ⚠️ Errores Comunes en DonWeb

### Error 1: Campo "Nombre" sin dominio
❌ **Incorrecto:**
```
Nombre: resend._domainkey
```

✅ **Correcto:**
```
Nombre: resend._domainkey.lavapp.ar
```

### Error 2: No copiar el valor completo
❌ **Incorrecto:** Copiar solo parte del texto
✅ **Correcto:** Copiar TODO el texto de la columna "Content"

### Error 3: Agregar espacios o saltos de línea
❌ **Incorrecto:** El valor con espacios extras
✅ **Correcto:** Pegar el valor tal cual, en una sola línea

---

## 📊 Resumen de Registros

| # | Tipo | Nombre | Contenido | Status |
|---|------|--------|-----------|--------|
| 1 | TXT | resend._domainkey.lavapp.ar | p=MIG... (largo) | ⏳ Pendiente |
| 2 | MX | send.lavapp.ar | feedback-smtp...com | ⏳ Pendiente |
| 3 | TXT | send.lavapp.ar | v=spf1... | ⏳ Pendiente |
| 4 | TXT | _dmarc.lavapp.ar | v=DMARC1; p=none; | ⏳ Pendiente |

---

## ⏱️ Después de Agregar los Registros

1. **Esperar 5-10 minutos** (propagación DNS)

2. **Volver a Resend** → Domains → lavapp.ar

3. **Click en "Verify"** o refrescar la página

4. **Los Status cambiarán:**
   - ⏳ Not Started → 🔄 Pending → ✅ Verified

5. **Cuando todos tengan ✅**, el dominio está listo para enviar

---

## 🎯 Estado Actual

Según tu captura:
- ❌ DKIM: Not Started
- ❌ SPF MX: Not Started
- ❌ SPF TXT: Not Started
- ❌ DMARC: Not Started
- ✅ "Enable Sending" está activado (toggle verde)

**Próximo paso:** Agregar los 4 registros DNS en DonWeb.

---

## 💡 Tip: Copiar con un Click

Si Resend tiene un botón de "Copy" (📋) al lado de cada valor:
1. Click en ese botón
2. El valor se copia al portapapeles
3. Ir a DonWeb y pegar (Ctrl+V)

Esto evita errores al copiar valores largos.

---

## 🆘 Si algo no funciona

### Verificar en DonWeb:
1. Que los 4 registros estén agregados
2. Que el campo "Nombre" tenga el dominio completo (.lavapp.ar)
3. Que el "Contenido" sea exactamente igual al de Resend

### Tiempos de propagación:
- **Mínimo:** 5-10 minutos
- **Normal:** 1-2 horas
- **Máximo:** 24-48 horas

### Verificar propagación:
```
https://dnschecker.org
```
Buscar tu dominio y tipo de registro para ver si ya se propagó.

---

## ✅ Checklist

- [ ] Agregar registro TXT para DKIM (resend._domainkey.lavapp.ar)
- [ ] Agregar registro MX para SPF (send.lavapp.ar)
- [ ] Agregar registro TXT para SPF (send.lavapp.ar)
- [ ] Agregar registro TXT para DMARC (_dmarc.lavapp.ar)
- [ ] Esperar 10-30 minutos
- [ ] Verificar en Resend
- [ ] ✅ Todos los registros verificados
- [ ] Listo para enviar emails desde noreply@lavapp.ar

---

## 🎊 Resultado Final

Cuando todo esté verificado en Resend:

```
lavapp.ar
├── DKIM ✅ (TXT: resend._domainkey)
├── SPF ✅ (MX + TXT: send)
└── DMARC ✅ (TXT: _dmarc)

Puedes enviar emails desde:
✉️ noreply@lavapp.ar
✉️ info@lavapp.ar
✉️ cualquier@lavapp.ar
```

---

## 📝 Nota Importante sobre los Subdominios

Resend está usando el subdominio **"send"** para los emails:

- Los emails técnicamente salen de: `send.lavapp.ar`
- Pero en el código usás: `noreply@lavapp.ar`
- Resend maneja esto automáticamente

**No te preocupes por el "send"**, es parte de la configuración de Resend y funciona transparentemente.
