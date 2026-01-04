import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Obtener estadísticas de clientes en los últimos 30 días
        const result = await sql`
      SELECT 
        nombre_cliente,
        celular,
        COUNT(*) as total_visitas,
        MAX(fecha_ingreso) as ultima_visita,
        MIN(fecha_ingreso) as primera_visita,
        STRING_AGG(DISTINCT marca_modelo, ', ') as autos
      FROM registros_lavado
      WHERE fecha_ingreso >= NOW() - INTERVAL '30 days'
      GROUP BY nombre_cliente, celular
      ORDER BY total_visitas DESC, ultima_visita DESC
    `;

        // También obtener estadísticas generales
        const statsResult = await sql`
      SELECT 
        COUNT(*) as total_registros_30dias,
        COUNT(DISTINCT celular) as clientes_unicos,
        COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as completados
      FROM registros_lavado
      WHERE fecha_ingreso >= NOW() - INTERVAL '30 days'
    `;

        return NextResponse.json({
            success: true,
            clientes: result.rows,
            estadisticas: statsResult.rows[0]
        });

    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}
