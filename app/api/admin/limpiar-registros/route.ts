import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

/**
 * API para limpiar datos de operación de una empresa SaaS
 * Elimina: registros, movimientos de cuenta corriente
 * Mantiene: usuarios, listas de precios, estructura de cuentas corrientes
 * 
 * Solo para desarrollo/testing
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No autenticado' },
        { status: 401 }
      );
    }

    // Decodificar token para obtener empresa
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    let decoded: any;
    
    try {
      decoded = jwt.verify(token, jwtSecret) as any;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Token inválido o expirado' },
        { status: 401 }
      );
    }

    const rolUsuario = decoded.rol;

    // Solo admins pueden limpiar registros
    if (rolUsuario !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Solo administradores pueden limpiar registros' },
        { status: 403 }
      );
    }

    const { confirmacion } = await request.json();

    // Seguridad - requiere confirmación
    if (confirmacion !== 'LIMPIAR_TODO') {
      return NextResponse.json(
        { success: false, message: 'Confirmación incorrecta. Debe ser: LIMPIAR_TODO' },
        { status: 400 }
      );
    }

    // Obtener branch_url de la empresa desde BD Central
    const { createPool } = await import('@vercel/postgres');
    const centralDB = createPool({
      connectionString: process.env.CENTRAL_DB_URL
    });

    const empresaResult = await centralDB.sql`
      SELECT branch_url, nombre, slug FROM empresas WHERE id = ${decoded.empresaId}
    `;

    if (empresaResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Empresa no encontrada' },
        { status: 404 }
      );
    }

    const empresa = empresaResult.rows[0];

    if (!empresa.branch_url) {
      return NextResponse.json(
        { success: false, message: 'Empresa no tiene base de datos asignada' },
        { status: 400 }
      );
    }

    // Conectar al branch de la empresa
    const sql = neon(empresa.branch_url);

    console.log(`[Limpiar Registros] Iniciando limpieza para empresa: ${empresa.nombre} (${empresa.slug})`);

    // Contar datos antes de eliminar
    const countRegistros = await sql`SELECT COUNT(*) as total FROM registros`;
    const countMovimientos = await sql`SELECT COUNT(*) as total FROM movimientos_cc`;
    const countClientes = await sql`SELECT COUNT(*) as total FROM clientes`;

    const totales = {
      registros: parseInt(countRegistros[0]?.total || '0'),
      movimientos: parseInt(countMovimientos[0]?.total || '0'),
      clientes: parseInt(countClientes[0]?.total || '0')
    };

    console.log('[Limpiar Registros] Datos a eliminar:', totales);

    // ELIMINAR DATOS DE OPERACIÓN
    console.log('[Limpiar Registros] Eliminando movimientos de cuenta corriente...');
    await sql`DELETE FROM movimientos_cc`;

    console.log('[Limpiar Registros] Eliminando registros de vehículos...');
    await sql`DELETE FROM registros`;

    console.log('[Limpiar Registros] Reseteando saldos de cuentas corrientes...');
    await sql`UPDATE cuentas_corrientes SET saldo_actual = 0`;

    console.log('[Limpiar Registros] Eliminando clientes...');
    await sql`DELETE FROM clientes`;

    // MANTENER:
    // - usuarios
    // - listas_precios
    // - precios
    // - estructura de cuentas_corrientes (solo resetear saldos)

    console.log('[Limpiar Registros] ✅ Limpieza completada exitosamente');

    return NextResponse.json({
      success: true,
      message: 'Base de datos limpiada exitosamente',
      empresa: {
        nombre: empresa.nombre,
        slug: empresa.slug
      },
      eliminado: {
        registros: totales.registros,
        movimientosCuentaCorriente: totales.movimientos,
        clientes: totales.clientes
      },
      mantenido: {
        usuarios: '✅ Mantenidos',
        listasPrecios: '✅ Mantenidas',
        cuentasCorrientes: '✅ Estructura mantenida (saldos en $0)'
      }
    });

  } catch (error) {
    console.error('[Limpiar Registros] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al limpiar registros',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
