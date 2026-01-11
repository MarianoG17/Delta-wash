import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Obtener algunos registros recientes para ver cómo están las fechas
        const result = await sql`
            SELECT 
                id,
                patente,
                fecha_ingreso,
                fecha_listo,
                fecha_entregado,
                fecha_ingreso::text as fecha_ingreso_text,
                fecha_entregado::text as fecha_entregado_text,
                DATE(fecha_entregado) as fecha_entregado_date,
                (fecha_entregado + INTERVAL '3 hours')::date as fecha_entregado_plus3,
                (fecha_entregado AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires')::date as fecha_entregado_converted,
                estado
            FROM registros_lavado
            WHERE estado = 'entregado'
              AND fecha_entregado IS NOT NULL
              AND (anulado IS NULL OR anulado = FALSE)
            ORDER BY fecha_entregado DESC
            LIMIT 10
        `;

        return NextResponse.json({
            success: true,
            registros: result.rows
        });

    } catch (error) {
        console.error('Error en debug:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
