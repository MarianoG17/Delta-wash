'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, TrendingUp, Send, Settings } from 'lucide-react';
import { getAuthUser, clearAuth, getLoginUrl } from '@/lib/auth-utils';

interface Encuesta {
    id: number;
    token: string;
    createdAt: string;
    sentAt: string | null;
    respondedAt: string | null;
    clientPhone: string;
    clientName: string;
    vehicle: string;
    patente: string;
    rating: number | null;
    comment: string | null;
    status: 'creada' | 'disparada' | 'respondida';
    surveyUrl?: string;
    whatsappUrl?: string;
    beneficioEstado?: string | null;
    beneficioFechaCanje?: string | null;
}

interface Estadisticas {
    totalEncuestas: number;
    encuestasRespondidas: number;
    encuestasEnviadas: number;
    promedioRating: number;
    tasaRespuesta: number;
    distribucionRatings: Record<string, number>;
}

interface SurveyConfig {
    enabled: boolean;
    brand_name: string;
    whatsapp_message: string;
    discount_percentage: number;
    google_maps_url: string;
}

export default function ReporteEncuestas() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [empresaNombre, setEmpresaNombre] = useState<string>('DeltaWash');
    const [empresaSlug, setEmpresaSlug] = useState<string>('lavadero');

    // Estados para configuración
    const [showConfig, setShowConfig] = useState(false);
    const [loadingConfig, setLoadingConfig] = useState(false);
    const [savingConfig, setSavingConfig] = useState(false);
    const [config, setConfig] = useState<SurveyConfig>({
        enabled: true,
        brand_name: 'DeltaWash',
        whatsapp_message: 'Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)',
        discount_percentage: 10,
        google_maps_url: 'https://maps.app.goo.gl/AJ4h1s9e38LzLsP36'
    });

    useEffect(() => {
        const user = getAuthUser();
        if (!user) {
            router.push(getLoginUrl());
            return;
        }

        if (user.isSaas) {
            const nombreEmpresa = localStorage.getItem('empresaNombre');
            if (nombreEmpresa) setEmpresaNombre(nombreEmpresa);

            const slug = localStorage.getItem('empresaSlug');
            if (slug) setEmpresaSlug(slug);
        }

        // ✨ Restaurar estado de encuestas desde localStorage
        const savedEncuestas = localStorage.getItem('encuestasEstado');
        if (savedEncuestas) {
            try {
                setEncuestas(JSON.parse(savedEncuestas));
            } catch (e) {
                console.error('Error al parsear encuestasEstado desde localStorage', e);
            }
        }

        cargarReporte();
        cargarConfiguracion();
    }, [router]);

    const cargarConfiguracion = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/survey-config', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success && data.config) {
                    setConfig(data.config);
                }
            }
        } catch (error) {
            console.error('Error al cargar configuración:', error);
        }
    };

    const guardarConfiguracion = async () => {
        setSavingConfig(true);
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/survey-config', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify(config)
            });

            if (res.ok) {
                alert('✅ Configuración guardada exitosamente');
                setShowConfig(false);
            } else {
                throw new Error('Error al guardar');
            }
        } catch (error) {
            console.error('Error al guardar configuración:', error);
            alert('❌ Error al guardar la configuración');
        } finally {
            setSavingConfig(false);
        }
    };

    const cargarReporte = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/reportes/encuestas', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });

            if (!res.ok) throw new Error('Error al cargar reporte');

            const data = await res.json();

            // 🔄 Mergear con estados locales (para mantener optimistic updates)
            const savedEncuestas = localStorage.getItem('encuestasEstado');
            let encuestasLocales: Record<number, Encuesta> = {};

            if (savedEncuestas) {
                try {
                    const parsed = JSON.parse(savedEncuestas);
                    parsed.forEach((enc: Encuesta) => {
                        encuestasLocales[enc.id] = enc;
                    });
                } catch (e) {
                    console.error('Error al parsear encuestasEstado', e);
                }
            }

            // Mergear: priorizar estado del servidor, pero mantener sentAt local si es más reciente
            const encuestasMerged = data.encuestas.map((encAPI: Encuesta) => {
                const encLocal = encuestasLocales[encAPI.id];
                if (encLocal && encLocal.sentAt && !encAPI.sentAt) {
                    // Si tenemos sentAt local pero no en API, usar el local
                    return { ...encAPI, sentAt: encLocal.sentAt, status: 'disparada' as const };
                }
                return encAPI;
            });

            setEncuestas(encuestasMerged);
            setEstadisticas(data.estadisticas);

            // 💾 Guardar estado merged en localStorage
            localStorage.setItem('encuestasEstado', JSON.stringify(encuestasMerged));
        } catch (error) {
            console.error('Error al cargar reporte:', error);
            alert('Error al cargar el reporte de encuestas');
        } finally {
            setLoading(false);
        }
    };

    const enviarEncuesta = async (encuesta: Encuesta) => {
        // Generar URLs - ruta directa sin slug para compatibilidad universal
        const baseUrl = window.location.origin;
        const surveyUrl = `${baseUrl}/survey/${encuesta.token}`;
        const whatsappMessage = `${config.whatsapp_message}\n👉 ${surveyUrl}`;

        // Formatear número de teléfono para Argentina: 549 + número sin el primer 0
        const phoneClean = encuesta.clientPhone.replace(/\D/g, ''); // Solo dígitos
        const whatsappUrl = `https://wa.me/549${phoneClean}?text=${encodeURIComponent(whatsappMessage)}`;

        // ✨ ACTUALIZACIÓN OPTIMISTA: Marcar como enviada en la UI ANTES de abrir WhatsApp
        const encuestasActualizadas = encuestas.map(enc =>
            enc.id === encuesta.id
                ? { ...enc, sentAt: new Date().toISOString(), status: 'disparada' as const }
                : enc
        );
        setEncuestas(encuestasActualizadas);

        // 💾 PERSISTIR en localStorage para que sobreviva a recargas de página
        localStorage.setItem('encuestasEstado', JSON.stringify(encuestasActualizadas));

        // Abrir WhatsApp DESPUÉS de actualizar el estado
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) {
            window.location.href = whatsappUrl;
        } else {
            window.open(whatsappUrl, '_blank');
        }

        // Marcar como enviada en el backend
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            await fetch('/api/surveys/mark-sent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ surveyId: encuesta.id })
            });
        } catch (error) {
            console.error('Error al marcar encuesta como enviada:', error);
        }
    };

    const renderStars = (rating: number | null) => {
        if (!rating) return <span className="text-gray-400">Sin calificar</span>;
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'respondida':
                return 'bg-green-100 text-green-700';
            case 'disparada':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'respondida':
                return '✅ Respondida';
            case 'disparada':
                return '📤 Enviada';
            default:
                return '📋 Creada';
        }
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
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                📊 Reporte de Encuestas
                            </h1>
                            <p className="text-gray-600">{empresaNombre}</p>
                        </div>
                        <button
                            onClick={() => {
                                setShowConfig(!showConfig);
                                // Recargar configuración al abrir el modal
                                if (!showConfig) {
                                    cargarConfiguracion();
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                        >
                            <Settings size={20} />
                            Configuración
                        </button>
                    </div>
                </div>

                {/* Estadísticas */}
                {estadisticas && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Total Encuestas</p>
                            <p className="text-3xl font-bold text-blue-600">{estadisticas.totalEncuestas}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Respondidas</p>
                            <p className="text-3xl font-bold text-green-600">{estadisticas.encuestasRespondidas}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Tasa: {estadisticas.tasaRespuesta}%
                            </p>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Promedio Rating</p>
                            <div className="flex items-center gap-2">
                                <p className="text-3xl font-bold text-yellow-600">
                                    {estadisticas.promedioRating.toFixed(1)}
                                </p>
                                <Star className="fill-yellow-400 text-yellow-400" size={24} />
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <p className="text-sm text-gray-600 mb-2">Distribución</p>
                            <div className="space-y-1">
                                {Object.entries(estadisticas.distribucionRatings).reverse().map(([rating, count]) => (
                                    <div key={rating} className="flex items-center gap-2 text-xs">
                                        <span className="w-3">{rating}★</span>
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-yellow-400 h-2 rounded-full"
                                                style={{
                                                    width: `${estadisticas.totalEncuestas > 0 ? (count / estadisticas.totalEncuestas) * 100 : 0}%`
                                                }}
                                            />
                                        </div>
                                        <span className="w-8 text-right">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Modal de configuración */}
                {showConfig && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-900">⚙️ Configuración de Encuestas</h2>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Toggle Sistema de Encuestas */}
                                <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <label className="text-sm font-bold text-gray-900">Sistema de Encuestas</label>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {config.enabled
                                                    ? 'Las encuestas se envían automáticamente después de cada lavado'
                                                    : 'El sistema está desactivado. No se enviarán ni generarán encuestas'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
                                            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${config.enabled ? 'bg-green-600' : 'bg-gray-300'
                                                }`}
                                        >
                                            <span
                                                className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${config.enabled ? 'translate-x-7' : 'translate-x-1'
                                                    }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Nombre de marca */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de tu marca
                                    </label>
                                    <input
                                        type="text"
                                        value={config.brand_name}
                                        onChange={(e) => setConfig({ ...config, brand_name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="DeltaWash"
                                    />
                                </div>

                                {/* Mensaje WhatsApp */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Mensaje de WhatsApp
                                    </label>
                                    <textarea
                                        value={config.whatsapp_message}
                                        onChange={(e) => setConfig({ ...config, whatsapp_message: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Gracias por confiar en nosotros..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Se agregará automáticamente el link de la encuesta al final
                                    </p>
                                </div>

                                {/* Porcentaje de descuento */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descuento por completar encuesta (%)
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={config.discount_percentage}
                                        onChange={(e) => setConfig({ ...config, discount_percentage: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Este descuento se aplicará en la próxima visita del cliente
                                    </p>
                                </div>

                                {/* URL Google Maps */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link de Google Maps (opcional)
                                    </label>
                                    <input
                                        type="url"
                                        value={config.google_maps_url}
                                        onChange={(e) => setConfig({ ...config, google_maps_url: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="https://maps.app.goo.gl/..."
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Se mostrará después de encuestas con 4-5 estrellas
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 border-t border-gray-200 flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowConfig(false);
                                        cargarConfiguracion(); // Recargar config original
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition-colors"
                                    disabled={savingConfig}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={guardarConfiguracion}
                                    disabled={savingConfig}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {savingConfig ? 'Guardando...' : 'Guardar Configuración'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabla de encuestas */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">Detalle de Encuestas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Fecha
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente / Vehículo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Rating
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comentario
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Beneficio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {encuestas.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                                            No hay encuestas registradas
                                        </td>
                                    </tr>
                                ) : (
                                    encuestas.map((encuesta) => (
                                        <tr key={encuesta.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {new Date(encuesta.createdAt).toLocaleDateString('es-AR')}
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <p className="font-semibold text-gray-900">{encuesta.clientName}</p>
                                                <p className="text-gray-600">{encuesta.vehicle}</p>
                                                <p className="text-xs text-gray-500">{encuesta.patente}</p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(encuesta.status)}`}>
                                                    {getStatusLabel(encuesta.status)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {renderStars(encuesta.rating)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                                                {encuesta.comment ? (
                                                    <div className="group relative">
                                                        <p className="line-clamp-2 cursor-help">
                                                            {encuesta.comment}
                                                        </p>
                                                        {encuesta.comment.length > 50 && (
                                                            <div className="invisible group-hover:visible absolute z-10 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl -top-2 left-full ml-2">
                                                                {encuesta.comment}
                                                                <div className="absolute top-3 -left-1 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400">Sin comentario</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {encuesta.beneficioEstado === 'redeemed' ? (
                                                    <div>
                                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                                                            ✓ Canjeado
                                                        </span>
                                                        {encuesta.beneficioFechaCanje && (
                                                            <div className="text-xs text-gray-600 mt-1">
                                                                {new Date(encuesta.beneficioFechaCanje).toLocaleDateString('es-AR')}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : encuesta.beneficioEstado === 'pending' ? (
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                        ⏳ Pendiente
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {/* ESTADO 3: Respondida (no se puede reenviar) */}
                                                {encuesta.respondedAt ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-lg border border-green-300">
                                                        ✅ Respondida
                                                    </span>
                                                ) : encuesta.sentAt ? (
                                                    /* ESTADO 2: Enviada - clickeable para reenviar */
                                                    <button
                                                        onClick={() => enviarEncuesta(encuesta)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 text-xs font-semibold rounded-lg border border-yellow-300 transition-colors cursor-pointer"
                                                        title="Click para reenviar"
                                                    >
                                                        <Send size={14} />
                                                        ✅ Enviada (reenviar)
                                                    </button>
                                                ) : (
                                                    /* ESTADO 1: No enviada */
                                                    <button
                                                        onClick={() => enviarEncuesta(encuesta)}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded-lg transition-colors"
                                                    >
                                                        <Send size={14} />
                                                        WhatsApp
                                                    </button>
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
