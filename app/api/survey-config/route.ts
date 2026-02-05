import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: Obtener configuración de encuestas
// Compatible con SaaS (tenant_survey_config) y DeltaWash legacy (survey_config)
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // SaaS: Cada branch tiene su propia tabla configuracion_encuestas
        // Legacy: Usa la misma tabla configuracion_encuestas
        let configResult = await db`
            SELECT
                nombre_negocio as brand_name,
                google_maps_link as google_maps_url,
                mensaje_agradecimiento as whatsapp_message,
                dias_para_responder,
                requiere_calificacion_minima
            FROM configuracion_encuestas
            LIMIT 1
        `;

        const configs = Array.isArray(configResult) ? configResult : configResult.rows || [];

        if (configs.length === 0) {
            // Retornar configuración por defecto
            return NextResponse.json({
                success: true,
                config: {
                    brand_name: 'DeltaWash',
                    logo_url: null,
                    google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36',
                    whatsapp_message: 'Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)',
                    discount_percentage: 10
                }
            });
        }

        return NextResponse.json({
            success: true,
            config: configs[0]
        });

    } catch (error) {
        console.error('Error al obtener configuración de encuestas:', error);
        return NextResponse.json(
            { error: 'Error al obtener configuración' },
            { status: 500 }
        );
    }
}

// POST: Guardar/actualizar configuración de encuestas
export async function POST(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const {
            brand_name,
            google_maps_url,
            whatsapp_message
        } = await request.json();

        // Actualizar configuracion_encuestas (siempre hay UNA fila por branch)
        await db`
            UPDATE configuracion_encuestas
            SET nombre_negocio = ${brand_name || 'Mi Lavadero'},
                google_maps_link = ${google_maps_url || null},
                mensaje_agradecimiento = ${whatsapp_message || 'Gracias por tu opinión, nos ayuda a mejorar'},
                updated_at = NOW()
        `;

        return NextResponse.json({
            success: true,
            message: 'Configuración guardada exitosamente'
        });

    } catch (error) {
        console.error('Error al guardar configuración de encuestas:', error);
        return NextResponse.json(
            { error: 'Error al guardar configuración' },
            { status: 500 }
        );
    }
}
