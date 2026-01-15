import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createAndSetupBranchForEmpresa } from '@/lib/neon-api';

/**
 * API de Registro SaaS
 * 
 * Crea una nueva empresa en la BD Central
 * Por ahora, sin creación automática de branch (se hace manual)
 */
export async function POST(request: Request) {
  try {
    // Leer datos del formulario
    const { nombreEmpresa, email, password } = await request.json();

    // Validaciones básicas
    if (!nombreEmpresa || !email || !password) {
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
    console.log(`[Registro] Creando base de datos para: ${nombreEmpresa}`);
    
    let branchUrl = '';
    let branchName = finalSlug;
    
    try {
      // Intentar crear el branch en Neon
      const branchInfo = await createAndSetupBranchForEmpresa(finalSlug);
      branchUrl = branchInfo.connectionUriPooler; // Usar pooler para mejor rendimiento
      branchName = branchInfo.branchName;
      
      console.log(`[Registro] ✅ Base de datos creada exitosamente: ${branchInfo.branchId}`);
    } catch (neonError) {
      // Si falla la creación del branch, loguear pero NO fallar el registro
      console.error('[Registro] ⚠️ Error al crear branch en Neon:', neonError);
      console.log('[Registro] La empresa se creará sin BD asignada (requiere configuración manual)');
      // branchUrl queda vacío, empresa se crea pero no podrá usarse hasta configurar manualmente
    }

    // Crear empresa en BD Central
    const empresaResult = await centralDB.sql`
      INSERT INTO empresas (
        nombre,
        slug,
        branch_name,
        branch_url,
        plan,
        estado,
        fecha_expiracion
      ) VALUES (
        ${nombreEmpresa},
        ${finalSlug},
        ${branchName},
        ${branchUrl},
        'trial',
        'activo',
        NOW() + INTERVAL '15 days'
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
