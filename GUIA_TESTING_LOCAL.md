# 🧪 GUÍA COMPLETA: TESTING LOCAL DEL SISTEMA MULTI-TENANT

**Objetivo:** Verificar que DeltaWash funciona igual que antes Y que las empresas nuevas acceden a sus propias bases de datos.

---

## 📋 REQUISITOS PREVIOS

### 1. Verificar que tenés todas las variables de entorno

Abrí el archivo `.env.local` y verificá que tengas:

```bash
# BD de DeltaWash (la original)
POSTGRES_URL=postgresql://...

# BD Central (donde se registran las empresas SaaS)
CENTRAL_DB_URL=postgresql://...

# API de Neon (para crear branches automáticamente)
NEON_API_KEY=...
NEON_PROJECT_ID=...

# JWT Secret
JWT_SECRET=...
```

✅ **Si tenés todo esto, seguí adelante.**  
❌ **Si falta algo, avisame.**

---

## 🚀 PASO 1: INICIAR EL SERVIDOR LOCAL

### 1.1 Abrir Terminal en VSCode

- Presioná `Ctrl + Ñ` (o `Ctrl + ~`) para abrir la terminal
- O: Menú → Terminal → New Terminal

### 1.2 Ejecutar el servidor

En la terminal, escribí:

```bash
npm run dev
```

Deberías ver algo como:

```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.3s
```

✅ **Si ves esto, el servidor está corriendo.**  
❌ **Si hay errores, copiame el error completo.**

---

## 🧪 PASO 2: PROBAR DELTAWASH (VERIFICAR QUE NO ROMPIMOS NADA)

### 2.1 Abrir el navegador

Abrí tu navegador favorito y andá a:

```
http://localhost:3000/login
```

**IMPORTANTE:** Tiene que ser `/login` (NO `/login-saas`)

### 2.2 Hacer login con tu usuario de DeltaWash

Ingresá tu usuario y contraseña habituales de DeltaWash.

✅ **Si entrás correctamente, perfecto.**  
❌ **Si no podés entrar, avisame.**

### 2.3 Probar funcionalidades básicas

Una vez adentro, probá:

#### a) Ver el historial
- Andá a la página principal
- ¿Ves los registros de DeltaWash que siempre tuviste?

✅ **Deberías ver TUS registros históricos de DeltaWash**  
❌ **Si ves una página vacía o error, avisame**

#### b) Crear un registro de prueba
- Clic en "Nuevo Registro" o similar
- Completá los datos:
  - Patente: TEST-001
  - Marca: Auto de Prueba
  - Cliente: Test Local
  - Celular: 123456789
  - Precio: 5000
- Guardá

✅ **Si se crea sin errores, bien**  
❌ **Si hay error, copiame el mensaje**

#### c) Ver que el registro aparece
- Volvé al historial
- ¿Aparece el registro TEST-001 que recién creaste?

✅ **Si aparece, DeltaWash funciona correctamente**

#### d) Probá marcar como listo
- Buscá el registro TEST-001
- Marcalo como "Listo"

✅ **Si cambia el estado, todo bien**

---

## 🏢 PASO 3: PROBAR EMPRESA NUEVA (LO MÁS IMPORTANTE)

### 3.1 Cerrar sesión de DeltaWash

En la app, buscá el botón de "Cerrar Sesión" o "Logout" y hacé clic.

O simplemente abrí una ventana de incógnito: `Ctrl + Shift + N` (Chrome) o `Ctrl + Shift + P` (Firefox)

### 3.2 Ir a la página de registro

En el navegador, andá a:

```
http://localhost:3000/home
```

### 3.3 Crear una cuenta de prueba

Completá el formulario:

```
Nombre Empresa: Lavadero Test Local
Email: test@local.com
Contraseña: test123456
Confirmar Contraseña: test123456
```

Hacé clic en "Crear Cuenta" o "Registrarse"

**¿Qué debería pasar?**

✅ **Mensaje de éxito**: "Cuenta creada correctamente" o similar  
✅ **Te redirige a** `/login-saas` (IMPORTANTE: fijate que sea `-saas`)

❌ **Error 500**: Copiame el error de la consola (F12 → Console)  
❌ **No redirige**: Avisame

### 3.4 Login con la empresa nueva

Ahora deberías estar en la página `/login-saas`

Ingresá:
```
Email: test@local.com
Contraseña: test123456
```

✅ **Si entrás, perfecto**  
❌ **Si no podés entrar, avisame el error**

### 3.5 Verificar que está VACÍO

Una vez adentro de la app con la empresa nueva:

#### a) Ver el historial
¿Qué ves?

✅ **CORRECTO: Página vacía** (sin registros, es una empresa nueva)  
❌ **INCORRECTO: Ves los registros de DeltaWash** ← Este era el problema original

#### b) ¿Ves el registro TEST-001?
El registro que creaste antes con DeltaWash, ¿aparece acá?

✅ **NO debe aparecer** (es de otra empresa)  
❌ **Si aparece, hay un problema** ← Avisame inmediatamente

### 3.6 Crear un registro de la empresa nueva

Clic en "Nuevo Registro" y completá:

```
Patente: EMPRESA-001
Marca: Auto Empresa Nueva
Cliente: Cliente Test
Celular: 987654321
Precio: 3000
```

Guardá.

✅ **Si se crea sin errores, bien**  
❌ **Si hay error, avisame**

