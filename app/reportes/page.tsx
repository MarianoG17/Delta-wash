'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, DollarSign, Clock, Wallet } from 'lucide-react';

interface ReporteDia {
    fecha: string;
    cantidad: number;
    facturacion: number;
}

interface ReporteHorario {
    hora: number;
    horario: string;
    domingo: number;
    lunes: number;
    martes: number;
    miercoles: number;
    jueves: number;
    viernes: number;
    sabado: number;
    total: number;
}

interface ReporteCaja {
    fecha: string;
    efectivo: number;
    cantidad_efectivo: number;
    transferencia: number;
    cantidad_transferencia: number;
    cuenta_corriente: number;
    cantidad_cuenta_corriente: number;
    cantidad_cancelados: number;
    total_dia: number;
    total_entregados: number;
}

interface Totales {
    cantidad_total: number;
    facturacion_total: number;
}

interface TotalesCaja {
    total_efectivo: number;
    total_cantidad_efectivo: number;
    total_transferencia: number;
    total_cantidad_transferencia: number;
    total_cuenta_corriente: number;
    total_cantidad_cuenta_corriente: number;
    total_cancelados: number;
    total_general: number;
    total_lavados: number;
}

export default function Reportes() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('operador');
    const [mounted, setMounted] = useState(false);
    const [tabActiva, setTabActiva] = useState<'diario' | 'horario' | 'caja'>('diario');

    // Fechas por defecto: últimos 30 días
    const hoy = new Date();
    const hace30Dias = new Date();
    hace30Dias.setDate(hoy.getDate() - 30);

    const [fechaDesde, setFechaDesde] = useState(hace30Dias.toISOString().split('T')[0]);
    const [fechaHasta, setFechaHasta] = useState(hoy.toISOString().split('T')[0]);

    const [reporte, setReporte] = useState<ReporteDia[]>([]);
    const [reporteHorario, setReporteHorario] = useState<ReporteHorario[]>([]);
    const [reporteCaja, setReporteCaja] = useState<ReporteCaja[]>([]);
    const [totales, setTotales] = useState<Totales>({
        cantidad_total: 0,
        facturacion_total: 0
    });
    const [totalesCaja, setTotalesCaja] = useState<TotalesCaja>({
        total_efectivo: 0,
        total_cantidad_efectivo: 0,
        total_transferencia: 0,
        total_cantidad_transferencia: 0,
        total_cuenta_corriente: 0,
        total_cantidad_cuenta_corriente: 0,
        total_cancelados: 0,
        total_general: 0,
        total_lavados: 0
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
            // Cargar reporte diario
            const resVentas = await fetch(`/api/reportes/ventas?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
            const dataVentas = await resVentas.json();

            if (dataVentas.success) {
                setReporte(dataVentas.reporte);
                setTotales(dataVentas.totales);
            } else {
                alert('Error al cargar reporte diario: ' + dataVentas.message);
            }

            // Cargar reporte de horarios
            const resHorarios = await fetch(`/api/reportes/horarios?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
            const dataHorarios = await resHorarios.json();

            if (dataHorarios.success) {
                setReporteHorario(dataHorarios.reporte);
            } else {
                alert('Error al cargar reporte de horarios: ' + dataHorarios.message);
            }

            // Cargar reporte de caja
            const resCaja = await fetch(`/api/reportes/caja?fecha_desde=${fechaDesde}&fecha_hasta=${fechaHasta}`);
            const dataCaja = await resCaja.json();

            if (dataCaja.success) {
                setReporteCaja(dataCaja.reporte);
                setTotalesCaja(dataCaja.totales);
            } else {
                alert('Error al cargar reporte de caja: ' + dataCaja.message);
            }
        } catch (error) {
            console.error('Error cargando reportes:', error);
            alert('Error al cargar reportes');
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

                {/* Tabs */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setTabActiva('diario')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${tabActiva === 'diario'
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
                            onClick={() => setTabActiva('caja')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${tabActiva === 'caja'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-2">
                                <Wallet size={20} />
                                <span>Caja Diaria</span>
                            </div>
                        </button>
                        <button
                            onClick={() => setTabActiva('horario')}
                            className={`flex-1 px-6 py-4 font-semibold transition-colors ${tabActiva === 'horario'
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
                </div>

                {/* Tabla de reporte diario */}
                {tabActiva === 'diario' && (
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
                )}

                {/* Tabla de reporte de caja diaria */}
                {tabActiva === 'caja' && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Reporte de Caja Diaria
                            </h2>

                            {/* Tarjetas de resumen */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-green-700">💵 Efectivo</span>
                                        <span className="text-xs bg-green-100 px-2 py-1 rounded-full text-green-700">
                                            {totalesCaja.total_cantidad_efectivo} pagos
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-700">
                                        ${totalesCaja.total_efectivo?.toLocaleString('es-AR') || 0}
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-blue-700">🏦 Transferencia</span>
                                        <span className="text-xs bg-blue-100 px-2 py-1 rounded-full text-blue-700">
                                            {totalesCaja.total_cantidad_transferencia} pagos
                                        </span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-700">
                                        ${totalesCaja.total_transferencia?.toLocaleString('es-AR') || 0}
                                    </p>
                                </div>

                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-red-700">✕ Cancelados</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-700">
                                        {totalesCaja.total_cancelados}
                                    </p>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-4 font-semibold text-gray-700">Fecha</th>
                                            <th className="text-right py-3 px-4 font-semibold text-green-700">Efectivo</th>
                                            <th className="text-right py-3 px-4 font-semibold text-blue-700">Transferencia</th>
                                            <th className="text-right py-3 px-4 font-semibold text-purple-700">Cta.Cte.</th>
                                            <th className="text-center py-3 px-4 font-semibold text-red-700">Cancelados</th>
                                            <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reporteCaja.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="text-center py-8 text-gray-500">
                                                    {loading ? 'Cargando...' : 'No hay datos para el período seleccionado'}
                                                </td>
                                            </tr>
                                        ) : (
                                            reporteCaja.map((row, index) => (
                                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-4 text-gray-900">
                                                        {formatearFecha(row.fecha)}
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-900">
                                                        <div className="font-bold text-green-600">
                                                            ${row.efectivo?.toLocaleString('es-AR') || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {row.cantidad_efectivo} pago{row.cantidad_efectivo !== 1 ? 's' : ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-900">
                                                        <div className="font-bold text-blue-600">
                                                            ${row.transferencia?.toLocaleString('es-AR') || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {row.cantidad_transferencia} pago{row.cantidad_transferencia !== 1 ? 's' : ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-right text-gray-900">
                                                        <div className="font-bold text-purple-600">
                                                            ${row.cuenta_corriente?.toLocaleString('es-AR') || 0}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {row.cantidad_cuenta_corriente} uso{row.cantidad_cuenta_corriente !== 1 ? 's' : ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4 text-center">
                                                        <span className="inline-block px-3 py-1 rounded-full bg-red-100 text-red-700 font-semibold">
                                                            {row.cantidad_cancelados}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                                                        ${row.total_dia?.toLocaleString('es-AR') || 0}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de reporte por horario */}
                {tabActiva === 'horario' && (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Cantidad de Autos por Horario y Día
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Muestra la cantidad de autos que ingresaron en cada franja horaria
                            </p>
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
                                                    {loading ? 'Cargando...' : 'No hay datos para el período seleccionado'}
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
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
