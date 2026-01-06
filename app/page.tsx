'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, LogOut, History, Plus, Send, Users } from 'lucide-react';

interface Registro {
    id: number;
    marca_modelo: string;
    patente: string;
    tipo_limpieza: string;
    nombre_cliente: string;
    celular: string;
    fecha_ingreso: string;
    estado: string;
}

export default function Home() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string>('operador');
    const [mounted, setMounted] = useState(false);

    // Form states
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [patente, setPatente] = useState('');
    const [tiposLimpieza, setTiposLimpieza] = useState<string[]>([]);
    const [nombreCliente, setNombreCliente] = useState('');
    const [celular, setCelular] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Registros en proceso y listos
    const [registrosEnProceso, setRegistrosEnProceso] = useState<Registro[]>([]);
    const [registrosListos, setRegistrosListos] = useState<Registro[]>([]);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('lavadero_user');
            if (!session) {
                router.push('/login');
            } else {
                const data = JSON.parse(session);
                setUsername(data.nombre || data.username);
                setUserId(data.id);
                setUserRole(data.rol || 'operador');
                cargarRegistrosEnProceso();
            }
        }
    }, [router]);

    const cargarRegistrosEnProceso = async () => {
        try {
            const resEnProceso = await fetch('/api/registros?estado=en_proceso');
            const dataEnProceso = await resEnProceso.json();
            if (dataEnProceso.success) {
                setRegistrosEnProceso(dataEnProceso.registros);
            }

            const resListos = await fetch('/api/registros?estado=listo');
            const dataListos = await resListos.json();
            if (dataListos.success) {
                setRegistrosListos(dataListos.registros);
            }
        } catch (error) {
            console.error('Error cargando registros:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (tiposLimpieza.length === 0) {
            setMessage('❌ Debes seleccionar al menos un tipo de limpieza');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/registros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marca_modelo: `${marca} ${modelo}`.trim(),
                    patente: patente.toUpperCase(),
                    tipo_limpieza: tiposLimpieza.join(', '),
                    nombre_cliente: nombreCliente,
                    celular: celular,
                    usuario_id: userId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage('✅ Auto registrado exitosamente');
                // Limpiar formulario
                setMarca('');
                setModelo('');
                setPatente('');
                setTiposLimpieza([]);
                setNombreCliente('');
                setCelular('');
                // Recargar registros
                cargarRegistrosEnProceso();
            } else {
                setMessage('❌ ' + data.message);
            }
        } catch (error) {
            setMessage('❌ Error al registrar el auto');
        } finally {
            setLoading(false);
        }
    };

    const marcarComoListo = async (id: number) => {
        try {
            const res = await fetch('/api/registros/marcar-listo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (data.success) {
                alert('✅ Auto marcado como listo');
                cargarRegistrosEnProceso();
            } else {
                alert('❌ Error al marcar como listo');
            }
        } catch (error) {
            alert('❌ Error al marcar como listo');
        }
    };

    const enviarWhatsApp = async (id: number) => {
        try {
            const res = await fetch('/api/registros/enviar-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (data.success) {
                // Detectar iOS para usar location.href en lugar de window.open
                const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
                
                if (isIOS) {
                    window.location.href = data.whatsappUrl;
                } else {
                    window.open(data.whatsappUrl, '_blank');
                }
            } else {
                alert('❌ Error al generar link de WhatsApp');
            }
        } catch (error) {
            alert('❌ Error al generar link de WhatsApp');
        }
    };

    const marcarComoEntregado = async (id: number) => {
        if (!confirm('¿Marcar este auto como entregado?')) {
            return;
        }

        try {
            const res = await fetch('/api/registros/marcar-entregado', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (data.success) {
                alert('✅ Auto marcado como entregado');
                cargarRegistrosEnProceso();
            } else {
                alert('❌ Error al marcar como entregado');
            }
        } catch (error) {
            alert('❌ Error al marcar como entregado');
        }
    };

    const cancelarRegistro = async (id: number) => {
        const motivo = prompt('¿Por qué se cancela? (opcional)');
        if (motivo === null) return; // Usuario canceló el prompt

        try {
            const res = await fetch('/api/registros/cancelar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, motivo }),
            });

            const data = await res.json();

            if (data.success) {
                alert('✅ Registro cancelado');
                cargarRegistrosEnProceso();
            } else {
                alert('❌ Error al cancelar registro');
            }
        } catch (error) {
            alert('❌ Error al cancelar registro');
        }
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('lavadero_user');
        }
        router.push('/login');
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Car size={32} />
                            <h1 className="text-3xl font-bold">DeltaWash</h1>
                        </div>
                        <p className="text-sm opacity-90">Bienvenido/a, {username}</p>
                    </div>
                    <div className="flex gap-2">
                        {userRole === 'admin' && (
                            <>
                                <Link
                                    href="/clientes"
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                                >
                                    <Users size={18} />
                                    <span className="text-sm">Clientes</span>
                                </Link>
                                <Link
                                    href="/historial"
                                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                                >
                                    <History size={18} />
                                    <span className="text-sm">Historial</span>
                                </Link>
                            </>
                        )}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                            <span className="text-sm">Salir</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Formulario de Registro */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Plus className="text-blue-600" size={24} />
                            <h2 className="text-2xl font-bold text-gray-900">Nuevo Registro</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Patente
                                </label>
                                <input
                                    type="text"
                                    value={patente}
                                    onChange={async (e) => {
                                        const value = e.target.value.toUpperCase();
                                        setPatente(value);

                                        // Buscar automáticamente cuando la patente tiene 6 o 7 caracteres
                                        if (value.length >= 6) {
                                            try {
                                                const res = await fetch(`/api/registros/buscar-patente?patente=${value}`);
                                                const data = await res.json();

                                                if (data.found) {
                                                    setMarca(data.data.marca);
                                                    setModelo(data.data.modelo);
                                                    setNombreCliente(data.data.nombre_cliente);
                                                    setCelular(data.data.celular);
                                                    setMessage('✅ Cliente encontrado! Datos autocompletados');
                                                    setTimeout(() => setMessage(''), 3000);
                                                }
                                            } catch (error) {
                                                console.error('Error buscando patente:', error);
                                            }
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase text-gray-900"
                                    placeholder="ABC123"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Se autocompletarán los datos si el cliente ya visitó
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Marca
                                    </label>
                                    <input
                                        type="text"
                                        value={marca}
                                        onChange={(e) => setMarca(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Toyota"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Modelo
                                    </label>
                                    <input
                                        type="text"
                                        value={modelo}
                                        onChange={(e) => setModelo(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Corolla"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Tipos de Limpieza (puedes seleccionar varios)
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'simple', label: 'Simple (solo por fuera)' },
                                        { value: 'con_cera', label: 'Con Cera' },
                                        { value: 'pulido', label: 'Pulido' },
                                        { value: 'limpieza_chasis', label: 'Limpieza de Chasis' },
                                        { value: 'limpieza_motor', label: 'Limpieza de Motor' },
                                    ].map((tipo) => (
                                        <label key={tipo.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={tiposLimpieza.includes(tipo.value)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setTiposLimpieza([...tiposLimpieza, tipo.value]);
                                                    } else {
                                                        setTiposLimpieza(tiposLimpieza.filter(t => t !== tipo.value));
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-900">{tipo.label}</span>
                                        </label>
                                    ))}
                                </div>
                                {tiposLimpieza.length === 0 && (
                                    <p className="text-xs text-red-600 mt-2">Selecciona al menos un tipo de limpieza</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Nombre del Cliente
                                </label>
                                <input
                                    type="text"
                                    value={nombreCliente}
                                    onChange={(e) => setNombreCliente(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Número de Celular
                                </label>
                                <input
                                    type="tel"
                                    value={celular}
                                    onChange={(e) => setCelular(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="11-12345678"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formato: código de área + número (ej: 11-12345678)
                                </p>
                            </div>

                            {message && (
                                <div className={`px-4 py-3 rounded-lg text-sm ${message.includes('✅')
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}>
                                    {message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Registrando...' : 'Registrar Auto'}
                            </button>
                        </form>
                    </div>

                    {/* Autos en Proceso y Listos */}
                    <div className="space-y-6">
                        {/* Autos en Proceso */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">
                                Autos en Proceso ({registrosEnProceso.length})
                            </h2>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {registrosEnProceso.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay autos en proceso
                                    </p>
                                ) : (
                                    registrosEnProceso.map((registro) => (
                                        <div
                                            key={registro.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        {registro.marca_modelo}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Patente: <span className="font-mono font-semibold">{registro.patente}</span>
                                                    </p>
                                                </div>
                                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {registro.tipo_limpieza.replace(/_/g, ' ')}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Cliente: {registro.nombre_cliente}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Ingreso: {new Date(registro.fecha_ingreso).toLocaleString('es-AR')}
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => marcarComoListo(registro.id)}
                                                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                                                >
                                                    ✓ Listo
                                                </button>
                                                <button
                                                    onClick={() => cancelarRegistro(registro.id)}
                                                    className="flex items-center justify-center gap-2 px-3 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors"
                                                    title="Cancelar"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Autos Listos */}
                        <div className="bg-white rounded-2xl shadow-xl p-6">
                            <h2 className="text-2xl font-bold text-orange-700 mb-6">
                                Autos Listos ({registrosListos.length})
                            </h2>

                            <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                {registrosListos.length === 0 ? (
                                    <p className="text-gray-500 text-center py-8">
                                        No hay autos listos
                                    </p>
                                ) : (
                                    registrosListos.map((registro) => (
                                        <div
                                            key={registro.id}
                                            className="border border-orange-200 bg-orange-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-bold text-gray-900">
                                                        {registro.marca_modelo}
                                                    </h3>
                                                    <p className="text-sm text-gray-600">
                                                        Patente: <span className="font-mono font-semibold">{registro.patente}</span>
                                                    </p>
                                                </div>
                                                <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-semibold">
                                                    LISTO
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">
                                                Cliente: {registro.nombre_cliente}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Tipo: {registro.tipo_limpieza.replace(/_/g, ' ')}
                                            </p>
                                            <div className="flex gap-2">
                                                {userRole === 'admin' && (
                                                    <button
                                                        onClick={() => enviarWhatsApp(registro.id)}
                                                        className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                                                    >
                                                        <Send size={16} />
                                                        WhatsApp
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => marcarComoEntregado(registro.id)}
                                                    className={`${userRole === 'admin' ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors`}
                                                >
                                                    ✓ Entregado
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
