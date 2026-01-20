import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { celular } = await request.json();

        if (!celular) {
            return NextResponse.json(
                { success: false, message: 'Celular requerido' },
                { status: 400 }
            );
        }

        // 1. Registros del cliente
        const registrosResult = await db`
            SELECT 
                id,
                fecha_ingreso,
                tipo_limpieza,
                anulado
            FROM registros_lavado
            WHERE celular = ${celular}
            ORDER BY fecha_ingreso DESC
        `;

        const registros = Array.isArray(registrosResult) ? registrosResult : registrosResult.rows || [];

        // 2. Conteo de visitas válidas
        const visitasResult = await db`
            SELECT COUNT(*) as total
            FROM registros_lavado
            WHERE celular = ${celular}
            AND (anulado IS NULL OR anulado = FALSE)
        `;

        const visitas = Array.isArray(visitasResult) ? visitasResult[0] : visitasResult.rows[0];

        // 3. ¿Tiene servicios premium?
        const premiumResult = await db`
            SELECT 
                id,
                tipo_limpieza,
                fecha_ingreso
            FROM registros_lavado
            WHERE celular = ${celular}
            AND (anulado IS NULL OR anulado = FALSE)
            AND (
                LOWER(tipo_limpieza) LIKE '%chasis%'
                OR LOWER(tipo_limpieza) LIKE '%motor%'
                OR LOWER(tipo_limpieza) LIKE '%pulido%'
            )
        `;

        const premium = Array.isArray(premiumResult) ? premiumResult : premiumResult.rows || [];

        // 4. Calcular percentil
        const percentilResult = await db`
            WITH cliente_visitas AS (
                SELECT 
                    celular,
                    COUNT(*) as visitas
                FROM registros_lavado
                WHERE (anulado IS NULL OR anulado = FALSE)
                GROUP BY celular
            )
            SELECT 
                PERCENTILE_CONT(0.80) WITHIN GROUP (ORDER BY visitas) as percentil_80
            FROM cliente_visitas
        `;

        const percentilData = Array.isArray(percentilResult) ? percentilResult[0] : percentilResult.rows[0];
        const percentil80 = parseFloat(percentilData?.percentil_80 || '0');

        return NextResponse.json({
            success: true,
            debug: {
                celular,
                total_registros: registros.length,
                registros_detalle: registros,
                visitas_validas: parseInt(visitas?.total || '0'),
                umbral_minimo: Math.ceil(percentil80),
                califica_top_20: parseInt(visitas?.total || '0') >= Math.ceil(percentil80),
                tiene_premium: premium.length > 0,
                servicios_premium_detalle: premium,
                es_elegible: parseInt(visitas?.total || '0') >= Math.ceil(percentil80) && premium.length === 0
            }
        });

    } catch (error) {
        console.error('Error en debug:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error del servidor',
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
