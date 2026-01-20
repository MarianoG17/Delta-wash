import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const {
            cliente_nombre,
            cliente_celular,
            promocion_id,
            accion,
            descuento_aplicado,
            registro_id,
            notas
        } = await request.json();

        if (!cliente_nombre || !cliente_celular || !promocion_id || !accion) {
            return NextResponse.json(
                { success: false, message: 'Datos incompletos' },
                { status: 400 }
            );
        }

        // Validar acción
        const accionesValidas = ['aceptado', 'rechazado', 'interes_futuro'];
        if (!accionesValidas.includes(accion)) {
            return NextResponse.json(
                { success: false, message: 'Acción no válida' },
                { status: 400 }
            );
        }

        // Registrar la interacción
        const result = await db`
            INSERT INTO upselling_interacciones (
                cliente_nombre,
                cliente_celular,
                promocion_id,
                accion,
                descuento_aplicado,
                registro_id,
                empresa_id,
                notas
            ) VALUES (
                ${cliente_nombre},
                ${cliente_celular},
                ${promocion_id},
                ${accion},
                ${descuento_aplicado || null},
                ${registro_id || null},
                ${empresaId || null},
                ${notas || null}
            )
            RETURNING *
        `;

        const resultData = Array.isArray(result) ? result : result.rows || [];

        return NextResponse.json({
            success: true,
            interaccion: resultData[0],
            message:
                accion === 'aceptado' ? '¡Excelente! Descuento aplicado' :
                    accion === 'interes_futuro' ? 'Guardado para el futuro' :
                        'Entendido'
        });

    } catch (error) {
        console.error('Error registrando interacción:', error);
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

// Obtener historial de interacciones
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const celular = searchParams.get('celular');
        const limite = parseInt(searchParams.get('limite') || '50');

        let query;
        if (celular) {
            query = db`
                SELECT 
                    i.*,
                    p.nombre as promocion_nombre,
                    p.descripcion as promocion_descripcion
                FROM upselling_interacciones i
                LEFT JOIN promociones_upselling p ON i.promocion_id = p.id
                WHERE i.cliente_celular = ${celular}
                ${empresaId ? db`AND i.empresa_id = ${empresaId}` : db`AND i.empresa_id IS NULL`}
                ORDER BY i.fecha_interaccion DESC
                LIMIT ${limite}
            `;
        } else {
            query = db`
                SELECT 
                    i.*,
                    p.nombre as promocion_nombre,
                    p.descripcion as promocion_descripcion
                FROM upselling_interacciones i
                LEFT JOIN promociones_upselling p ON i.promocion_id = p.id
                ${empresaId ? db`WHERE i.empresa_id = ${empresaId}` : db`WHERE i.empresa_id IS NULL`}
                ORDER BY i.fecha_interaccion DESC
                LIMIT ${limite}
            `;
        }

        const result = await query;
        const interacciones = Array.isArray(result) ? result : result.rows || [];

        return NextResponse.json({
            success: true,
            interacciones
        });

    } catch (error) {
        console.error('Error obteniendo interacciones:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error del servidor'
            },
            { status: 500 }
        );
    }
}
