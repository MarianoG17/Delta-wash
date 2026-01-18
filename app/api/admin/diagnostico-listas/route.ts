import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken, getTokenPayload } from '@/lib/auth-middleware';

/**
 * API de Diagnóstico de Listas de Precios
 * 
 * PROPÓSITO:
 * - Ver qué listas de precios tiene una empresa
 * - Verificar si está usando la conexión correcta (SaaS vs DeltaWash)
 * - Diagnosticar si hay datos heredados incorrectamente
 * 
 * USO:
 * GET /api/admin/diagnostico-listas
 * Header: Authorization: Bearer <token>
 */
export async function GET(request: Request) {
    try {
        console.log('=== DIAGNÓSTICO DE LISTAS DE PRECIOS ===');

        // 1. Información del token
        const payload = await getTokenPayload(request);
        const empresaId = await getEmpresaIdFromToken(request);

        console.log('Token Payload:', JSON.stringify(payload, null, 2));
        console.log('Empresa ID extraído:', empresaId);

        // 2. Obtener conexión
        const db = await getDBConnection(empresaId);

        // 3. Contar listas
        const listasResult = await db`SELECT COUNT(*) as total FROM listas_precios`;
        const listas = Array.isArray(listasResult) ? listasResult : listasResult.rows || [];

        // 4. Ver nombres de listas
        const nombresResult = await db`
            SELECT id, nombre, es_default, activa, fecha_creacion 
            FROM listas_precios 
            ORDER BY id
        `;
        const nombres = Array.isArray(nombresResult) ? nombresResult : nombresResult.rows || [];

        // 5. Contar precios
        const preciosResult = await db`SELECT COUNT(*) as total FROM precios`;
        const precios = Array.isArray(preciosResult) ? preciosResult : preciosResult.rows || [];

        // 6. Ejemplo de precios de la primera lista
        let ejemploPrecios: any[] = [];
        if (nombres.length > 0) {
            const primeraListaId = nombres[0].id;
            const ejemploResult = await db`
                SELECT tipo_vehiculo, tipo_servicio, precio 
                FROM precios 
                WHERE lista_id = ${primeraListaId}
                LIMIT 10
            `;
            ejemploPrecios = Array.isArray(ejemploResult) ? ejemploResult : ejemploResult.rows || [];
        }

        const resultado = {
            success: true,
            timestamp: new Date().toISOString(),

            // Información del token/sesión
            token: {
                presente: !!payload,
                empresaId: payload?.empresaId,
                empresaSlug: payload?.empresaSlug,
                empresaNombre: payload?.empresaNombre,
                userId: payload?.userId,
                email: payload?.email,
                rol: payload?.rol
            },

            // Información de conexión
            conexion: {
                empresaIdUsado: empresaId,
                tipoConexion: empresaId
                    ? `✅ SaaS - Empresa ${empresaId}`
                    : '⚠️ DeltaWash Legacy (sin empresaId)',
                branchEsperado: payload?.empresaSlug || 'N/A'
            },

            // Datos en la base de datos
            baseDatos: {
                totalListas: parseInt(listas[0]?.total) || 0,
                totalPrecios: parseInt(precios[0]?.total) || 0,
                listas: nombres.map((l: any) => ({
                    id: l.id,
                    nombre: l.nombre,
                    es_default: l.es_default,
                    activa: l.activa,
                    fecha_creacion: l.fecha_creacion
                })),
                ejemploPrecios: ejemploPrecios.map((p: any) => ({
                    vehiculo: p.tipo_vehiculo,
                    servicio: p.tipo_servicio,
                    precio: parseFloat(p.precio)
                }))
            },

            // Interpretación
            diagnostico: {
                estado: empresaId
                    ? '✅ Usando base de datos correcta (SaaS)'
                    : '⚠️ Usando DeltaWash (no es empresa SaaS)',
                problema_comun: nombres.length > 1
                    ? '🔴 PROBLEMA: Hay más de 1 lista de precios. Debería haber solo "Por Defecto"'
                    : nombres.length === 1 && nombres[0].nombre === 'Por Defecto'
                        ? '✅ Correcto: Solo existe lista "Por Defecto"'
                        : '⚠️ Lista con nombre inesperado',
                accion_sugerida: nombres.length > 1
                    ? 'Usar API /api/admin/limpiar-listas-empresa para resetear'
                    : 'Todo parece estar correcto'
            }
        };

        console.log('RESULTADO:', JSON.stringify(resultado, null, 2));
        console.log('=== FIN DIAGNÓSTICO ===');

        return NextResponse.json(resultado);

    } catch (error: any) {
        console.error('Error en diagnóstico de listas:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Error desconocido',
            stack: error.stack
        }, { status: 500 });
    }
}
