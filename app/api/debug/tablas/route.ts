import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
    try {
        // Obtener todas las tablas en el schema public
        const tablasResult = await sql`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        `;

        // Verificar específicamente si existe movimientos_cuenta
        const movimientosExiste = await sql`
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_schema = 'public' 
                AND table_name = 'movimientos_cuenta'
            ) as existe
        `;

        // Obtener información de conexión (sin mostrar credenciales)
        const connectionInfo = {
            database: process.env.POSTGRES_DATABASE || 'No configurado',
            host: process.env.POSTGRES_HOST || 'No configurado',
            user: process.env.POSTGRES_USER || 'No configurado'
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
                error_detail: error.message || 'Error desconocido',
                connection_info: {
                    database: process.env.POSTGRES_DATABASE || 'No configurado',
                    host: process.env.POSTGRES_HOST || 'No configurado',
                    user: process.env.POSTGRES_USER || 'No configurado'
                }
            },
            { status: 500 }
        );
    }
}
