import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { createAndSetupBranchForEmpresa, sincronizarUsuariosEmpresa } from '@/lib/neon-api';

/**
 * API de Registro SaaS
 * 
 * Crea una nueva empresa en la BD Central
 * Por ahora, sin creación automática de branch (se hace manual)
 */
export async function POST(request: Request) {
  try {
    // Leer datos del formulario
    const { nombreEmpresa, email, password, telefono, contacto_nombre, direccion } = await request.json();

    // Validaciones básicas
    if (!nombreEmpresa || !email || !password || !telefono || !contacto_nombre || !direccion) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Email inválido' },
        { status: 400 }
      );
    }

    // Conectar a BD Central
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    // Verificar que el email no esté registrado
    const existingUser = await centralDB.sql`
      SELECT id FROM usuarios_sistema WHERE email = ${email}
    `;

    if (existingUser.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Este email ya está registrado' },
        { status: 400 }
      );
    }

    // Generar slug único para la empresa
    const slug = nombreEmpresa
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar espacios y caracteres especiales por guiones
      .replace(/^-+|-+$/g, ''); // Quitar guiones al inicio y final

    // Verificar que el slug no exista
    const existingSlug = await centralDB.sql`
      SELECT id FROM empresas WHERE slug = ${slug}
    `;

    let finalSlug = slug;
    if (existingSlug.rows.length > 0) {
      // Agregar timestamp para hacerlo único
      finalSlug = `${slug}-${Date.now()}`;
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // CREAR BRANCH AUTOMÁTICAMENTE EN NEON
    console.log('========================================');
    console.log('[Registro] 🚀 INICIO: Creación de base de datos en Neon');
    console.log(`[Registro] Empresa: ${nombreEmpresa}`);
    console.log(`[Registro] Slug generado: ${finalSlug}`);
    console.log(`[Registro] Email: ${email}`);

    let branchUrl = '';
    let branchName = finalSlug;

    try {
      console.log('[Registro] 📞 Llamando a createAndSetupBranchForEmpresa()...');
      console.log(`[Registro] NEON_API_KEY: ${process.env.NEON_API_KEY ? '✅ Configurada (' + process.env.NEON_API_KEY.substring(0, 10) + '...)' : '❌ NO configurada'}`);
      console.log(`[Registro] NEON_PROJECT_ID: ${process.env.NEON_PROJECT_ID ? '✅ Configurado (' + process.env.NEON_PROJECT_ID + ')' : '❌ NO configurado'}`);

      // Intentar crear el branch en Neon
      const branchInfo = await createAndSetupBranchForEmpresa(finalSlug);

      console.log('[Registro] 📦 Respuesta recibida de createAndSetupBranchForEmpresa:');
      console.log(`[Registro]   - branchId: ${branchInfo.branchId}`);
      console.log(`[Registro]   - branchName: ${branchInfo.branchName}`);
      console.log(`[Registro]   - connectionUri: ${branchInfo.connectionUri ? '✅ ' + branchInfo.connectionUri.substring(0, 50) + '...' : '❌ undefined'}`);
      console.log(`[Registro]   - connectionUriPooler: ${branchInfo.connectionUriPooler ? '✅ ' + branchInfo.connectionUriPooler.substring(0, 50) + '...' : '❌ undefined'}`);

      branchUrl = branchInfo.connectionUriPooler; // Usar pooler para mejor rendimiento
      branchName = branchInfo.branchName;

      if (!branchUrl || branchUrl.trim() === '') {
        console.error('[Registro] ❌ ERROR: connectionUriPooler está vacío o undefined');
        console.error('[Registro] Esto significa que Neon API no devolvió la URL de conexión esperada');
        throw new Error('connectionUriPooler vacío en respuesta de Neon');
      }

      console.log(`[Registro] ✅ Base de datos creada exitosamente!`);
      console.log(`[Registro]   - Branch ID: ${branchInfo.branchId}`);
      console.log(`[Registro]   - Branch Name: ${branchName}`);
      console.log(`[Registro]   - URL guardada: ${branchUrl.substring(0, 60)}...`);
    } catch (neonError) {
      // Si falla la creación del branch, loguear pero NO fallar el registro
      console.error('========================================');
      console.error('[Registro] ❌ ERROR al crear branch en Neon:');
      console.error(`[Registro] Tipo de error: ${neonError instanceof Error ? neonError.constructor.name : typeof neonError}`);
      console.error(`[Registro] Mensaje: ${neonError instanceof Error ? neonError.message : JSON.stringify(neonError)}`);
      if (neonError instanceof Error && neonError.stack) {
        console.error(`[Registro] Stack trace (primeras 3 líneas):`);
        const stackLines = neonError.stack.split('\n').slice(0, 3);
        stackLines.forEach(line => console.error(`[Registro]   ${line}`));
      }
      console.log('[Registro] ⚠️ La empresa se creará sin BD asignada (requiere configuración manual)');
      console.error('========================================');
      // branchUrl queda vacío, empresa se crea pero no podrá usarse hasta configurar manualmente
    }

    console.log('========================================');

    // Crear empresa en BD Central
    const empresaResult = await centralDB.sql`
      INSERT INTO empresas (
        nombre,
        slug,
        branch_name,
        branch_url,
        plan,
        estado,
        fecha_expiracion,
        email,
        telefono,
        contacto_nombre,
        direccion
      ) VALUES (
        ${nombreEmpresa},
        ${finalSlug},
        ${branchName},
        ${branchUrl},
        'trial',
        'activo',
        NOW() + INTERVAL '15 days',
        ${email},
        ${telefono},
        ${contacto_nombre},
        ${direccion}
      )
      RETURNING id, nombre, slug
    `;

    const empresa = empresaResult.rows[0];

    // Crear usuario admin para la empresa
    const usuarioResult = await centralDB.sql`
      INSERT INTO usuarios_sistema (
        empresa_id,
        email,
        password_hash,
        nombre,
        rol,
        activo
      ) VALUES (
        ${empresa.id},
        ${email},
        ${passwordHash},
        ${nombreEmpresa},
        'admin',
        true
      )
      RETURNING id, email, nombre, rol
    `;

    const usuario = usuarioResult.rows[0];

    // Crear usuarios de ejemplo para probar roles
    // Usuario Operador de ejemplo
    const passwordOperadorHash = await bcrypt.hash('demo123', 10);
    const operadorResult = await centralDB.sql`
      INSERT INTO usuarios_sistema (
        empresa_id,
        email,
        password_hash,
        nombre,
        rol,
        activo
      ) VALUES (
        ${empresa.id},
        ${'operador@' + finalSlug + '.demo'},
        ${passwordOperadorHash},
        'Operador Demo',
        'operador',
        true
      )
      RETURNING id
    `;

    // CRÍTICO: Crear los usuarios en la tabla 'usuarios' del branch dedicado
    // Esto sincroniza los IDs entre usuarios_sistema (BD Central) y usuarios (Branch)
    // AHORA CON RETRY LOGIC para manejar problemas de timing/inicialización
    if (branchUrl) {
      console.log('[Registro] 👤 Sincronizando usuarios en branch dedicado con retry logic...');

      const sincronizado = await sincronizarUsuariosEmpresa(empresa.id, branchUrl, 3);

      if (sincronizado) {
        console.log(`[Registro] ✅ Usuarios sincronizados exitosamente`);
      } else {
        console.error('[Registro] ⚠️ No se pudieron sincronizar usuarios');
        console.error('[Registro] Los usuarios se sincronizarán automáticamente en la primera acción (lazy sync)');
      }
    }

    // Registrar actividad
    await centralDB.sql`
      INSERT INTO actividad_sistema (
        empresa_id,
        usuario_id,
        tipo,
        descripcion
      ) VALUES (
        ${empresa.id},
        ${usuario.id},
        'registro',
        'Nueva empresa registrada en el sistema SaaS con usuarios de prueba'
      )
    `;

    // Generar token JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const token = jwt.sign(
      {
        empresaId: empresa.id,
        empresaNombre: empresa.nombre,
        empresaSlug: empresa.slug,
        userId: usuario.id,
        email: usuario.email,
        rol: usuario.rol
      },
      jwtSecret,
      { expiresIn: '7d' }
    );

    // Preparar mensaje según si se creó la BD o no
    const mensajeFinal = branchUrl
      ? '¡Cuenta creada exitosamente! Tu base de datos está lista y podés comenzar a usar la aplicación.'
      : '¡Cuenta creada! Sin embargo, hubo un problema al crear tu base de datos automáticamente. Un administrador deberá configurarla manualmente antes de que puedas ingresar.';

    const advertencia = branchUrl
      ? null
      : 'Tu cuenta requiere configuración manual de la base de datos. Contactá a soporte.';

    // Enviar email de bienvenida
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lavapp.ar';

        await resend.emails.send({
          from: 'LAVAPP <noreply@lavapp.ar>',
          to: email,
          subject: '¡Bienvenido a LAVAPP! Tu cuenta está lista 🎉',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #0ea5e9; font-size: 32px; margin-bottom: 10px;">
                  🚗 ¡Bienvenido a LAVAPP!
                </h1>
              </div>
              
              <div style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; margin-bottom: 30px;">
                <p style="margin: 0; font-size: 16px; color: #333;">
                  Hola <strong>${nombreEmpresa}</strong>,
                </p>
                <p style="margin-top: 10px; color: #666;">
                  Tu cuenta ha sido creada exitosamente. Ahora podés empezar a gestionar tu lavadero de forma profesional y dejar el papel atrás. 📱
                </p>
              </div>

              <h2 style="color: #0ea5e9; font-size: 20px; margin-top: 30px;">🚀 Próximos pasos:</h2>
              
              <div style="margin: 20px 0;">
                <div style="padding: 15px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 15px;">
                  <strong style="color: #0ea5e9;">1. Configurá tus precios</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    Ir a Listas de Precios y definir las tarifas de tus servicios y tipos de vehículos.
                  </p>
                </div>

                <div style="padding: 15px; background-color: #f9fafb; border-radius: 8px; margin-bottom: 15px;">
                  <strong style="color: #0ea5e9;">2. Cargá tu primer auto</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    Empezá a registrar vehículos y ver cómo el sistema calcula los precios automáticamente.
                  </p>
                </div>

                <div style="padding: 15px; background-color: #f9fafb; border-radius: 8px;">
                  <strong style="color: #0ea5e9;">3. Explorá las funciones</strong>
                  <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                    • Historial de autos<br>
                    • Cuenta corriente con clientes<br>
                    • Reportes y estadísticas<br>
                    • Encuestas de satisfacción
                  </p>
                </div>
              </div>

              <div style="text-align: center; margin: 40px 0;">
                <a href="${appUrl}/home" style="display: inline-block; padding: 14px 28px; background-color: #0ea5e9; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Ir a mi panel →
                </a>
              </div>

              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 30px 0;">
                <p style="margin: 0; color: #92400e; font-size: 14px;">
                  <strong>💡 Periodo de prueba:</strong> Tenés 15 días para explorar todas las funciones sin costo.
                </p>
              </div>

              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #e5e7eb; margin-top: 40px;">
                <p style="color: #666; font-size: 14px; margin-bottom: 10px;">
                  ¿Necesitás ayuda? Respondé este email y te asistimos con gusto.
                </p>
                <p style="color: #999; font-size: 12px;">
                  LAVAPP - Sistema de gestión para lavaderos de autos<br>
                  <a href="${appUrl}" style="color: #0ea5e9; text-decoration: none;">lavapp.ar</a>
                </p>
              </div>
            </div>
          `
        });

        console.log('[Registro] ✉️ Email de bienvenida enviado a:', email);
      }
    } catch (emailError) {
      // No fallar el registro si falla el email
      console.error('[Registro] Error al enviar email de bienvenida:', emailError);
    }

    // Retornar éxito con información de ambos usuarios
    return NextResponse.json({
      success: true,
      message: mensajeFinal,
      advertencia: advertencia,
      bdCreada: !!branchUrl,
      empresa: {
        id: empresa.id,
        nombre: empresa.nombre,
        slug: empresa.slug,
        branchUrl: branchUrl || '(Pendiente de asignación)'
      },
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nombre: usuario.nombre,
        rol: 'admin'
      },
      usuariosPrueba: {
        admin: {
          email: email,
          password: '(Tu contraseña)',
          rol: 'admin',
          permisos: [
            'Acceso completo a Reportes y Estadísticas',
            'Modificar Listas de Precios',
            'Gestionar Cuentas Corrientes de clientes',
            'Eliminar registros del sistema',
            'Acceso a todas las funciones'
          ]
        },
        operador: {
          email: 'operador@' + finalSlug + '.demo',
          password: 'demo123',
          rol: 'operador',
          permisos: [
            'Registrar y cargar vehículos',
            'Cambiar estados (En Proceso → Listo → Entregado)',
            'Ver autos en pantalla principal solamente'
          ],
          restricciones: [
            '❌ No puede ver Historial de registros',
            '❌ No puede enviar WhatsApp',
            '❌ No puede acceder a Reportes',
            '❌ No puede modificar Listas de Precios',
            '❌ No puede gestionar Cuentas Corrientes',
            '❌ No puede eliminar registros'
          ]
        }
      },
      token,
      trialDias: 15,
      requiereConfiguracion: true
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al crear la cuenta. Por favor intenta nuevamente.',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
