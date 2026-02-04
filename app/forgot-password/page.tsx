'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        
        // En development, mostrar el link en consola
        if (data.resetLink) {
          console.log('🔗 Link de reseteo (DEVELOPMENT):', data.resetLink);
          console.log('⏰ Válido hasta:', data.expiresAt);
        }
      } else {
        setError(data.message || 'Error al enviar el email');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al procesar la solicitud. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <Link href="/login-saas" className="inline-flex items-center space-x-2 mb-4">
            <div className="text-4xl">🧺</div>
            <h1 className="text-3xl font-bold text-blue-600">lavapp</h1>
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600 mt-2">
            Ingresá tu email y te enviaremos un link para recuperarla
          </p>
        </div>

        {/* Formulario o mensaje de éxito */}
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="tu@email.com"
                  required
                  autoComplete="email"
                  autoFocus
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
                    Enviando...
                  </span>
                ) : (
                  'Enviar link de recuperación'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-4 text-5xl">📧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ¡Revisá tu email!
              </h3>
              <p className="text-gray-600 mb-4">
                Si existe una cuenta asociada a <strong>{email}</strong>, recibirás un link de recuperación en los próximos minutos.
              </p>
              <p className="text-sm text-gray-500 mb-6">
                El link será válido por 1 hora.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  <strong>💡 Tip:</strong> Si no recibís el email en 5 minutos, revisá tu carpeta de spam o correo no deseado.
                </p>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">o</span>
            </div>
          </div>

          {/* Link back to login */}
          <div className="text-center">
            <Link href="/login-saas" className="text-blue-600 hover:underline font-medium">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          ¿No tenés cuenta?{' '}
          <Link href="/registro" className="text-blue-600 hover:underline">
            Registrate gratis
          </Link>
        </p>
      </div>
    </div>
  );
}
