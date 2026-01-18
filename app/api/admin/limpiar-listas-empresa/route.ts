import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

/**
 * API de Limpieza y Reinicialización de Listas de Precios
 * 
 * PROPÓSITO:
 * - Eliminar TODAS las listas de precios existentes de una empresa
 * - Crear una lista "Por Defecto" limpia con precios en $0
 * - Resolver problema de listas heredadas de DeltaWash u otras empresas
 * 
 * ⚠️ ADVERTENCIA: Esta acción NO se puede deshacer
 * 
 * USO:
 * POST /api/admin/limpiar-listas-empresa
 * Header: Authorization: Bearer <token de empresa SaaS>
 */
export async function POST(request: Request) {
    try {
        console.log('=== LIMPIEZA DE LISTAS DE PRECIOS ===');

        const empresaId = await getEmpresaIdFromToken(request);

        // Solo permitir para empresas SaaS (no DeltaWash)
        if (!empresaId) {
            return NextResponse.json({
                success: false,
                message: '❌ Esta API solo puede usarse con empresas SaaS (requiere empresaId en token)',
                info: 'No ejecutar en DeltaWash para evitar pérdida de datos'
            }, { status: 400 });
        }

        console.log(`[Limpieza] Iniciando limpieza para empresa ${empresaId}`);

        const db = await getDBConnection(empresaId);

        // Paso 1: Contar listas antes de eliminar
        const antesResult = await db`SELECT COUNT(*) as total FROM listas_precios`;
        const antes = Array.isArray(antesResult) ? antesResult : antesResult.rows || [];
        const listasAnteriores = parseInt(antes[0]?.total) || 0;

        console.log(`[Limpieza] Listas encontradas: ${listasAnteriores}`);

        // Paso 2: Eliminar TODAS las listas de precios (CASCADE eliminará precios también)
        await db`DELETE FROM precios`;
        await db`DELETE FROM listas_precios`;

        console.log(`[Limpieza] ✅ Todas las listas y precios eliminados`);

        // Paso 3: Crear lista "Por Defecto" limpia
        await db`
            INSERT INTO listas_precios (nombre, descripcion, activa, es_default)
            VALUES (
                'Por Defecto', 
                'Lista de precios - Configure sus valores desde Listas de Precios', 
                true, 
                true
            )
        `;

        const listaResult = await db`
            SELECT id FROM listas_precios WHERE nombre = 'Por Defecto' LIMIT 1
        `;
        const listaId = (Array.isArray(listaResult) ? listaResult : listaResult.rows || [])[0]?.id;

        console.log(`[Limpieza] ✅ Lista "Por Defecto" creada con ID ${listaId}`);

        if (!listaId) {
            throw new Error('No se pudo crear la lista "Por Defecto"');
        }

        // Paso 4: Insertar todos los servicios con precio $0
        const tiposVehiculo = ['auto', 'mono', 'camioneta', 'camioneta_xl', 'moto'];
        const tiposServicio = ['simple_exterior', 'simple', 'con_cera', 'pulido', 'limpieza_chasis', 'limpieza_motor'];

        let preciosCreados = 0;
        for (const vehiculo of tiposVehiculo) {
            for (const servicio of tiposServicio) {
                await db`
                    INSERT INTO precios (lista_id, tipo_vehiculo, tipo_servicio, precio)
                    VALUES (${listaId}, ${vehiculo}, ${servicio}, 0)
                `;
                preciosCreados++;
            }
        }

        console.log(`[Limpieza] ✅ ${preciosCreados} precios inicializados en $0`);

        // Paso 5: Verificar resultado final
        const despuesResult = await db`SELECT COUNT(*) as total FROM listas_precios`;
        const despues = Array.isArray(despuesResult) ? despuesResult : despuesResult.rows || [];
        const listasFinales = parseInt(despues[0]?.total) || 0;

        const preciosResult = await db`SELECT COUNT(*) as total FROM precios`;
        const precios = Array.isArray(preciosResult) ? preciosResult : preciosResult.rows || [];
        const preciosFinales = parseInt(precios[0]?.total) || 0;

        console.log(`[Limpieza] Resultado: ${listasFinales} lista(s), ${preciosFinales} precios`);
        console.log('=== LIMPIEZA COMPLETADA ===');

        return NextResponse.json({
            success: true,
            message: '✅ Listas de precios reiniciadas correctamente',

            resultado: {
                listas_eliminadas: listasAnteriores,
                listas_creadas: listasFinales,
                precios_creados: preciosFinales,

                nueva_lista: {
                    id: listaId,
                    nombre: 'Por Defecto',
                    todos_precios_en: '$0'
                }
            },

            accion_requerida: '⚠️ IMPORTANTE: Configure sus precios desde el módulo Listas de Precios',

            proximos_pasos: [
                '1. Ir a /listas-precios',
                '2. Hacer click en "Editar" en la lista "Por Defecto"',
                '3. Configurar los precios según su negocio',
                '4. Hacer click en "Guardar"'
            ]
        });

    } catch (error: any) {
        console.error('[Limpieza] ❌ Error:', error);
        return NextResponse.json({
            success: false,
            message: '❌ Error al limpiar listas de precios',
            error: error.message || 'Error desconocido',
            stack: error.stack
        }, { status: 500 });
    }
}
