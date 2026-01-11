'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign } from 'lucide-react';

interface ReporteDia {
    fecha: string;
    cantidad: number;
    facturacion: number;
}

interface Totales {
    cantidad_total: number;
    facturacion_total: number;
}

export default function Reportes() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('operador');
    const [mounted, setMounted] = useState(false);
    
    // Fechas por defecto: últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    const [fechaDesde, setFechaDesde] = useState(hace30Dias.toISOString().split('T')[0]);
    const [fechaHasta, setFechaHasta] = useState(hoy.toISOString().split('T')[0]);
    
    const [reporte, setReporte] = useState<ReporteDia[]>([]);
    const [totales, setTotales] = useState<Totales>({
        cantidad_total: 0,
        facturacion_total: 0
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('lavadero_user');
            if (!session) {
                router.push('/login');
            } else {
                const data = JSON.parse(session);
                setUserRole(data.rol || 'operador');
                
                if (data.rol !== 'admin') {
                    alert('No tienes permisos para acceder a esta página');
                    router.push('/');
                } else {
                    cargarReporte();
                }
            }
        }
    }, [router]);

    const cargarReporte = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reportes/ventas?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
            const data = await res.json();

            if (data.success) {
                setReporte(data.reporte);
                setTotales(data.totales);
            } else {
                alert('Error al cargar reporte: ' + data.message);
            }
        } catch (error) {
            console.error('Error cargando reporte:', error);
            alert('Error al cargar reporte');
        } finally {
            setLoading(false);
        }
    };

    const formatearFecha = (fechaStr: string) => {
        const [year, month, day] = fechaStr.split('-');
        const fecha = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
        return fecha.toLocaleDateString('es-AR', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-white hover:text-white/80 transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver al inicio</span>
                    </Link>
                    
                    <div className="flex items-center gap-3 text-white mb-4">
                        <DollarSign size={32} />
                        <h1 className="text-3xl font-bold">Reporte de Ventas</h1>
                    </div>

                    {/* Filtros de fecha */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-white text-sm font-medium mb-2">
                                Fecha Desde
                            </label>
                            <input
                                type="date"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-white text-sm font-medium mb-2">
                                Fecha Hasta
                            </label>
                            <input
                                type="date"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                            />
                        </div>
                        <button
                            onClick={cargarReporte}
                            disabled={loading}
                            className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Cargando...' : 'Generar Reporte'}
                        </button>
                    </div>
                </div>

                {/* Tarjetas de totales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <Calendar size={20} />
                            <span className="text-sm font-medium">Total Autos</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{totales.cantidad_total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <DollarSign size={20} />
                            <span className="text-sm font-medium">Facturación Total</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            ${totales.facturacion_total.toLocaleString('es-AR')}
                        </p>
                    </div>
                </div>

                {/* Tabla de reporte */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Ventas por Día
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                                        <th className="text-right py-3 px-4 font-semibold text-gray-700">Facturación</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reporte.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="text-center py-8 text-gray-500">
                                                {loading ? 'Cargando...' : 'No hay datos para el período seleccionado'}
                                            </td>
                                        </tr>
                                    ) : (
                                        reporte.map((row, index) => (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                <td className="py-3 px-4 text-gray-900">
                                                    {formatearFecha(row.fecha)}
                                                </td>
                                                <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                                    <Link
                                                        href={`/historial?fecha=${row.fecha}`}
                                                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                                                        title="Ver detalle de registros de este día"
                                                    >
                                                        {row.cantidad}
                                                    </Link>
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-green-600">
                                                    ${row.facturacion.toLocaleString('es-AR')}
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
        </div>
    );
}
