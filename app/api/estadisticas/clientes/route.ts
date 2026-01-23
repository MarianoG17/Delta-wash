import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
  try {
    // Obtener conexión apropiada (DeltaWash o empresa específica)
    const empresaId = await getEmpresaIdFromToken(request);
    const db = await getDBConnection(empresaId);

    // Obtener estadísticas de clientes en los últimos 30 días
    // Agrupar SOLO por celular para evitar duplicados por diferencias en nombres
    // EXCLUIR registros anulados
    // Calcular frecuencia promedio de visitas en días
    const result = await db`
          SELECT
            MAX(nombre_cliente) as nombre_cliente,
            celular,
            COUNT(*) as total_visitas,
            MAX(fecha_ingreso) as ultima_visita,
            MIN(fecha_ingreso) as primera_visita,
            STRING_AGG(DISTINCT marca_modelo, ', ') as autos,
            CASE
              WHEN COUNT(*) > 1 THEN
                ROUND(
                  EXTRACT(EPOCH FROM (MAX(fecha_ingreso) - MIN(fecha_ingreso))) / 86400.0 / (COUNT(*) - 1),
                  1
                )
              ELSE NULL
            END as frecuencia_promedio_dias
          FROM registros_lavado
          WHERE fecha_ingreso >= NOW() - INTERVAL '30 days'
            AND (anulado IS NULL OR anulado = FALSE)
          GROUP BY celular
          ORDER BY total_visitas DESC, ultima_visita DESC
        `;

    // También obtener estadísticas generales (EXCLUIR anulados)
    const statsResult = await db`
      SELECT
        COUNT(*) as total_registros_30dias,
        COUNT(DISTINCT celular) as clientes_unicos,
        COUNT(CASE WHEN estado = 'entregado' THEN 1 END) as completados
      FROM registros_lavado
      WHERE fecha_ingreso >= NOW() - INTERVAL '30 days'
        AND (anulado IS NULL OR anulado = FALSE)
    `;

    // Manejar diferencias entre drivers (pg vs neon)
    const clientes = Array.isArray(result) ? result : result.rows || [];
    const estadisticas = Array.isArray(statsResult) ? statsResult[0] : statsResult.rows?.[0] || {};

    return NextResponse.json({
      success: true,
      clientes: clientes,
      estadisticas: estadisticas
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    );
  }
}
