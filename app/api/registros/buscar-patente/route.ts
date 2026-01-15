import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { searchParams } = new URL(request.url);
        const patente = searchParams.get('patente');

        if (!patente) {
            return NextResponse.json(
                { error: 'Patente es requerida' },
                { status: 400 }
            );
        }

        // Buscar el registro más reciente con esa patente
        const result = await db`
      SELECT marca_modelo, nombre_cliente, celular, patente, tipo_vehiculo
      FROM registros_lavado
      WHERE UPPER(patente) = UPPER(${patente})
      ORDER BY fecha_ingreso DESC
      LIMIT 1
    `;

        if (result.rows.length === 0) {
            return NextResponse.json({
                found: false
            });
        }

        const registro = result.rows[0];

        // Separar marca_modelo en marca y modelo
        const marcaModelo = registro.marca_modelo.split(' ');
        const marca = marcaModelo[0] || '';
        const modelo = marcaModelo.slice(1).join(' ') || '';

        return NextResponse.json({
            found: true,
            data: {
                marca,
                modelo,
                nombre_cliente: registro.nombre_cliente,
                celular: registro.celular,
                patente: registro.patente,
                tipo_vehiculo: registro.tipo_vehiculo || 'auto'
            }
        });

    } catch (error) {
        console.error('Error buscando patente:', error);
        return NextResponse.json(
            { error: 'Error al buscar patente' },
            { status: 500 }
        );
    }
}
