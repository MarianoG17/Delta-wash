'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Car, AlertCircle } from 'lucide-react';

interface Registro {
    id: number;
    marca_modelo: string;
    patente: string;
    tipo_limpieza: string;
    nombre_cliente: string;
    celular: string;
    fecha_ingreso: string;
    fecha_listo: string | null;
    fecha_entregado: string | null;
    estado: string;
}

export default function Historial() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [loading, setLoading] = useState(true);
    const [clientesSinVisitar, setClientesSinVisitar] = useState<any[]>([]);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('lavadero_user');
            if (!session) {
                router.push('/login');
            } else {
                cargarDatos();
            }
        }
    }, [router]);

    const cargarDatos = async () => {
        try {
            // Cargar todos los registros
            const res = await fetch('/api/registros');
            const data = await res.json();
            if (data.success) {
                setRegistros(data.registros);
                analizarClientesSinVisitar(data.registros);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
        } finally {
            setLoading(false);
        }
    };

    const analizarClientesSinVisitar = (registros: Registro[]) => {
        const hoy = new Date();
        const hace10Dias = new Date(hoy.getTime() - 10 * 24 * 60 * 60 * 1000);

        // Agrupar por celular (cliente único)
        const clientesMap = new Map();

        registros.forEach((registro) => {
            const fechaIngreso = new Date(registro.fecha_ingreso);
            const celular = registro.celular;

            if (!clientesMap.has(celular)) {
                clientesMap.set(celular, {
                    nombre: registro.nombre_cliente,
                    celular: celular,
                    ultimaVisita: fechaIngreso,
                    marca_modelo: registro.marca_modelo,
                    patente: registro.patente,
                });
            } else {
                const cliente = clientesMap.get(celular);
                if (fechaIngreso > cliente.ultimaVisita) {
                    cliente.ultimaVisita = fechaIngreso;
                    cliente.marca_modelo = registro.marca_modelo;
                    cliente.patente = registro.patente;
                }
            }
        });

        // Filtrar clientes que no visitaron en más de 10 días
        const sinVisitar = Array.from(clientesMap.values())
            .filter((cliente) => cliente.ultimaVisita < hace10Dias)
            .sort((a, b) => a.ultimaVisita.getTime() - b.ultimaVisita.getTime());

        setClientesSinVisitar(sinVisitar);
    };

    const formatFecha = (fecha: string) => {
        const date = new Date(fecha);
        return date.toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calcularTiempoTotal = (fechaIngreso: string, fechaListo: string | null) => {
        if (!fechaListo) return '-';

        const ingreso = new Date(fechaIngreso);
        const listo = new Date(fechaListo);
        const diffMs = listo.getTime() - ingreso.getTime();

        const horas = Math.floor(diffMs / (1000 * 60 * 60));
        const minutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (horas > 0) {
            return `${horas}h ${minutos}m`;
        }
        return `${minutos}m`;
    };

    const getDiasDesdeVisita = (fecha: Date) => {
        const hoy = new Date();
        const diff = hoy.getTime() - fecha.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

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
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">Volver</span>
                    </Link>
                    <div className="text-white">
                        <h1 className="text-3xl font-bold">Historial y Estadísticas</h1>
                    </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Total Registros</h3>
                            <Car className="text-blue-600" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{registros.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Entregados</h3>
                            <Calendar className="text-green-600" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {registros.filter((r) => r.estado === 'entregado').length}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Sin visitar +10 días</h3>
                            <AlertCircle className="text-orange-600" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-orange-600">
                            {clientesSinVisitar.length}
                        </p>
                    </div>
                </div>

                {/* Clientes sin visitar */}
                {clientesSinVisitar.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            ⚠️ Clientes que no visitan hace más de 10 días
                        </h2>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {clientesSinVisitar.map((cliente, index) => (
                                <div
                                    key={index}
                                    className="border border-orange-200 bg-orange-50 rounded-lg p-4"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-gray-900">{cliente.nombre}</h3>
                                            <p className="text-sm text-gray-600">
                                                {cliente.marca_modelo} - {cliente.patente}
                                            </p>
                                            <p className="text-sm text-gray-600">Tel: {cliente.celular}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-orange-700">
                                                Hace {getDiasDesdeVisita(cliente.ultimaVisita)} días
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                Última visita: {formatFecha(cliente.ultimaVisita.toISOString())}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Historial completo */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        Historial Completo
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Ingreso
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Listo
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Entregado
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Tiempo
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Auto
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Patente
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Cliente
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Teléfono
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Tipo
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Estado
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {registros.map((registro) => (
                                    <tr key={registro.id} className="border-b border-gray-100 hover:bg-gray-50">
                                        <td className="py-3 px-2 text-sm text-gray-900">
                                            {formatFecha(registro.fecha_ingreso)}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-900">
                                            {registro.fecha_listo ? formatFecha(registro.fecha_listo) : '-'}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-900">
                                            {registro.fecha_entregado ? formatFecha(registro.fecha_entregado) : '-'}
                                        </td>
                                        <td className="py-3 px-2 text-sm font-semibold text-blue-600">
                                            {calcularTiempoTotal(registro.fecha_ingreso, registro.fecha_listo)}
                                        </td>
                                        <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                            {registro.marca_modelo}
                                        </td>
                                        <td className="py-3 px-2 text-sm font-mono text-gray-900">
                                            {registro.patente}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-900">{registro.nombre_cliente}</td>
                                        <td className="py-3 px-2 text-sm font-mono text-blue-600">{registro.celular}</td>
                                        <td className="py-3 px-2 text-sm text-gray-900">
                                            {registro.tipo_limpieza.replace(/_/g, ' ')}
                                        </td>
                                        <td className="py-3 px-2">
                                            <span
                                                className={`text-xs px-2 py-1 rounded-full font-medium ${registro.estado === 'entregado'
                                                    ? 'bg-green-100 text-green-700'
                                                    : registro.estado === 'listo'
                                                        ? 'bg-orange-100 text-orange-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}
                                            >
                                                {registro.estado === 'entregado'
                                                    ? '✓ Entregado'
                                                    : registro.estado === 'listo'
                                                        ? '⚠ Listo'
                                                        : '⏳ En proceso'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
