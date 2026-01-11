import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Buscar el registro específico AE870LG
        const registro = await sql`
            SELECT 
                id,
                patente,
                fecha_ingreso,
                fecha_listo,
                fecha_entregado,
                fecha_entregado::date as fecha_entregado_solo_fecha,
                fecha_entregado::text as fecha_entregado_texto,
                TO_CHAR(fecha_entregado, 'YYYY-MM-DD HH24:MI:SS') as fecha_entregado_formateada,
                estado,
                anulado,
                precio
            FROM registros_lavado
            WHERE patente = 'AE870LG'
            ORDER BY fecha_ingreso DESC
            LIMIT 1
        `;

        // Verificar si cumple con el filtro del reporte
        const cumpleFiltro = await sql`
            SELECT 
                COUNT(*) as total,
                MIN(fecha_entregado) as min_fecha,
                MAX(fecha_entregado) as max_fecha
            FROM registros_lavado
            WHERE patente = 'AE870LG'
              AND fecha_entregado >= '2026-01-09'::date
              AND fecha_entregado < ('2026-01-11'::date + INTERVAL '1 day')
              AND estado = 'entregado'
              AND (anulado IS NULL OR anulado = FALSE)
        `;

        // Contar todos los registros del 9 de enero entregados
        const registros9 = await sql`
            SELECT 
                patente,
                fecha_entregado,
                fecha_entregado::date as fecha_date,
                fecha_entregado::text as fecha_text,
                estado,
                anulado
            FROM registros_lavado
            WHERE fecha_entregado >= '2026-01-09'::date
              AND fecha_entregado < ('2026-01-09'::date + INTERVAL '1 day')
              AND estado = 'entregado'
              AND (anulado IS NULL OR anulado = FALSE)
            ORDER BY fecha_entregado
        `;

        return NextResponse.json({
            success: true,
            registro_ae870lg: registro.rows[0] || null,
            cumple_filtro_reporte: cumpleFiltro.rows[0],
            todos_registros_9_enero: registros9.rows,
            total_9_enero: registros9.rows.length
        });

    } catch (error) {
        console.error('Error en debug:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
