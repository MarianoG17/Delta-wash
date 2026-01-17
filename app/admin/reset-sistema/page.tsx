'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Empresa {
  id: number;
  nombre: string;
  slug: string;
  branch_name: string;
  plan: string;
  estado: string;
  created_at: string;
  total_usuarios: number;
}

export default function ResetSistemaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirmacion, setConfirmacion] = useState('');
  const [resumen, setResumen] = useState<any>(null);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      const response = await fetch('/api/admin/limpiar-todo-sistema');
      const data = await response.json();

      if (data.success) {
        setResumen(data.resumen);
        setEmpresas(data.empresas);
      }
    } catch (error) {
      console.error('Error cargando resumen:', error);
    }
  };

  const handleReset = async () => {
    if (confirmacion !== 'ELIMINAR_TODO_EL_SISTEMA') {
      alert('⚠️ Debes escribir exactamente: ELIMINAR_TODO_EL_SISTEMA');
      return;
    }

    if (!confirm(
      '⚠️⚠️⚠️ ÚLTIMA ADVERTENCIA ⚠️⚠️⚠️\n\n' +
      'Esta acción es IRREVERSIBLE y eliminará:\n\n' +
      `• ${empresas.length} empresa(s) completa(s)\n` +
      `• ${resumen?.totalUsuarios || 0} usuario(s)\n` +
      `• Todos los datos asociados\n` +
      `• Se intentará eliminar branches de Neon\n\n` +
      '¿ESTÁS ABSOLUTAMENTE SEGURO?'
    )) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/limpiar-todo-sistema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ confirmacion: 'ELIMINAR_TODO_EL_SISTEMA' })
      });

      const data = await response.json();

      if (data.success) {
        let mensaje = `✅ Sistema limpiado exitosamente\n\n`;
        mensaje += `📊 Resumen:\n`;
        mensaje += `• Empresas eliminadas: ${data.resumen.empresasEliminadas}\n`;
        mensaje += `• Usuarios eliminados: ${data.resumen.usuariosEliminados}\n`;
        mensaje += `• Actividades eliminadas: ${data.resumen.actividadesEliminadas}\n\n`;

        if (data.branchesNeon.requierenEliminacionManual.length > 0) {
          mensaje += `⚠️ BRANCHES DE NEON:\n`;
          mensaje += `Debes eliminar manualmente estos branches:\n`;
          data.branchesNeon.requierenEliminacionManual.forEach((branch: string) => {
            mensaje += `• ${branch}\n`;
          });
          mensaje += `\n📍 Ir a: https://console.neon.tech`;
        }

        alert(mensaje);
        setConfirmacion('');
        cargarResumen();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error al limpiar el sistema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 via-orange-100 to-yellow-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="mb-4 text-gray-600 hover:text-gray-800"
          >
            ← Volver
          </button>
          <h1 className="text-4xl font-bold text-red-700 mb-2">
            ⚠️ RESET COMPLETO DEL SISTEMA
          </h1>
          <p className="text-gray-600">
            Elimina TODAS las empresas SaaS y sus branches de Neon
          </p>
        </div>

        {/* Resumen actual */}
        {resumen && (
          <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Estado Actual del Sistema</h2>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-blue-600">{resumen.totalEmpresas}</div>
                <div className="text-sm text-gray-600">Empresas</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{resumen.totalUsuarios}</div>
                <div className="text-sm text-gray-600">Usuarios</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{resumen.totalActividad}</div>
                <div className="text-sm text-gray-600">Actividades</div>
              </div>
            </div>

            {empresas.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-800 mb-3">Empresas registradas:</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {empresas.map((empresa) => (
                    <div key={empresa.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-gray-900">{empresa.nombre}</div>
                          <div className="text-sm text-gray-600">Slug: {empresa.slug}</div>
                          <div className="text-xs text-gray-500">Branch: {empresa.branch_name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-blue-600">{empresa.total_usuarios} usuarios</div>
                          <div className="text-xs text-gray-500">{empresa.plan}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Advertencia EXTREMA */}
        <div className="bg-red-50 border-4 border-red-500 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-red-800 mb-3">
            ⚠️⚠️⚠️ PELIGRO EXTREMO ⚠️⚠️⚠️
          </h2>
          
          <div className="bg-white rounded-lg p-4 mb-4">
            <h3 className="font-bold text-red-800 mb-2">🗑️ ESTO ELIMINARÁ:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• <strong>TODAS</strong> las empresas del sistema SaaS</li>
              <li>• <strong>TODOS</strong> los usuarios del sistema</li>
              <li>• <strong>TODA</strong> la actividad registrada</li>
              <li>• <strong>Intentará eliminar</strong> todos los branches de Neon (excepto main)</li>
            </ul>
          </div>

          <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-4">
            <h3 className="font-bold text-yellow-800 mb-2">📍 Branches de Neon:</h3>
            <p className="text-sm text-yellow-800 mb-2">
              Algunos branches pueden requerir eliminación MANUAL desde Neon Console.
            </p>
            <a 
              href="https://console.neon.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline"
            >
              🔗 Abrir Neon Console →
            </a>
          </div>

          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-4">
            <p className="text-red-800 font-bold text-center text-lg">
              ⚡ ESTA ACCIÓN ES IRREVERSIBLE ⚡
            </p>
            <p className="text-red-700 text-center text-sm mt-2">
              No hay forma de recuperar los datos eliminados
            </p>
          </div>
        </div>

        {/* Formulario de confirmación */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            🔐 Confirmación Triple Requerida
          </h3>

          <p className="text-sm text-gray-600 mb-3">
            Para continuar, escribe <strong>exactamente</strong>: 
            <code className="bg-red-100 px-2 py-1 rounded font-mono ml-2 text-red-700">
              ELIMINAR_TODO_EL_SISTEMA
            </code>
          </p>

          <input
            type="text"
            value={confirmacion}
            onChange={(e) => setConfirmacion(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono text-lg mb-4"
            placeholder="Escribe: ELIMINAR_TODO_EL_SISTEMA"
            disabled={loading}
          />

          <button
            onClick={handleReset}
            disabled={loading || confirmacion !== 'ELIMINAR_TODO_EL_SISTEMA' || empresas.length === 0}
            className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${
              loading || confirmacion !== 'ELIMINAR_TODO_EL_SISTEMA' || empresas.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {loading ? '🔄 Eliminando todo...' : empresas.length === 0 ? '✓ Sistema ya limpio' : '💣 ELIMINAR TODO EL SISTEMA'}
          </button>

          {confirmacion && confirmacion !== 'ELIMINAR_TODO_EL_SISTEMA' && (
            <p className="text-sm text-red-600 mt-2">
              ⚠️ Texto incorrecto. Debe ser exactamente: ELIMINAR_TODO_EL_SISTEMA
            </p>
          )}

          {empresas.length === 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-center">
                ✅ No hay empresas en el sistema. Todo limpio!
              </p>
            </div>
          )}
        </div>

        {/* Botón de cancelar */}
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
