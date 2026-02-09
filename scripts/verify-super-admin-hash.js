/**
 * Script para verificar si un hash de bcrypt coincide con una contraseña
 * 
 * Uso:
 * 1. npm install bcryptjs (si no está instalado)
 * 2. node scripts/verify-super-admin-hash.js
 * 
 * Este script te ayudará a:
 * - Verificar si tu contraseña coincide con el hash que pusiste en Vercel
 * - Identificar si el hash está truncado o corrupto
 * - Generar un nuevo hash si es necesario
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(60));
console.log('🔍 Verificador de Hash para Super Admin Password');
console.log('='.repeat(60));
console.log('');

// Paso 1: Solicitar el hash actual
rl.question('1️⃣  Pegá el hash que pusiste en Vercel (SUPER_ADMIN_PASSWORD_HASH):\n   ', async (hash) => {
  if (!hash || hash.trim() === '') {
    console.error('❌ El hash no puede estar vacío');
    rl.close();
    return;
  }

  hash = hash.trim();

  // Verificar longitud del hash
  console.log('');
  console.log('📏 Longitud del hash:', hash.length);
  
  if (hash.length < 59 || hash.length > 61) {
    console.warn('⚠️  ADVERTENCIA: Los hashes de bcrypt normalmente tienen 60 caracteres');
    console.warn('   Tu hash tiene', hash.length, 'caracteres');
    console.warn('   Puede estar truncado o corrupto');
  } else {
    console.log('✅ Longitud correcta (60 caracteres)');
  }

  // Verificar formato
  if (!hash.startsWith('$2a$') && !hash.startsWith('$2b$') && !hash.startsWith('$2y$')) {
    console.warn('⚠️  ADVERTENCIA: El hash no tiene el formato correcto de bcrypt');
    console.warn('   Debería empezar con $2a$, $2b$ o $2y$');
  } else {
    console.log('✅ Formato correcto de bcrypt');
  }

  console.log('');
  
  // Paso 2: Solicitar la contraseña
  rl.question('2️⃣  Ahora ingresá la contraseña con la que querés intentar entrar:\n   ', async (password) => {
    if (!password || password.trim() === '') {
      console.error('❌ La contraseña no puede estar vacía');
      rl.close();
      return;
    }

    console.log('');
    console.log('⏳ Verificando...');
    console.log('');

    try {
      const isMatch = await bcrypt.compare(password, hash);

      if (isMatch) {
        console.log('✅✅✅ ¡ÉXITO! ✅✅✅');
        console.log('');
        console.log('La contraseña COINCIDE con el hash.');
        console.log('');
        console.log('🤔 Si no podés entrar en Vercel, el problema puede ser:');
        console.log('   1. El hash en Vercel está diferente (verificá que esté completo)');
        console.log('   2. Vercel no actualizó las variables (hacer un re-deploy)');
        console.log('   3. Hay espacios extra al copiar/pegar en Vercel');
        console.log('');
        console.log('💡 Solución:');
        console.log('   1. Andá a Vercel → Settings → Environment Variables');
        console.log('   2. Borrá SUPER_ADMIN_PASSWORD_HASH completamente');
        console.log('   3. Creala de nuevo y pegá este hash SIN espacios:');
        console.log('');
        console.log('   ' + hash);
        console.log('');
        console.log('   4. Hacé un re-deploy (o push a git)');
      } else {
        console.log('❌ NO COINCIDE');
        console.log('');
        console.log('La contraseña que ingresaste NO coincide con el hash.');
        console.log('');
        console.log('🤔 Posibles causas:');
        console.log('   1. La contraseña es diferente a la que usaste para generar el hash');
        console.log('   2. El hash está truncado o corrupto');
        console.log('   3. Hay caracteres extra o espacios');
        console.log('');
        console.log('💡 Solución recomendada:');
        console.log('   Generá un nuevo hash con la contraseña correcta:');
        console.log('');
        console.log('   node scripts/generate-super-admin-hash.js');
        console.log('');
        console.log('   Y actualizá Vercel con ese nuevo hash.');
      }
    } catch (error) {
      console.error('❌ ERROR al verificar:', error.message);
      console.log('');
      console.log('El hash parece estar corrupto o inválido.');
      console.log('');
      console.log('💡 Solución:');
      console.log('   Generá un nuevo hash desde cero:');
      console.log('');
      console.log('   node scripts/generate-super-admin-hash.js');
      console.log('');
    } finally {
      rl.close();
    }
  });
});
