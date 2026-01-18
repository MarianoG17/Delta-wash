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

    // Filtrar registros cuando cambia la fecha o los registros
    useEffect(() => {
        if (fechaFiltro && registros.length > 0) {
            const filtrados = registros.filter((r) => {
                if (!r.fecha_entregado) return false;
                const fechaEntregado = new Date(r.fecha_entregado).toISOString().split('T')[0];
                return fechaEntregado === fechaFiltro;
            });
            setRegistrosFiltrados(filtrados);
        } else {
            setRegistrosFiltrados(registros);
        }
    }, [fechaFiltro, registros]);

    const limpiarFiltro = () => {
        setFechaFiltro(null);
        // Actualizar URL sin el parámetro fecha
        router.push('/historial');
    };

    const anularRegistro = async (id: number) => {
        const motivo = prompt('⚠️ ¿Por qué se anula este registro?\n\nEl registro quedará marcado como anulado y NO se contará en estadísticas ni facturación.\nSi usó cuenta corriente, se revertirá el saldo.');

        if (motivo === null) return; // Usuario canceló

        try {
            const res = await fetch('/api/registros/anular', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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

    const enviarWhatsAppReactivacion = (cliente: any) => {
        const mensaje = `Hola ${cliente.nombre}! 👋 Hace tiempo que no te vemos por DeltaWash. ¿Tu ${cliente.marca_modelo} necesita un lavado? 🚗✨ Tenemos promociones especiales para clientes como vos. ¡Te esperamos!`;
        const mensajeCodificado = encodeURIComponent(mensaje);

        let numeroFormateado = cliente.celular.replace(/\D/g, '');
        if (numeroFormateado.startsWith('11')) {
            numeroFormateado = `549${numeroFormateado}`;
        } else if (!numeroFormateado.startsWith('549')) {
            numeroFormateado = `549${numeroFormateado}`;
        }

        const whatsappUrl = `https://wa.me/${numeroFormateado}?text=${mensajeCodificado}`;

        // Detectar iOS para usar location.href en lugar de window.open
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        if (isIOS) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, '_blank');
        }
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
                            <h3 className="font-bold text-gray-900">{fechaFiltro ? 'Registros del día' : 'Total Registros'}</h3>
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
                        <p className="text-3xl font-bold text-orange-600">
                            {clientesSinVisitar.length}
                        </p>
                    </div>
                </div>

                {/* Banner de filtro activo */}
                {fechaFiltro && (
                    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
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
                                    <p className="text-xs text-blue-500 mt-1">
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

                {/* Clientes sin visitar - Tabla */}
                {!fechaFiltro && clientesSinVisitar.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-orange-700 mb-4">
                            📢 Clientes Inactivos (+15 días sin visitar)
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                            Cliente
                                        </th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                            Auto
                                        </th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                            Teléfono
                                        </th>
                                        <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                            Última Visita
                                        </th>
                                        <th className="text-center py-3 px-2 font-semibold text-gray-700">
                                            Días
                                        </th>
                                        <th className="text-center py-3 px-2 font-semibold text-gray-700">
                                            Acción
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clientesSinVisitar.map((cliente, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-orange-50">
                                            <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                                {cliente.nombre}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-900">
                                                {cliente.marca_modelo}
                                                <br />
                                                <span className="text-xs font-mono text-gray-600">{cliente.patente}</span>
                                            </td>
                                            <td className="py-3 px-2 text-sm font-mono text-blue-600">
                                                {cliente.celular}
                                            </td>
                                            <td className="py-3 px-2 text-sm text-gray-900">
                                                {formatFecha(cliente.ultimaVisita.toISOString())}
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-orange-100 text-orange-700">
                                                    {getDiasDesdeVisita(cliente.ultimaVisita)}
                                                </span>
                                            </td>
                                            <td className="py-3 px-2 text-center">
                                                <button
                                                    onClick={() => enviarWhatsAppReactivacion(cliente)}
                                                    className="inline-flex items-center gap-1 px-3 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                                                    </svg>
                                                    Reactivar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                                {registrosFiltrados.map((registro) => (
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
                                            {registro.usa_cuenta_corriente ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 font-medium">
                                                    💳 Cta.Cte.
                                                </span>
                                            ) : registro.metodo_pago === 'efectivo' ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">
                                                    💵 Efectivo
                                                </span>
                                            ) : registro.metodo_pago === 'transferencia' ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                                                    🏦 Transferencia
                                                </span>
                                            ) : registro.pagado ? (
                                                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 font-medium">
                                                    ✓ Pagado
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
                                                    ⏳ Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-2">
                                            {registro.anulado ? (
                                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-red-100 text-red-700">
                                                    🚫 ANULADO
                                                </span>
                                            ) : (
                                                <span
                                                    className={`text-xs px-2 py-1 rounded-full font-medium ${registro.estado === 'entregado'
                                                        ? 'bg-green-100 text-green-700'
                                                        : registro.estado === 'listo'
                                                            ? 'bg-orange-100 text-orange-700'
                                                            : registro.estado === 'cancelado'
                                                                ? 'bg-red-100 text-red-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}
                                                >
                                                    {registro.estado === 'entregado'
                                                        ? '✓ Entregado'
                                                        : registro.estado === 'listo'
                                                            ? '⚠ Listo'
                                                            : registro.estado === 'cancelado'
                                                                ? '✕ Cancelado'
                                                                : '⏳ En proceso'}
                                                </span>
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
