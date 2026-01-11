'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, TrendingUp, Clock, DollarSign } from 'lucide-react';

interface ReporteDiario {
    fecha: string;
    cantidad_lavados: number;
    importe_total: number;
    pago_efectivo: number;
    pago_transferencia: number;
    pago_cuenta_corriente: number;
    registros_sin_precio: number;
}

interface ReporteHorario {
    horario: string;
    hora: number;
    lunes: number;
    martes: number;
    miercoles: number;
    jueves: number;
    viernes: number;
    sabado: number;
    total: number;
}

interface Totales {
    cantidad_total: number;
    importe_total: number;
    efectivo_total: number;
    transferencia_total: number;
    cuenta_corriente_total: number;
    registros_sin_precio_total: number;
}

export default function Reportes() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('operador');
    const [mounted, setMounted] = useState(false);
    const [tabActiva, setTabActiva] = useState<'diario' | 'horario'>('diario');
    
    // Fechas por defecto: últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);
    
    const [fechaDesde, setFechaDesde] = useState(hace30Dias.toISOString().split('T')[0]);
    const [fechaHasta, setFechaHasta] = useState(hoy.toISOString().split('T')[0]);
    
    const [reporteDiario, setReporteDiario] = useState<ReporteDiario[]>([]);
    const [reporteHorario, setReporteHorario] = useState<ReporteHorario[]>([]);
    const [totales, setTotales] = useState<Totales>({
        cantidad_total: 0,
        importe_total: 0,
        efectivo_total: 0,
        transferencia_total: 0,
        cuenta_corriente_total: 0,
        registros_sin_precio_total: 0
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
                setReporteDiario(data.reporte_diario);
                setReporteHorario(data.reporte_horario);
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

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
            <div className="max-w-7xl mx-auto">
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
                        <TrendingUp size={32} />
                        <h1 className="text-3xl font-bold">Reportes de Ventas</h1>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <Calendar size={20} />
                            <span className="text-sm font-medium">Total Lavados</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900">{totales.cantidad_total}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <DollarSign size={20} />
                            <span className="text-sm font-medium">Importe Total</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                            ${totales.importe_total.toLocaleString('es-AR')}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <span className="text-sm font-medium">💵 Efectivo</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                            ${totales.efectivo_total.toLocaleString('es-AR')}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <span className="text-sm font-medium">🏦 Transferencia</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                            ${totales.transferencia_total.toLocaleString('es-AR')}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-lg p-4">
                        <div className="flex items-center gap-2 text-gray-600 mb-2">
                            <span className="text-sm font-medium">💳 Cta. Cte.</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-600">
                            ${totales.cuenta_corriente_total.toLocaleString('es-AR')}
                        </p>
                    </div>
                </div>

                {/* Alerta de registros sin precio */}
                {totales.registros_sin_precio_total > 0 && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-lg">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    <strong>⚠️ Atención:</strong> Hay <strong>{totales.registros_sin_precio_total}</strong> registro(s) sin precio definido.
                                    Estos registros cuentan en la cantidad pero no en la facturación. Revisa y corrige los precios en el historial.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setTabActiva('diario')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                                tabActiva === 'diario'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Calendar size={20} />
                                <span>Reporte Diario</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setTabActiva('horario')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${
                                tabActiva === 'horario'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Clock size={20} />
                                <span>Reporte por Horario</span>
                            </div>
                        </button>
                    </div>

                    <div className="p-6">
                        {/* Reporte Diario */}
                        {tabActiva === 'diario' && (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Cantidad</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Importe Total</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Efectivo</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Transferencia</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Cta. Cte.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reporteDiario.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                                    No hay datos para el período seleccionado
                                                </td>
                                            </tr>
                                        ) : (
                                            reporteDiario.map((row, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-900">
                                                        {new Date(row.fecha).toLocaleDateString('es-AR', {
                                                            weekday: 'short',
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                                                        {row.cantidad_lavados}
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-green-600">
                                                        ${row.importe_total.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-blue-600">
                                                        ${row.pago_efectivo.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-purple-600">
                                                        ${row.pago_transferencia.toLocaleString('es-AR')}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-orange-600">
                                                        ${row.pago_cuenta_corriente.toLocaleString('es-AR')}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Reporte por Horario - Matriz por día de semana */}
                        {tabActiva === 'horario' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-2 font-semibold text-gray-700 sticky left-0 bg-white">Horario</th>
                                            <th className="text-center py-3 px-2 font-semibold text-gray-700">Lun</th>
                                            <th className="text-center py-3 px-2 font-semibold text-gray-700">Mar</th>
                                            <th className="text-center py-3 px-2 font-semibold text-gray-700">Mié</th>
                                            <th className="text-center py-3 px-2 font-semibold text-gray-700">Jue</th>
                                            <th className="text-center py-3 px-2 font-semibold text-gray-700">Vie</th>
                                            <th className="text-center py-3 px-2 font-semibold text-gray-700">Sáb</th>
                                            <th className="text-center py-3 px-2 font-semibold text-blue-700 bg-blue-50">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reporteHorario.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="text-center py-8 text-gray-500">
                                                    No hay datos para el período seleccionado
                                                </td>
                                            </tr>
                                        ) : (
                                            reporteHorario.map((row, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-2 px-2 text-gray-900 font-medium sticky left-0 bg-white">
                                                        {row.horario}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-700">
                                                        {row.lunes > 0 ? row.lunes : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-700">
                                                        {row.martes > 0 ? row.martes : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-700">
                                                        {row.miercoles > 0 ? row.miercoles : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-700">
                                                        {row.jueves > 0 ? row.jueves : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-700">
                                                        {row.viernes > 0 ? row.viernes : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center text-gray-700">
                                                        {row.sabado > 0 ? row.sabado : '-'}
                                                    </td>
                                                    <td className="py-2 px-2 text-center font-bold text-blue-700 bg-blue-50">
                                                        {row.total}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                                <p className="text-xs text-gray-500 mt-4">
                                    💡 La tabla muestra la cantidad de lavados por horario y día de la semana (Lunes a Sábado) en el período seleccionado.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
