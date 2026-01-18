// Script de diagnóstico para error al registrar auto
// Copia y pega esto en DevTools Console (F12) mientras estás en la página de registro

console.log('🔍 DIAGNÓSTICO DE ERROR AL REGISTRAR AUTO');
console.log('==========================================\n');

// Interceptar el próximo error
const originalFetch = window.fetch;
window.fetch = async function (...args) {
    console.log('📡 Request interceptado:', args[0]);

    if (args[0].includes('/api/registros') && args[1]?.method === 'POST') {
        console.log('📝 Body enviado:', JSON.parse(args[1].body));
    }

    const response = await originalFetch.apply(this, args);

    if (!response.ok) {
        const clone = response.clone();
        try {
            const errorData = await clone.json();
            console.error('❌ ERROR DE RESPUESTA:', errorData);
        } catch (e) {
            console.error('❌ ERROR (no JSON):', await clone.text());
        }
    }

    return response;
};

console.log('✅ Interceptor activado');
console.log('Ahora intenta registrar un auto y verás el error detallado aquí\n');
