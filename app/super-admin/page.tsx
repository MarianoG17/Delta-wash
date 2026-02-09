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
  telefono: string | null;
  contacto_nombre: string | null;
  direccion: string | null;
  estado: string;
}

interface Pago {
  id: number;
  empresa_id: number;
  empresa_nombre: string;
  mes: number;
  anio: number;
  fecha_vencimiento: string;
  monto_base: number;
  descuento_porcentaje: number;
  monto_final: number;
  estado: 'pendiente' | 'pagado' | 'vencido' | 'cancelado';
  fecha_pago: string | null;
  metodo_pago: string | null;
  comprobante: string | null;
  notas: string | null;
  registrado_por: string | null;
  dias_mora: number;
  empresa_estado: string;
  suspendido_por_falta_pago: boolean;
}

interface Estadisticas {
  cantidad_pagado: number;
  cantidad_pendiente: number;
  cantidad_vencido: number;
  total_pagado: number;
  total_pendiente: number;
  total_vencido: number;
}

export default function SuperAdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editingEmpresa, setEditingEmpresa] = useState<number | null>(null);
  const [vistaActual, setVistaActual] = useState<'empresas' | 'pagos'>('empresas');
  
  // Estados para Pagos
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [mesSeleccionado, setMesSeleccionado] = useState(new Date().getMonth() + 1);
  const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
  const [filtroEstadoPago, setFiltroEstadoPago] = useState<'todos' | 'pendiente' | 'pagado' | 'vencido'>('todos');
  const [modalRegistroPago, setModalRegistroPago] = useState<Pago | null>(null);
  const [formRegistroPago, setFormRegistroPago] = useState({
    fecha_pago: new Date().toISOString().split('T')[0],
    metodo_pago: 'transferencia',
    comprobante: '',
    notas: ''
  });
  const [editForm, setEditForm] = useState({
    precio_mensual: 85000,
    descuento_porcentaje: 0,
    nota_descuento: '',
    trial_end_date: '',
    telefono: '',
    contacto_nombre: '',
    direccion: ''
  });
  const [branchesCount, setBranchesCount] = useState({ total: 0, limit: 10 });
  const [filtroEstado, setFiltroEstado] = useState<'todos' | 'activos' | 'archivados'>('activos');

  useEffect(() => {
    const authStatus = sessionStorage.getItem('super_admin_auth');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      cargarEmpresas();
      cargarBranchesCount();
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && vistaActual === 'pagos') {
      cargarPagos();
    }
  }, [isAuthenticated, vistaActual, mesSeleccionado, anioSeleccionado, filtroEstadoPago]);

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

  const cargarPagos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        mes: mesSeleccionado.toString(),
        anio: anioSeleccionado.toString(),
        estado: filtroEstadoPago
      });
      const res = await fetch(`/api/super-admin/pagos?${params}`);
      if (res.ok) {
        const data = await res.json();
        setPagos(data.pagos || []);
        setEstadisticas(data.estadisticas);
      }
    } catch (err) {
      console.error('Error cargando pagos:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarPagosMes = async () => {
    if (!confirm(`¿Generar pagos para ${mesSeleccionado}/${anioSeleccionado}?`)) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/pagos/generar-mes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mes: mesSeleccionado,
          anio: anioSeleccionado
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✓ ${data.estadisticas.pagos_creados} pagos generados\n${data.estadisticas.pagos_existentes} ya existían`);
        cargarPagos();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al generar pagos');
    } finally {
      setLoading(false);
    }
  };

  const abrirModalRegistroPago = (pago: Pago) => {
    setModalRegistroPago(pago);
    setFormRegistroPago({
      fecha_pago: new Date().toISOString().split('T')[0],
      metodo_pago: 'transferencia',
      comprobante: '',
      notas: ''
    });
  };

  const cerrarModalRegistroPago = () => {
    setModalRegistroPago(null);
  };

  const registrarPago = async () => {
    if (!modalRegistroPago) return;

    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/pagos/registrar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pago_id: modalRegistroPago.id,
          ...formRegistroPago,
          registrado_por: email
        })
      });

      if (res.ok) {
        const data = await res.json();
        alert(`✓ ${data.message}`);
        cerrarModalRegistroPago();
        cargarPagos();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al registrar pago');
    } finally {
      setLoading(false);
    }
  };

  const iniciarEdicion = (empresa: Empresa) => {
    setEditingEmpresa(empresa.id);
    setEditForm({
      precio_mensual: empresa.precio_mensual,
      descuento_porcentaje: empresa.descuento_porcentaje,
      nota_descuento: empresa.nota_descuento || '',
      trial_end_date: empresa.trial_end_date?.split('T')[0] || '',
      telefono: empresa.telefono || '',
      contacto_nombre: empresa.contacto_nombre || '',
      direccion: empresa.direccion || ''
    });
  };

  const cancelarEdicion = () => {
    setEditingEmpresa(null);
    setEditForm({
      precio_mensual: 85000,
      descuento_porcentaje: 0,
      nota_descuento: '',
      trial_end_date: '',
      telefono: '',
      contacto_nombre: '',
      direccion: ''
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

  const archivarEmpresa = async (empresa: Empresa) => {
    const confirmacion = confirm(
      `¿ARCHIVAR empresa "${empresa.nombre}"?\n\n` +
      `Esto hará:\n` +
      `✓ Eliminar el branch de Neon (libera espacio)\n` +
      `✓ Mantener los datos de contacto\n` +
      `✓ Cambiar estado a "archivado"\n\n` +
      `Podrás reactivarla después si es necesario.`
    );

    if (!confirmacion) return;

    setLoading(true);
    try {
      const res = await fetch('/api/super-admin/empresas', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          empresa_id: empresa.id,
          accion: 'archivar',
          admin_email: 'admin@lavapp.ar'
        })
      });

      if (res.ok) {
        alert('Empresa archivada correctamente. Branch liberado.');
        await cargarEmpresas();
        await cargarBranchesCount();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      alert('Error al archivar empresa');
    } finally {
      setLoading(false);
    }
  };

  const calcularPrecioFinal = (precio: number, descuento: number) => {
    return precio * (1 - descuento / 100);
  };

  const formatearMes = (mes: number) => {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return meses[mes - 1];
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return 'bg-green-100 text-green-700';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-700';
      case 'vencido':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pagado':
        return '✅';
      case 'pendiente':
        return '⏰';
      case 'vencido':
        return '❌';
      default:
        return '⚪';
    }
  };

  const empresasFiltradas = empresas.filter(e => {
    if (filtroEstado === 'activos') return e.estado === 'activo';
    if (filtroEstado === 'archivados') return e.estado === 'archivado';
    return true;
  });

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

          {/* Tabs de navegación */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setVistaActual('empresas')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                vistaActual === 'empresas'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🏢 Empresas
            </button>
            <button
              onClick={() => setVistaActual('pagos')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                vistaActual === 'pagos'
                  ? 'bg-white text-blue-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              💰 Pagos
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {vistaActual === 'empresas' ? (
          /* Vista de Empresas (existente) */
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
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

                {/* Filtros */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setFiltroEstado('activos')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === 'activos'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    ✓ Activos ({empresas.filter(e => e.estado === 'activo').length})
                  </button>
                  <button
                    onClick={() => setFiltroEstado('archivados')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === 'archivados'
                      ? 'bg-gray-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    📦 Archivados ({empresas.filter(e => e.estado === 'archivado').length})
                  </button>
                  <button
                    onClick={() => setFiltroEstado('todos')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstado === 'todos'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    📋 Todos ({empresas.length})
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teléfono</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dirección</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trial hasta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descuento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Final</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {empresasFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                          {filtroEstado === 'activos' && 'No hay empresas activas'}
                          {filtroEstado === 'archivados' && 'No hay empresas archivadas'}
                          {filtroEstado === 'todos' && 'No hay empresas registradas'}
                        </td>
                      </tr>
                    ) : (
                      empresasFiltradas.map((empresa) => (
                        <tr key={empresa.id} className={`hover:bg-gray-50 ${empresa.estado === 'archivado' ? 'bg-gray-100 opacity-60' : ''
                          }`}>
                          <td className="px-4 py-4 text-sm text-gray-900">{empresa.id}</td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{empresa.nombre}</div>
                            {editingEmpresa === empresa.id ? (
                              <div className="mt-2 space-y-1">
                                <input
                                  type="text"
                                  value={editForm.contacto_nombre}
                                  onChange={(e) => setEditForm({ ...editForm, contacto_nombre: e.target.value })}
                                  placeholder="Nombre contacto"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                                <input
                                  type="text"
                                  value={editForm.telefono}
                                  onChange={(e) => setEditForm({ ...editForm, telefono: e.target.value })}
                                  placeholder="Teléfono"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                                <input
                                  type="text"
                                  value={editForm.direccion}
                                  onChange={(e) => setEditForm({ ...editForm, direccion: e.target.value })}
                                  placeholder="Dirección"
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                />
                              </div>
                            ) : (
                              <>
                                {empresa.nota_descuento && (
                                  <div className="text-xs text-purple-600 mt-1">
                                    📝 {empresa.nota_descuento}
                                  </div>
                                )}
                                {empresa.contacto_nombre && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    👤 {empresa.contacto_nombre}
                                  </div>
                                )}
                                {empresa.telefono && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    📞 {empresa.telefono}
                                  </div>
                                )}
                                {empresa.direccion && (
                                  <div className="text-xs text-gray-600 mt-1">
                                    📍 {empresa.direccion}
                                  </div>
                                )}
                              </>
                            )}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">{empresa.email}</td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {empresa.telefono || '-'}
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-600">
                            {empresa.direccion || '-'}
                          </td>
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
                          <td className="px-4 py-4 text-sm">
                            {empresa.estado === 'archivado' ? (
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                📦 Archivado
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                                ✓ Activo
                              </span>
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
                            ) : empresa.estado === 'activo' ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => iniciarEdicion(empresa)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                                >
                                  ✏️ Editar
                                </button>
                                <button
                                  onClick={() => archivarEmpresa(empresa)}
                                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                                >
                                  📦 Archivar
                                </button>
                              </div>
                            ) : (
                              <div className="text-gray-500 text-sm">
                                Archivado - Branch liberado
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
                  ${empresas.filter(e => e.estado === 'activo').reduce((sum, e) => sum + Number(e.precio_final || 0), 0).toLocaleString()}
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
          </>
        ) : (
          /* Vista de Pagos */
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  💰 Gestión de Pagos Mensuales
                </h2>

                {/* Dashboard de Estadísticas */}
                {estadisticas && (
                  <div className="grid md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                      <div className="text-2xl mb-2">💚</div>
                      <div className="text-sm text-gray-600">Pagados</div>
                      <div className="text-2xl font-bold text-green-600">
                        {estadisticas.cantidad_pagado}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${estadisticas.total_pagado?.toLocaleString() || '0'}
                      </div>
                    </div>

                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                      <div className="text-2xl mb-2">⏰</div>
                      <div className="text-sm text-gray-600">Pendientes</div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {estadisticas.cantidad_pendiente}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${estadisticas.total_pendiente?.toLocaleString() || '0'}
                      </div>
                    </div>

                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                      <div className="text-2xl mb-2">❌</div>
                      <div className="text-sm text-gray-600">Vencidos</div>
                      <div className="text-2xl font-bold text-red-600">
                        {estadisticas.cantidad_vencido}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${estadisticas.total_vencido?.toLocaleString() || '0'}
                      </div>
                    </div>

                    <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                      <div className="text-2xl mb-2">📊</div>
                      <div className="text-sm text-gray-600">Total del Mes</div>
                      <div className="text-2xl font-bold text-blue-600">
                        ${((estadisticas.total_pagado || 0) + (estadisticas.total_pendiente || 0)).toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Proyectado
                      </div>
                    </div>
                  </div>
                )}

                {/* Controles */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Mes</label>
                    <select
                      value={mesSeleccionado}
                      onChange={(e) => setMesSeleccionado(parseInt(e.target.value))}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {formatearMes(i + 1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm text-gray-600 block mb-1">Año</label>
                    <select
                      value={anioSeleccionado}
                      onChange={(e) => setAnioSeleccionado(parseInt(e.target.value))}
                      className="px-4 py-2 border border-gray-300 rounded-lg"
                    >
                      {[2024, 2025, 2026, 2027].map((anio) => (
                        <option key={anio} value={anio}>
                          {anio}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 ml-auto">
                    <button
                      onClick={cargarPagos}
                      disabled={loading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {loading ? 'Cargando...' : '🔄 Actualizar'}
                    </button>
                    <button
                      onClick={generarPagosMes}
                      disabled={loading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      + Generar Pagos del Mes
                    </button>
                  </div>
                </div>

                {/* Filtros de estado */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setFiltroEstadoPago('todos')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstadoPago === 'todos'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    📋 Todos ({pagos.length})
                  </button>
                  <button
                    onClick={() => setFiltroEstadoPago('pagado')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstadoPago === 'pagado'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    ✅ Pagados ({pagos.filter(p => p.estado === 'pagado').length})
                  </button>
                  <button
                    onClick={() => setFiltroEstadoPago('pendiente')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstadoPago === 'pendiente'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    ⏰ Pendientes ({pagos.filter(p => p.estado === 'pendiente').length})
                  </button>
                  <button
                    onClick={() => setFiltroEstadoPago('vencido')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filtroEstadoPago === 'vencido'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                  >
                    ❌ Vencidos ({pagos.filter(p => p.estado === 'vencido').length})
                  </button>
                </div>
              </div>

              {/* Tabla de pagos */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Empresa</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vencimiento</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha Pago</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Método</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {pagos.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                          No hay pagos para este período. Usa "Generar Pagos del Mes" para crearlos.
                        </td>
                      </tr>
                    ) : (
                      pagos.map((pago) => (
                        <tr key={pago.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="text-sm font-medium text-gray-900">{pago.empresa_nombre}</div>
                            {pago.descuento_porcentaje > 0 && (
                              <div className="text-xs text-purple-600 mt-1">
                                Descuento: -{pago.descuento_porcentaje}%
                              </div>
                            )}
                            {pago.dias_mora > 0 && pago.estado === 'vencido' && (
                              <div className="text-xs text-red-600 mt-1">
                                ⚠️ {pago.dias_mora} días de mora
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-bold text-gray-900">
                              ${pago.monto_final.toLocaleString()}
                            </div>
                            {pago.monto_base !== pago.monto_final && (
                              <div className="text-xs text-gray-500 line-through">
                                ${pago.monto_base.toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(pago.fecha_vencimiento).toLocaleDateString('es-AR')}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getEstadoBadge(pago.estado)}`}>
                              {getEstadoIcon(pago.estado)} {pago.estado.charAt(0).toUpperCase() + pago.estado.slice(1)}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900">
                              {pago.fecha_pago
                                ? new Date(pago.fecha_pago).toLocaleDateString('es-AR')
                                : '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-600">
                              {pago.metodo_pago || '-'}
                            </div>
                            {pago.comprobante && (
                              <div className="text-xs text-gray-500 mt-1">
                                {pago.comprobante}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            {pago.estado !== 'pagado' ? (
                              <button
                                onClick={() => abrirModalRegistroPago(pago)}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                              >
                                💰 Registrar Pago
                              </button>
                            ) : (
                              <span className="text-xs text-gray-500">Registrado</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal Registrar Pago */}
      {modalRegistroPago && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">💰 Registrar Pago</h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="text-sm text-gray-600">Empresa</div>
                <div className="text-lg font-bold text-gray-900">{modalRegistroPago.empresa_nombre}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Período</div>
                <div className="font-medium text-gray-900">
                  {formatearMes(modalRegistroPago.mes)} {modalRegistroPago.anio}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Monto Base:</span>
                  <span className="font-medium">${modalRegistroPago.monto_base.toLocaleString()}</span>
                </div>
                {modalRegistroPago.descuento_porcentaje > 0 && (
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Descuento:</span>
                    <span className="text-green-600">-{modalRegistroPago.descuento_porcentaje}%</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-gray-900">Monto Final:</span>
                  <span className="font-bold text-blue-600">${modalRegistroPago.monto_final.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Pago
                </label>
                <input
                  type="date"
                  value={formRegistroPago.fecha_pago}
                  onChange={(e) => setFormRegistroPago({ ...formRegistroPago, fecha_pago: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de Pago
                </label>
                <div className="space-y-2">
                  {['efectivo', 'transferencia', 'tarjeta_credito', 'mercadopago', 'otro'].map((metodo) => (
                    <label key={metodo} className="flex items-center">
                      <input
                        type="radio"
                        name="metodo_pago"
                        value={metodo}
                        checked={formRegistroPago.metodo_pago === metodo}
                        onChange={(e) => setFormRegistroPago({ ...formRegistroPago, metodo_pago: e.target.value })}
                        className="mr-2"
                      />
                      <span className="text-sm text-gray-700">
                        {metodo.charAt(0).toUpperCase() + metodo.slice(1).replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante/Referencia (opcional)
                </label>
                <input
                  type="text"
                  value={formRegistroPago.comprobante}
                  onChange={(e) => setFormRegistroPago({ ...formRegistroPago, comprobante: e.target.value })}
                  placeholder="Ej: REF-12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formRegistroPago.notas}
                  onChange={(e) => setFormRegistroPago({ ...formRegistroPago, notas: e.target.value })}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={cerrarModalRegistroPago}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={registrarPago}
                disabled={loading}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Registrando...' : 'Registrar Pago'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
