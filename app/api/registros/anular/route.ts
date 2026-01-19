import { NextResponse } from 'next/server';
import { getDBConnection } from '@/lib/db-saas';
import { getEmpresaIdFromToken } from '@/lib/auth-middleware';

export async function POST(request: Request) {
    try {
        console.log('[Anular] 🚀 Inicio de anulación de registro');
        
        // Obtener conexión apropiada (DeltaWash o empresa específica)
        const empresaId = await getEmpresaIdFromToken(request);
        console.log(`[Anular] EmpresaId obtenido: ${empresaId || '(undefined - DeltaWash Legacy)'}`);
        
        const db = await getDBConnection(empresaId);
        console.log('[Anular] Conexión DB obtenida exitosamente');

        const { id, motivo, usuario_id } = await request.json();
        console.log(`[Anular] Datos recibidos: ID=${id}, Usuario=${usuario_id}, Motivo="${motivo || 'Sin motivo'}"`);

        if (!id || !usuario_id) {
            console.error('[Anular] ❌ Faltan datos requeridos');
            return NextResponse.json(
                { success: false, message: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        // Obtener el registro para verificar si existe y si usó cuenta corriente
        console.log(`[Anular] 🔍 Buscando registro con ID: ${id}...`);
        const result = await db`
            SELECT * FROM registros_lavado
            WHERE id = ${id}
        `;

        console.log(`[Anular] Resultados de búsqueda:`, {
            esArray: Array.isArray(result),
            tieneRows: result && 'rows' in result,
            cantidad: Array.isArray(result) ? result.length : (result && 'rows' in result ? result.rows.length : 0)
        });

        // Fix: Driver neon retorna array directo, NO .rows
        const registros = Array.isArray(result) ? result : (result.rows || []);

        if (registros.length === 0) {
            console.error(`[Anular] ❌ Registro ${id} no encontrado en la base de datos`);
            console.error(`[Anular] EmpresaId usado: ${empresaId || 'DeltaWash Legacy'}`);
            return NextResponse.json(
                { success: false, message: 'Registro no encontrado' },
                { status: 404 }
            );
        }

        const registro = registros[0];
        console.log(`[Anular] ✅ Registro encontrado:`, {
            id: registro.id,
            patente: registro.patente,
            cliente: registro.nombre_cliente,
            precio: registro.precio,
            anulado: registro.anulado,
            cuenta_corriente_id: registro.cuenta_corriente_id
        });

        // Verificar si ya está anulado
        if (registro.anulado) {
            console.warn(`[Anular] ⚠️ Registro ${id} ya está anulado`);
            return NextResponse.json(
                { success: false, message: 'Este registro ya está anulado' },
                { status: 400 }
            );
        }

        // Si el registro usó cuenta corriente, revertir el saldo
        if (registro.cuenta_corriente_id && registro.precio) {
            console.log(`[Anular] 💰 Registro usa cuenta corriente. Revirtiendo $${registro.precio}...`);
            
            // Revertir el saldo (devolver el dinero)
            await db`
                UPDATE cuentas_corrientes
                SET saldo_actual = saldo_actual + ${registro.precio}
                WHERE id = ${registro.cuenta_corriente_id}
            `;
            console.log(`[Anular] ✅ Saldo revertido en cuenta ${registro.cuenta_corriente_id}`);

            // Marcar el movimiento como anulado (si existe)
            await db`
                UPDATE movimientos_cuenta
                SET descripcion = CONCAT(descripcion, ' [ANULADO]')
                WHERE registro_id = ${id}
            `;
            console.log(`[Anular] ✅ Movimiento marcado como anulado`);
        }

        // Marcar el registro como anulado (NO eliminarlo)
        console.log(`[Anular] 📝 Marcando registro ${id} como anulado...`);
        await db`
            UPDATE registros_lavado
            SET
                anulado = TRUE,
                fecha_anulacion = NOW(),
                motivo_anulacion = ${motivo || 'Sin motivo especificado'},
                usuario_anulacion_id = ${usuario_id}
            WHERE id = ${id}
        `;
        console.log(`[Anular] ✅ Registro anulado exitosamente`);

        return NextResponse.json({
            success: true,
            message: 'Registro anulado correctamente',
            saldo_revertido: registro.cuenta_corriente_id ? registro.precio : null
        });

    } catch (error) {
        console.error('[Anular] ❌ ERROR COMPLETO:', error);
        console.error('[Anular] Stack trace:', error instanceof Error ? error.stack : 'No stack');
        console.error('[Anular] Mensaje:', error instanceof Error ? error.message : JSON.stringify(error));
        
        return NextResponse.json(
            {
                success: false,
                message: 'Error al anular registro',
                error: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
