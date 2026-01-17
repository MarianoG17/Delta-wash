'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { getAuthUser } from '@/lib/auth-utils';

export default function LimpiarDatosPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push('/login-saas');
      return;
    }

    // Solo admins pueden acceder
    if (user.rol !== 'admin') {
      alert('❌ Solo administradores pueden acceder a esta sección');
      router.push('/');
      return;
    }
  }, [router]);

  const handleLimpiar = async () => {
    if (confirmacion !== 'LIMPIAR_TODO') {
      alert('⚠️ Debes escribir exactamente: LIMPIAR_TODO');
      return;
    }

    if (!confirm(
      '⚠️ ¿ESTÁS SEGURO?\n\n' +
      'Esta acción eliminará:\n' +
      '• Todos los registros de vehículos\n' +
      '• Todo el historial\n' +
      '• Todos los movimientos de cuenta corriente\n' +
      '• Todos los clientes\n\n' +
      'Se mantendrá:\n' +
      '✓ Usuarios\n' +
      '✓ Listas de precios\n' +
      '✓ Estructura de cuentas corrientes (saldos en $0)\n\n' +
      'Esta acción NO se puede deshacer.'
    )) {
      return;
    }

    setLoading(true);

    try {
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/admin/limpiar-registros', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ confirmacion: 'LIMPIAR_TODO' })
      });

      const data = await response.json();

      if (data.success) {
        alert(
          '✅ Base de datos limpiada exitosamente\n\n' +
          `📊 Eliminado:\n` +
          `• Registros: ${data.eliminado.registros}\n` +
          `• Movimientos CC: ${data.eliminado.movimientosCuentaCorriente}\n` +
          `• Clientes: ${data.eliminado.clientes}\n\n` +
          `✓ Usuarios mantenidos\n` +
          `✓ Listas de precios mantenidas\n` +
          `✓ Cuentas corrientes reseteadas a $0`
        );
        setConfirmacion('');
        router.push('/');
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error al limpiar:', error);
      alert('❌ Error al limpiar la base de datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-red-700 mb-2">
            ⚠️ Limpiar Base de Datos
          </h1>
          <p className="text-gray-600">
            Elimina todos los datos de operación para empezar de cero
          </p>
        </div>

        {/* Advertencia */}
        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-red-800 mb-3">⚠️ ADVERTENCIA</h2>
          <p className="text-red-700 mb-4">
            Esta acción eliminará permanentemente todos los datos de operación de tu empresa.
            <strong> NO se puede deshacer.</strong>
          </p>

          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-bold text-red-800 mb-2">🗑️ Se eliminará:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Todos los registros de vehículos lavados</li>
              <li>• Todo el historial de operaciones</li>
              <li>• Todos los movimientos de cuenta corriente</li>
              <li>• Todos los clientes registrados</li>
            </ul>
          </div>

          <div className="bg-white rounded-lg p-4">
            <h3 className="font-bold text-green-800 mb-2">✅ Se mantendrá:</h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Todos los usuarios (admin y operadores)</li>
              <li>• Todas las listas de precios configuradas</li>
              <li>• Estructura de cuentas corrientes (saldos en $0)</li>
            </ul>
          </div>
        </div>

        {/* Formulario de confirmación */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Confirmación requerida
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            Para continuar, escribe exactamente: <code className="bg-gray-100 px-2 py-1 rounded font-mono">LIMPIAR_TODO</code>
          </p>

          <input
            type="text"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-lg mb-4"
            placeholder="Escribe: LIMPIAR_TODO"
            disabled={loading}
          />

          <button
            onClick={handleLimpiar}
            disabled={loading || confirmacion !== 'LIMPIAR_TODO'}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              loading || confirmacion !== 'LIMPIAR_TODO'
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? '🔄 Limpiando...' : '🗑️ Limpiar Base de Datos'}
          </button>

          {confirmacion && confirmacion !== 'LIMPIAR_TODO' && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Texto incorrecto. Debe ser exactamente: LIMPIAR_TODO
            </p>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 ¿Cuándo usar esto?</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Después de hacer pruebas y antes de empezar a operar en serio</li>
            <li>• Para limpiar datos de demostración</li>
            <li>• Al finalizar un período de testing</li>
          </ul>
        </div>

        {/* Botón alternativo */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            Cancelar y volver al inicio
          </button>
        </div>
      </div>
    </div>
  );
}
