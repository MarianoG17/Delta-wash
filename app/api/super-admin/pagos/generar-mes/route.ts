import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// POST: Generar pagos para todas las empresas activas de un mes específico
export async function POST(request: Request) {
    try {
        if (!process.env.CENTRAL_DB_URL) {
            return NextResponse.json(
                { error: 'Base de datos central no configurada' },
                { status: 500 }
            );
        }

        const { mes, anio } = await request.json();

        if (!mes || !anio) {
            return NextResponse.json(
                { error: 'mes y anio son requeridos' },
                { status: 400 }
            );
        }

        if (mes < 1 || mes > 12) {
            return NextResponse.json(
                { error: 'mes debe estar entre 1 y 12' },
                { status: 400 }
            );
        }

        if (anio < 2024) {
            return NextResponse.json(
                { error: 'anio debe ser 2024 o posterior' },
                { status: 400 }
            );
        }

        const sql = neon(process.env.CENTRAL_DB_URL);

        // Obtener todas las empresas activas (incluye empresas en trial)
        const empresasActivas = await sql`
            SELECT
                id,
                nombre,
                COALESCE(precio_mensual, 85000.00) as precio_mensual,
                COALESCE(descuento_porcentaje, 0) as descuento_porcentaje,
                COALESCE(precio_final, 85000.00) as precio_final,
                trial_end_date
            FROM empresas
            WHERE COALESCE(estado, 'activo') = 'activo'
        `;

        let pagosCreados = 0;
        let pagosExistentes = 0;
        let errores = 0;

        // Calcular fecha de vencimiento (día 10 del mes)
        const fechaVencimiento = new Date(anio, mes - 1, 10);

        for (const empresa of empresasActivas) {
            try {
                // Verificar si ya existe un pago para este período
                const pagoExistente = await sql`
                    SELECT id FROM pagos_mensuales
                    WHERE empresa_id = ${empresa.id}
                    AND mes = ${mes}
                    AND anio = ${anio}
                `;

                if (pagoExistente.length > 0) {
                    pagosExistentes++;
                    continue;
                }

                // Calcular monto final
                const montoBase = parseFloat(empresa.precio_mensual.toString());
                const descuento = parseInt(empresa.descuento_porcentaje.toString());
                const montoFinal = montoBase * (1 - descuento / 100);

                // Crear el pago
                await sql`
                    INSERT INTO pagos_mensuales (
                        empresa_id,
                        mes,
                        anio,
                        fecha_vencimiento,
                        monto_base,
                        descuento_porcentaje,
                        monto_final,
                        estado
                    ) VALUES (
                        ${empresa.id},
                        ${mes},
                        ${anio},
                        ${fechaVencimiento.toISOString().split('T')[0]},
                        ${montoBase},
                        ${descuento},
                        ${montoFinal},
                        'pendiente'
                    )
                `;

                pagosCreados++;
            } catch (error) {
                console.error(`Error creando pago para empresa ${empresa.nombre}:`, error);
                errores++;
            }
        }

        return NextResponse.json({
            success: true,
            message: `Pagos generados para ${mes}/${anio}`,
            estadisticas: {
                empresas_activas: empresasActivas.length,
                pagos_creados: pagosCreados,
                pagos_existentes: pagosExistentes,
                errores: errores
            }
        });
    } catch (error) {
        console.error('Error generando pagos:', error);
        return NextResponse.json(
            { error: 'Error al generar pagos del mes' },
            { status: 500 }
        );
    }
}
