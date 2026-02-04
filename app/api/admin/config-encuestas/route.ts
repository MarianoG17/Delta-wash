import { NextResponse } from 'next/server';
import { requireAuth, isSaaSRequest } from '@/lib/auth-middleware';
import { getDBConnection } from '@/lib/db-saas';

// GET /api/admin/config-encuestas - Obtener configuración de encuestas
export async function GET(request: Request) {
    try {
        // Validar que sea SaaS
        if (!(await isSaaSRequest(request))) {
            return NextResponse.json(
                { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
                { status: 403 }
            );
        }

        // Validar autenticación y rol admin
        const payload = await requireAuth(request);

        if (payload.rol !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Solo administradores pueden acceder a esta funcionalidad' },
                { status: 403 }
            );
        }

        // Validar que el token tenga empresaId
        if (!payload.empresaId) {
            return NextResponse.json(
                { success: false, message: 'Token inválido: sin empresa asociada' },
                { status: 403 }
            );
        }

        // Obtener conexión a la base de datos de la empresa
        const db = await getDBConnection(payload.empresaId);

        // Consultar configuración (solo debe haber un registro)
        const result = await db`
      SELECT * FROM configuracion_encuestas 
      LIMIT 1
    `;

        // Si no existe configuración, devolver valores por defecto
        if (result.rows.length === 0) {
            return NextResponse.json({
                success: true,
                config: {
                    id: null,
                    nombre_negocio: '',
                    enlace_google_maps: '',
                    mensaje_agradecimiento: '¡Gracias por elegirnos!',
                    mensaje_despedida: 'Esperamos verte pronto',
                    activo: true
                }
            });
        }

        return NextResponse.json({
            success: true,
            config: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error al obtener configuración de encuestas:', error);
        return NextResponse.json(
            { success: false, message: 'Error al obtener configuración de encuestas', error: error.message },
            { status: 500 }
        );
    }
}

// PUT /api/admin/config-encuestas - Actualizar o crear configuración de encuestas
export async function PUT(request: Request) {
    try {
        // Validar que sea SaaS
        if (!(await isSaaSRequest(request))) {
            return NextResponse.json(
                { success: false, message: 'Esta funcionalidad solo está disponible para SaaS' },
                { status: 403 }
            );
        }

        // Validar autenticación y rol admin
        const payload = await requireAuth(request);

        if (payload.rol !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Solo administradores pueden acceder a esta funcionalidad' },
                { status: 403 }
            );
        }

        // Validar que el token tenga empresaId
        if (!payload.empresaId) {
            return NextResponse.json(
                { success: false, message: 'Token inválido: sin empresa asociada' },
                { status: 403 }
            );
        }

        // Obtener datos del body
        const body = await request.json();
        const {
            nombre_negocio,
            enlace_google_maps,
            mensaje_agradecimiento,
            mensaje_despedida,
            activo
        } = body;

        // Validaciones
        if (!nombre_negocio || nombre_negocio.trim() === '') {
            return NextResponse.json(
                { success: false, message: 'El nombre del negocio es requerido' },
                { status: 400 }
            );
        }

        if (nombre_negocio.length > 100) {
            return NextResponse.json(
                { success: false, message: 'El nombre del negocio no puede exceder 100 caracteres' },
                { status: 400 }
            );
        }

        // Validar formato de URL de Google Maps (opcional)
        if (enlace_google_maps && enlace_google_maps.trim() !== '') {
            const urlPattern = /^https?:\/\/.+/;
            if (!urlPattern.test(enlace_google_maps)) {
                return NextResponse.json(
                    { success: false, message: 'El enlace de Google Maps debe ser una URL válida (http:// o https://)' },
                    { status: 400 }
                );
            }
        }

        // Obtener conexión a la base de datos de la empresa
        const db = await getDBConnection(payload.empresaId);

        // Verificar si ya existe configuración
        const existe = await db`
      SELECT id FROM configuracion_encuestas LIMIT 1
    `;

        let result;

        if (existe.rows.length > 0) {
            // Actualizar configuración existente
            result = await db`
        UPDATE configuracion_encuestas 
        SET 
          nombre_negocio = ${nombre_negocio.trim()},
          enlace_google_maps = ${enlace_google_maps?.trim() || ''},
          mensaje_agradecimiento = ${mensaje_agradecimiento?.trim() || '¡Gracias por elegirnos!'},
          mensaje_despedida = ${mensaje_despedida?.trim() || 'Esperamos verte pronto'},
          activo = ${activo !== false},
          updated_at = NOW()
        WHERE id = ${existe.rows[0].id}
        RETURNING *
      `;
        } else {
            // Crear nueva configuración
            result = await db`
        INSERT INTO configuracion_encuestas 
        (nombre_negocio, enlace_google_maps, mensaje_agradecimiento, mensaje_despedida, activo)
        VALUES (
          ${nombre_negocio.trim()},
          ${enlace_google_maps?.trim() || ''},
          ${mensaje_agradecimiento?.trim() || '¡Gracias por elegirnos!'},
          ${mensaje_despedida?.trim() || 'Esperamos verte pronto'},
          ${activo !== false}
        )
        RETURNING *
      `;
        }

        return NextResponse.json({
            success: true,
            message: 'Configuración guardada exitosamente',
            config: result.rows[0]
        });

    } catch (error: any) {
        console.error('Error al guardar configuración de encuestas:', error);
        return NextResponse.json(
            { success: false, message: 'Error al guardar configuración de encuestas', error: error.message },
            { status: 500 }
        );
    }
}
