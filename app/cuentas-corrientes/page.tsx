'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, ArrowLeft, Plus, DollarSign } from 'lucide-react';

interface CuentaCorriente {
    id: number;
    nombre_cliente: string;
    celular: string;
    saldo_inicial: number;
    saldo_actual: number;
    fecha_creacion: string;
    activa: boolean;
    notas?: string;
}

export default function CuentasCorrientesPage() {
    const router = useRouter();
    const [userRole, setUserRole] = useState<string>('operador');
    const [userId, setUserId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const [cuentas, setCuentas] = useState<CuentaCorriente[]>([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Estados para crear cuenta
    const [mostrarFormCrear, setMostrarFormCrear] = useState(false);
    const [nombreCliente, setNombreCliente] = useState('');
    const [celular, setCelular] = useState('');
    const [saldoInicial, setSaldoInicial] = useState('');
    const [notas, setNotas] = useState('');

    // Estados para cargar saldo
    const [cuentaSeleccionada, setCuentaSeleccionada] = useState<number | null>(null);
    const [montoCargar, setMontoCargar] = useState('');

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const session = localStorage.getItem('lavadero_user');
            if (!session) {
                router.push('/login');
            } else {
                const data = JSON.parse(session);
                setUserRole(data.rol || 'operador');
                setUserId(data.id);
                
                if (data.rol !== 'admin') {
                    router.push('/');
                } else {
                    cargarCuentas();
                }
            }
        }
    }, [router]);

    const cargarCuentas = async () => {
        try {
            const res = await fetch('/api/cuentas-corrientes');
            const data = await res.json();
            if (data.success) {
                setCuentas(data.cuentas);
            }
        } catch (error) {
            console.error('Error cargando cuentas:', error);
        }
    };

    const crearCuenta = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/cuentas-corrientes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre_cliente: nombreCliente,
                    celular: celular,
                    saldo_inicial: parseFloat(saldoInicial),
                    notas: notas,
                }),
            });

            const data = await res.json();

            if (data.success) {
                setMessage('✅ Cuenta corriente creada exitosamente');
                setNombreCliente('');
                setCelular('');
                setSaldoInicial('');
                setNotas('');
                setMostrarFormCrear(false);
                cargarCuentas();
            } else {
                setMessage('❌ ' + data.message);
            }
        } catch (error) {
            setMessage('❌ Error al crear cuenta corriente');
        } finally {
            setLoading(false);
        }
    };

    const cargarSaldo = async (cuentaId: number) => {
        if (!montoCargar || parseFloat(montoCargar) <= 0) {
            alert('Ingresa un monto válido');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/cuentas-corrientes/cargar-saldo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cuenta_id: cuentaId,
                    monto: parseFloat(montoCargar),
                    descripcion: 'Carga de saldo',
                    usuario_id: userId,
                }),
            });

            const data = await res.json();

            if (data.success) {
                alert(`✅ Saldo cargado exitosamente\nNuevo saldo: $${data.saldo_nuevo.toLocaleString('es-AR')}`);
                setMontoCargar('');
                setCuentaSeleccionada(null);
                cargarCuentas();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al cargar saldo');
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
                <div className="flex justify-between items-center mb-6">
                    <div className="text-white">
                        <div className="flex items-center gap-2 mb-2">
                            <Wallet size={32} />
                            <h1 className="text-3xl font-bold">Cuentas Corrientes</h1>
                        </div>
                        <p className="text-sm opacity-90">Gestión de saldos prepagos</p>
                    </div>
                    <div className="flex gap-2">
                        <Link
                            href="/prueba"
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm">Volver</span>
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Formulario para crear cuenta */}
                    <div className="bg-white rounded-2xl shadow-xl p-6">
                        <button
                            onClick={() => setMostrarFormCrear(!mostrarFormCrear)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg transition-colors mb-4"
                        >
                            <Plus size={20} />
                            {mostrarFormCrear ? 'Cancelar' : 'Nueva Cuenta Corriente'}
                        </button>

                        {mostrarFormCrear && (
                            <form onSubmit={crearCuenta} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Celular (ID único)
                                    </label>
                                    <input
                                        type="tel"
                                        value={celular}
                                        onChange={async (e) => {
                                            const value = e.target.value;
                                            setCelular(value);
                                            
                                            // Buscar si ya existe una cuenta con este celular
                                            if (value.length >= 8) {
                                                try {
                                                    const res = await fetch(`/api/cuentas-corrientes?celular=${value}`);
                                                    const data = await res.json();
                                                    
                                                    if (data.success && data.found) {
                                                        setMessage('⚠️ Ya existe una cuenta con este celular. Puedes cargarle saldo desde la lista.');
                                                        setNombreCliente(data.cuenta.nombre_cliente);
                                                    } else {
                                                        setMessage('');
                                                    }
                                                } catch (error) {
                                                    console.error('Error buscando celular:', error);
                                                }
                                            } else {
                                                setMessage('');
                                            }
                                        }}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="11-12345678"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Se verificará si ya existe una cuenta con este celular
                                    </p>
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
                                        placeholder="Juan Pérez"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Saldo Inicial ($)
                                    </label>
                                    <input
                                        type="number"
                                        value={saldoInicial}
                                        onChange={(e) => setSaldoInicial(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="100000"
                                        min="1"
                                        step="any"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-900 mb-2">
                                        Notas (Opcional)
                                    </label>
                                    <textarea
                                        value={notas}
                                        onChange={(e) => setNotas(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                        placeholder="Información adicional..."
                                        rows={3}
                                    />
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
                                    className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Creando...' : 'Crear Cuenta Corriente'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Lista de cuentas corrientes */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            Cuentas Activas ({cuentas.filter(c => c.activa).length})
                        </h2>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {cuentas.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">
                                    No hay cuentas corrientes creadas
                                </p>
                            ) : (
                                cuentas.map((cuenta) => (
                                    <div
                                        key={cuenta.id}
                                        className={`border rounded-lg p-4 ${cuenta.activa && cuenta.saldo_actual > 0
                                            ? 'border-green-200 bg-green-50'
                                            : 'border-gray-200 bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    {cuenta.nombre_cliente}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    📱 {cuenta.celular}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-2xl font-bold text-green-600">
                                                    ${parseFloat(cuenta.saldo_actual.toString()).toLocaleString('es-AR')}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Inicial: ${parseFloat(cuenta.saldo_inicial.toString()).toLocaleString('es-AR')}
                                                </p>
                                            </div>
                                        </div>

                                        {cuenta.notas && (
                                            <p className="text-xs text-gray-600 mb-3">
                                                📝 {cuenta.notas}
                                            </p>
                                        )}

                                        <p className="text-xs text-gray-500 mb-3">
                                            Creada: {new Date(cuenta.fecha_creacion).toLocaleDateString('es-AR')}
                                        </p>

                                        {/* Formulario para cargar saldo */}
                                        {cuentaSeleccionada === cuenta.id ? (
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    value={montoCargar}
                                                    onChange={(e) => setMontoCargar(e.target.value)}
                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                                                    placeholder="Monto a cargar"
                                                    min="1"
                                                    step="any"
                                                />
                                                <button
                                                    onClick={() => cargarSaldo(cuenta.id)}
                                                    disabled={loading}
                                                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    Cargar
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setCuentaSeleccionada(null);
                                                        setMontoCargar('');
                                                    }}
                                                    className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => setCuentaSeleccionada(cuenta.id)}
                                                className="w-full flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
                                            >
                                                <DollarSign size={16} />
                                                Cargar Saldo
                                            </button>
                                        )}
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
