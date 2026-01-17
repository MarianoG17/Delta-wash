# 💻 Cómo Usar la Terminal en VSCode

**Guía rápida para ejecutar comandos en Visual Studio Code**

---

## 🎯 Abrir la Terminal en VSCode

### Opción 1: Atajo de Teclado (Más Rápido)

**Windows/Linux:**
```
Ctrl + `  (tecla arriba del Tab)
```

**Mac:**
```
Cmd + `
```

### Opción 2: Desde el Menú

1. Click en menú superior: **Terminal**
2. Click en **"New Terminal"** (Nueva Terminal)

### Opción 3: Ver Terminal Existente

Si ya hay una terminal abierta (como ahora):
1. Mirar en la parte inferior de VSCode
2. Debería haber un panel que dice "TERMINAL"
3. Si no lo ves, usar Ctrl+` para mostrarlo/ocultarlo

---

## ⌨️ Ejecutar Comandos

Una vez que tenés la terminal abierta:

### 1. Iniciar Servidor de Desarrollo

**Escribir en la terminal:**
```bash
npm run dev
```

**Luego presionar:** `Enter`

**Qué hace:**
- Inicia el servidor de Next.js
- La app queda disponible en `http://localhost:3000`
- Los logs aparecen en esa terminal

**Salida esperada:**
```
> next dev
  ▲ Next.js 15.1.3
  - Local:        http://localhost:3000

✓ Starting...
✓ Ready in 2.3s
```

### 2. Detener el Servidor

**Si el servidor está corriendo:**

**Windows/Linux/Mac:**
```
Ctrl + C
```

Esto detiene el proceso actual.

### 3. Otros Comandos Útiles

**Instalar dependencias:**
```bash
npm install
```

**Build para producción:**
```bash
npm run build
```

**Ver versión de Node:**
```bash
node --version
```

---

## 📁 Ubicación de la Terminal

La terminal siempre se abre en la **carpeta del proyecto** (donde está `package.json`).

**Tu proyecto:**
```
c:/Users/Mariano/Documents/GitHub/App lavadero
```

Podés verificarlo viendo el "prompt" de la terminal:
```
C:\Users\Mariano\Documents\GitHub\App lavadero>
```

---

## 🔄 Múltiples Terminales

Podés tener varias terminales abiertas al mismo tiempo:

### Crear Nueva Terminal

**Opción 1:** Click en el icono **"+"** en el panel de terminal

**Opción 2:** 
```
Ctrl + Shift + `
```

### Cambiar entre Terminales

En el panel de terminal, hay pestañas arriba que muestran:
```
bash (1)  |  bash (2)  |  bash (3)
```

Click en la pestaña para cambiar de terminal.

---

## 📊 Estado Actual de Tu Terminal

**Ahora mismo tenés:**
- ✅ 1 terminal activa
- ✅ Ejecutando: `npm run dev`
- ✅ Ubicación: `c:/Users/Mariano/Documents/GitHub/App lavadero`

---

## 🎓 Comandos Más Comunes para Tu Proyecto

### Desarrollo Diario

```bash
# Iniciar servidor de desarrollo
npm run dev

# Detener servidor
Ctrl + C
```

### Git (Subir Cambios)

```bash
# Ver cambios
git status

# Agregar archivos
git add .

# Hacer commit
git commit -m "descripción de cambios"

# Subir a GitHub
git push

# Ver historial
git log
```

### Vercel (Deploy)

```bash
# Deploy manual (si tenés Vercel CLI)
vercel --prod
```

---

## 🔍 Ver la Terminal Actual

**Si no ves la terminal ahora:**

1. Presionar `Ctrl + ` ` (backtick)
2. O click en "View" → "Terminal"
3. Debería aparecer en la parte inferior de VSCode

**Tu terminal actual ya tiene corriendo:**
```
npm run dev
```

Está activa y esperando que abras `http://localhost:3000` en tu navegador.

---

## ⚙️ Cambiar Tipo de Terminal (Opcional)

Por defecto VSCode usa:
- Windows: CMD (Command Prompt)
- También podés usar: PowerShell, Git Bash

**Para cambiar:**
1. Click en la flecha ▼ al lado del "+"
2. Seleccionar el tipo de terminal

---

## 📝 Resumen Visual

```
┌────────────────────────────────────────────┐
│  VSCode                            - □ ×   │
├────────────────────────────────────────────┤
│  File  Edit  View  Terminal  Help         │
├────────────────────────────────────────────┤
│                                            │
│  [Tu código aquí]                          │
│                                            │
│                                            │
├────────────────────────────────────────────┤
│  TERMINAL                          + ▼ ×   │  ← Panel de terminal
├────────────────────────────────────────────┤
│  bash (1) ●                                │  ← Pestaña activa
├────────────────────────────────────────────┤
│  > npm run dev                             │  ← Comando ejecutado
│    ▲ Next.js 15.1.3                        │
│    - Local: http://localhost:3000          │
│    ✓ Ready in 2.3s                         │
│  █                                         │  ← Cursor esperando
└────────────────────────────────────────────┘
```

---

## 🎯 Para Reiniciar el Servidor (Caso Común)

Cuando modificás `.env.local` o instalás paquetes:

1. **En la terminal donde corre `npm run dev`:**
   ```
   Ctrl + C   (detener)
   ```

2. **Esperar a que se detenga** (verás el prompt de nuevo)

3. **Volver a iniciarlo:**
   ```bash
   npm run dev
   ```

4. **Presionar** `Enter`

---

## ✅ Checklist Rápido

```
[ ] Sé cómo abrir terminal: Ctrl + `
[ ] Sé cómo ejecutar comando: escribir + Enter
[ ] Sé cómo detener proceso: Ctrl + C
[ ] Sé cómo reiniciar servidor: Ctrl+C → npm run dev → Enter
```

---

**Ahora mismo tu servidor YA ESTÁ CORRIENDO.** 

Solo tenés que:
1. Abrir navegador
2. Ir a: `http://localhost:3000/registro`
3. Probar crear cuenta

¡Eso es todo!
