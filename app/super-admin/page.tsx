'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Empresa {
  id: number;
  nombre: string;
  email: string;
  neon_branch_id: string | null;
  created_at: string;
  trial_end_date: string | null;
  precio_mensual: number;
  descuento_porcentaje: number;
  precio_final: number;
  nota_descuento: string | null;
}

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEmpresa, setEditingEmpresa] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    precio_mensual: 85000,
    descuento_porcentaje: 0,
    nota_descuento: '',
    trial_end_date: ''
  });
  const [branchesCount, setBranchesCount] = useState({ total: 0, limit: 10 });

  useEffect(() => {
    const authStatus = sessionStorage.getItem('super_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      cargarEmpresas();
      cargarBranchesCount();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/super-admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        sessionStorage.setItem('super_admin_auth', 'true');
        setIsAuthenticated(true);
        cargarEmpresas();
        cargarBranchesCount();
      } else {
        setError('Credenciales incorrectas');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('super_admin_auth');
    setIsAuthenticated(false);
    setEmpresas([]);
  };

  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/empresas');
      if (res.ok) {
        const data = await res.json();
        setEmpresas(data.empresas);
      }
    } catch (err) {
      console.error('Error cargando empresas:', err);
    } finally {
      setLoading(false);
    }
  };

  const cargarBranchesCount = async () => {
    try {
      const res = await fetch('/api/super-admin/branches-count');
      if (res.ok) {
        const data = await res.json();
        setBranchesCount(data);
      }
    } catch (err) {
      console.error('Error cargando count de branches:', err);
    }
  };

  const iniciarEdicion = (empresa: Empresa) => {
    setEditingEmpresa(empresa.id);
    setEditForm({
      precio_mensual: empresa.precio_mensual,
      descuento_porcentaje: empresa.descuento_porcentaje,
      nota_descuento: empresa.nota_descuento || '',
      trial_end_date: empresa.trial_end_date?.split('T')[0] || ''
    });
  };

  const cancelarEdicion = () => {
    setEditingEmpresa(null);
    setEditForm({
      precio_mensual: 85000,
      descuento_porcentaje: 0,
      nota_descuento: '',
      trial_end_date: ''
    });
  };

  const guardarCambios = async (empresaId: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/empresas', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresaId,
          ...editForm
        })
      });

      if (res.ok) {
        await cargarEmpresas();
        cancelarEdicion();
      } else {
        alert('Error al guardar cambios');
      }
    } catch (err) {
      alert('Error al guardar cambios');
    } finally {
      setLoading(false);
    }
  };

  const eliminarEmpresa = async (empresa: Empresa) => {
    const confirmacion = confirm(
      `¿ELIMINAR empresa "${empresa.nombre}"?\n\n` +
      `Esto borrará:\n` +
      `✗ El branch de Neon (${empresa.neon_branch_id})\n` +
      `✗ Todos los datos de la empresa\n` +
      `✗ Registro en la base de datos central\n\n` +
      `Esta acción NO SE PUEDE DESHACER.\n\n` +
      `Escribe el nombre de la empresa para confirmar:`
    );

    if (!confirmacion) return;

    const nombreConfirmacion = prompt(`Escribe "${empresa.nombre}" para confirmar:`);
    if (nombreConfirmacion !== empresa.nombre) {
      alert('Nombre incorrecto. Operación cancelada.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/empresas', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa_id: empresa.id })
      });

      if (res.ok) {
        alert('Empresa eliminada correctamente');
        await cargarEmpresas();
        await cargarBranchesCount();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al eliminar empresa');
    } finally {
      setLoading(false);
    }
  };

  const calcularPrecioFinal = (precio: number, descuento: number) => {
    return precio * (1 - descuento / 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔐 Super Admin</h1>
            <p className="text-gray-600">Panel de administración LAVAPP</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Verificando...' : 'Acceder'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/home" className="text-sm text-gray-600 hover:text-gray-900">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">🔐 Super Admin Panel</h1>
              <p className="text-blue-100 mt-1">Gestión de empresas LAVAPP</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm text-blue-100">Branches Neon</div>
                <div className="text-xl font-bold">
                  {branchesCount.total} / {branchesCount.limit}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Empresas Registradas ({empresas.length})
              </h2>
              <button
                onClick={cargarEmpresas}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Cargando...' : '🔄 Actualizar'}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial hasta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Final</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {empresas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      No hay empresas registradas
                    </td>
                  </tr>
                ) : (
                  empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-900">{empresa.id}</td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-gray-900">{empresa.nombre}</div>
                        {empresa.nota_descuento && (
                          <div className="text-xs text-purple-600 mt-1">
                            📝 {empresa.nota_descuento}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">{empresa.email}</td>
                      <td className="px-4 py-4">
                        {editingEmpresa === empresa.id ? (
                          <input
                            type="date"
                            value={editForm.trial_end_date}
                            onChange={(e) => setEditForm({ ...editForm, trial_end_date: e.target.value })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          <div className="text-sm text-gray-900">
                            {empresa.trial_end_date
                              ? new Date(empresa.trial_end_date).toLocaleDateString('es-AR')
                              : 'Sin límite'}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {editingEmpresa === empresa.id ? (
                          <input
                            type="number"
                            value={editForm.precio_mensual}
                            onChange={(e) => setEditForm({ ...editForm, precio_mensual: parseFloat(e.target.value) })}
                            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                            step="1000"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900">
                            ${empresa.precio_mensual.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {editingEmpresa === empresa.id ? (
                          <div className="space-y-1">
                            <input
                              type="number"
                              value={editForm.descuento_porcentaje}
                              onChange={(e) => setEditForm({ ...editForm, descuento_porcentaje: parseInt(e.target.value) })}
                              className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                              min="0"
                              max="100"
                            />
                            <input
                              type="text"
                              value={editForm.nota_descuento}
                              onChange={(e) => setEditForm({ ...editForm, nota_descuento: e.target.value })}
                              placeholder="Nota (opcional)"
                              className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-sm">
                            {empresa.descuento_porcentaje > 0 ? (
                              <span className="text-green-600 font-semibold">
                                -{empresa.descuento_porcentaje}%
                              </span>
                            ) : (
                              <span className="text-gray-400">0%</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {editingEmpresa === empresa.id ? (
                          <div className="text-sm font-bold text-blue-600">
                            ${calcularPrecioFinal(editForm.precio_mensual, editForm.descuento_porcentaje).toLocaleString()}
                          </div>
                        ) : (
                          <div className="text-sm font-bold text-gray-900">
                            ${empresa.precio_final.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {editingEmpresa === empresa.id ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() => guardarCambios(empresa.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                            >
                              ✓
                            </button>
                            <button
                              onClick={cancelarEdicion}
                              className="bg-gray-400 text-white px-3 py-1 rounded text-sm hover:bg-gray-500"
                            >
                              ✗
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <button
                              onClick={() => iniciarEdicion(empresa)}
                              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                            >
                              ✏️ Editar
                            </button>
                            <button
                              onClick={() => eliminarEmpresa(empresa)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                            >
                              🗑️ Eliminar
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info */}
        <div className="mt-8 grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">📊</div>
            <div className="text-sm text-gray-600">Total Empresas</div>
            <div className="text-2xl font-bold text-gray-900">{empresas.length}</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">💰</div>
            <div className="text-sm text-gray-600">Ingresos Mensuales Potenciales</div>
            <div className="text-2xl font-bold text-green-600">
              ${empresas.reduce((sum, e) => sum + Number(e.precio_final || 0), 0).toLocaleString()}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl mb-2">🎁</div>
            <div className="text-sm text-gray-600">Descuentos Aplicados</div>
            <div className="text-2xl font-bold text-purple-600">
              {empresas.filter(e => e.descuento_porcentaje > 0).length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
