'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Plus, Edit, Trash2, Copy, TrendingUp } from 'lucide-react';

interface Precio {
    id: number;
    tipo_vehiculo: string;
    tipo_servicio: string;
    precio: number;
}

interface ListaPrecio {
    id: number;
    nombre: string;
    descripcion: string;
    activa: boolean;
    es_default: boolean;
    precios: Precio[];
}

export default function ListasPrecios() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [listas, setListas] = useState<ListaPrecio[]>([]);
    const [loading, setLoading] = useState(true);
    const [listaEditando, setListaEditando] = useState<number | null>(null);
    const [preciosEditando, setPreciosEditando] = useState<{ [key: string]: number }>({});
    const [mostrarAumento, setMostrarAumento] = useState<number | null>(null);
    const [porcentajeAumento, setPorcentajeAumento] = useState<string>('');
    const [redondear, setRedondear] = useState<boolean>(true);

    const tiposVehiculo = [
        { value: 'auto', label: '🚗 Auto' },
        { value: 'mono', label: '🚙 Mono (SUV)' },
        { value: 'camioneta', label: '🚐 Camioneta' },
        { value: 'camioneta_xl', label: '🚐 Camioneta XL' },
        { value: 'moto', label: '🏍️ Moto' }
    ];

    const tiposServicio = [
        { value: 'simple', label: 'Simple' },
        { value: 'con_cera', label: 'Con Cera (incremento)' }
    ];

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
                    cargarListas();
                }
            }
        }
    }, [router]);

    const cargarListas = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/listas-precios');
            const data = await res.json();
            if (data.success) {
                setListas(data.listas);
            }
        } catch (error) {
            console.error('Error cargando listas:', error);
        } finally {
            setLoading(false);
        }
    };

    const crearNuevaLista = async () => {
        const nombre = prompt('Nombre de la nueva lista de precios:');
        if (!nombre) return;

        const descripcion = prompt('Descripción (opcional):');

        try {
            const res = await fetch('/api/listas-precios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre, descripcion }),
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ Lista creada exitosamente');
                cargarListas();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al crear lista');
        }
    };

    const eliminarLista = async (id: number, nombre: string) => {
        if (!confirm(`¿Eliminar la lista "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/listas-precios?id=${id}`, {
                method: 'DELETE',
            });

            const data = await res.json();
            if (data.success) {
                alert('✅ Lista eliminada');
                cargarListas();
            } else {
                alert('❌ ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al eliminar lista');
        }
    };

    const iniciarEdicion = (lista: ListaPrecio) => {
        setListaEditando(lista.id);
        const preciosMap: { [key: string]: number } = {};
        lista.precios.forEach(precio => {
            const key = `${precio.tipo_vehiculo}_${precio.tipo_servicio}`;
            preciosMap[key] = parseFloat(precio.precio.toString());
        });
        setPreciosEditando(preciosMap);
    };

    const guardarPrecios = async (listaId: number) => {
        try {
            // Actualizar cada precio
            for (const [key, valor] of Object.entries(preciosEditando)) {
                const [tipo_vehiculo, tipo_servicio] = key.split('_');
                await fetch('/api/listas-precios/actualizar-precio', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lista_id: listaId,
                        tipo_vehiculo,
                        tipo_servicio,
                        precio: valor
                    }),
                });
            }

            alert('✅ Precios actualizados correctamente');
            setListaEditando(null);
            cargarListas();
        } catch (error) {
            alert('❌ Error al actualizar precios');
        }
    };

    const getPrecio = (lista: ListaPrecio, tipoVehiculo: string, tipoServicio: string): number => {
        if (listaEditando === lista.id) {
            const key = `${tipoVehiculo}_${tipoServicio}`;
            return preciosEditando[key] || 0;
        }
        const precio = lista.precios.find(
            p => p.tipo_vehiculo === tipoVehiculo && p.tipo_servicio === tipoServicio
        );
        return precio ? parseFloat(precio.precio.toString()) : 0;
    };

    const setPrecio = (tipoVehiculo: string, tipoServicio: string, valor: number) => {
        const key = `${tipoVehiculo}_${tipoServicio}`;
        setPreciosEditando({ ...preciosEditando, [key]: valor });
    };

    const redondearPrecio = (precio: number): number => {
        // Redondea a la centena más cercana (últimos 2 dígitos a 00)
        // Ejemplo: 23470 -> 23500, 23420 -> 23400
        return Math.round(precio / 100) * 100;
    };

    const aplicarAumento = (listaId: number) => {
        const porcentaje = parseFloat(porcentajeAumento);
        if (isNaN(porcentaje) || porcentaje === 0) {
            alert('❌ Ingresa un porcentaje válido');
            return;
        }

        const lista = listas.find(l => l.id === listaId);
        if (!lista) return;

        const nuevosPreciosEditando: { [key: string]: number } = {};
        
        lista.precios.forEach(precio => {
            const key = `${precio.tipo_vehiculo}_${precio.tipo_servicio}`;
            const precioActual = parseFloat(precio.precio.toString());
            const aumento = precioActual * (porcentaje / 100);
            let precioNuevo = precioActual + aumento;
            
            if (redondear) {
                precioNuevo = redondearPrecio(precioNuevo);
            }
            
            nuevosPreciosEditando[key] = precioNuevo;
        });

        setPreciosEditando(nuevosPreciosEditando);
        setListaEditando(listaId);
        setMostrarAumento(null);
        setPorcentajeAumento('');
        alert(`✅ Aumento del ${porcentaje}% aplicado${redondear ? ' (redondeado)' : ''}`);
    };

    if (!mounted) return null;

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4">
            <div className="max-w-7xl mx-auto">
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
                                <DollarSign size={32} />
                                Listas de Precios
                            </h1>
                        </div>
                    </div>
                    <button
                        onClick={crearNuevaLista}
                        className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all"
                    >
                        <Plus size={18} />
                        <span className="text-sm">Nueva Lista</span>
                    </button>
                </div>

                {/* Listas de Precios */}
                <div className="space-y-6">
                    {listas.map((lista) => (
                        <div key={lista.id} className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                        {lista.nombre}
                                        {lista.es_default && (
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                Por defecto
                                            </span>
                                        )}
                                        {!lista.activa && (
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                Inactiva
                                            </span>
                                        )}
                                    </h2>
                                    {lista.descripcion && (
                                        <p className="text-sm text-gray-600 mt-1">{lista.descripcion}</p>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {listaEditando === lista.id ? (
                                        <>
                                            <button
                                                onClick={() => guardarPrecios(lista.id)}
                                                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setListaEditando(null);
                                                    setPreciosEditando({});
                                                }}
                                                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setMostrarAumento(lista.id)}
                                                className="p-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                                                title="Aplicar aumento"
                                            >
                                                <TrendingUp size={18} />
                                            </button>
                                            <button
                                                onClick={() => iniciarEdicion(lista)}
                                                className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                                                title="Editar precios"
                                            >
                                                <Edit size={18} />
                                            </button>
                                            {!lista.es_default && (
                                                <button
                                                    onClick={() => eliminarLista(lista.id, lista.nombre)}
                                                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                                                    title="Eliminar lista"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Tabla de Precios */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-2 font-semibold text-gray-700">
                                                Tipo de Vehículo
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                                Precio Base
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                                + Con Cera
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700">
                                                Total con Cera
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tiposVehiculo.map((tipo) => {
                                            const precioBase = getPrecio(lista, tipo.value, 'simple');
                                            const precioCera = getPrecio(lista, tipo.value, 'con_cera');
                                            const total = precioBase + precioCera;

                                            return (
                                                <tr key={tipo.value} className="border-b border-gray-100">
                                                    <td className="py-3 px-2 text-sm font-medium text-gray-900">
                                                        {tipo.label}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioBase}
                                                                onChange={(e) => setPrecio(tipo.value, 'simple', parseFloat(e.target.value) || 0)}
                                                                className="w-32 px-2 py-1 border border-gray-300 rounded text-right text-gray-900"
                                                                step="1000"
                                                            />
                                                        ) : (
                                                            <span className="text-sm font-semibold text-gray-900">
                                                                ${precioBase.toLocaleString('es-AR')}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioCera}
                                                                onChange={(e) => setPrecio(tipo.value, 'con_cera', parseFloat(e.target.value) || 0)}
                                                                className="w-32 px-2 py-1 border border-gray-300 rounded text-right text-gray-900"
                                                                step="1000"
                                                                disabled={tipo.value === 'moto'}
                                                            />
                                                        ) : (
                                                            <span className="text-sm text-gray-700">
                                                                {tipo.value === 'moto' ? '-' : `$${precioCera.toLocaleString('es-AR')}`}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        <span className="text-sm font-bold text-blue-600">
                                                            {tipo.value === 'moto' ? '-' : `$${total.toLocaleString('es-AR')}`}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modal de Aumento */}
                {mostrarAumento && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="text-orange-500" size={28} />
                                Aplicar Aumento
                            </h3>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Porcentaje de Aumento
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={porcentajeAumento}
                                            onChange={(e) => setPorcentajeAumento(e.target.value)}
                                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-gray-900"
                                            placeholder="Ej: 10"
                                            step="0.1"
                                            autoFocus
                                        />
                                        <span className="text-gray-700 font-semibold">%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Ingresa el porcentaje de aumento (puede ser decimal)
                                    </p>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={redondear}
                                            onChange={(e) => setRedondear(e.target.checked)}
                                            className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                        />
                                        <span className="text-sm font-medium text-gray-900">
                                            Redondear precios
                                        </span>
                                    </label>
                                    <p className="text-xs text-gray-600 mt-1 ml-6">
                                        Los precios se redondearán a la centena más cercana
                                        <br />
                                        <span className="text-blue-700 font-semibold">
                                            Ejemplo: $23,470 → $23,500
                                        </span>
                                    </p>
                                </div>

                                {porcentajeAumento && !isNaN(parseFloat(porcentajeAumento)) && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                        <p className="text-sm text-green-800">
                                            <strong>Vista previa:</strong>
                                        </p>
                                        <p className="text-xs text-green-700 mt-1">
                                            Un precio de $22,000 quedaría en{' '}
                                            <strong>
                                                ${redondear
                                                    ? redondearPrecio(22000 * (1 + parseFloat(porcentajeAumento) / 100)).toLocaleString('es-AR')
                                                    : (22000 * (1 + parseFloat(porcentajeAumento) / 100)).toLocaleString('es-AR', { maximumFractionDigits: 0 })
                                                }
                                            </strong>
                                        </p>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={() => aplicarAumento(mostrarAumento)}
                                        className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Aplicar Aumento
                                    </button>
                                    <button
                                        onClick={() => {
                                            setMostrarAumento(null);
                                            setPorcentajeAumento('');
                                            setRedondear(true);
                                        }}
                                        className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
