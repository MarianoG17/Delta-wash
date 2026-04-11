'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Car, AlertCircle, Ban } from 'lucide-react';
import { getAuthUser, getLoginUrl } from '@/lib/auth-utils';

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
    anulado?: boolean;
    precio?: number;
    metodo_pago?: string;
    pagado?: boolean;
    usa_cuenta_corriente?: boolean;
    motivo_anulacion?: string;
    motivo_cancelacion?: string;
    fecha_anulacion?: string;
}

function HistorialContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [mounted, setMounted] = useState(false);
    const [registros, setRegistros] = useState<Registro[]>([]);
    const [registrosFiltrados, setRegistrosFiltrados] = useState<Registro[]>([]);
    const [loading, setLoading] = useState(true);
    const [clientesSinVisitar, setClientesSinVisitar] = useState<any[]>([]);
    const [userId, setUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string>('operador');
    const [fechaFiltro, setFechaFiltro] = useState<string | null>(null);
    const [filtroEstado, setFiltroEstado] = useState<string>('todos');
    const [itemsVisibles, setItemsVisibles] = useState<number>(50);
    const [editandoPago, setEditandoPago] = useState<number | null>(null);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const user = getAuthUser();
            if (!user) {
                router.push(getLoginUrl());
            } else {
                setUserId(user.id);
                setUserRole(user.rol);

                // Obtener fecha del parámetro URL si existe
                const fechaParam = searchParams.get('fecha');
                if (fechaParam) {
                    setFechaFiltro(fechaParam);
                }

                cargarDatos();
            }
        }
    }, [router, searchParams]);

    const cargarDatos = async () => {
        try {
            // Obtener token para autenticación
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            // Cargar todos los registros (incluyendo anulados para el historial)
            const res = await fetch('/api/registros?incluir_anulados=true', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await res.json();
            
            if (data.success && Array.isArray(data.registros)) {
                setRegistros(data.registros);
                // Para análisis de clientes sin visitar, excluir anulados
                const registrosActivos = data.registros.filter((r: Registro) => !r.anulado);
                analizarClientesSinVisitar(registrosActivos);
            } else {
                console.error('Error en respuesta de API:', data);
                setRegistros([]);
                setClientesSinVisitar([]);
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            setRegistros([]);
            setClientesSinVisitar([]);
        } finally {
            setLoading(false);
        }
    };

    // Filtrar registros cuando cambia la fecha
    useEffect(() => {
        let filtrados = registros;

        // Filtro por fecha
        if (fechaFiltro && registros.length > 0) {
            filtrados = filtrados.filter((r) => {
                if (!r.fecha_entregado) return false;
                const fechaEntregado = new Date(r.fecha_entregado).toISOString().split('T')[0];
                return fechaEntregado === fechaFiltro;
            });
        }

        // Filtro por estado (cancelados/anulados)
        if (filtroEstado === 'cancelados_anulados') {
            filtrados = filtrados.filter((r) => r.anulado || r.estado === 'cancelado');
        }

        setItemsVisibles(50);
        setRegistrosFiltrados(filtrados);
    }, [fechaFiltro, filtroEstado, registros]);

    const limpiarFiltro = () => {
        setFechaFiltro(null);
        // Actualizar URL sin el parámetro fecha
        router.push('/historial');
    };

    const anularRegistro = async (id: number) => {
        const motivo = prompt('⚠️ ¿Por qué se anula este registro?\n\nEl registro quedará marcado como anulado y NO se contará en estadísticas ni facturación.\nSi usó cuenta corriente, se revertirá el saldo.');

        if (motivo === null) return; // Usuario canceló

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/anular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id, motivo, usuario_id: userId }),
            });

            const data = await res.json();

            if (data.success) {
                let mensaje = '✅ Registro anulado exitosamente';
                if (data.saldo_revertido) {
                    mensaje += `\n💰 Saldo revertido: $${data.saldo_revertido.toLocaleString('es-AR')}`;
                }
                alert(mensaje);
                cargarDatos(); // Recargar la lista
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al anular registro');
        }
    };

    const actualizarMetodoPago = async (id: number, metodo_pago: string) => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/registrar-pago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id, metodo_pago }),
            });
            const data = await res.json();
            if (data.success) {
                setEditandoPago(null);
                cargarDatos();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al actualizar forma de pago');
        }
    };

    const analizarClientesSinVisitar = (registros: Registro[]) => {
        const hoy = new Date();
        const hace15Dias = new Date(hoy.getTime() - 15 * 24 * 60 * 60 * 1000);

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

        // Filtrar clientes que no visitaron en más de 15 días
        const sinVisitar = Array.from(clientesMap.values())
            .filter((cliente) => cliente.ultimaVisita < hace15Dias)
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
                            <h3 className="font-bold text-gray-900">
                                {fechaFiltro ? 'Registros del día' : 'Total Registros'}
                            </h3>
                            <Car className="text-blue-600" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{registrosFiltrados.length}</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Entregados</h3>
                            <Calendar className="text-green-600" size={24} />
                        </div>
                        <p className="text-3xl font-bold text-green-600">
                            {registrosFiltrados.filter((r) => r.estado === 'entregado').length}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-xl">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-gray-900">Sin visitar +15 días</h3>
                            <AlertCircle className="text-orange-600" size={24} />
                        </div>
                        <Link
                            href="/reportes"
                            className="text-3xl font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors cursor-pointer"
                            title="Ver reporte completo en Reportes"
                        >
                            {clientesSinVisitar.length}
                        </Link>
                        <p className="text-xs text-gray-500 mt-2">
                            Click para ver en Reportes →
                        </p>
                    </div>
                </div>

                {/* Banner de filtro por fecha activo */}
                {fechaFiltro && (
                    <div className="border-l-4 p-4 mb-6 rounded-lg bg-blue-50 border-blue-500">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Calendar className="text-blue-500 mr-3" size={24} />
                                <div>
                                    <p className="text-sm font-semibold text-blue-700">
                                        Filtrado por fecha de entrega
                                    </p>
                                    <p className="text-sm text-blue-600">
                                        Mostrando registros del: <strong>{(() => {
                                            const [year, month, day] = fechaFiltro.split('-');
                                            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                            return date.toLocaleDateString('es-AR', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            });
                                        })()}</strong>
                                    </p>
                                    <p className="text-xs mt-1 text-blue-500">
                                        {registrosFiltrados.length} registro(s) encontrado(s)
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={limpiarFiltro}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                            >
                                Ver todos
                            </button>
                        </div>
                    </div>
                )}

                {/* Filtros de estado */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    <button
                        onClick={() => setFiltroEstado('todos')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === 'todos' ? 'bg-white text-blue-700 shadow' : 'bg-white/30 text-white hover:bg-white/40'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => setFiltroEstado('cancelados_anulados')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filtroEstado === 'cancelados_anulados' ? 'bg-white text-red-700 shadow' : 'bg-white/30 text-white hover:bg-white/40'}`}
                    >
                        🚫 Cancelados / Anulados
                    </button>
                </div>

                {/* Historial completo */}
                <div id="historial-tabla" className="bg-white rounded-2xl shadow-xl p-6 scroll-mt-4">
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
                                        Vehículo
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
                                        Importe
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Forma de Pago
                                    </th>
                                    <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                        Estado
                                    </th>
                                    {userRole === 'admin' && (
                                        <th className="text-center py-3 px-2 font-semibold text-gray-700">
                                            Acción
                                        </th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {registrosFiltrados.slice(0, itemsVisibles).map((registro) => (
                                    <tr key={registro.id} className={`border-b border-gray-100 hover:bg-gray-50 ${registro.anulado ? 'bg-red-50 opacity-60' : ''}`}>
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
                                        <td className="py-3 px-2 text-sm">
                                            <a
                                                href={`https://wa.me/549${registro.celular.replace(/\D/g, '')}?text=${encodeURIComponent('Hola!')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-mono text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
                                                title="Enviar WhatsApp"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                </svg>
                                                {registro.celular}
                                            </a>
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-900">
                                            {registro.tipo_limpieza.replace(/_/g, ' ')}
                                        </td>
                                        <td className="py-3 px-2 text-sm font-semibold text-blue-600">
                                            {registro.precio ? `$${registro.precio.toLocaleString('es-AR')}` : '-'}
                                        </td>
                                        <td className="py-3 px-2 text-sm text-gray-900">
                                            {userRole === 'admin' && !registro.anulado && editandoPago === registro.id ? (
                                                <div className="flex gap-1 items-center">
                                                    <select
                                                        defaultValue={registro.metodo_pago || ''}
                                                        onChange={(e) => actualizarMetodoPago(registro.id, e.target.value)}
                                                        className="px-2 py-1 border border-gray-300 rounded text-xs text-gray-900 focus:ring-1 focus:ring-blue-500"
                                                    >
                                                        <option value="efectivo">💵 Efectivo</option>
                                                        <option value="transferencia">🏦 Transferencia</option>
                                                        <option value="cuenta_corriente">💳 Cta.Cte.</option>
                                                    </select>
                                                    <button onClick={() => setEditandoPago(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1">
                                                    {registro.usa_cuenta_corriente ? (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">💳 Cta.Cte.</span>
                                                    ) : registro.metodo_pago === 'efectivo' ? (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">💵 Efectivo</span>
                                                    ) : registro.metodo_pago === 'transferencia' ? (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">🏦 Transferencia</span>
                                                    ) : registro.pagado ? (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">✓ Pagado</span>
                                                    ) : (
                                                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">⏳ Pendiente</span>
                                                    )}
                                                    {userRole === 'admin' && !registro.anulado && (
                                                        <button
                                                            onClick={() => setEditandoPago(registro.id)}
                                                            className="text-xs text-gray-400 hover:text-blue-500 ml-1"
                                                            title="Editar forma de pago"
                                                        >✏️</button>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-2">
                                            {registro.anulado ? (
                                                <div>
                                                    <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                                                        🚫 ANULADO
                                                    </span>
                                                    {userRole === 'admin' && registro.motivo_anulacion && (
                                                        <p className="text-xs text-red-500 mt-1 max-w-[140px]" title={registro.motivo_anulacion}>
                                                            💬 {registro.motivo_anulacion.length > 40 ? registro.motivo_anulacion.slice(0, 40) + '…' : registro.motivo_anulacion}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <div>
                                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                                        registro.estado === 'entregado' ? 'bg-green-100 text-green-700'
                                                        : registro.estado === 'listo' ? 'bg-orange-100 text-orange-700'
                                                        : registro.estado === 'cancelado' ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                    }`}>
                                                        {registro.estado === 'entregado' ? '✓ Entregado'
                                                        : registro.estado === 'listo' ? '⚠ Listo'
                                                        : registro.estado === 'cancelado' ? '✕ Cancelado'
                                                        : '⏳ En proceso'}
                                                    </span>
                                                    {userRole === 'admin' && registro.estado === 'cancelado' && registro.motivo_cancelacion && (
                                                        <p className="text-xs text-red-400 mt-1 max-w-[140px]" title={registro.motivo_cancelacion}>
                                                            💬 {registro.motivo_cancelacion.length > 40 ? registro.motivo_cancelacion.slice(0, 40) + '…' : registro.motivo_cancelacion}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        {userRole === 'admin' && (
                                            <td className="py-3 px-2 text-center">
                                                {!registro.anulado && (
                                                    <button
                                                        onClick={() => anularRegistro(registro.id)}
                                                        className="inline-flex items-center gap-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                                        title="Anular registro (no cuenta en estadísticas)"
                                                    >
                                                        <Ban size={16} />
                                                        Anular
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {registrosFiltrados.length > itemsVisibles && (
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setItemsVisibles(prev => prev + 50)}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Cargar más ({registrosFiltrados.length - itemsVisibles} restantes)
                            </button>
                        </div>
                    )}
                    <p className="text-xs text-gray-400 mt-3 text-center">
                        Mostrando {Math.min(itemsVisibles, registrosFiltrados.length)} de {registrosFiltrados.length} registros
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function Historial() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        }>
            <HistorialContent />
        </Suspense>
    );
}
