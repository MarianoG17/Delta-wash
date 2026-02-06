import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getTokenPayload } from '@/lib/auth-middleware';
import { neon } from '@neondatabase/serverless';

export async function POST(request: Request) {
    try {
        // Obtener token payload (contiene empresaId y branchUrl si es SaaS)
        const tokenPayload = await getTokenPayload(request);
        const empresaId = tokenPayload?.empresaId;
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
                // Branch-per-company: cada branch solo tiene datos de una empresa
                const encuestaExistente = await db`
                    SELECT id FROM surveys
                    WHERE visit_id = ${id}
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
                    
                    // Generar token UUID explícitamente
                    const surveyToken = crypto.randomUUID();
                    
                    // Branch-per-company: sin empresa_id en la tabla
                    await db`
                        INSERT INTO surveys (
                            survey_token,
                            visit_id,
                            client_phone,
                            vehicle_marca,
                            vehicle_patente,
                            vehicle_servicio
                        ) VALUES (
                            ${surveyToken},
                            ${registro_actualizado.id},
                            ${registro_actualizado.celular || null},
                            ${reg?.marca_modelo || 'Vehículo'},
                            ${reg?.patente || ''},
                            ${reg?.tipo_limpieza || 'Servicio'}
                        )
                    `;
                    
                    // SOLO EN SAAS: Registrar en survey_lookup en base central
                    // tokenPayload contiene empresaId y branchUrl si el usuario está autenticado vía SaaS
                    if (tokenPayload && tokenPayload.empresaId && tokenPayload.branchUrl) {
                        try {
                            // Usar neon() directamente porque CENTRAL_DB_URL es conexión directa (no pooled)
                            const centralSql = neon(process.env.CENTRAL_DB_URL!);
                            
                            // Usar branchUrl directamente del JWT (no requiere query adicional)
                            await centralSql`
                                INSERT INTO survey_lookup (survey_token, empresa_id, branch_url)
                                VALUES (${surveyToken}, ${tokenPayload.empresaId}, ${tokenPayload.branchUrl})
                            `;
                            
                            console.log(`[Survey] ✅ Registrado en survey_lookup: token=${surveyToken.substring(0,8)}... empresa=${tokenPayload.empresaId}`);
                        } catch (lookupError) {
                            // Log pero no fallar - Legacy no necesita survey_lookup
                            console.error('[Survey] ⚠️ Error al registrar survey_lookup (solo afecta SaaS):', lookupError);
                        }
                    } else if (!tokenPayload) {
                        // Legacy mode - no tiene token, es normal
                        console.log('[Survey] Modo Legacy: no se registra en survey_lookup (normal)');
                    }
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
