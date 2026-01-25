import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

// GET: Obtener configuración de upselling
export async function GET(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        // Buscar configuración específica de la empresa o usar la por defecto
        const result = await db`
            SELECT *
            FROM upselling_configuracion
            WHERE ${empresaId ? db`empresa_id = ${empresaId}` : db`empresa_id IS NULL`}
            LIMIT 1
        `;

        const configuracion = Array.isArray(result) ? result[0] : result.rows?.[0];

        // Si no existe, crear una con valores por defecto
        if (!configuracion) {
            const defaultConfig = await db`
                INSERT INTO upselling_configuracion (
                    empresa_id,
                    percentil_clientes,
                    periodo_rechazado_dias,
                    servicios_premium,
                    activo
                ) VALUES (
                    ${empresaId},
                    80,
                    30,
                    '["chasis", "motor", "pulido"]',
                    true
                )
                RETURNING *
            `;

            const newConfig = Array.isArray(defaultConfig) ? defaultConfig[0] : defaultConfig.rows?.[0];

            return NextResponse.json({
                success: true,
                configuracion: {
                    ...newConfig,
                    servicios_premium: JSON.parse(newConfig.servicios_premium)
                }
            });
        }

        return NextResponse.json({
            success: true,
            configuracion: {
                ...configuracion,
                servicios_premium: JSON.parse(configuracion.servicios_premium)
            }
        });

    } catch (error) {
        console.error('Error obteniendo configuración upselling:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al obtener configuración',
            error: String(error)
        }, { status: 500 });
    }
}

// PUT: Actualizar configuración de upselling
export async function PUT(request: Request) {
    try {
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const body = await request.json();
        const {
            percentil_clientes,
            periodo_rechazado_dias,
            servicios_premium,
            activo
        } = body;

        // Validaciones
        if (percentil_clientes !== undefined && (percentil_clientes < 1 || percentil_clientes > 99)) {
            return NextResponse.json({
                success: false,
                message: 'El percentil debe estar entre 1 y 99'
            }, { status: 400 });
        }

        if (periodo_rechazado_dias !== undefined && periodo_rechazado_dias < 0) {
            return NextResponse.json({
                success: false,
                message: 'El período de rechazo no puede ser negativo'
            }, { status: 400 });
        }

        if (servicios_premium !== undefined && !Array.isArray(servicios_premium)) {
            return NextResponse.json({
                success: false,
                message: 'Los servicios premium deben ser un array'
            }, { status: 400 });
        }

        // Construir el objeto de actualización solo con campos presentes
        const updates: any = { updated_at: new Date() };
        if (percentil_clientes !== undefined) updates.percentil_clientes = percentil_clientes;
        if (periodo_rechazado_dias !== undefined) updates.periodo_rechazado_dias = periodo_rechazado_dias;
        if (servicios_premium !== undefined) updates.servicios_premium = JSON.stringify(servicios_premium);
        if (activo !== undefined) updates.activo = activo;

        // Verificar si existe la configuración
        const existing = await db`
            SELECT id
            FROM upselling_configuracion
            WHERE ${empresaId ? db`empresa_id = ${empresaId}` : db`empresa_id IS NULL`}
        `;

        const existingData = Array.isArray(existing) ? existing : existing.rows || [];

        let result;
        if (existingData.length === 0) {
            // Crear nueva configuración
            result = await db`
                INSERT INTO upselling_configuracion (
                    empresa_id,
                    percentil_clientes,
                    periodo_rechazado_dias,
                    servicios_premium,
                    activo
                ) VALUES (
                    ${empresaId},
                    ${updates.percentil_clientes || 80},
                    ${updates.periodo_rechazado_dias || 30},
                    ${updates.servicios_premium || '["chasis", "motor", "pulido"]'},
                    ${updates.activo !== undefined ? updates.activo : true}
                )
                RETURNING *
            `;
        } else {
            // Actualizar configuración existente
            const setClause = Object.entries(updates)
                .map(([key, value]) => `${key} = ${typeof value === 'string' ? `'${value}'` : value}`)
                .join(', ');

            result = await db`
                UPDATE upselling_configuracion
                SET
                    percentil_clientes = COALESCE(${updates.percentil_clientes}, percentil_clientes),
                    periodo_rechazado_dias = COALESCE(${updates.periodo_rechazado_dias}, periodo_rechazado_dias),
                    servicios_premium = COALESCE(${updates.servicios_premium}, servicios_premium),
                    activo = COALESCE(${updates.activo}, activo),
                    updated_at = CURRENT_TIMESTAMP
                WHERE ${empresaId ? db`empresa_id = ${empresaId}` : db`empresa_id IS NULL`}
                RETURNING *
            `;
        }

        const updatedConfig = Array.isArray(result) ? result[0] : result.rows?.[0];

        return NextResponse.json({
            success: true,
            message: 'Configuración actualizada correctamente',
            configuracion: {
                ...updatedConfig,
                servicios_premium: JSON.parse(updatedConfig.servicios_premium)
            }
        });

    } catch (error) {
        console.error('Error actualizando configuración upselling:', error);
        return NextResponse.json({
            success: false,
            message: 'Error al actualizar configuración',
            error: String(error)
        }, { status: 500 });
    }
}
