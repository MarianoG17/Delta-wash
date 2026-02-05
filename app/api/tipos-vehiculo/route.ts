import { NextRequest, NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET - Listar tipos de vehículo
export async function GET(request: NextRequest) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const sql = await getDBConnection(empresaId);

        const tipos = await sql`
            SELECT id, nombre, orden, activo, created_at
            FROM tipos_vehiculo
            WHERE activo = true
            ORDER BY orden ASC, nombre ASC
        `;

        return NextResponse.json({ success: true, tipos });
    } catch (error: any) {
        console.error('[API tipos-vehiculo GET] Error:', error);
        return NextResponse.json(
            { error: 'Error al obtener tipos de vehículo' },
            { status: 500 }
        );
    }
}

// POST - Crear nuevo tipo de vehículo
export async function POST(request: NextRequest) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);

        const { nombre } = await request.json();

        if (!nombre || nombre.trim() === '') {
            return NextResponse.json(
                { error: 'Nombre es requerido' },
                { status: 400 }
            );
        }

        const sql = await getDBConnection(empresaId);

        // Verificar que no exista ya
        const existe = await sql`
            SELECT id FROM tipos_vehiculo
            WHERE LOWER(nombre) = LOWER(${nombre.trim()})
        `;

        if (existe.length > 0) {
            return NextResponse.json(
                { error: 'Ya existe un tipo con ese nombre' },
                { status: 400 }
            );
        }

        // Obtener próximo orden
        const maxOrden = await sql`
            SELECT COALESCE(MAX(orden), 0) as max_orden
            FROM tipos_vehiculo
        `;

        const nuevoOrden = (maxOrden[0]?.max_orden || 0) + 1;

        // Crear
        const resultado = await sql`
            INSERT INTO tipos_vehiculo (nombre, orden)
            VALUES (${nombre.trim()}, ${nuevoOrden})
            RETURNING *
        `;

        return NextResponse.json({
            success: true,
            tipo: resultado[0]
        });
    } catch (error: any) {
        console.error('[API tipos-vehiculo POST] Error:', error);
        return NextResponse.json(
            { error: 'Error al crear tipo de vehículo' },
            { status: 500 }
        );
    }
}
