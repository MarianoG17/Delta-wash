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
      return undefined;
    }
    
    // Verificar formato Bearer
    if (!authHeader.startsWith('Bearer ')) {
      return undefined;
    }
    
    // Extraer token
    const token = authHeader.substring(7);
    
    // Verificar JWT
    const jwtSecret = process.env.JWT_SECRET || 'default-secret-change-this';
    const decoded = jwt.verify(token, jwtSecret) as JWTPayload;
    
    // Retornar empresaId (puede ser undefined para tokens legacy)
    return decoded.empresaId;
    
  } catch (error) {
    // Token inválido o expirado = Tratar como DeltaWash
    // Esto garantiza que errores de autenticación caigan en comportamiento legacy
    console.log('[Auth] Token inválido o no presente, usando modo legacy');
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
