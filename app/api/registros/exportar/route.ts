import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';
import * as XLSX from 'xlsx';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // Obtener todos los registros
        const result = await db`
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

        // Fix: Driver neon retorna array directo, NO .rows
        const registros = Array.isArray(result) ? result : [];

        // Preparar datos para Excel
        const data = registros.map(row => ({
            'ID': row.id,
            'Fecha Ingreso': row.fecha_ingreso ? new Date(row.fecha_ingreso).toLocaleString('es-AR') : '',
            'Fecha Listo': row.fecha_listo ? new Date(row.fecha_listo).toLocaleString('es-AR') : '',
            'Fecha Entregado': row.fecha_entregado ? new Date(row.fecha_entregado).toLocaleString('es-AR') : '',
            'Auto': row.marca_modelo,
            'Patente': row.patente,
            'Tipo Limpieza': row.tipo_limpieza,
            'Cliente': row.nombre_cliente,
            'Teléfono': row.celular,
            'Estado': row.estado
        }));

        // Crear libro de Excel
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Registros');

        // Ajustar ancho de columnas
        const maxWidth = 20;
        worksheet['!cols'] = [
            { wch: 5 },   // ID
            { wch: 18 },  // Fecha Ingreso
            { wch: 18 },  // Fecha Listo
            { wch: 18 },  // Fecha Entregado
            { wch: 20 },  // Auto
            { wch: 10 },  // Patente
            { wch: 25 },  // Tipo Limpieza
            { wch: 20 },  // Cliente
            { wch: 15 },  // Teléfono
            { wch: 12 }   // Estado
        ];

        // Generar buffer de Excel
        const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new NextResponse(excelBuffer, {
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="lavadero_registros_${new Date().toISOString().split('T')[0]}.xlsx"`
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