### 3.7 Verificar que SOLO ves este registro

En el historial:

✅ **CORRECTO: Ves SOLO el registro EMPRESA-001** (el que acabás de crear)  
❌ **INCORRECTO: Ves también TEST-001** (el de DeltaWash)

---

## 🔄 PASO 4: VERIFICAR AISLAMIENTO (CRUCIAL)

### 4.1 Volver a DeltaWash

- Cerrar sesión de la empresa nueva
- Volver a login "normal": `http://localhost:3000/login`
- Login con tu usuario de DeltaWash

### 4.2 Verificar que NO ves el registro de la empresa nueva

En el historial de DeltaWash:

✅ **CORRECTO: Ves TEST-001 pero NO EMPRESA-001**  
❌ **INCORRECTO: Ves EMPRESA-001** (no debería aparecer)

---

## 📊 PASO 5: REVISAR LA CONSOLA

### 5.1 Abrir DevTools

En el navegador, presioná `F12` o:
- Chrome: Menú → Más herramientas → Herramientas para desarrolladores
- Firefox: Menú → Más herramientas → Herramientas del navegador

### 5.2 Ir a la pestaña "Console"

¿Hay errores en rojo?

✅ **No hay errores rojos**: Todo bien  
⚠️ **Hay warnings amarillos**: Está bien, no importan  
❌ **Hay errores rojos**: Copiame el texto completo

### 5.3 Ir a la terminal de VSCode

¿Hay mensajes de error?

Buscá líneas que empiecen con:
- `Error:`
- `⚠️`
- `Failed:`

✅ **No hay errores**: Perfecto  
❌ **Hay errores**: Copiame los mensajes

---

## ✅ RESULTADOS ESPERADOS

Si todo funciona correctamente:

### DeltaWash
- ✅ Login funciona igual que siempre
- ✅ Ves tus registros históricos
- ✅ Podés crear/editar registros
- ✅ NO ves registros de empresas nuevas

### Empresa Nueva
- ✅ Se puede crear cuenta desde /home
- ✅ Login funciona en /login-saas
- ✅ Empieza con historial vacío
- ✅ Puede crear registros propios
- ✅ NO ve registros de DeltaWash

### Aislamiento
- ✅ Los datos de DeltaWash y la empresa nueva están separados
- ✅ Cada uno ve solo lo suyo

---

## 🐛 PROBLEMAS COMUNES

### Problema 1: "Cannot connect to database"
**Solución:** Verificá que `.env.local` tenga las URLs correctas.

### Problema 2: "La empresa nueva ve datos de DeltaWash"
**Este es el bug original.** Si pasa esto:
1. Avisame inmediatamente
2. NO hagas deploy
3. Copiame los errores de la consola (F12)

### Problema 3: "DeltaWash no funciona"
**Esto sería grave.**
1. Avisame inmediatamente
2. Copiame el error exacto
3. Podemos hacer rollback si es necesario

### Problema 4: El servidor no inicia
**Error común:**
```
Error: Cannot find module 'next'
```

**Solución:**
```bash
npm install
```

---

## 📝 CHECKLIST DE TESTING

Marcá cada item a medida que lo probás:

### DeltaWash
- [ ] Puedo hacer login en /login
- [ ] Veo mi historial de registros anterior
- [ ] Puedo crear un registro TEST-001
- [ ] El registro TEST-001 aparece en el historial
- [ ] Puedo marcar TEST-001 como listo
- [ ] NO veo registros de otras empresas

### Empresa Nueva
- [ ] Puedo crear cuenta desde /home
- [ ] Me redirige a /login-saas
- [ ] Puedo hacer login con la cuenta nueva
- [ ] El historial está vacío (correcto para empresa nueva)
- [ ] Puedo crear un registro EMPRESA-001
- [ ] El registro EMPRESA-001 aparece en el historial
- [ ] NO veo el registro TEST-001 de DeltaWash

### Aislamiento
- [ ] Desde DeltaWash NO veo registros de empresa nueva
- [ ] Desde empresa nueva NO veo registros de DeltaWash
- [ ] Cada uno ve solo sus propios datos

### Técnico
- [ ] No hay errores rojos en la consola del navegador (F12)
- [ ] No hay errores en la terminal de VSCode
- [ ] El servidor sigue corriendo sin crashear

---

## 🎯 DESPUÉS DEL TESTING

### Si TODO funciona correctamente ✅

Escribime: "Todo funciona bien" y procedemos al deploy:

```bash
git push origin main
```

### Si encontrás problemas ❌

Escribime exactamente:
1. Qué paso falló
2. Qué mensaje de error apareció
3. En qué página estabas
4. Screenshot si es posible (F12 → Console)

---

## 💡 TIPS

- **Usá ventanas de incógnito** para probar diferentes usuarios sin cerrar sesión
- **Abrí la consola (F12) siempre** para ver errores en tiempo real
- **No tengas miedo de romper algo** - es entorno local, no afecta producción
- **Si algo falla, avisame de inmediato** - estoy acá para ayudar

---

## 🆘 NECESITÁS AYUDA?

Si en cualquier momento te trabás, escribime:

```
"Estoy en el paso X.X y me pasa esto: [describe el problema]"
```

Y te ayudo a resolverlo.

---

**¡Listo! Empezá con el Paso 1 y avisame cómo te va.** 🚀
