import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// Obtener todas las promociones
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const soloActivas = searchParams.get('activas') === 'true';

        let query;
        if (soloActivas) {
            query = db`
                SELECT *
                FROM promociones_upselling
                ${empresaId ? db`WHERE (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`WHERE empresa_id IS NULL`}
                AND activa = true
                AND (fecha_inicio IS NULL OR fecha_inicio <= CURRENT_DATE)
                AND (fecha_fin IS NULL OR fecha_fin >= CURRENT_DATE)
                ORDER BY empresa_id DESC NULLS LAST, created_at DESC
            `;
        } else {
            query = db`
                SELECT *
                FROM promociones_upselling
                ${empresaId ? db`WHERE (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`WHERE empresa_id IS NULL`}
                ORDER BY created_at DESC
            `;
        }

        const result = await query;
        const promociones = Array.isArray(result) ? result : result.rows || [];

        // Parsear servicios_objetivo de JSON string a array
        const promocionesParseadas = promociones.map((p: any) => ({
            ...p,
            servicios_objetivo: typeof p.servicios_objetivo === 'string'
                ? JSON.parse(p.servicios_objetivo)
                : p.servicios_objetivo
        }));

        return NextResponse.json({
            success: true,
            promociones: promocionesParseadas
        });

    } catch (error) {
        console.error('Error obteniendo promociones:', error);
        return NextResponse.json(
            {
                success: false,
                message: 'Error del servidor'
            },
            { status: 500 }
        );
    }
}

// Crear nueva promoción
export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const {
            nombre,
            descripcion,
            servicios_objetivo,
            descuento_porcentaje,
            descuento_fijo,
            activa,
            fecha_inicio,
            fecha_fin
        } = await request.json();

        if (!nombre || !descripcion || !servicios_objetivo) {
            return NextResponse.json(
                { success: false, message: 'Nombre, descripción y servicios objetivo son requeridos' },
                { status: 400 }
            );
        }

        // Validar que al menos haya un tipo de descuento
        if (!descuento_porcentaje && !descuento_fijo) {
            return NextResponse.json(
                { success: false, message: 'Debe especificar descuento porcentual o fijo' },
                { status: 400 }
            );
        }

        // Convertir servicios_objetivo a JSON string si es array
        const serviciosJSON = Array.isArray(servicios_objetivo)
            ? JSON.stringify(servicios_objetivo)
            : servicios_objetivo;

        const result = await db`
            INSERT INTO promociones_upselling (
                nombre,
                descripcion,
                servicios_objetivo,
                descuento_porcentaje,
                descuento_fijo,
                activa,
                fecha_inicio,
                fecha_fin,
                empresa_id
            ) VALUES (
                ${nombre},
                ${descripcion},
                ${serviciosJSON},
                ${descuento_porcentaje || 0},
                ${descuento_fijo || 0},
                ${activa !== undefined ? activa : true},
                ${fecha_inicio || null},
                ${fecha_fin || null},
                ${empresaId || null}
            )
            RETURNING *
        `;

        const resultData = Array.isArray(result) ? result : result.rows || [];
        const promocion = resultData[0];

        return NextResponse.json({
            success: true,
            promocion: {
                ...promocion,
                servicios_objetivo: JSON.parse(promocion.servicios_objetivo)
            },
            message: 'Promoción creada exitosamente'
        });

    } catch (error) {
        console.error('Error creando promoción:', error);
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

// Actualizar promoción
export async function PUT(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const {
            id,
            nombre,
            descripcion,
            servicios_objetivo,
            descuento_porcentaje,
            descuento_fijo,
            activa,
            fecha_inicio,
            fecha_fin
        } = await request.json();

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID de promoción es requerido' },
                { status: 400 }
            );
        }

        // Convertir servicios_objetivo a JSON string si es array
        const serviciosJSON = servicios_objetivo && Array.isArray(servicios_objetivo)
            ? JSON.stringify(servicios_objetivo)
            : servicios_objetivo;

        const result = await db`
            UPDATE promociones_upselling
            SET
                nombre = ${nombre !== undefined ? nombre : db`nombre`},
                descripcion = ${descripcion !== undefined ? descripcion : db`descripcion`},
                servicios_objetivo = ${serviciosJSON !== undefined ? serviciosJSON : db`servicios_objetivo`},
                descuento_porcentaje = ${descuento_porcentaje !== undefined ? descuento_porcentaje : db`descuento_porcentaje`},
                descuento_fijo = ${descuento_fijo !== undefined ? descuento_fijo : db`descuento_fijo`},
                activa = ${activa !== undefined ? activa : db`activa`},
                fecha_inicio = ${fecha_inicio !== undefined ? fecha_inicio : db`fecha_inicio`},
                fecha_fin = ${fecha_fin !== undefined ? fecha_fin : db`fecha_fin`},
                updated_at = NOW()
            WHERE id = ${id}
            ${empresaId ? db`AND (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`AND empresa_id IS NULL`}
            RETURNING *
        `;

        const resultData = Array.isArray(result) ? result : result.rows || [];

        if (resultData.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Promoción no encontrada' },
                { status: 404 }
            );
        }

        const promocion = resultData[0];

        return NextResponse.json({
            success: true,
            promocion: {
                ...promocion,
                servicios_objetivo: JSON.parse(promocion.servicios_objetivo)
            },
            message: 'Promoción actualizada exitosamente'
        });

    } catch (error) {
        console.error('Error actualizando promoción:', error);
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

// Eliminar promoción
export async function DELETE(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { success: false, message: 'ID de promoción es requerido' },
                { status: 400 }
            );
        }

        const result = await db`
            DELETE FROM promociones_upselling
            WHERE id = ${parseInt(id)}
            ${empresaId ? db`AND (empresa_id = ${empresaId} OR empresa_id IS NULL)` : db`AND empresa_id IS NULL`}
            RETURNING *
        `;

        const resultData = Array.isArray(result) ? result : result.rows || [];

        if (resultData.length === 0) {
            return NextResponse.json(
                { success: false, message: 'Promoción no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Promoción eliminada exitosamente'
        });

    } catch (error) {
        console.error('Error eliminando promoción:', error);
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
