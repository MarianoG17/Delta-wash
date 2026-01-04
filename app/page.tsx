'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, LogOut, History, Plus, Send } from 'lucide-react';

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
    const [mounted, setMounted] = useState(false);

    // Form states
    const [marcaModelo, setMarcaModelo] = useState('');
    const [patente, setPatente] = useState('');
    const [tipoLimpieza, setTipoLimpieza] = useState('simple');
    const [nombreCliente, setNombreCliente] = useState('');
    const [celular, setCelular] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Registros en proceso
    const [registrosEnProceso, setRegistrosEnProceso] = useState<Registro[]>([]);

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
                cargarRegistrosEnProceso();
            }
        }
    }, [router]);

    const cargarRegistrosEnProceso = async () => {
        try {
            const res = await fetch('/api/registros?estado=en_proceso');
            const data = await res.json();
            if (data.success) {
                setRegistrosEnProceso(data.registros);
            }
        } catch (error) {
            console.error('Error cargando registros:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/registros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    marca_modelo: marcaModelo,
                    patente: patente.toUpperCase(),
                    tipo_limpieza: tipoLimpieza,
                    nombre_cliente: nombreCliente,
                    celular: celular,
                    usuario_id: userId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage('✅ Auto registrado exitosamente');
                // Limpiar formulario
                setMarcaModelo('');
                setPatente('');
                setTipoLimpieza('simple');
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

    const marcarComoListo = async (registro: Registro) => {
        if (!confirm(`¿Marcar como listo el ${registro.marca_modelo} - ${registro.patente}?`)) {
            return;
        }

        try {
            const res = await fetch('/api/registros/marcar-listo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: registro.id }),
            });

            const data = await res.json();

            if (data.success) {
                // Abrir WhatsApp en nueva ventana
                window.open(data.whatsappUrl, '_blank');
                alert('✅ Auto marcado como listo. Se abrió WhatsApp para enviar el mensaje.');
                cargarRegistrosEnProceso();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al marcar como listo');
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
                            <h1 className="text-3xl font-bold">Lavadero App</h1>
                        </div>
                        <p className="text-sm opacity-90">Bienvenido/a, {username}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/historial"
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                        >
                            <History size={18} />
                            <span className="text-sm">Historial</span>
                        </Link>
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
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Marca y Modelo
                                </label>
                                <input
                                    type="text"
                                    value={marcaModelo}
                                    onChange={(e) => setMarcaModelo(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Ej: Toyota Corolla"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Patente
                                </label>
                                <input
                                    type="text"
                                    value={patente}
                                    onChange={(e) => setPatente(e.target.value.toUpperCase())}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                                    placeholder="ABC123"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tipo de Limpieza
                                </label>
                                <select
                                    value={tipoLimpieza}
                                    onChange={(e) => setTipoLimpieza(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="simple">Simple (solo por fuera)</option>
                                    <option value="con_cera">Con Cera</option>
                                    <option value="pulido">Pulido</option>
                                    <option value="limpieza_chasis">Limpieza de Chasis</option>
                                    <option value="limpieza_motor">Limpieza de Motor</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del Cliente
                                </label>
                                <input
                                    type="text"
                                    value={nombreCliente}
                                    onChange={(e) => setNombreCliente(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Número de Celular
                                </label>
                                <input
                                    type="tel"
                                    value={celular}
                                    onChange={(e) => setCelular(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="5491112345678"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formato: 549 + código de área + número (sin 0 ni 15)
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

                    {/* Autos en Proceso */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Autos en Proceso ({registrosEnProceso.length})
                        </h2>

                        <div className="space-y-3 max-h-[600px] overflow-y-auto">
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
                                        <button
                                            onClick={() => marcarComoListo(registro)}
                                            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors"
                                        >
                                            <Send size={16} />
                                            Marcar como Listo y Enviar WhatsApp
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
