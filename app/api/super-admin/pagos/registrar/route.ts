import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

// POST: Registrar pago manualmente
export async function POST(request: Request) {
    try {
        if (!process.env.CENTRAL_DB_URL) {
            return NextResponse.json(
                { error: 'Base de datos central no configurada' },
                { status: 500 }
            );
        }

        const {
            pago_id,
            fecha_pago,
            metodo_pago,
            comprobante,
            notas,
            registrado_por
        } = await request.json();

        if (!pago_id) {
            return NextResponse.json(
                { error: 'pago_id es requerido' },
                { status: 400 }
            );
        }

        if (!fecha_pago || !metodo_pago) {
            return NextResponse.json(
                { error: 'fecha_pago y metodo_pago son requeridos' },
                { status: 400 }
            );
        }

        const sql = neon(process.env.CENTRAL_DB_URL);

        // Verificar que el pago existe
        const pagoExistente = await sql`
            SELECT pm.*, e.nombre as empresa_nombre
            FROM pagos_mensuales pm
            JOIN empresas e ON pm.empresa_id = e.id
            WHERE pm.id = ${pago_id}
        `;

        if (pagoExistente.length === 0) {
            return NextResponse.json(
                { error: 'Pago no encontrado' },
                { status: 404 }
            );
        }

        const pago = pagoExistente[0];

        // Actualizar el pago
        await sql`
            UPDATE pagos_mensuales
            SET estado = 'pagado',
                fecha_pago = ${fecha_pago}::timestamp,
                metodo_pago = ${metodo_pago},
                comprobante = ${comprobante || null},
                notas = ${notas || null},
                registrado_por = ${registrado_por || 'Super Admin'}
            WHERE id = ${pago_id}
        `;

        // Actualizar último_pago_fecha y resetear dias_mora en empresas
        await sql`
            UPDATE empresas
            SET ultimo_pago_fecha = ${fecha_pago}::date,
                dias_mora = 0,
                suspendido_por_falta_pago = false
            WHERE id = ${pago.empresa_id}
        `;

        return NextResponse.json({
            success: true,
            message: `Pago registrado para ${pago.empresa_nombre}`
        });
    } catch (error) {
        console.error('Error registrando pago:', error);
        return NextResponse.json(
            { error: 'Error al registrar pago' },
            { status: 500 }
        );
    }
}
