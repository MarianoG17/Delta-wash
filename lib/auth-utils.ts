/**
 * Utilidades de autenticación que soportan tanto SaaS como DeltaWash legacy
 */

export interface AuthUser {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  empresaId?: string;
  empresaNombre?: string;
  isSaas: boolean;
}

/**
 * Obtiene el usuario autenticado desde localStorage
 * Soporta tanto el sistema SaaS nuevo como DeltaWash legacy
 */
export function getAuthUser(): AuthUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  // Intentar detectar usuario SaaS primero
  const authToken = localStorage.getItem('authToken');
  const empresaId = localStorage.getItem('empresaId');
  const userId = localStorage.getItem('userId');
  const userEmail = localStorage.getItem('userEmail');
  const userNombre = localStorage.getItem('userNombre');
  const userRol = localStorage.getItem('userRol');
  const empresaNombre = localStorage.getItem('empresaNombre');

  if (authToken && empresaId && userId) {
    // Usuario SaaS autenticado
    return {
      id: parseInt(userId),
      nombre: userNombre || userEmail || 'Usuario',
      email: userEmail || '',
      rol: userRol || 'admin',
      empresaId,
      empresaNombre: empresaNombre || '',
      isSaas: true,
    };
  }

  // Intentar detectar usuario DeltaWash legacy
  const session = localStorage.getItem('lavadero_user');
  if (session) {
    try {
      const data = JSON.parse(session);
      return {
        id: data.id,
        nombre: data.nombre || data.username,
        email: data.email || '',
        rol: data.rol || 'operador',
        isSaas: false,
      };
    } catch (error) {
      console.error('Error parsing legacy session:', error);
      return null;
    }
  }

  return null;
}

/**
 * Limpia toda la sesión (SaaS y legacy)
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') {
    return;
  }

  // Limpiar sesión SaaS
  localStorage.removeItem('authToken');
  localStorage.removeItem('empresaId');
  localStorage.removeItem('empresaNombre');
  localStorage.removeItem('empresaSlug');
  localStorage.removeItem('empresaPlan');
  localStorage.removeItem('userId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('userNombre');
  localStorage.removeItem('userRol');
  localStorage.removeItem('isDemo');

  // Limpiar sesión DeltaWash legacy
  localStorage.removeItem('lavadero_user');
}

/**
 * Obtiene la URL de login adecuada según el tipo de sesión
 */
export function getLoginUrl(): string {
  const authToken = localStorage.getItem('authToken');
  return authToken ? '/login-saas' : '/login';
}
