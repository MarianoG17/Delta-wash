'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginSaaSPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // TODO: Implementar autenticación cuando el backend esté listo
            // Por ahora, simulamos el login

            await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay de red

            // Mock: verificar que tenga datos
            if (formData.email && formData.password) {
                alert(`✅ Login exitoso!\n\nEmail: ${formData.email}\n\nPróximamente accederás al dashboard.`);
                // router.push('/saas/dashboard');
                router.push('/home');
            } else {
                setError('Por favor completá todos los campos');
            }

            /*
            // Implementación futura:
            const response = await fetch('/api/auth/login-saas', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(formData)
            });
      
            if (response.ok) {
              const data = await response.json();
              // Guardar sesión
              localStorage.setItem('empresaId', data.empresaId);
              localStorage.setItem('empresaNombre', data.empresaNombre);
              localStorage.setItem('userId', data.userId);
              // Redirigir a dashboard
              router.push('/saas/dashboard');
            } else {
              const error = await response.json();
              setError(error.message || 'Email o contraseña incorrectos');
            }
            */
        } catch (err) {
            setError('Error al iniciar sesión. Intenta nuevamente.');
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
                        Bienvenido de vuelta
                    </h2>
                    <p className="text-gray-600 mt-2">
                        Ingresá a tu cuenta para continuar
                    </p>
                </div>

                {/* Formulario */}
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="tu@email.com"
                                required
                                autoComplete="email"
                            />
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
                                placeholder="Tu contraseña"
                                required
                                autoComplete="current-password"
                            />
                        </div>

                        {/* Recordarme y olvide contraseña */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-600">Recordarme</span>
                            </label>
                            <a href="#" className="text-blue-600 hover:underline font-medium">
                                ¿Olvidaste tu contraseña?
                            </a>
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
                                    Iniciando sesión...
                                </span>
                            ) : (
                                'Iniciar sesión'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">o</span>
                        </div>
                    </div>

                    {/* Link a registro */}
                    <div className="text-center">
                        <p className="text-sm text-gray-600">
                            ¿No tenés cuenta?{' '}
                            <Link href="/registro" className="text-blue-600 hover:underline font-semibold">
                                Registrate gratis
                            </Link>
                        </p>
                        <p className="text-xs text-gray-500 mt-3">
                            🎉 15 días de prueba sin tarjeta de crédito
                        </p>
                    </div>
                </div>

                {/* Acceso legacy (DeltaWash) */}
                <div className="mt-6 text-center">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">
                            <strong>¿Usuario de DeltaWash?</strong>
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                            Si ya usabas el sistema antes, seguí usando tu acceso habitual:
                        </p>
                        <Link
                            href="/"
                            className="inline-block text-sm text-blue-600 hover:underline font-medium"
                        >
                            Ir al acceso de DeltaWash →
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    Al iniciar sesión, aceptás nuestros términos y condiciones
                </p>
            </div>
        </div>
    );
}
