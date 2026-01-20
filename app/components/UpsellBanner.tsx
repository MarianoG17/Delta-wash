'use client';

import { useState } from 'react';
import { X, Sparkles, TrendingUp, Clock } from 'lucide-react';

interface Promocion {
    id: number;
    nombre: string;
    descripcion: string;
    descuento_porcentaje: number;
    descuento_fijo: number;
    servicios_objetivo: string[];
}

interface ClienteInfo {
    total_visitas: number;
    percentil: string;
    umbral_minimo?: number;
}

interface UpsellBannerProps {
    promocion: Promocion;
    cliente: ClienteInfo;
    clienteNombre: string;
    clienteCelular: string;
    onAceptar: (descuento: number) => void;
    onRechazar: () => void;
    onInteresFuturo: () => void;
    onCerrar: () => void;
}

export default function UpsellBanner({
    promocion,
    cliente,
    clienteNombre,
    clienteCelular,
    onAceptar,
    onRechazar,
    onInteresFuturo,
    onCerrar
}: UpsellBannerProps) {
    const [procesando, setProcesando] = useState(false);

    const calcularDescuento = () => {
        if (promocion.descuento_porcentaje > 0) {
            return { tipo: 'porcentaje', valor: promocion.descuento_porcentaje };
        }
        return { tipo: 'fijo', valor: promocion.descuento_fijo };
    };

    const descuento = calcularDescuento();

    const handleAceptar = async () => {
        setProcesando(true);
        try {
            // Registrar la interacción
            await fetch('/api/upselling/interaccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('lavadero_token')}`
                },
                body: JSON.stringify({
                    cliente_nombre: clienteNombre,
                    cliente_celular: clienteCelular,
                    promocion_id: promocion.id,
                    accion: 'aceptado',
                    descuento_aplicado: descuento.valor
                })
            });

            onAceptar(descuento.valor);
        } catch (error) {
            console.error('Error registrando aceptación:', error);
        } finally {
            setProcesando(false);
        }
    };

    const handleRechazar = async () => {
        setProcesando(true);
        try {
            await fetch('/api/upselling/interaccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('lavadero_token')}`
                },
                body: JSON.stringify({
                    cliente_nombre: clienteNombre,
                    cliente_celular: clienteCelular,
                    promocion_id: promocion.id,
                    accion: 'rechazado'
                })
            });

            onRechazar();
        } catch (error) {
            console.error('Error registrando rechazo:', error);
        } finally {
            setProcesando(false);
        }
    };

    const handleInteresFuturo = async () => {
        setProcesando(true);
        try {
            await fetch('/api/upselling/interaccion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken') || localStorage.getItem('lavadero_token')}`
                },
                body: JSON.stringify({
                    cliente_nombre: clienteNombre,
                    cliente_celular: clienteCelular,
                    promocion_id: promocion.id,
                    accion: 'interes_futuro',
                    notas: 'Cliente mostró interés para próxima visita'
                })
            });

            onInteresFuturo();
        } catch (error) {
            console.error('Error registrando interés futuro:', error);
        } finally {
            setProcesando(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-2xl shadow-2xl max-w-2xl w-full animate-slideIn">
                {/* Header */}
                <div className="relative p-6 pb-4">
                    <button
                        onClick={onCerrar}
                        className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-2 transition-all"
                        disabled={procesando}
                    >
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-3 rounded-full">
                            <Sparkles className="text-yellow-300" size={32} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold text-white">{promocion.nombre}</h2>
                            <div className="flex items-center gap-2 mt-1">
                                <TrendingUp className="text-green-300" size={16} />
                                <p className="text-white/90 text-sm font-semibold">
                                    ¡Sos uno de nuestros mejores clientes!
                                    {cliente.umbral_minimo
                                        ? ` (${cliente.total_visitas} visitas - Top 20%, mín: ${cliente.umbral_minimo})`
                                        : ` (${cliente.total_visitas} visitas)`
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="bg-white rounded-b-2xl p-6">
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-5 mb-6 border-2 border-purple-200">
                        <p className="text-gray-800 text-lg mb-4">
                            {promocion.descripcion}
                        </p>

                        <div className="bg-white rounded-lg p-4 border-2 border-dashed border-purple-300">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 font-semibold">Tu descuento exclusivo:</span>
                                <span className="text-4xl font-bold text-purple-600">
                                    {descuento.tipo === 'porcentaje' ? `${descuento.valor}%` : `$${descuento.valor.toLocaleString('es-AR')}`}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Servicios disponibles */}
                    <div className="mb-6">
                        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Sparkles className="text-purple-600" size={20} />
                            Servicios Premium incluidos:
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {promocion.servicios_objetivo.map((servicio, idx) => (
                                <div key={idx} className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                                    <p className="text-sm font-semibold text-purple-900 capitalize text-center">
                                        🌟 {servicio === 'chasis' ? 'Limpieza de Chasis' :
                                            servicio === 'motor' ? 'Limpieza de Motor' :
                                                'Pulido de Ópticas'}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <button
                            onClick={handleAceptar}
                            disabled={procesando}
                            className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 px-6 rounded-xl hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                            {procesando ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    Aplicando...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    ✓ ¡Aplicar descuento!
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleInteresFuturo}
                            disabled={procesando}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <Clock size={20} />
                                Próxima vez
                            </span>
                        </button>

                        <button
                            onClick={handleRechazar}
                            disabled={procesando}
                            className="bg-gray-200 text-gray-700 font-bold py-4 px-6 rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            No, gracias
                        </button>
                    </div>

                    <p className="text-xs text-gray-500 text-center mt-4">
                        💡 Esta oferta es exclusiva para clientes frecuentes como vos
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideIn {
                    from {
                        transform: translateY(-50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }

                .animate-slideIn {
                    animation: slideIn 0.4s ease-out;
                }
            `}</style>
        </div>
    );
}
