import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const patente = searchParams.get('patente') || 'AE870LG';

        // Buscar el registro específico
        const registro = await sql`
            SELECT 
                id,
                patente,
                fecha_ingreso,
                fecha_listo,
                fecha_entregado,
                estado,
                anulado,
                precio,
                fecha_entregado::date as fecha_entregado_date,
                fecha_entregado::text as fecha_entregado_text
            FROM registros_lavado
            WHERE patente = ${patente}
            ORDER BY fecha_ingreso DESC
            LIMIT 1
        `;

        // Contar registros del 9 de enero con diferentes métodos
        const conteo1 = await sql`
            SELECT COUNT(*) as total
            FROM registros_lavado
            WHERE fecha_entregado::date = '2026-01-09'
              AND estado = 'entregado'
              AND (anulado IS NULL OR anulado = FALSE)
        `;

        const conteo2 = await sql`
            SELECT COUNT(*) as total
            FROM registros_lavado
            WHERE DATE(fecha_entregado) = '2026-01-09'
              AND estado = 'entregado'
              AND (anulado IS NULL OR anulado = FALSE)
        `;

        // Listar TODOS los registros entregados del 9 de enero
        const registros9 = await sql`
            SELECT 
                patente,
                fecha_entregado,
                fecha_entregado::date as fecha_date,
                estado,
                anulado,
                precio
            FROM registros_lavado
            WHERE fecha_entregado::date = '2026-01-09'
              AND estado = 'entregado'
            ORDER BY fecha_entregado
        `;

        return NextResponse.json({
            success: true,
            registro_buscado: registro.rows[0] || null,
            conteo_metodo1: conteo1.rows[0]?.total || 0,
            conteo_metodo2: conteo2.rows[0]?.total || 0,
            registros_9_enero: registros9.rows,
            total_registros_9: registros9.rows.length
        });

    } catch (error) {
        console.error('Error en debug:', error);
        return NextResponse.json({
            success: false,
            error: String(error)
        }, { status: 500 });
    }
}
