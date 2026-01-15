import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function GET(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // Obtener todas las tablas en el schema public
        const tablasResult = await db`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        // Verificar específicamente si existe movimientos_cuenta
        const movimientosExiste = await db`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'movimientos_cuenta'
            ) as existe
        `;

        // Información de contexto (sin credenciales sensibles)
        const connectionInfo = {
            tipo: empresaId ? 'Empresa SaaS' : 'DeltaWash Legacy',
            empresa_id: empresaId || 'N/A',
            database: empresaId ? 'Branch específico' : process.env.POSTGRES_DATABASE || 'No configurado',
            host: process.env.POSTGRES_HOST || 'No configurado'
        };

        return NextResponse.json({
            success: true,
            tablas: tablasResult.rows.map(r => r.table_name),
            total_tablas: tablasResult.rows.length,
            movimientos_cuenta_existe: movimientosExiste.rows[0].existe,
            connection_info: connectionInfo,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('Error obteniendo tablas:', error);
        return NextResponse.json(
            { 
                success: false, 
                message: 'Error al obtener tablas',
                error_detail: error.message || 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
