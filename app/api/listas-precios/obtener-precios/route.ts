import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const listaId = searchParams.get('lista_id');
        const celular = searchParams.get('celular');

        let lista_precio_id = listaId;

        // Si se proporciona celular, buscar la lista asignada al cliente
        if (celular && !listaId) {
            const cuenta = await db`
                SELECT lista_precio_id FROM cuentas_corrientes 
                WHERE celular = ${celular}
            `;
            
            if (cuenta.rows.length > 0 && cuenta.rows[0].lista_precio_id) {
                lista_precio_id = cuenta.rows[0].lista_precio_id;
            }
        }

        // Si no se encontró lista, usar la por defecto
        if (!lista_precio_id) {
            const listaDefault = await db`
                SELECT id FROM listas_precios WHERE es_default = true LIMIT 1
            `;
            lista_precio_id = listaDefault.rows[0]?.id;
        }

        if (!lista_precio_id) {
            return NextResponse.json(
                { success: false, message: 'No se encontró lista de precios' },
                { status: 404 }
            );
        }

        // Obtener precios de la lista
        const precios = await db`
            SELECT * FROM precios 
            WHERE lista_id = ${lista_precio_id}
        `;

        // Convertir a formato más fácil de usar
        const preciosMap: any = {};
        precios.rows.forEach((precio: any) => {
            if (!preciosMap[precio.tipo_vehiculo]) {
                preciosMap[precio.tipo_vehiculo] = {};
            }
            preciosMap[precio.tipo_vehiculo][precio.tipo_servicio] = parseFloat(precio.precio);
        });

        return NextResponse.json({
            success: true,
            lista_id: lista_precio_id,
            precios: preciosMap
        });
    } catch (error) {
        console.error('Error obteniendo precios:', error);
        return NextResponse.json(
            { success: false, message: 'Error del servidor' },
            { status: 500 }
        );
    }
}
