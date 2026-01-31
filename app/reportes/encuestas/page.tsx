'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, MessageSquare, TrendingUp, Send } from 'lucide-react';
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
}

interface Estadisticas {
    totalEncuestas: number;
    encuestasRespondidas: number;
    encuestasEnviadas: number;
    promedioRating: number;
    tasaRespuesta: number;
    distribucionRatings: Record<string, number>;
}

export default function ReporteEncuestas() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [encuestas, setEncuestas] = useState<Encuesta[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [empresaNombre, setEmpresaNombre] = useState<string>('DeltaWash');

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

            const res = await fetch('/api/reportes/encuestas', {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });

            if (!res.ok) throw new Error('Error al cargar reporte');

            const data = await res.json();
            setEncuestas(data.encuestas);
            setEstadisticas(data.estadisticas);
        } catch (error) {
            console.error('Error al cargar reporte:', error);
            alert('Error al cargar el reporte de encuestas');
        } finally {
            setLoading(false);
        }
    };

    const enviarEncuesta = async (encuesta: Encuesta) => {
        if (!encuesta.surveyUrl || !encuesta.whatsappUrl) {
            // Generar URLs si no vienen en la respuesta
            const baseUrl = window.location.origin;
            const surveyUrl = `${baseUrl}/survey/${encuesta.token}`;
            const whatsappMessage = `Gracias por confiar en DeltaWash. ¿Nos dejarías tu opinión? Son solo 10 segundos y a nosotros nos ayuda a mejorar :)\n👉 ${surveyUrl}`;
            const whatsappUrl = `https://wa.me/${encuesta.clientPhone}?text=${encodeURIComponent(whatsappMessage)}`;
            
            // Abrir WhatsApp
            window.open(whatsappUrl, '_blank');
        } else {
            // Usar URLs de la respuesta
            window.open(encuesta.whatsappUrl, '_blank');
        }

        // Marcar como disparada
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
                body: JSON.stringify({ visitId: encuesta.id })
            });

            // Recargar reporte
            cargarReporte();
        } catch (error) {
            console.error('Error al marcar encuesta:', error);
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
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        📊 Reporte de Encuestas
                    </h1>
                    <p className="text-gray-600">{empresaNombre}</p>
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
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {encuestas.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
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
                                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                                                {encuesta.comment || <span className="text-gray-400">Sin comentario</span>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {encuesta.respondedAt ? (
                                                    <span className="text-xs text-green-600 font-semibold">✓ Respondida</span>
                                                ) : (
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
