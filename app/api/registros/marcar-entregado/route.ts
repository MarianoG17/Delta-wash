import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        const db = await getDBConnection(empresaId);

        const { id } = await request.json();

        if (!id) {
            return NextResponse.json(
                { error: 'ID es requerido' },
                { status: 400 }
            );
        }

        // VALIDAR PAGO ANTES DE MARCAR ENTREGADO
        const registroCheck = await db`
            SELECT pagado, usa_cuenta_corriente
            FROM registros_lavado
            WHERE id = ${id}
        `;

        const registros = Array.isArray(registroCheck) ? registroCheck : registroCheck.rows || [];
        
        if (registros.length === 0) {
            return NextResponse.json(
                { error: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registros[0];

        // Si NO está pagado Y NO usa cuenta corriente → ERROR
        if (!registro.pagado && !registro.usa_cuenta_corriente) {
            return NextResponse.json({
                success: false,
                error: 'pago_pendiente',
                message: 'El cliente no ha pagado. Debe registrar el pago antes de entregar el vehículo.'
            }, { status: 400 });
        }

        // Actualizar el estado a entregado
        const result = await db`
      UPDATE registros_lavado
      SET estado = 'entregado',
          fecha_entregado = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING id, celular
    `;

        const registro_actualizado = Array.isArray(result) ? result[0] : result.rows?.[0];

        // GENERAR ENCUESTA AUTOMÁTICAMENTE
        if (registro_actualizado) {
            try {
                // Verificar si ya existe una encuesta para esta visita
                const encuestaExistente = await db`
                    SELECT id FROM surveys
                    WHERE visit_id = ${id}
                    AND empresa_id = ${empresaId}
                `;

                const encuestas = Array.isArray(encuestaExistente) ? encuestaExistente : encuestaExistente.rows || [];

                // Solo crear si no existe
                if (encuestas.length === 0) {
                    // Obtener datos completos del registro para la encuesta
                    const registroCompleto = await db`
                        SELECT marca_modelo, patente, tipo_limpieza
                        FROM registros_lavado
                        WHERE id = ${registro_actualizado.id}
                    `;
                    
                    const reg = Array.isArray(registroCompleto) ? registroCompleto[0] : registroCompleto.rows?.[0];
                    
                    await db`
                        INSERT INTO surveys (
                            empresa_id,
                            visit_id,
                            client_phone,
                            vehicle_marca,
                            vehicle_patente,
                            vehicle_servicio
                        ) VALUES (
                            ${empresaId},
                            ${registro_actualizado.id},
                            ${registro_actualizado.celular || null},
                            ${reg?.marca_modelo || 'Vehículo'},
                            ${reg?.patente || ''},
                            ${reg?.tipo_limpieza || 'Servicio'}
                        )
                    `;
                }
            } catch (error) {
                // Log pero no fallar el entregado
                console.error('Error al generar encuesta:', error);
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Auto marcado como entregado'
        });

    } catch (error) {
        console.error('Error al marcar como entregado:', error);
        return NextResponse.json(
            { error: 'Error al marcar como entregado' },
            { status: 500 }
        );
    }
}
