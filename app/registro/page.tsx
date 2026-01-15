'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegistroPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
        
        // Mostrar mensaje de éxito
        alert(`✅ ¡Cuenta creada exitosamente!\n\n🏢 Empresa: ${data.empresa.nombre}\n📧 Email: ${data.usuario.email}\n⏰ Trial: ${data.trialDias} días gratis\n\nSerás redirigido a tu panel de control...`);
        
        // Redirigir a la app principal (por ahora a home, después será /dashboard)
        router.push('/');
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
    </div>
  );
}
