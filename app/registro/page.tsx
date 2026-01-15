'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [registroData, setRegistroData] = useState<any>(null);
  const [formData, setFormData] = useState({
    nombreEmpresa: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    // Validaciones
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      // Llamada a API real de registro
      const response = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreEmpresa: formData.nombreEmpresa,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Guardar token en localStorage
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('empresaId', data.empresa.id);
        localStorage.setItem('empresaNombre', data.empresa.nombre);
        localStorage.setItem('userId', data.usuario.id);
        localStorage.setItem('userEmail', data.usuario.email);
        
        // Mostrar modal de bienvenida con info de usuarios
        setRegistroData(data);
        setShowWelcome(true);
      } else {
        setError(data.message || 'Error al crear cuenta');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError('Error al crear cuenta. Verifica tu conexión e intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link href="/home" className="inline-flex items-center space-x-2 mb-4">
            <div className="text-4xl">🧺</div>
            <h1 className="text-3xl font-bold text-blue-600">lavapp</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            Empezá tu prueba gratis
          </h2>
          <p className="text-gray-600 mt-2">
            15 días gratis. Sin tarjeta de crédito.
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre de la empresa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de tu lavadero
              </label>
              <input
                type="text"
                value={formData.nombreEmpresa}
                onChange={(e) => setFormData({ ...formData, nombreEmpresa: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Ej: Lavadero Express"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tu email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="tu@email.com"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Usarás este email para iniciar sesión
              </p>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Mínimo 6 caracteres"
                required
                minLength={6}
              />
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Repetí tu contraseña"
                required
                minLength={6}
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta gratis'
              )}
            </button>
          </form>

          {/* Beneficios */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm font-semibold text-gray-700 mb-3">
              ✨ Tu prueba incluye:
            </p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                15 días gratis completos
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Todas las funciones desbloqueadas
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Usuarios ilimitados
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                Soporte por email
              </li>
            </ul>
          </div>

          {/* Link a login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tenés cuenta?{' '}
              <Link href="/login-saas" className="text-blue-600 hover:underline font-semibold">
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Al crear una cuenta, aceptás nuestros términos y condiciones
        </p>
      </div>

      {/* Modal de Bienvenida con Info de Usuarios */}
      {showWelcome && registroData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white rounded-t-2xl">
              <h3 className="text-3xl font-bold mb-2">🎉 ¡Bienvenido a lavapp!</h3>
              <p className="text-blue-100">Tu cuenta {registroData.empresa.nombre} está lista</p>
            </div>
            
            <div className="p-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold mb-1">✅ Cuenta creada exitosamente</p>
                <p className="text-green-700 text-sm">🎁 {registroData.trialDias} días de prueba gratis • Sin tarjeta de crédito</p>
              </div>

              <h4 className="text-xl font-bold text-gray-900 mb-4">👥 Usuarios Creados Automáticamente</h4>
              <p className="text-gray-600 mb-4">
                Para simplificar, <strong>ya creamos 2 usuarios</strong> listos para usar:
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                <p className="text-sm text-blue-800">
                  💡 <strong>Sin configuración adicional:</strong> Los usuarios ya están activos. Solo compartí las credenciales con tu empleado.
                </p>
              </div>

              {/* Usuario Admin */}
              <div className="bg-blue-50 border-2 border-blue-300 rounded-xl p-5 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-lg font-bold text-blue-900">👤 Admin (Dueño)</h5>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">TU USUARIO</span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm"><strong className="text-gray-700">Email:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">{registroData.usuariosPrueba.admin.email}</code></p>
                  <p className="text-sm"><strong className="text-gray-700">Password:</strong> <code className="bg-blue-100 px-2 py-1 rounded text-blue-900">{registroData.usuariosPrueba.admin.password}</code></p>
                </div>
                <div className="bg-white rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">✅ Permisos:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {registroData.usuariosPrueba.admin.permisos.map((permiso: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-1">✓</span>
                        {permiso}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Usuario Operador */}
              <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-lg font-bold text-orange-900">👷 Operador (Lavador)</h5>
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-xs font-bold">DEMO</span>
                </div>
                <div className="space-y-2 mb-4">
                  <p className="text-sm"><strong className="text-gray-700">Email:</strong> <code className="bg-orange-100 px-2 py-1 rounded text-orange-900">{registroData.usuariosPrueba.operador.email}</code></p>
                  <p className="text-sm"><strong className="text-gray-700">Password:</strong> <code className="bg-orange-100 px-2 py-1 rounded text-orange-900">{registroData.usuariosPrueba.operador.password}</code></p>
                </div>
                <div className="bg-white rounded-lg p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">✅ Puede hacer:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {registroData.usuariosPrueba.operador.permisos.map((permiso: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-green-500 mr-1">✓</span>
                        {permiso}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">🚫 Restricciones:</p>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {registroData.usuariosPrueba.operador.restricciones.map((restriccion: string, i: number) => (
                      <li key={i}>{restriccion}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  💡 <strong>Tip:</strong> Probá iniciar sesión con cada usuario para ver las diferencias de permisos. El operador es ideal para tus empleados.
                </p>
              </div>

              <button
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-bold text-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
              >
                Empezar a usar lavapp →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
