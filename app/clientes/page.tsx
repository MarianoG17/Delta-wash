'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users, Download, TrendingUp, Tag } from 'lucide-react';
import { getAuthUser, getLoginUrl } from '@/lib/auth-utils';

interface Cliente {
    nombre_cliente: string;
    celular: string;
    total_visitas: number;
    ultima_visita: string;
    primera_visita: string;
    autos: string;
    frecuencia_promedio_dias: number | null;
}

interface Estadisticas {
    total_registros: number;
    clientes_unicos: number;
    completados: number;
}

interface ListaPrecio {
    id: number;
    nombre: string;
    es_default: boolean;
}

interface AsignacionLista {
    celular: string;
    lista_precio_id: number | null;
}

export default function Clientes() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [filtro, setFiltro] = useState('');
    const [userRole, setUserRole] = useState<string>('operador');
    const [listas, setListas] = useState<ListaPrecio[]>([]);
    const [asignaciones, setAsignaciones] = useState<Record<string, number | null>>({});
    const [editandoLista, setEditandoLista] = useState<string | null>(null);
    const [periodoStats, setPeriodoStats] = useState<number>(30);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const user = getAuthUser();
            if (!user) {
                router.push(getLoginUrl());
            } else {
                setUserRole(user.rol);
                cargarDatos(30);
                if (user.rol === 'admin') {
                    cargarListas();
                    cargarAsignaciones();
                }
            }
        }
    }, [router]);

    const getAuthToken = () => {
        const user = getAuthUser();
        return user?.isSaas
            ? localStorage.getItem('authToken')
            : localStorage.getItem('lavadero_token');
    };

    const cargarListas = async () => {
        try {
            const res = await fetch('/api/listas-precios', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setListas(data.listas.map((l: any) => ({ id: l.id, nombre: l.nombre, es_default: l.es_default })));
            }
        } catch (error) {
            console.error('Error cargando listas:', error);
        }
    };

    const cargarAsignaciones = async () => {
        try {
            const res = await fetch('/api/clientes/lista-precio', {
                headers: { 'Authorization': `Bearer ${getAuthToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                const map: Record<string, number | null> = {};
                data.asignaciones.forEach((a: AsignacionLista) => {
                    map[a.celular] = a.lista_precio_id;
                });
                setAsignaciones(map);
            }
        } catch (error) {
            console.error('Error cargando asignaciones:', error);
        }
    };

    const asignarLista = async (celular: string, nombre_cliente: string, lista_precio_id: number | null) => {
        try {
            const res = await fetch('/api/clientes/lista-precio', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAuthToken()}`
                },
                body: JSON.stringify({ celular, nombre_cliente, lista_precio_id }),
            });
            const data = await res.json();
            if (data.success) {
                setAsignaciones(prev => ({ ...prev, [celular]: lista_precio_id }));
                setEditandoLista(null);
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al asignar lista de precios');
        }
    };

    const cargarDatos = async (dias: number = periodoStats) => {
        try {
            // Obtener token para autenticación
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch(`/api/estadisticas/clientes?dias=${dias}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setClientes(data.clientes);
                setEstadisticas(data.estadisticas);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const exportarDatos = () => {
        window.open('/api/registros/exportar', '_blank');
    };

    const formatFecha = (fecha: string) => {
        return new Date(fecha).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const clientesFiltrados = clientes.filter(cliente =>
        cliente.nombre_cliente.toLowerCase().includes(filtro.toLowerCase()) ||
        cliente.celular.includes(filtro) ||
        cliente.autos.toLowerCase().includes(filtro.toLowerCase())
    );

    if (!mounted) {
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm">Volver</span>
                        </Link>
                        <div className="text-white">
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <Users size={32} />
                                Base de Clientes
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={exportarDatos}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                    >
                        <Download size={18} />
                        <span className="text-sm">Exportar Excel</span>
                    </button>
                </div>

                {/* Selector de período */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {[
                        { label: '7 días', dias: 7 },
                        { label: '30 días', dias: 30 },
                        { label: '90 días', dias: 90 },
                        { label: '1 año', dias: 365 },
                        { label: 'Todo', dias: 0 },
                    ].map(({ label, dias }) => (
                        <button
                            key={dias}
                            onClick={() => { setPeriodoStats(dias); cargarDatos(dias); }}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${periodoStats === dias ? 'bg-white text-blue-700 shadow' : 'bg-white/30 text-white hover:bg-white/40'}`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-900">
                                    Visitas{periodoStats > 0 ? ` (${periodoStats} días)` : ' (total)'}
                                </h3>
                                <TrendingUp className="text-blue-600" size={24} />
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                {estadisticas.total_registros}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-900">
                                    Clientes únicos{periodoStats > 0 ? ` (${periodoStats} días)` : ''}
                                </h3>
                                <Users className="text-green-600" size={24} />
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {estadisticas.clientes_unicos}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 shadow-xl">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-gray-900">
                                    Completados{periodoStats > 0 ? ` (${periodoStats} días)` : ''}
                                </h3>
                                <TrendingUp className="text-purple-600" size={24} />
                            </div>
                            <p className="text-3xl font-bold text-purple-600">
                                {estadisticas.completados}
                            </p>
                        </div>
                    </div>
                )}

                {/* Filtro */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono o auto..."
                        value={filtro}
                        onChange={(e) => setFiltro(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                </div>

                {/* Lista de Clientes */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Base de Clientes
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Cliente
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Teléfono
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Autos
                                    </th>
                                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                                        Visitas
                                    </th>
                                    <th className="text-center py-3 px-2 font-semibold text-gray-700">
                                        Frecuencia
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Primera Visita
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Última Visita
                                    </th>
                                    {userRole === 'admin' && (
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                            Lista Precios
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {clientesFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={userRole === 'admin' ? 8 : 7} className="text-center py-8 text-gray-500">
                                            No se encontraron clientes
                                        </td>
                                    </tr>
                                ) : (
                                    clientesFiltrados.map((cliente, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                                {cliente.nombre_cliente}
                                            </td>
                                            <td className="py-3 px-2 text-sm">
                                                <a
                                                    href={`https://wa.me/549${cliente.celular.replace(/\D/g, '')}?text=${encodeURIComponent('Hola!')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="font-mono text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                                    title="Enviar WhatsApp"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                    </svg>
                                                    {cliente.celular}
                                                </a>
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-900">
                                                {cliente.autos}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${cliente.total_visitas >= 5
                                                    ? 'bg-green-100 text-green-700'
                                                    : cliente.total_visitas >= 3
                                                        ? 'bg-blue-100 text-blue-700'
                                                        : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {cliente.total_visitas}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                {cliente.frecuencia_promedio_dias !== null ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${cliente.frecuencia_promedio_dias <= 7
                                                                ? 'bg-green-100 text-green-700'
                                                                : cliente.frecuencia_promedio_dias <= 15
                                                                    ? 'bg-blue-100 text-blue-700'
                                                                    : cliente.frecuencia_promedio_dias <= 30
                                                                        ? 'bg-yellow-100 text-yellow-700'
                                                                        : 'bg-red-100 text-red-700'
                                                            }`}>
                                                            {cliente.frecuencia_promedio_dias} días
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        1 visita
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-900">
                                                {formatFecha(cliente.primera_visita)}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-900">
                                                {formatFecha(cliente.ultima_visita)}
                                            </td>
                                            {userRole === 'admin' && (
                                                <td className="py-3 px-2 text-sm">
                                                    {editandoLista === cliente.celular ? (
                                                        <div className="flex gap-1 items-center">
                                                            <select
                                                                defaultValue={asignaciones[cliente.celular] ?? ''}
                                                                onChange={(e) => asignarLista(
                                                                    cliente.celular,
                                                                    cliente.nombre_cliente,
                                                                    e.target.value ? parseInt(e.target.value) : null
                                                                )}
                                                                className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500"
                                                            >
                                                                <option value="">Por defecto</option>
                                                                {listas.map(l => (
                                                                    <option key={l.id} value={l.id}>
                                                                        {l.nombre}{l.es_default ? ' ✓' : ''}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                            <button
                                                                onClick={() => setEditandoLista(null)}
                                                                className="text-xs text-gray-400 hover:text-gray-600"
                                                            >
                                                                ✕
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => setEditandoLista(cliente.celular)}
                                                            className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600"
                                                        >
                                                            <Tag size={11} />
                                                            {asignaciones[cliente.celular]
                                                                ? (listas.find(l => l.id === asignaciones[cliente.celular])?.nombre ?? 'Especial')
                                                                : 'Default'}
                                                        </button>
                                                    )}
                                                </td>
                                            )}
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
