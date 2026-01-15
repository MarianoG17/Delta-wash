import { NextResponse } from 'next/server';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

/**
 * Endpoint de DEBUG para verificar versión del código y configuración
 */
export async function GET(request: Request) {
  try {
    console.log('========================================');
    console.log('[Debug/Version] Endpoint de diagnóstico iniciado');
    
    // Verificar variables de entorno
    const envVars = {
      POSTGRES_URL: !!process.env.POSTGRES_URL,
      CENTRAL_DB_URL: !!process.env.CENTRAL_DB_URL,
      NEON_API_KEY: !!process.env.NEON_API_KEY,
      NEON_PROJECT_ID: !!process.env.NEON_PROJECT_ID,
      JWT_SECRET: !!process.env.JWT_SECRET,
    };
    
    console.log('[Debug/Version] Variables de entorno:', envVars);
    
    // Extraer empresaId del token
    const empresaId = await getEmpresaIdFromToken(request);
    console.log(`[Debug/Version] empresaId extraído: ${empresaId || '(undefined - modo legacy)'}`);
    
    // Intentar obtener conexión
    let connectionInfo = 'No se intentó obtener conexión';
    try {
      const db = await getDBConnection(empresaId);
      connectionInfo = 'Conexión obtenida exitosamente';
      console.log('[Debug/Version] ✅ Conexión obtenida');
    } catch (dbError) {
      connectionInfo = `Error: ${dbError instanceof Error ? dbError.message : 'Error desconocido'}`;
      console.error('[Debug/Version] ❌ Error al obtener conexión:', dbError);
    }
    
    // Información de la versión
    const version = {
      commit: '5873703', // Último commit
      timestamp: new Date().toISOString(),
      logsEnabled: true,
      multiTenantEnabled: true,
      debugEndpointWorking: true
    };
    
    console.log('[Debug/Version] Información de versión:', version);
    console.log('========================================');
    
    return NextResponse.json({
      success: true,
      version,
      auth: {
        empresaId: empresaId || null,
        isLegacyMode: empresaId === undefined,
        isSaaSMode: empresaId !== undefined
      },
      database: {
        connectionInfo,
        empresaIdDetected: !!empresaId
      },
      environment: envVars,
      message: 'Endpoint de debug funcionando correctamente. Revisa los logs del servidor.'
    });
    
  } catch (error) {
    console.error('[Debug/Version] ❌ Error en endpoint de debug:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
      message: 'Error al ejecutar diagnóstico'
    }, { status: 500 });
  }
}
