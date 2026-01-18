// Script de diagnóstico rápido para ejecutar en DevTools Console
// Copia y pega esto en la consola del navegador mientras estás logueado como empresa SaaS

async function diagnosticarListasPrecios() {
    console.log('🔍 DIAGNÓSTICO DE LISTAS DE PRECIOS');
    console.log('====================================');

    const token = localStorage.getItem('authToken') || localStorage.getItem('lavadero_token');

    if (!token) {
        console.error('❌ No hay token de autenticación');
        return;
    }

    try {
        // Llamar a la API de diagnóstico
        const response = await fetch('/api/admin/diagnostico-listas', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Diagnóstico completado\n');

            console.log('📊 INFORMACIÓN DEL TOKEN:');
            console.table(data.token);

            console.log('\n🔌 CONEXIÓN:');
            console.table(data.conexion);

            console.log('\n💾 BASE DE DATOS:');
            console.log(`Total de listas: ${data.baseDatos.totalListas}`);
            console.log(`Total de precios: ${data.baseDatos.totalPrecios}`);

            if (data.baseDatos.listas.length > 0) {
                console.log('\nListas encontradas:');
                console.table(data.baseDatos.listas);
            }

            if (data.baseDatos.ejemploPrecios.length > 0) {
                console.log('\nEjemplo de precios (primeros 10):');
                console.table(data.baseDatos.ejemploPrecios);
            }

            console.log('\n🎯 DIAGNÓSTICO:');
            console.log(data.diagnostico.estado);
            console.log(data.diagnostico.problema_comun);
            console.log('\n💡 Acción sugerida:', data.diagnostico.accion_sugerida);

        } else {
            console.error('❌ Error en diagnóstico:', data);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

// Ejecutar
diagnosticarListasPrecios();
