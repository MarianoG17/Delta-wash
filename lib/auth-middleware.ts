/**
 * Middleware de Autenticación Multi-Tenant
 * 
 * Extrae información de la empresa desde el token JWT
 * Compatible con DeltaWash legacy (sin token)
 */

import jwt from 'jsonwebtoken';

interface JWTPayload {
  empresaId?: number;
  empresaNombre?: string;
  empresaSlug?: string;
  userId?: number;
  email?: string;
  rol?: string;
  branchUrl?: string;
}

/**
 * Extrae el empresaId del token JWT en el request
 * Si no hay token o es inválido, retorna undefined (DeltaWash legacy)
 * 
 * @param request - Request de Next.js
 * @returns empresaId o undefined para DeltaWash
 */
export async function getEmpresaIdFromToken(request: Request): Promise<number | undefined> {
  try {
    // Obtener header de autorización
    const authHeader = request.headers.get('authorization');

    // Sin header = DeltaWash legacy
    if (!authHeader) {
      console.log('[Auth] Sin header de autorización → Modo Legacy (DeltaWash)');
      return undefined;
    }

    // Verificar formato Bearer
    if (!authHeader.startsWith('Bearer ')) {
      console.log('[Auth] Header sin formato Bearer → Modo Legacy');
      return undefined;
    }

    // Extraer token
    const token = authHeader.substring(7);
    console.log('[Auth] Token detectado, verificando JWT...');

    // Verificar JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Retornar empresaId (puede ser undefined para tokens legacy)
    if (decoded.empresaId) {
      console.log(`[Auth] ✅ Token válido → Empresa ID: ${decoded.empresaId} (${decoded.empresaSlug || 'sin slug'})`);
    } else {
      console.log('[Auth] Token válido pero sin empresaId → Modo Legacy');
    }

    return decoded.empresaId;

  } catch (error) {
    // Token inválido o expirado = Tratar como DeltaWash
    // Esto garantiza que errores de autenticación caigan en comportamiento legacy
    const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
    console.log(`[Auth] ⚠️ Error al verificar token: ${errorMsg} → Modo Legacy`);
    return undefined;
  }
}

/**
 * Extrae información completa del token JWT
 * 
 * @param request - Request de Next.js
 * @returns Payload del JWT o null
 */
export async function getTokenPayload(request: Request): Promise<JWTPayload | null> {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    return decoded;

  } catch (error) {
    return null;
  }
}

/**
 * Verifica si el request es de un usuario SaaS (tiene empresaId)
 * 
 * @param request - Request de Next.js
 * @returns true si es SaaS, false si es legacy
 */
export async function isSaaSRequest(request: Request): Promise<boolean> {
  const empresaId = await getEmpresaIdFromToken(request);
  return empresaId !== undefined;
}

/**
 * Middleware para proteger rutas que requieren autenticación
 * Retorna el payload si está autenticado, o lanza error
 */
export async function requireAuth(request: Request): Promise<JWTPayload> {
  const payload = await getTokenPayload(request);

  if (!payload) {
    throw new Error('No autenticado');
  }

  return payload;
}

/**
 * Verifica el estado del token JWT
 * 
 * @return 'valid' si el token es válido con empresaId
 * @return 'expired' si había un token pero expiró o es inválido
 * @return 'no_token' si no hay header de autorización (legacy)
 * @return 'legacy_token' si hay token válido pero sin empresaId
 */
export async function checkTokenStatus(request: Request): Promise<'valid' | 'expired' | 'no_token' | 'legacy_token'> {
  try {
    const authHeader = request.headers.get('authorization');

    // Sin header = modo legacy (no es error)
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return 'no_token';
    }

    // Hay token, intentar verificar
    const token = authHeader.substring(7);
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';

    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

    // Token válido con empresaId = SaaS
    if (decoded.empresaId) {
      return 'valid';
    }

    // Token válido pero sin empresaId = legacy con token
    return 'legacy_token';

  } catch (error) {
    // Token presente pero inválido o expirado
    const errorMsg = error instanceof Error ? error.message : '';
    console.log(`[Auth] Token expirado o inválido: ${errorMsg}`);
    return 'expired';
  }
}

