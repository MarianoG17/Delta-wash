import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// GET: Obtener pagos con filtros y estadísticas
export async function GET(request: Request) {
    try {
        if (!process.env.CENTRAL_DB_URL) {
            return NextResponse.json(
                { error: 'Base de datos central no configurada' },
                { status: 500 }
            );
        }

        const { searchParams } = new URL(request.url);
        const mes = searchParams.get('mes');
        const anio = searchParams.get('anio');
        const estado = searchParams.get('estado');
        const empresa_id = searchParams.get('empresa_id');

        const sql = neon(process.env.CENTRAL_DB_URL);

        // Construir query dinámicamente
        let whereConditions = [];
        let params: any = {};

        if (mes) {
            whereConditions.push('pm.mes = ' + parseInt(mes));
        }
        if (anio) {
            whereConditions.push('pm.anio = ' + parseInt(anio));
        }
        if (estado && estado !== 'todos') {
            whereConditions.push(`pm.estado = '${estado}'`);
        }
        if (empresa_id) {
            whereConditions.push('pm.empresa_id = ' + parseInt(empresa_id));
        }

        const whereClause = whereConditions.length > 0
            ? 'WHERE ' + whereConditions.join(' AND ')
            : '';

        // Obtener pagos con información de empresa
        const pagos = await sql`
            SELECT
                pm.id,
                pm.empresa_id,
                e.nombre as empresa_nombre,
                pm.mes,
                pm.anio,
                pm.fecha_vencimiento,
                pm.monto_base,
                pm.descuento_porcentaje,
                pm.monto_final,
                pm.estado,
                pm.fecha_pago,
                pm.metodo_pago,
                pm.comprobante,
                pm.notas,
                pm.registrado_por,
                pm.created_at,
                e.dias_mora,
                e.estado as empresa_estado,
                e.suspendido_por_falta_pago
            FROM pagos_mensuales pm
            JOIN empresas e ON pm.empresa_id = e.id
            ${whereClause ? sql.unsafe(whereClause) : sql``}
            ORDER BY pm.anio DESC, pm.mes DESC, pm.fecha_vencimiento DESC
        `.catch(err => {
            // Si la tabla no existe aún, devolver array vacío
            console.log('Tabla pagos_mensuales no existe aún o error:', err.message);
            return [];
        });

        // Calcular estadísticas
        const estadisticas = await sql`
            SELECT
                COUNT(*) FILTER (WHERE estado = 'pagado') as cantidad_pagado,
                COUNT(*) FILTER (WHERE estado = 'pendiente') as cantidad_pendiente,
                COUNT(*) FILTER (WHERE estado = 'vencido') as cantidad_vencido,
                COALESCE(SUM(monto_final) FILTER (WHERE estado = 'pagado'), 0) as total_pagado,
                COALESCE(SUM(monto_final) FILTER (WHERE estado IN ('pendiente', 'vencido')), 0) as total_pendiente,
                COALESCE(SUM(monto_final) FILTER (WHERE estado = 'vencido'), 0) as total_vencido
            FROM pagos_mensuales pm
            ${whereClause ? sql.unsafe(whereClause) : sql``}
        `.catch(err => {
            console.log('Error calculando estadísticas:', err.message);
            return [{
                cantidad_pagado: 0,
                cantidad_pendiente: 0,
                cantidad_vencido: 0,
                total_pagado: 0,
                total_pendiente: 0,
                total_vencido: 0
            }];
        });

        return NextResponse.json({
            pagos,
            estadisticas: estadisticas[0]
        });
    } catch (error) {
        console.error('Error fetching pagos:', error);
        return NextResponse.json(
            { error: 'Error al cargar pagos' },
            { status: 500 }
        );
    }
}
