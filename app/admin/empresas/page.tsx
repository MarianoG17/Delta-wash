'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Empresa {
  id: number;
  nombre: string;
  slug: string;
  branch_name: string;
  plan: string;
  estado: string;
  fecha_expiracion: string;
  created_at: string;
  total_usuarios: number;
}

export default function AdminEmpresasPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [eliminando, setEliminando] = useState<string | null>(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  async function cargarEmpresas() {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/limpiar-cuentas');
      const data = await response.json();
      
      if (data.success) {
        setEmpresas(data.empresas);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Error al cargar empresas');
    } finally {
      setLoading(false);
    }
  }

  async function eliminarEmpresa(slug: string, nombre: string) {
    const confirmar = window.confirm(
      `⚠️ ¿ESTÁS SEGURO?\n\n` +
      `Vas a ELIMINAR la empresa:\n` +
      `"${nombre}" (${slug})\n\n` +
      `Esta acción NO SE PUEDE DESHACER.\n\n` +
      `Los usuarios de DeltaWash NO se verán afectados.\n` +
      `Solo se eliminará esta empresa del sistema SaaS.`
    );

    if (!confirmar) return;

    try {
      setEliminando(slug);
      const response = await fetch('/api/admin/limpiar-cuentas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmacion: 'ELIMINAR_CUENTA',
          empresaSlug: slug
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`✅ Empresa eliminada exitosamente\n\n${data.message}\n\nUsuarios eliminados: ${data.detalles.usuariosEliminados}`);
        cargarEmpresas(); // Recargar lista
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (err) {
      alert('Error al eliminar empresa');
    } finally {
      setEliminando(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🏢 Gestión de Empresas</h1>
              <p className="text-gray-600 mt-1">Panel de administración - Sistema SaaS</p>
            </div>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              ← Volver al Home
            </Link>
          </div>
        </div>

        {/* Advertencia */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <p className="font-bold text-yellow-900 mb-2">IMPORTANTE - Lee antes de eliminar:</p>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>✅ <strong>DeltaWash está SEGURO:</strong> Los usuarios de DeltaWash NO están en esta lista ni se verán afectados</li>
                <li>🗑️ Solo se eliminan empresas del sistema SaaS registradas desde /home</li>
                <li>📊 Estas empresas están en la BD Central (CENTRAL_DB_URL), separada de DeltaWash</li>
                <li>🌳 El branch de Neon NO se elimina automáticamente, deberás hacerlo manual</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contador */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-900 font-semibold">
            📊 Total de empresas registradas: <span className="text-2xl">{empresas.length}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {/* Lista de empresas */}
        {empresas.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No hay empresas registradas</h3>
            <p className="text-gray-600">Cuando alguien se registre desde /home, aparecerá aquí</p>
          </div>
        ) : (
          <div className="space-y-4">
            {empresas.map((empresa) => (
              <div key={empresa.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{empresa.nombre}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        empresa.estado === 'activo' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {empresa.estado.toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        empresa.plan === 'trial' 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-purple-100 text-purple-700'
                      }`}>
                        {empresa.plan.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold text-gray-700">ID:</span> {empresa.id}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Slug:</span>{' '}
                        <code className="bg-gray-100 px-2 py-1 rounded">{empresa.slug}</code>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Branch:</span>{' '}
                        <code className="bg-gray-100 px-2 py-1 rounded">{empresa.branch_name}</code>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Usuarios:</span> {empresa.total_usuarios}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Creada:</span>{' '}
                        {new Date(empresa.created_at).toLocaleString('es-AR')}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">Expira:</span>{' '}
                        {new Date(empresa.fecha_expiracion).toLocaleString('es-AR')}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => eliminarEmpresa(empresa.slug, empresa.nombre)}
                    disabled={eliminando === empresa.slug}
                    className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {eliminando === empresa.slug ? '⏳ Eliminando...' : '🗑️ Eliminar'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="font-bold text-gray-900 mb-3">ℹ️ Información:</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li><strong>BD Central:</strong> Donde se almacenan estas empresas (CENTRAL_DB_URL)</li>
            <li><strong>BD DeltaWash:</strong> Separada, con tus usuarios reales (POSTGRES_URL)</li>
            <li><strong>Branches Neon:</strong> Cada empresa tiene su propio branch si se creó exitosamente</li>
            <li><strong>Eliminar:</strong> Solo elimina de BD Central, no afecta DeltaWash</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
