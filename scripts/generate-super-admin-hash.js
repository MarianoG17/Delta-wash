/**
 * Script para generar el hash de la contraseña del super admin
 * 
 * Uso:
 * 1. npm install bcryptjs (si no está instalado)
 * 2. node scripts/generate-super-admin-hash.js
 * 3. Copiar el hash generado
 * 4. Agregar a Vercel como SUPER_ADMIN_PASSWORD_HASH
 */

const bcrypt = require('bcryptjs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('='.repeat(50));
console.log('🔐 Generador de Hash para Super Admin Password');
console.log('='.repeat(50));
console.log('');

rl.question('Ingresá la contraseña que querés usar: ', async (password) => {
  if (!password || password.trim() === '') {
    console.error('❌ La contraseña no puede estar vacía');
    rl.close();
    return;
  }

  if (password.length < 8) {
    console.warn('⚠️  Advertencia: La contraseña es muy corta (menos de 8 caracteres)');
  }

  try {
    console.log('');
    console.log('⏳ Generando hash...');
    
    const hash = await bcrypt.hash(password, 10);
    
    console.log('');
    console.log('✅ Hash generado exitosamente!');
    console.log('');
    console.log('-'.repeat(50));
    console.log('Hash:');
    console.log(hash);
    console.log('-'.repeat(50));
    console.log('');
    console.log('📋 Próximos pasos:');
    console.log('1. Copiá el hash de arriba');
    console.log('2. Andá a Vercel Dashboard → Settings → Environment Variables');
    console.log('3. Agregá/Actualizá:');
    console.log('   Variable: SUPER_ADMIN_PASSWORD_HASH');
    console.log('   Value: [pegá el hash]');
    console.log('4. Removee la variable SUPER_ADMIN_PASSWORD (ya no se usa)');
    console.log('5. Redeploy la aplicación');
    console.log('');
    console.log('⚠️  IMPORTANTE: Guardá este hash en un lugar seguro');
    console.log('              Si lo perdés, tendrás que generar uno nuevo');
    console.log('');
  } catch (error) {
    console.error('❌ Error generando hash:', error);
  } finally {
    rl.close();
  }
});
