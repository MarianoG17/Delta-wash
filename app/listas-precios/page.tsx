'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, Plus, Edit, Trash2, Copy, TrendingUp, Settings } from 'lucide-react';
import { getAuthUser, getLoginUrl } from '@/lib/auth-utils';
import ModalTiposVehiculo from '@/app/components/ModalTiposVehiculo';
import ModalTiposLimpieza from '@/app/components/ModalTiposLimpieza';

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
    const [guardando, setGuardando] = useState(false);
    const [listaEditando, setListaEditando] = useState<number | null>(null);
    const [preciosEditando, setPreciosEditando] = useState<{ [key: string]: number }>({});
    const [mostrarAumento, setMostrarAumento] = useState<number | null>(null);
    const [porcentajeAumento, setPorcentajeAumento] = useState<string>('');
    const [redondear, setRedondear] = useState<boolean>(true);
    const [modalVehiculosAbierto, setModalVehiculosAbierto] = useState(false);
    const [modalLimpiezaAbierto, setModalLimpiezaAbierto] = useState(false);
    const [tiposVehiculoDinamicos, setTiposVehiculoDinamicos] = useState<any[]>([]);
    const [tiposLimpiezaDinamicos, setTiposLimpiezaDinamicos] = useState<any[]>([]);

    // Helper function para formatear nombres de tipos
    const formatearNombreTipo = (nombre: string): string => {
        return nombre.split('_').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    };

    // Fallback a valores hardcodeados si no se cargan los dinámicos
    const tiposVehiculo = tiposVehiculoDinamicos.length > 0
        ? tiposVehiculoDinamicos.map(t => ({
            value: t.nombre,
            label: t.nombre === 'auto' ? '🚗 Auto' :
                   t.nombre === 'mono' ? '🚙 Mono (SUV)' :
                   t.nombre === 'camioneta' ? '🚐 Camioneta' :
                   t.nombre === 'camioneta_xl' ? '🚐 Camioneta XL' :
                   t.nombre === 'moto' ? '🏍️ Moto' :
                   '🚗 ' + t.nombre.toUpperCase()
          }))
        : [
            { value: 'auto', label: '🚗 Auto' },
            { value: 'mono', label: '🚙 Mono (SUV)' },
            { value: 'camioneta', label: '🚐 Camioneta' },
            { value: 'camioneta_xl', label: '🚐 Camioneta XL' },
            { value: 'moto', label: '🏍️ Moto' }
          ];

    const tiposServicio = tiposLimpiezaDinamicos.length > 0
        ? tiposLimpiezaDinamicos.map(t => ({
            value: t.nombre,
            label: t.nombre === 'simple_exterior' ? 'Simple Exterior' :
                   t.nombre === 'simple' ? 'Simple (completo)' :
                   t.nombre === 'con_cera' ? 'Con Cera (incremento)' :
                   t.nombre === 'pulido' ? 'Pulido' :
                   t.nombre === 'limpieza_chasis' ? 'Limpieza de Chasis' :
                   t.nombre === 'limpieza_motor' ? 'Limpieza de Motor' :
                   formatearNombreTipo(t.nombre)
          }))
        : [
            { value: 'simple_exterior', label: 'Simple Exterior' },
            { value: 'simple', label: 'Simple (completo)' },
            { value: 'con_cera', label: 'Con Cera (incremento)' },
            { value: 'pulido', label: 'Pulido' },
            { value: 'limpieza_chasis', label: 'Limpieza de Chasis' },
            { value: 'limpieza_motor', label: 'Limpieza de Motor' }
          ];

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const user = getAuthUser();
            if (!user) {
                router.push(getLoginUrl());
            } else {
                if (user.rol !== 'admin') {
                    router.push('/');
                } else {
                    cargarTiposVehiculo();
                    cargarTiposLimpieza();
                    cargarListas();
                }
            }
        }
    }, [router]);

    const cargarListas = async () => {
        try {
            setLoading(true);
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/listas-precios', {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
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

    const cargarTiposVehiculo = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/tipos-vehiculo', {
                headers: authToken ? {
                    'Authorization': `Bearer ${authToken}`
                } : {}
            });
            const data = await res.json();
            if (res.ok && data.success && Array.isArray(data.tipos)) {
                const tiposActivos = data.tipos
                    .filter((t: any) => t.activo)
                    .sort((a: any, b: any) => a.orden - b.orden);
                setTiposVehiculoDinamicos(tiposActivos);
            }
        } catch (error) {
            console.error('Error cargando tipos de vehículo:', error);
        }
    };

    const cargarTiposLimpieza = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/tipos-limpieza', {
                headers: authToken ? {
                    'Authorization': `Bearer ${authToken}`
                } : {}
            });
            const data = await res.json();
            if (res.ok && data.success && Array.isArray(data.tipos)) {
                const tiposActivos = data.tipos
                    .filter((t: any) => t.activo)
                    .sort((a: any, b: any) => a.orden - b.orden);
                setTiposLimpiezaDinamicos(tiposActivos);
            }
        } catch (error) {
            console.error('Error cargando tipos de limpieza:', error);
        }
    };

    const crearNuevaLista = async () => {
        const nombre = prompt('Nombre de la nueva lista de precios:');
        if (!nombre) return;

        const descripcion = prompt('Descripción (opcional):');

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/listas-precios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
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
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch(`/api/listas-precios?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
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
            setGuardando(true);
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            // Actualizar cada precio
            for (const [key, valor] of Object.entries(preciosEditando)) {
                // Parsear el key correctamente buscando coincidencia con valores conocidos
                let tipo_vehiculo = '';
                let tipo_servicio = '';

                // IMPORTANTE: Ordenar de más largo a más corto para evitar matches incorrectos
                // Ejemplo: 'camioneta_xl' debe verificarse ANTES que 'camioneta'
                const vehiculosOrdenados = [...tiposVehiculo].sort((a, b) => b.value.length - a.value.length);

                // Buscar qué tipo de vehículo coincide con el inicio del key
                for (const vehiculo of vehiculosOrdenados) {
                    if (key.startsWith(vehiculo.value + '_')) {
                        tipo_vehiculo = vehiculo.value;
                        // El servicio es lo que queda después de quitar el vehículo y el '_'
                        tipo_servicio = key.substring(vehiculo.value.length + 1);
                        break;
                    }
                }

                // Validar que se encontraron ambos valores
                if (!tipo_vehiculo || !tipo_servicio) {
                    console.error(`No se pudo parsear el key: ${key}`);
                    continue;
                }

                console.log(`Guardando: ${key} → vehiculo=${tipo_vehiculo}, servicio=${tipo_servicio}, precio=${valor}`);

                await fetch('/api/listas-precios/actualizar-precio', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
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
        } finally {
            setGuardando(false);
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
        // Si el precio es menor a 50, no redondear (evita que queden en 0)
        if (precio < 50) {
            return Math.round(precio); // Redondear al entero más cercano
        }
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

        // Determinar la fuente de precios según si está editando o no
        let preciosBase: { [key: string]: number } = {};

        if (listaEditando === listaId) {
            // Ya está editando: usar preciosEditando actual
            preciosBase = { ...preciosEditando };
        } else {
            // No está editando: cargar todos los precios desde la BD
            lista.precios.forEach(precio => {
                const key = `${precio.tipo_vehiculo}_${precio.tipo_servicio}`;
                preciosBase[key] = parseFloat(precio.precio.toString());
            });
        }

        // Iterar sobre TODOS los vehículos y servicios posibles
        tiposVehiculo.forEach(vehiculo => {
            tiposServicio.forEach(servicio => {
                const key = `${vehiculo.value}_${servicio.value}`;
                const precioActual = preciosBase[key] || 0;

                // Solo incluir precios > 0 en el objeto (no sobrescribir con 0s)
                if (precioActual > 0) {
                    const aumento = precioActual * (porcentaje / 100);
                    let precioNuevo = precioActual + aumento;

                    if (redondear) {
                        precioNuevo = redondearPrecio(precioNuevo);
                    }

                    nuevosPreciosEditando[key] = precioNuevo;
                }
                // Si precioActual es 0, NO lo incluimos en el objeto
                // Así no se sobrescribirán precios existentes con 0
            });
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
                                                disabled={guardando}
                                                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${guardando
                                                        ? 'bg-green-400 cursor-not-allowed'
                                                        : 'bg-green-500 hover:bg-green-600'
                                                    } text-white`}
                                            >
                                                {guardando && (
                                                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                )}
                                                {guardando ? 'Guardando...' : 'Guardar'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setListaEditando(null);
                                                    setPreciosEditando({});
                                                }}
                                                disabled={guardando}
                                                className={`px-4 py-2 rounded-lg transition-colors ${guardando
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gray-500 hover:bg-gray-600'
                                                    } text-white`}
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
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b-2 border-gray-200">
                                            <th className="text-left py-3 px-2 font-semibold text-gray-700 sticky left-0 bg-white">
                                                Vehículo
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                                Simple Exterior
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                                Simple
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                                + Con Cera
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                                Pulido
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                                Limpieza Chasis
                                            </th>
                                            <th className="text-right py-3 px-2 font-semibold text-gray-700 whitespace-nowrap">
                                                Limpieza Motor
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tiposVehiculo.map((tipo) => {
                                            const precioExterior = getPrecio(lista, tipo.value, 'simple_exterior');
                                            const precioBase = getPrecio(lista, tipo.value, 'simple');
                                            const precioCera = getPrecio(lista, tipo.value, 'con_cera');
                                            const precioPulido = getPrecio(lista, tipo.value, 'pulido');
                                            const precioChasis = getPrecio(lista, tipo.value, 'limpieza_chasis');
                                            const precioMotor = getPrecio(lista, tipo.value, 'limpieza_motor');

                                            return (
                                                <tr key={tipo.value} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-2 font-medium text-gray-900 sticky left-0 bg-white">
                                                        {tipo.label}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioExterior}
                                                                onChange={(e) => setPrecio(tipo.value, 'simple_exterior', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 text-sm"
                                                                step="1000"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-900">${precioExterior.toLocaleString('es-AR')}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioBase}
                                                                onChange={(e) => setPrecio(tipo.value, 'simple', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 text-sm"
                                                                step="1000"
                                                            />
                                                        ) : (
                                                            <span className="font-semibold text-gray-900">${precioBase.toLocaleString('es-AR')}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioCera}
                                                                onChange={(e) => setPrecio(tipo.value, 'con_cera', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 text-sm"
                                                                step="1000"
                                                                disabled={tipo.value === 'moto'}
                                                            />
                                                        ) : (
                                                            <span className="text-gray-700">
                                                                {tipo.value === 'moto' ? '-' : `$${precioCera.toLocaleString('es-AR')}`}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioPulido}
                                                                onChange={(e) => setPrecio(tipo.value, 'pulido', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 text-sm"
                                                                step="1000"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-700">${precioPulido.toLocaleString('es-AR')}</span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioChasis}
                                                                onChange={(e) => setPrecio(tipo.value, 'limpieza_chasis', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 text-sm"
                                                                step="1000"
                                                                disabled={tipo.value === 'moto'}
                                                            />
                                                        ) : (
                                                            <span className="text-gray-700">
                                                                {tipo.value === 'moto' ? '-' : `$${precioChasis.toLocaleString('es-AR')}`}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="py-3 px-2 text-right">
                                                        {listaEditando === lista.id ? (
                                                            <input
                                                                type="number"
                                                                value={precioMotor}
                                                                onChange={(e) => setPrecio(tipo.value, 'limpieza_motor', parseFloat(e.target.value) || 0)}
                                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 text-sm"
                                                                step="1000"
                                                            />
                                                        ) : (
                                                            <span className="text-gray-700">${precioMotor.toLocaleString('es-AR')}</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Botones de gestión de tipos - Solo para SaaS */}
                            {getAuthUser()?.isSaas && (
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <p className="text-sm text-gray-600 mb-3 font-medium">
                                        Gestionar tipos de vehículos y servicios:
                                    </p>
                                    <div className="flex gap-3 flex-wrap">
                                        <button
                                            onClick={() => setModalVehiculosAbierto(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Settings size={16} />
                                            Gestionar Tipos de Vehículo
                                        </button>
                                        <button
                                            onClick={() => setModalLimpiezaAbierto(true)}
                                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm font-medium"
                                        >
                                            <Settings size={16} />
                                            Gestionar Tipos de Limpieza
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        💡 Personaliza los tipos de vehículos y servicios según tu lavadero
                                    </p>
                                </div>
                            )}
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

                {/* Modales de gestión de tipos */}
                <ModalTiposVehiculo
                    isOpen={modalVehiculosAbierto}
                    onClose={() => setModalVehiculosAbierto(false)}
                    onUpdate={() => {
                        cargarTiposVehiculo();
                        cargarListas();
                    }}
                />
                <ModalTiposLimpieza
                    isOpen={modalLimpiezaAbierto}
                    onClose={() => setModalLimpiezaAbierto(false)}
                    onUpdate={() => {
                        cargarTiposLimpieza();
                        cargarListas();
                    }}
                />
            </div>
        </div>
    );
}
