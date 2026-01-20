'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Edit, Trash2, ToggleLeft, ToggleRight, TrendingUp } from 'lucide-react';
import { getAuthUser, getLoginUrl } from '@/lib/auth-utils';

interface Promocion {
    id: number;
    nombre: string;
    descripcion: string;
    servicios_objetivo: string[];
    descuento_porcentaje: number;
    descuento_fijo: number;
    activa: boolean;
    fecha_inicio: string | null;
    fecha_fin: string | null;
    created_at: string;
}

interface Estadisticas {
    umbral_minimo: number;
    total_clientes: number;
    clientes_elegibles: number;
    top_clientes_elegibles: Array<{
        celular: string;
        nombre_cliente: string;
        total_visitas: number;
    }>;
    interacciones_30_dias: {
        aceptado: number;
        rechazado: number;
        interes_futuro: number;
    };
}

export default function AdminUpsellingPage() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [promociones, setPromociones] = useState<Promocion[]>([]);
    const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editando, setEditando] = useState<Promocion | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        servicios_objetivo: [] as string[],
        descuento_porcentaje: 0,
        descuento_fijo: 0,
        activa: true,
        fecha_inicio: '',
        fecha_fin: ''
    });

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const user = getAuthUser();
            if (!user || user.rol !== 'admin') {
                router.push(getLoginUrl());
            } else {
                cargarPromociones();
                cargarEstadisticas();
            }
        }
    }, [router]);

    const cargarPromociones = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/upselling/promociones', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setPromociones(data.promociones);
            }
        } catch (error) {
            console.error('Error cargando promociones:', error);
        } finally {
            setLoading(false);
        }
    };

    const cargarEstadisticas = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/upselling/estadisticas', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await res.json();
            if (data.success) {
                setEstadisticas(data.estadisticas);
            }
        } catch (error) {
            console.error('Error cargando estadísticas:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const url = editando ? '/api/upselling/promociones' : '/api/upselling/promociones';
            const method = editando ? 'PUT' : 'POST';

            const body = editando
                ? { ...formData, id: editando.id }
                : formData;

            const res = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (data.success) {
                alert(editando ? '✅ Promoción actualizada' : '✅ Promoción creada');
                setShowModal(false);
                setEditando(null);
                resetForm();
                cargarPromociones();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al guardar promoción');
        }
    };

    const toggleActiva = async (promocion: Promocion) => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/upselling/promociones', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    id: promocion.id,
                    activa: !promocion.activa
                })
            });

            const data = await res.json();

            if (data.success) {
                cargarPromociones();
            }
        } catch (error) {
            alert('❌ Error al actualizar estado');
        }
    };

    const eliminarPromocion = async (id: number) => {
        if (!confirm('¿Eliminar esta promoción?')) return;

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch(`/api/upselling/promociones?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            const data = await res.json();

            if (data.success) {
                alert('✅ Promoción eliminada');
                cargarPromociones();
            }
        } catch (error) {
            alert('❌ Error al eliminar promoción');
        }
    };

    const editarPromocion = (promocion: Promocion) => {
        setEditando(promocion);
        setFormData({
            nombre: promocion.nombre,
            descripcion: promocion.descripcion,
            servicios_objetivo: promocion.servicios_objetivo,
            descuento_porcentaje: promocion.descuento_porcentaje,
            descuento_fijo: promocion.descuento_fijo,
            activa: promocion.activa,
            fecha_inicio: promocion.fecha_inicio || '',
            fecha_fin: promocion.fecha_fin || ''
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            nombre: '',
            descripcion: '',
            servicios_objetivo: [],
            descuento_porcentaje: 0,
            descuento_fijo: 0,
            activa: true,
            fecha_inicio: '',
            fecha_fin: ''
        });
    };

    const handleServicioToggle = (servicio: string) => {
        if (formData.servicios_objetivo.includes(servicio)) {
            setFormData({
                ...formData,
                servicios_objetivo: formData.servicios_objetivo.filter(s => s !== servicio)
            });
        } else {
            setFormData({
                ...formData,
                servicios_objetivo: [...formData.servicios_objetivo, servicio]
            });
        }
    };

    if (!mounted || loading) {
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
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                        >
                            <ArrowLeft size={18} />
                            <span className="text-sm">Volver</span>
                        </Link>
                        <div className="text-white">
                            <h1 className="text-3xl font-bold flex items-center gap-2">
                                <TrendingUp size={32} />
                                Promociones de Upselling
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setEditando(null);
                            resetForm();
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                    >
                        <Plus size={18} />
                        <span className="text-sm">Nueva Promoción</span>
                    </button>
                </div>

                {/* Panel de Estadísticas */}
                {estadisticas && (
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">
                            📊 Estadísticas del Sistema
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-300">
                                <p className="text-sm text-blue-600 font-semibold mb-1">Umbral Mínimo (Top 20%)</p>
                                <p className="text-3xl font-bold text-blue-900">
                                    {estadisticas.umbral_minimo} visitas
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-300">
                                <p className="text-sm text-purple-600 font-semibold mb-1">Total Clientes</p>
                                <p className="text-3xl font-bold text-purple-900">
                                    {estadisticas.total_clientes}
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border-2 border-green-300">
                                <p className="text-sm text-green-600 font-semibold mb-1">Clientes Elegibles</p>
                                <p className="text-3xl font-bold text-green-900">
                                    {estadisticas.clientes_elegibles}
                                </p>
                                <p className="text-xs text-green-600 mt-1">
                                    {((estadisticas.clientes_elegibles / estadisticas.total_clientes) * 100).toFixed(1)}% del total
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-300">
                                <p className="text-sm text-orange-600 font-semibold mb-1">Interacciones (30d)</p>
                                <div className="space-y-1">
                                    <p className="text-sm text-green-700">✓ Aceptado: {estadisticas.interacciones_30_dias.aceptado}</p>
                                    <p className="text-sm text-blue-700">⏰ Futuro: {estadisticas.interacciones_30_dias.interes_futuro}</p>
                                    <p className="text-sm text-gray-600">✕ Rechazado: {estadisticas.interacciones_30_dias.rechazado}</p>
                                </div>
                            </div>
                        </div>

                        {estadisticas.top_clientes_elegibles.length > 0 && (
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 mb-3">
                                    🏆 Top 10 Clientes Elegibles para Upselling
                                </h3>
                                <div className="bg-gray-50 rounded-xl p-4 max-h-64 overflow-y-auto">
                                    <div className="space-y-2">
                                        {estadisticas.top_clientes_elegibles.map((cliente, idx) => (
                                            <div
                                                key={cliente.celular}
                                                className="bg-white rounded-lg p-3 border border-gray-200 flex justify-between items-center"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className="text-lg font-bold text-blue-600">#{idx + 1}</span>
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{cliente.nombre_cliente}</p>
                                                        <p className="text-xs text-gray-500">{cliente.celular}</p>
                                                    </div>
                                                </div>
                                                <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
                                                    {cliente.total_visitas} visitas
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2">
                                    💡 Estos clientes están en el top 20% más frecuentes y nunca pidieron servicios premium
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* Lista de Promociones */}
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">
                        Promociones Configuradas
                    </h2>

                    {promociones.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500 mb-4">No hay promociones configuradas</p>
                            <button
                                onClick={() => setShowModal(true)}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                            >
                                Crear Primera Promoción
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {promociones.map((promocion) => (
                                <div
                                    key={promocion.id}
                                    className={`border-2 rounded-xl p-6 ${promocion.activa
                                            ? 'border-green-300 bg-green-50'
                                            : 'border-gray-300 bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {promocion.nombre}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold ${promocion.activa
                                                            ? 'bg-green-200 text-green-800'
                                                            : 'bg-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {promocion.activa ? '🟢 Activa' : '⚪ Inactiva'}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 mb-3">{promocion.descripcion}</p>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <p className="text-xs text-gray-600 mb-1">Descuento:</p>
                                                    <p className="text-lg font-bold text-purple-600">
                                                        {promocion.descuento_porcentaje > 0
                                                            ? `${promocion.descuento_porcentaje}%`
                                                            : `$${promocion.descuento_fijo.toLocaleString('es-AR')}`}
                                                    </p>
                                                </div>
                                                <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                    <p className="text-xs text-gray-600 mb-1">Servicios Objetivo:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        {promocion.servicios_objetivo.map((servicio, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                                                            >
                                                                {servicio}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {(promocion.fecha_inicio || promocion.fecha_fin) && (
                                                <div className="text-xs text-gray-600">
                                                    {promocion.fecha_inicio && (
                                                        <span>Inicio: {new Date(promocion.fecha_inicio).toLocaleDateString('es-AR')}</span>
                                                    )}
                                                    {promocion.fecha_inicio && promocion.fecha_fin && ' • '}
                                                    {promocion.fecha_fin && (
                                                        <span>Fin: {new Date(promocion.fecha_fin).toLocaleDateString('es-AR')}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex flex-col gap-2 ml-4">
                                            <button
                                                onClick={() => toggleActiva(promocion)}
                                                className={`p-2 rounded-lg transition-all ${promocion.activa
                                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                                        : 'bg-gray-300 hover:bg-gray-400 text-gray-600'
                                                    }`}
                                                title={promocion.activa ? 'Desactivar' : 'Activar'}
                                            >
                                                {promocion.activa ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                            </button>
                                            <button
                                                onClick={() => editarPromocion(promocion)}
                                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Edit size={20} />
                                            </button>
                                            <button
                                                onClick={() => eliminarPromocion(promocion.id)}
                                                className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal de Crear/Editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">
                                {editando ? 'Editar Promoción' : 'Nueva Promoción'}
                            </h3>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nombre de la Promoción
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: ¡Upgrade Premium!"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Descripción
                                    </label>
                                    <textarea
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Descripción de la oferta que verá el cliente..."
                                        rows={3}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Servicios Objetivo
                                    </label>
                                    <div className="space-y-2">
                                        {['chasis', 'motor', 'pulido'].map((servicio) => (
                                            <label key={servicio} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.servicios_objetivo.includes(servicio)}
                                                    onChange={() => handleServicioToggle(servicio)}
                                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                                                />
                                                <span className="text-sm text-gray-900 capitalize">{servicio}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descuento % (opcional)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.descuento_porcentaje}
                                            onChange={(e) => setFormData({ ...formData, descuento_porcentaje: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="15"
                                            min="0"
                                            max="100"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Descuento $ (opcional)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.descuento_fijo}
                                            onChange={(e) => setFormData({ ...formData, descuento_fijo: parseFloat(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                            placeholder="5000"
                                            min="0"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha Inicio (opcional)
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.fecha_inicio}
                                            onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Fecha Fin (opcional)
                                        </label>
                                        <input
                                            type="date"
                                            value={formData.fecha_fin}
                                            onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.activa}
                                            onChange={(e) => setFormData({ ...formData, activa: e.target.checked })}
                                            className="w-4 h-4 text-green-600 border-gray-300 rounded"
                                        />
                                        <span className="text-sm font-medium text-gray-900">Activar inmediatamente</span>
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setEditando(null);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        {editando ? 'Actualizar' : 'Crear'} Promoción
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
