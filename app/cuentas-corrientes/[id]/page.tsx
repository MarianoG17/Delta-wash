'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

interface Movimiento {
    id: number;
    tipo: string;
    monto: number;
    saldo_anterior: number;
    saldo_nuevo: number;
    descripcion: string;
    fecha_movimiento: string;
    registro_id?: number;
    patente?: string;
    marca_modelo?: string;
    tipo_limpieza?: string;
    usuario_nombre?: string;
}

interface Cuenta {
    id: number;
    cliente_nombre: string;
    celular: string;
    saldo_actual: number;
    fecha_creacion: string;
    fecha_actualizacion: string;
}

export default function MovimientosCuentaCorriente() {
    const router = useRouter();
    const params = useParams();
    const cuentaId = params.id as string;
    
    const [cuenta, setCuenta] = useState<Cuenta | null>(null);
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('lavadero_user');
            if (!session) {
                router.push('/login');
            } else {
                const data = JSON.parse(session);
                if (data.rol !== 'admin') {
                    router.push('/');
                } else {
                    cargarMovimientos();
                }
            }
        }
    }, [router, cuentaId]);

    const cargarMovimientos = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/cuentas-corrientes/movimientos?cuenta_id=${cuentaId}`);
            const data = await res.json();

            if (data.success) {
                setCuenta(data.cuenta);
                setMovimientos(data.movimientos);
            } else {
                alert('Error al cargar movimientos');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cargar movimientos');
        } finally {
            setLoading(false);
        }
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link
                        href="/cuentas-corrientes"
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                    >
                        <ArrowLeft size={18} />
                        <span className="text-sm">Volver</span>
                    </Link>
                    <div className="text-white">
                        <div className="flex items-center gap-2">
                            <Wallet size={32} />
                            <h1 className="text-3xl font-bold">Movimientos de Cuenta Corriente</h1>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <p className="text-gray-600">Cargando movimientos...</p>
                    </div>
                ) : cuenta ? (
                    <>
                        {/* Info de la Cuenta */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                        {cuenta.cliente_nombre}
                                    </h2>
                                    <p className="text-gray-600">
                                        📱 {cuenta.celular}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-600 mb-1">Saldo Actual</p>
                                    <p className={`text-4xl font-bold ${parseFloat(cuenta.saldo_actual.toString()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        ${parseFloat(cuenta.saldo_actual.toString()).toLocaleString('es-AR')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Lista de Movimientos */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">
                                Historial de Movimientos ({movimientos.length})
                            </h3>

                            {movimientos.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No hay movimientos registrados
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {movimientos.map((mov) => (
                                        <div
                                            key={mov.id}
                                            className={`border rounded-lg p-4 ${
                                                mov.tipo === 'carga' 
                                                    ? 'border-green-200 bg-green-50' 
                                                    : 'border-blue-200 bg-blue-50'
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        {mov.tipo === 'carga' ? (
                                                            <TrendingUp className="text-green-600" size={20} />
                                                        ) : (
                                                            <TrendingDown className="text-blue-600" size={20} />
                                                        )}
                                                        <span className={`font-bold ${
                                                            mov.tipo === 'carga' ? 'text-green-700' : 'text-blue-700'
                                                        }`}>
                                                            {mov.tipo === 'carga' ? 'CARGA DE CRÉDITO' : 'LAVADO'}
                                                        </span>
                                                    </div>
                                                    
                                                    {mov.tipo === 'descuento' && mov.patente && (
                                                        <div className="text-sm text-gray-700 ml-7">
                                                            <p className="font-semibold">
                                                                🚗 {mov.marca_modelo} - {mov.patente}
                                                            </p>
                                                            <p className="text-xs text-gray-600">
                                                                {mov.tipo_limpieza}
                                                            </p>
                                                        </div>
                                                    )}
                                                    
                                                    {mov.descripcion && (
                                                        <p className="text-sm text-gray-600 ml-7">
                                                            {mov.descripcion}
                                                        </p>
                                                    )}
                                                    
                                                    {mov.usuario_nombre && (
                                                        <p className="text-xs text-gray-500 ml-7 mt-1">
                                                            Por: {mov.usuario_nombre}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="text-right ml-4">
                                                    <p className={`text-2xl font-bold ${
                                                        mov.tipo === 'carga' ? 'text-green-600' : 'text-blue-600'
                                                    }`}>
                                                        {mov.tipo === 'carga' ? '+' : '-'}${parseFloat(mov.monto.toString()).toLocaleString('es-AR')}
                                                    </p>
                                                    <div className="text-xs text-gray-600 mt-1">
                                                        <p>Anterior: ${parseFloat(mov.saldo_anterior.toString()).toLocaleString('es-AR')}</p>
                                                        <p className="font-semibold">Nuevo: ${parseFloat(mov.saldo_nuevo.toString()).toLocaleString('es-AR')}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                                                <Calendar size={12} />
                                                <span>{new Date(mov.fecha_movimiento).toLocaleString('es-AR')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <p className="text-red-600">Cuenta corriente no encontrada</p>
                    </div>
                )}
            </div>
        </div>
    );
}
