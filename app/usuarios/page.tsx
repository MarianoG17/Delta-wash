'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthUser, clearAuth, getLoginUrl } from '@/lib/auth-utils';

interface Usuario {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

export default function UsuariosPage() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    password: '',
    nombre: '',
    rol: 'operador'
  });

  useEffect(() => {
    const user = getAuthUser();
    if (!user) {
      router.push(getLoginUrl());
      return;
    }

    // Solo admins pueden acceder
    if (user.rol !== 'admin') {
      alert('❌ Solo administradores pueden acceder a esta sección');
      router.push('/home');
      return;
    }

    cargarUsuarios();
  }, [router]);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/usuarios', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setUsuarios(data.usuarios);
      } else {
        console.error('Error al cargar usuarios:', data.message);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (nuevoUsuario.password.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const authToken = localStorage.getItem('authToken');

      const response = await fetch('/api/usuarios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(nuevoUsuario)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Usuario creado exitosamente');
        setMostrarFormulario(false);
        setNuevoUsuario({ email: '', password: '', nombre: '', rol: 'operador' });
        cargarUsuarios();
      } else {
        alert('❌ ' + data.message);
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('❌ Error al crear usuario');
    }
  };

  const copiarAlPortapapeles = (texto: string, tipo: string) => {
    navigator.clipboard.writeText(texto);
    alert(`✅ ${tipo} copiado al portapapeles`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <p className="text-lg text-gray-600">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                👥 Gestión de Usuarios
              </h1>
              <p className="text-gray-600">
                Administrá los usuarios de tu empresa
              </p>
            </div>
            <button
              onClick={() => router.push('/')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        {/* Botón Nuevo Usuario */}
        <div className="mb-6">
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            {mostrarFormulario ? '✕ Cancelar' : '+ Nuevo Usuario'}
          </button>
        </div>

        {/* Formulario Nuevo Usuario */}
        {mostrarFormulario && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Crear Nuevo Usuario</h2>
            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={nuevoUsuario.email}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={nuevoUsuario.password}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, password: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  minLength={6}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  value={nuevoUsuario.nombre}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rol
                </label>
                <select
                  value={nuevoUsuario.rol}
                  onChange={(e) => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="operador">Operador</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Crear Usuario
              </button>
            </form>
          </div>
        )}

        {/* Lista de Usuarios */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600">
            <h2 className="text-2xl font-bold text-white">
              Usuarios de tu Empresa
            </h2>
            <p className="text-blue-100">Total: {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</p>
          </div>

          {usuarios.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No hay usuarios registrados
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {usuarios.map((usuario) => (
                <div key={usuario.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Nombre y Rol */}
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold text-gray-800">
                          {usuario.nombre}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          usuario.rol === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {usuario.rol === 'admin' ? '👑 Admin' : '👤 Operador'}
                        </span>
                        {!usuario.activo && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
                            ❌ Inactivo
                          </span>
                        )}
                      </div>

                      {/* Email con botón copiar */}
                      <div className="mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-600">📧 Email:</span>
                          <code className="bg-gray-100 px-3 py-1 rounded text-gray-800 font-mono text-sm">
                            {usuario.email}
                          </code>
                          <button
                            onClick={() => copiarAlPortapapeles(usuario.email, 'Email')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            📋 Copiar
                          </button>
                        </div>
                      </div>

                      {/* Password (solo para operadores demo) */}
                      {usuario.email.includes('@') && usuario.email.split('@')[1]?.includes('.demo') && (
                        <div className="mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">🔑 Password:</span>
                            <code className="bg-yellow-100 px-3 py-1 rounded text-gray-800 font-mono text-sm">
                              demo123
                            </code>
                            <button
                              onClick={() => copiarAlPortapapeles('demo123', 'Password')}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              📋 Copiar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Permisos según rol */}
                      <div className="mt-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Permisos:</p>
                        {usuario.rol === 'admin' ? (
                          <ul className="text-xs text-gray-600 space-y-1">
                            <li>✅ Acceso completo a Reportes y Estadísticas</li>
                            <li>✅ Modificar Listas de Precios</li>
                            <li>✅ Gestionar Cuentas Corrientes</li>
                            <li>✅ Eliminar registros del sistema</li>
                            <li>✅ Gestionar usuarios</li>
                          </ul>
                        ) : (
                          <>
                            <ul className="text-xs text-gray-600 space-y-1 mb-2">
                              <li>✅ Registrar y cargar vehículos</li>
                              <li>✅ Cambiar estados (En Proceso → Listo → Entregado)</li>
                              <li>✅ Ver autos en pantalla principal</li>
                            </ul>
                            <p className="text-xs font-semibold text-gray-600 mb-1">Restricciones:</p>
                            <ul className="text-xs text-red-600 space-y-1">
                              <li>❌ No puede ver Historial</li>
                              <li>❌ No puede enviar WhatsApp</li>
                              <li>❌ No puede acceder a Reportes</li>
                              <li>❌ No puede modificar Precios</li>
                              <li>❌ No puede gestionar Cuentas Corrientes</li>
                              <li>❌ No puede eliminar registros</li>
                            </ul>
                          </>
                        )}
                      </div>

                      {/* Fecha de creación */}
                      <p className="text-xs text-gray-400 mt-3">
                        Creado: {new Date(usuario.fechaCreacion).toLocaleString('es-AR')}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info adicional */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Información Importante</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Usuarios Demo:</strong> El operador creado automáticamente tiene email <code>operador@{'{slug}'}.demo</code> y password <code>demo123</code></li>
            <li>• <strong>Crear Nuevos:</strong> Podés crear más usuarios operadores para tu equipo</li>
            <li>• <strong>Roles:</strong> Los admins tienen acceso completo, los operadores tienen permisos limitados</li>
            <li>• <strong>Seguridad:</strong> Cambiá la contraseña del operador demo desde el código si es necesario</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
