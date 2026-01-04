import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Obtener todos los registros
        const result = await sql`
      SELECT 
        id,
        fecha_ingreso,
        fecha_listo,
        fecha_entregado,
        marca_modelo,
        patente,
        tipo_limpieza,
        nombre_cliente,
        celular,
        estado
      FROM registros_lavado 
      ORDER BY fecha_ingreso DESC
    `;

        // Crear CSV
        const headers = [
            'ID',
            'Fecha Ingreso',
            'Fecha Listo',
            'Fecha Entregado',
            'Auto',
            'Patente',
            'Tipo Limpieza',
            'Cliente',
            'Teléfono',
            'Estado'
        ];

        const csvRows = [headers.join(',')];

        result.rows.forEach(row => {
            const values = [
                row.id,
                row.fecha_ingreso ? new Date(row.fecha_ingreso).toLocaleString('es-AR') : '',
                row.fecha_listo ? new Date(row.fecha_listo).toLocaleString('es-AR') : '',
                row.fecha_entregado ? new Date(row.fecha_entregado).toLocaleString('es-AR') : '',
                `"${row.marca_modelo}"`, // Comillas para manejar comas en el texto
                row.patente,
                `"${row.tipo_limpieza}"`,
                `"${row.nombre_cliente}"`,
                row.celular,
                row.estado
            ];
            csvRows.push(values.join(','));
        });

        const csv = csvRows.join('\n');

        // Agregar BOM para que Excel reconozca UTF-8
        const bom = '\uFEFF';
        const csvWithBom = bom + csv;

        return new NextResponse(csvWithBom, {
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="lavadero_registros_${new Date().toISOString().split('T')[0]}.csv"`
            }
        });

    } catch (error) {
        console.error('Error exportando registros:', error);
        return NextResponse.json(
            { error: 'Error al exportar registros' },
            { status: 500 }
        );
    }
}
