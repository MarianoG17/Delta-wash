import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken, getTokenPayload } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        console.log('=== DIAGNÓSTICO COMPLETO INICIADO ===');
        
        // 1. Obtener información del token
        const payload = await getTokenPayload(request);
        const empresaId = await getEmpresaIdFromToken(request);
        
        console.log('Token Payload:', JSON.stringify(payload, null, 2));
        console.log('Empresa ID extraído:', empresaId);
        
        // 2. Obtener conexión
        const db = await getDBConnection(empresaId);
        
        // 3. Verificar cuántos registros hay en diferentes tablas
        const registrosResult = await db`
            SELECT COUNT(*) as total
            FROM registros_lavado
            WHERE (anulado IS NULL OR anulado = FALSE)
        `;
        
        const clientesResult = await db`
            SELECT COUNT(*) as total
            FROM registros_lavado
            WHERE (anulado IS NULL OR anulado = FALSE)
            GROUP BY patente
        `;
        
        const registrosEntregadosResult = await db`
            SELECT COUNT(*) as total
            FROM registros_lavado
            WHERE estado = 'entregado'
            AND (anulado IS NULL OR anulado = FALSE)
        `;
        
        // Manejar diferencias de driver
        const totalRegistros = Array.isArray(registrosResult) 
            ? registrosResult[0]?.total 
            : registrosResult.rows[0]?.total;
            
        const totalClientes = Array.isArray(clientesResult)
            ? clientesResult.length
            : clientesResult.rows?.length || 0;
            
        const totalEntregados = Array.isArray(registrosEntregadosResult)
            ? registrosEntregadosResult[0]?.total
            : registrosEntregadosResult.rows[0]?.total;
        
        // 4. Obtener algunos registros de muestra
        const muestraResult = await db`
            SELECT id, patente, created_at, estado, precio
            FROM registros_lavado
            WHERE (anulado IS NULL OR anulado = FALSE)
            ORDER BY created_at DESC
            LIMIT 5
        `;
        
        const muestra = Array.isArray(muestraResult) ? muestraResult : muestraResult.rows || [];
        
        const diagnostico = {
            timestamp: new Date().toISOString(),
            token: {
                presente: !!payload,
                empresaId: payload?.empresaId,
                empresaSlug: payload?.empresaSlug,
                empresaNombre: payload?.empresaNombre,
                userId: payload?.userId,
                email: payload?.email,
                rol: payload?.rol
            },
            conexion: {
                empresaIdUsado: empresaId,
                tipoConexion: empresaId ? 'SaaS (Branch específico)' : 'DeltaWash Legacy',
                empresaSlugEsperado: payload?.empresaSlug || 'N/A'
            },
            baseDatos: {
                totalRegistros: parseInt(String(totalRegistros)) || 0,
                totalClientes: totalClientes || 0,
                totalEntregados: parseInt(String(totalEntregados)) || 0,
                muestraRegistros: muestra.map(r => ({
                    id: r.id,
                    patente: r.patente,
                    fecha: r.created_at,
                    estado: r.estado,
                    precio: r.precio
                }))
            },
            interpretacion: empresaId 
                ? `Está usando branch de empresa ${empresaId}. Si hay registros, están en ese branch.`
                : 'Está usando DeltaWash Legacy. Los registros son de la base principal.'
        };
        
        console.log('DIAGNÓSTICO:', JSON.stringify(diagnostico, null, 2));
        console.log('=== DIAGNÓSTICO COMPLETO FINALIZADO ===');
        
        return NextResponse.json({
            success: true,
            diagnostico
        });
        
    } catch (error) {
        console.error('Error en diagnóstico:', error);
        return NextResponse.json({
            success: false,
            error: String(error),
            message: 'Error al realizar diagnóstico'
        }, { status: 500 });
    }
}
