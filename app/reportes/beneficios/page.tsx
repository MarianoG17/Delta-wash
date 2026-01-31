'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Gift, CheckCircle, Clock } from 'lucide-react';
import { getAuthUser, clearAuth, getLoginUrl } from '@/lib/auth-utils';

interface Beneficio {
    id: number;
    type: string;
    description: string;
    status: 'pending' | 'redeemed';
    createdAt: string;
    redeemedAt: string | null;
    clientPhone: string;
    clientName: string;
    vehicle: string;
    patente: string;
    rating: number | null;
    notes: string | null;
    redeemedBy: string | null;
}

interface Estadisticas {
    totalBeneficios: number;
    beneficiosPendientes: number;
    beneficiosCanjeados: number;
    tasaCanje: number;
}

export default function ReporteBeneficios() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [empresaNombre, setEmpresaNombre] = useState<string>('DeltaWash');
    const [filtroEstado, setFiltroEstado] = useState<'todos' | 'pending' | 'redeemed'>('todos');

    useEffect(() => {
        const user = getAuthUser();
        if (!user) {
            router.push(getLoginUrl());
            return;
        }

        if (user.isSaas) {
            const nombreEmpresa = localStorage.getItem('empresaNombre');
            if (nombreEmpresa) setEmpresaNombre(nombreEmpresa);
        }

        cargarReporte();
    }, [router]);

    const cargarReporte = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/reportes/beneficios', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });

            if (!res.ok) throw new Error('Error al cargar reporte');

            const data = await res.json();
            setBeneficios(data.beneficios);
            setEstadisticas(data.estadisticas);
        } catch (error) {
            console.error('Error al cargar reporte:', error);
            alert('Error al cargar el reporte de beneficios');
        } finally {
            setLoading(false);
        }
    };

    const beneficiosFiltrados = beneficios.filter(b => {
        if (filtroEstado === 'todos') return true;
        return b.status === filtroEstado;
    });

    const getStatusColor = (status: string) => {
        return status === 'redeemed'
            ? 'bg-green-100 text-green-700'
            : 'bg-yellow-100 text-yellow-700';
    };

    const getStatusLabel = (status: string) => {
        return status === 'redeemed' ? '✅ Canjeado' : '⏳ Pendiente';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando reporte...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/reportes"
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4"
                    >
                        <ArrowLeft size={20} />
                        Volver a Reportes
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        🎁 Reporte de Beneficios
                    </h1>
                    <p className="text-gray-600">{empresaNombre}</p>
                </div>

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Total Beneficios</p>
                            <p className="text-3xl font-bold text-blue-600">{estadisticas.totalBeneficios}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <Clock size={16} className="text-yellow-600" />
                                <p className="text-sm text-gray-600">Pendientes</p>
                            </div>
                            <p className="text-3xl font-bold text-yellow-600">{estadisticas.beneficiosPendientes}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle size={16} className="text-green-600" />
                                <p className="text-sm text-gray-600">Canjeados</p>
                            </div>
                            <p className="text-3xl font-bold text-green-600">{estadisticas.beneficiosCanjeados}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Tasa de Canje</p>
                            <p className="text-3xl font-bold text-purple-600">{estadisticas.tasaCanje}%</p>
                        </div>
                    </div>
                )}

                {/* Filtros */}
                <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFiltroEstado('todos')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filtroEstado === 'todos'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Todos ({beneficios.length})
                        </button>
                        <button
                            onClick={() => setFiltroEstado('pending')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filtroEstado === 'pending'
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Pendientes ({beneficios.filter(b => b.status === 'pending').length})
                        </button>
                        <button
                            onClick={() => setFiltroEstado('redeemed')}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                filtroEstado === 'redeemed'
                                    ? 'bg-green-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            Canjeados ({beneficios.filter(b => b.status === 'redeemed').length})
                        </button>
                    </div>
                </div>

                {/* Tabla de beneficios */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Detalle de Beneficios</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Creado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente / Teléfono
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehículo Origen
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Beneficio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Canjeado
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {beneficiosFiltrados.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            {filtroEstado === 'todos'
                                                ? 'No hay beneficios registrados'
                                                : `No hay beneficios ${filtroEstado === 'pending' ? 'pendientes' : 'canjeados'}`}
                                        </td>
                                    </tr>
                                ) : (
                                    beneficiosFiltrados.map((beneficio) => (
                                        <tr key={beneficio.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(beneficio.createdAt).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <p className="font-semibold text-gray-900">{beneficio.clientName}</p>
                                                <p className="text-gray-600">{beneficio.clientPhone}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <p className="text-gray-900">{beneficio.vehicle}</p>
                                                <p className="text-xs text-gray-500">{beneficio.patente}</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex items-center gap-2">
                                                    <Gift size={16} className="text-purple-600" />
                                                    <span className="font-semibold text-purple-600">
                                                        {beneficio.description}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(beneficio.status)}`}>
                                                    {getStatusLabel(beneficio.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                {beneficio.redeemedAt ? (
                                                    <div>
                                                        <p className="text-gray-900">
                                                            {new Date(beneficio.redeemedAt).toLocaleDateString('es-AR')}
                                                        </p>
                                                        {beneficio.redeemedBy && (
                                                            <p className="text-xs text-gray-500">
                                                                por {beneficio.redeemedBy}
                                                            </p>
                                                        )}
                                                        {beneficio.notes && (
                                                            <p className="text-xs text-gray-600 italic mt-1">
                                                                {beneficio.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
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
