# Pasos para Configurar chasis.app - GUÍA RÁPIDA

## ✅ Paso 1: Activar Zona DNS en DonWeb (AHORA)

Estás en el lugar correcto. Necesitás activar la zona DNS:

1. **Click en el botón verde "Crear zona en DonWeb"**
2. Esperar a que se cree la zona
3. Deberías ver una lista vacía de registros DNS

---

## ✅ Paso 2: Agregar Dominio en Vercel

1. **Abrir en otra pestaña:**
   ```
   https://vercel.com/marianos-projects-7b8bdb06/app-lavadero/settings/domains
   ```

2. **En la sección "Domains", buscar el campo de texto**

3. **Escribir:**
   ```
   chasis.app
   ```

4. **Click "Add"**

5. **Vercel te mostrará instrucciones**. Probablemente te pida uno de estos:

   **Opción A - Registro A:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **Opción B - Registro CNAME:**
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

6. **NO hagas click en "Verify" todavía** - Primero agregá los registros

7. **Copiar o anotar** qué tipo de registro te pide Vercel

---

## ✅ Paso 3: Agregar Registros en DonWeb

1. **Volver a la pestaña de DonWeb** (Zona DNS)

2. **Buscar botón "Agregar Registro" o "+"** (debería aparecer después de crear la zona)

3. **Agregar el registro que Vercel te pidió:**

   ### Si Vercel pidió registro A:
   ```
   Tipo: A
   Nombre/Host: @
   Valor/Apunta a: 76.76.21.21
   TTL: 3600 (o Auto)
   ```

   ### Si Vercel pidió registro CNAME:
   ```
   Tipo: CNAME
   Nombre/Host: @
   Valor/Apunta a: cname.vercel-dns.com
   TTL: 3600 (o Auto)
   ```

4. **Guardar el registro**

5. **Agregar también registro para www:**
   ```
   Tipo: CNAME
   Nombre/Host: www
   Valor/Apunta a: cname.vercel-dns.com
   TTL: 3600
   ```

---

## ✅ Paso 4: Verificar en Vercel

1. **Volver a Vercel** → Domains

2. **Click "Refresh" o "Verify"** junto a chasis.app

3. **Esperar** (puede tardar de 1 minuto a 1 hora)

4. **Cuando veas ✅**, el dominio está configurado

5. **Probar:**
   ```
   https://chasis.app
   ```
   Debería mostrar tu aplicación

---

## 🎯 RESUMEN - Qué hacer AHORA:

1. ✅ Click en **"Crear zona en DonWeb"** (botón verde)
2. ⏸️ Esperar a que se cree
3. ➡️ Ir a Vercel y agregar dominio chasis.app
4. ➡️ Ver qué registros te pide Vercel
5. ➡️ Volver a DonWeb y agregar esos registros
6. ➡️ Verificar en Vercel

---

## 📸 Screenshots que me ayudarían:

Si tenés alguna duda, podés compartir:
1. Screenshot de Vercel después de agregar el dominio (te mostrará qué registros necesitás)
2. Screenshot de DonWeb después de crear la zona (para ver el formulario de agregar registros)

---

## ⚠️ Nota Importante:

El proceso puede parecer complejo, pero es:
1. Crear zona DNS (1 click)
2. Ver qué pide Vercel (abrir link)
3. Copiar esos valores en DonWeb (2-3 registros)
4. Esperar verificación (automático)

**Tiempo total:** 5-10 minutos de trabajo + tiempo de propagación DNS
