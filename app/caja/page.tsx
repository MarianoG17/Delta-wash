'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, DollarSign, TrendingDown, TrendingUp, Lock, Unlock, Trash2, Eye, X } from 'lucide-react';
import { getAuthUser, getLoginUrl } from '@/lib/auth-utils';

interface Caja {
    id: number;
    fecha: string | Date;
    saldo_inicial: number;
    estado: 'abierta' | 'cerrada';
    notas_cierre: string | null;
    created_at: string;
    closed_at: string | null;
    efectivo_contado: number | null;
    diferencia_cierre: number | null;
}

interface Resumen {
    ingresos_efectivo: { cantidad: number; total: number };
    ingresos_transferencia: { cantidad: number; total: number };
    total_egresos: number;
}

interface Lavado {
    id: number;
    nombre_cliente: string;
    patente: string;
    tipo_limpieza: string;
    precio: number;
    metodo_pago: string;
    fecha_pago: string | null;
    fecha_entregado: string | null;
    extras: string | null;
    extras_valor: number | null;
}

interface Movimiento {
    id: number;
    caja_id: number;
    tipo: string;
    categoria: string;
    descripcion: string | null;
    monto: number;
    metodo_pago: string;
    created_at: string;
}

interface CajaHistorial {
    id: number;
    fecha: string;
    saldo_inicial: number;
    estado: string;
    notas_cierre: string | null;
    closed_at: string | null;
    ingresos_efectivo: number;
    cant_efectivo: number;
    ingresos_transferencia: number;
    cant_transferencia: number;
    total_egresos: number;
    diferencia_cierre: number | null;
}

export default function Caja() {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<number | null>(null);

    const [caja, setCaja] = useState<Caja | null>(null);
    const [resumen, setResumen] = useState<Resumen | null>(null);
    const [lavados, setLavados] = useState<Lavado[]>([]);
    const [egresos, setEgresos] = useState<Movimiento[]>([]);
    const [sugerencia, setSugerencia] = useState<number>(0);

    // Form apertura
    const [saldoInicial, setSaldoInicial] = useState<string>('');

    // Form egreso/retiro
    const [tipoMovimiento, setTipoMovimiento] = useState<'egreso' | 'retiro'>('egreso');
    const [categoria, setCategoria] = useState<string>('sueldo');
    const [descripcion, setDescripcion] = useState<string>('');
    const [monto, setMonto] = useState<string>('');
    const [metodoPagoEgreso, setMetodoPagoEgreso] = useState<'efectivo' | 'transferencia'>('efectivo');
    const [guardando, setGuardando] = useState(false);

    // Cierre
    const [notas, setNotas] = useState<string>('');
    const [confirmandoCierre, setConfirmandoCierre] = useState(false);
    const [efectivoContado, setEfectivoContado] = useState<string>('');

    // Historial
    const [historial, setHistorial] = useState<CajaHistorial[]>([]);
    const [loadingHistorial, setLoadingHistorial] = useState(false);
    const [historialVisible, setHistorialVisible] = useState(false);
    const [cerrandoHistorialId, setCerrandoHistorialId] = useState<number | null>(null);

    // Modal detalle historial
    const [detalleCaja, setDetalleCaja] = useState<CajaHistorial | null>(null);
    const [detalleLavados, setDetalleLavados] = useState<Lavado[]>([]);
    const [detalleEgresos, setDetalleEgresos] = useState<Movimiento[]>([]);
    const [loadingDetalle, setLoadingDetalle] = useState(false);

    useEffect(() => {
        setMounted(true);
        const user = getAuthUser();
        if (!user) {
            router.push(getLoginUrl());
            return;
        }
        if (user.rol !== 'admin') {
            router.push('/');
            return;
        }
        setUserId(user.id);
        cargarCaja();
    }, [router]);

    const getToken = () => {
        const user = getAuthUser();
        return user?.isSaas
            ? localStorage.getItem('authToken')
            : localStorage.getItem('lavadero_token');
    };

    const cargarCaja = async () => {
        try {
            const res = await fetch('/api/caja', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setCaja(data.caja);
                setResumen(data.resumen);
                setLavados(data.lavados);
                setEgresos(data.egresos);
                setSugerencia(data.sugerencia_saldo_inicial);
                if (!data.caja) {
                    setSaldoInicial(String(data.sugerencia_saldo_inicial));
                }
            }
        } catch (error) {
            console.error('Error cargando caja:', error);
        } finally {
            setLoading(false);
        }
    };

    const abrirCaja = async () => {
        setGuardando(true);
        try {
            const res = await fetch('/api/caja', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ saldo_inicial: parseFloat(saldoInicial) || 0, usuario_id: userId }),
            });
            const data = await res.json();
            if (data.success) {
                cargarCaja();
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Error al abrir caja');
        } finally {
            setGuardando(false);
        }
    };

    const agregarMovimiento = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!caja || !monto) return;
        setGuardando(true);
        try {
            const res = await fetch('/api/caja/movimientos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    caja_id: caja.id,
                    tipo: tipoMovimiento,
                    categoria: tipoMovimiento === 'retiro' ? 'retiro' : categoria,
                    descripcion,
                    monto: parseFloat(monto),
                    usuario_id: userId,
                    metodo_pago: metodoPagoEgreso,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setMonto('');
                setDescripcion('');
                cargarCaja();
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Error al agregar movimiento');
        } finally {
            setGuardando(false);
        }
    };

    const eliminarMovimiento = async (id: number) => {
        if (!confirm('¿Eliminar este movimiento?')) return;
        try {
            const res = await fetch(`/api/caja/movimientos?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                cargarCaja();
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Error al eliminar');
        }
    };

    const cerrarCaja = async () => {
        if (!caja) return;
        setGuardando(true);
        try {
            const res = await fetch('/api/caja/cerrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    caja_id: caja.id,
                    notas_cierre: notas,
                    usuario_id: userId,
                    efectivo_contado: efectivoContado !== '' ? parseFloat(efectivoContado) : null,
                    saldo_esperado: saldoEfectivo,
                }),
            });
            const data = await res.json();
            if (data.success) {
                setConfirmandoCierre(false);
                cargarCaja();
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Error al cerrar caja');
        } finally {
            setGuardando(false);
        }
    };

    const cerrarCajaHistorial = async (cajaId: number) => {
        if (!confirm('¿Cerrar esta caja sin arqueo? Se guardará como cerrada sin diferencia registrada.')) return;
        setCerrandoHistorialId(cajaId);
        try {
            const res = await fetch('/api/caja/cerrar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`
                },
                body: JSON.stringify({ caja_id: cajaId, usuario_id: userId }),
            });
            const data = await res.json();
            if (data.success) {
                // Recargar caja principal (puede que ya no haya caja activa) y historial
                cargarCaja();
                const res2 = await fetch('/api/caja/historial', {
                    headers: { 'Authorization': `Bearer ${getToken()}` }
                });
                const data2 = await res2.json();
                if (data2.success) setHistorial(data2.cajas);
            } else {
                alert('❌ ' + data.message);
            }
        } catch {
            alert('❌ Error al cerrar caja');
        } finally {
            setCerrandoHistorialId(null);
        }
    };

    const cargarHistorial = async () => {
        if (historialVisible) {
            setHistorialVisible(false);
            return;
        }
        setLoadingHistorial(true);
        setHistorialVisible(true);
        try {
            const res = await fetch('/api/caja/historial', {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.success) setHistorial(data.cajas);
        } catch (error) {
            console.error('Error cargando historial:', error);
        } finally {
            setLoadingHistorial(false);
        }
    };

    const verDetalleCaja = async (c: CajaHistorial) => {
        setDetalleCaja(c);
        setLoadingDetalle(true);
        try {
            const res = await fetch(`/api/caja/detalle?id=${c.id}`, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
            const data = await res.json();
            if (data.success) {
                setDetalleLavados(data.lavados);
                setDetalleEgresos(data.egresos);
            }
        } catch (error) {
            console.error('Error cargando detalle:', error);
        } finally {
            setLoadingDetalle(false);
        }
    };

    const formatPeso = (n: number) => `$${n.toLocaleString('es-AR')}`;

    const formatHora = (fecha: string | null) => {
        if (!fecha) return '-';
        return new Date(fecha).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };

    const egresosEfectivo = egresos.reduce((s, e) => (e.metodo_pago === 'efectivo' || !e.metodo_pago) ? s + (parseFloat(String(e.monto)) || 0) : s, 0);
    const egresosTransferencia = egresos.reduce((s, e) => e.metodo_pago === 'transferencia' ? s + (parseFloat(String(e.monto)) || 0) : s, 0);

    const saldoEfectivo = caja
        ? (parseFloat(String(caja.saldo_inicial)) || 0)
            + (resumen?.ingresos_efectivo.total || 0)
            - egresosEfectivo
        : 0;

    if (!mounted || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    const hoyStr = new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    return (
        <>
        <div className="min-h-screen bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6">
                    <Link href="/" className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all">
                        <ArrowLeft size={18} />
                        <span className="text-sm">Volver</span>
                    </Link>
                    <div className="text-white">
                        <h1 className="text-3xl font-bold">Caja del Día</h1>
                        <p className="text-sm opacity-80 capitalize">{hoyStr}</p>
                    </div>
                    {caja && (
                        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${caja.estado === 'abierta' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-700'}`}>
                            {caja.estado === 'abierta' ? '🟢 Abierta' : '🔒 Cerrada'}
                        </span>
                    )}
                </div>

                {/* Sin caja: formulario apertura */}
                {!caja && (
                    <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                        <div className="flex items-center gap-3 mb-6">
                            <Unlock className="text-emerald-600" size={28} />
                            <h2 className="text-2xl font-bold text-gray-900">Abrir Caja</h2>
                        </div>
                        <p className="text-gray-500 text-sm mb-6">
                            Ingresá el efectivo con el que arranca el día (fondo de caja).
                        </p>
                        {sugerencia > 0 && (
                            <p className="text-xs text-emerald-600 bg-emerald-50 px-3 py-2 rounded-lg mb-4">
                                💡 Sugerido basado en el cierre anterior: {formatPeso(sugerencia)}
                            </p>
                        )}
                        <label className="block text-sm font-medium text-gray-700 mb-2">Saldo inicial (efectivo)</label>
                        <input
                            type="number"
                            min="0"
                            value={saldoInicial}
                            onChange={(e) => setSaldoInicial(e.target.value)}
                            placeholder="0"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-lg font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent mb-6"
                        />
                        <button
                            onClick={abrirCaja}
                            disabled={guardando}
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-lg transition-colors"
                        >
                            {guardando ? 'Abriendo...' : 'Abrir Caja'}
                        </button>
                    </div>
                )}

                {/* Caja existente */}
                {caja && resumen && (
                    <>
                        {/* Aviso si la caja es de un día anterior */}
                        {(() => {
                            const fechaCaja = typeof caja.fecha === 'object'
                                ? (caja.fecha as unknown as Date).toISOString().split('T')[0]
                                : String(caja.fecha).split('T')[0];
                            const hoyLocal = new Date().toISOString().split('T')[0];
                            if (fechaCaja !== hoyLocal) {
                                const fechaDisplay = new Date(fechaCaja + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit' });
                                return (
                                    <div className="bg-amber-100 border border-amber-300 rounded-xl px-4 py-3 mb-4 text-sm text-amber-800 font-medium">
                                        ⚠️ Mostrando la caja del <span className="font-bold capitalize">{fechaDisplay}</span> — quedó abierta sin cerrar. Podés agregar egresos y cerrarla normalmente.
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        {/* Resumen en cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                                <p className="text-xs text-gray-500 mb-1">Saldo inicial</p>
                                <p className="text-xl font-bold text-gray-800">{formatPeso(parseFloat(String(caja.saldo_inicial)) || 0)}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                                <p className="text-xs text-gray-500 mb-1">💵 Efectivo ({resumen.ingresos_efectivo.cantidad})</p>
                                <p className="text-xl font-bold text-green-600">{formatPeso(resumen.ingresos_efectivo.total)}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                                <p className="text-xs text-gray-500 mb-1">🏦 Transferencia ({resumen.ingresos_transferencia.cantidad})</p>
                                <p className="text-xl font-bold text-blue-600">{formatPeso(resumen.ingresos_transferencia.total)}</p>
                            </div>
                            <div className="bg-white rounded-2xl p-4 shadow-xl">
                                <p className="text-xs text-gray-500 mb-1">Egresos / Retiros</p>
                                <p className="text-xl font-bold text-red-500">{formatPeso(resumen.total_egresos)}</p>
                                {(egresosTransferencia > 0) && (
                                    <p className="text-xs text-gray-400 mt-0.5">💵 {formatPeso(egresosEfectivo)} · 🏦 {formatPeso(egresosTransferencia)}</p>
                                )}
                            </div>
                        </div>

                        {/* Saldo efectivo en caja */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Efectivo en caja ahora</p>
                                <p className="text-4xl font-bold text-emerald-600">{formatPeso(saldoEfectivo)}</p>
                                <p className="text-xs text-gray-400 mt-1">saldo inicial + ingresos efectivo − egresos en efectivo</p>
                            </div>
                            <DollarSign className="text-emerald-200" size={64} />
                        </div>

                        {/* Ingresos del día */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="text-green-600" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">Ingresos del día</h3>
                                <span className="text-sm text-gray-400">({lavados.length} lavados)</span>
                            </div>
                            {lavados.length === 0 ? (
                                <p className="text-gray-400 text-sm">Aún no hay ingresos registrados.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Hora</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Cliente</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Patente</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Servicio</th>
                                                <th className="text-right py-2 px-2 text-gray-500 font-medium">Monto</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Método</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lavados.map((l) => (
                                                <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-2 px-2 text-gray-500">{formatHora(l.fecha_pago || l.fecha_entregado)}</td>
                                                    <td className="py-2 px-2 font-medium text-gray-900">{l.nombre_cliente}</td>
                                                    <td className="py-2 px-2 font-mono text-gray-700">{l.patente}</td>
                                                    <td className="py-2 px-2 text-gray-600">
                                                        {l.tipo_limpieza.replace(/_/g, ' ')}
                                                        {l.extras && l.extras_valor ? (
                                                            <span className="block text-xs text-blue-500 mt-0.5">+ {l.extras} ({formatPeso(parseFloat(String(l.extras_valor)))})</span>
                                                        ) : null}
                                                    </td>
                                                    <td className="py-2 px-2 font-bold text-right text-gray-900">{formatPeso(parseFloat(String(l.precio)) || 0)}</td>
                                                    <td className="py-2 px-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                            {l.metodo_pago === 'efectivo' ? '💵 Efectivo' : '🏦 Transfer.'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        {/* Egresos */}
                        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingDown className="text-red-500" size={20} />
                                <h3 className="text-lg font-bold text-gray-900">Egresos y Retiros</h3>
                            </div>

                            {/* Listado egresos */}
                            {egresos.length === 0 ? (
                                <p className="text-gray-400 text-sm mb-6">No hay egresos registrados.</p>
                            ) : (
                                <table className="w-full text-sm mb-6">
                                    <thead>
                                        <tr className="border-b border-gray-100">
                                            <th className="text-left py-2 px-2 text-gray-500 font-medium">Hora</th>
                                            <th className="text-left py-2 px-2 text-gray-500 font-medium">Tipo</th>
                                            <th className="text-left py-2 px-2 text-gray-500 font-medium">Categoría</th>
                                            <th className="text-left py-2 px-2 text-gray-500 font-medium">Detalle</th>
                                            <th className="text-right py-2 px-2 text-gray-500 font-medium">Monto</th>
                                            <th className="text-left py-2 px-2 text-gray-500 font-medium">Pago</th>
                                            {caja.estado === 'abierta' && <th className="py-2 px-2"></th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {egresos.map((e) => (
                                            <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                <td className="py-2 px-2 text-gray-500">{formatHora(e.created_at)}</td>
                                                <td className="py-2 px-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.tipo === 'retiro' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                        {e.tipo === 'retiro' ? '💰 Retiro' : '📤 Egreso'}
                                                    </span>
                                                </td>
                                                <td className="py-2 px-2 text-gray-700 capitalize">{e.categoria || '-'}</td>
                                                <td className="py-2 px-2 text-gray-600">{e.descripcion || '-'}</td>
                                                <td className="py-2 px-2 font-bold text-right text-red-600">{formatPeso(parseFloat(String(e.monto)) || 0)}</td>
                                                <td className="py-2 px-2">
                                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.metodo_pago === 'transferencia' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                        {e.metodo_pago === 'transferencia' ? '🏦 Transfer.' : '💵 Efectivo'}
                                                    </span>
                                                </td>
                                                {caja.estado === 'abierta' && (
                                                    <td className="py-2 px-2">
                                                        <button onClick={() => eliminarMovimiento(e.id)} className="text-gray-300 hover:text-red-500 transition-colors" title="Eliminar">
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* Formulario nuevo egreso/retiro */}
                            {caja.estado === 'abierta' && (
                                <form onSubmit={agregarMovimiento} className="border-t border-gray-100 pt-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Registrar egreso / retiro</p>
                                    <div className="grid grid-cols-3 gap-3 mb-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Tipo</label>
                                            <select
                                                value={tipoMovimiento}
                                                onChange={(e) => setTipoMovimiento(e.target.value as 'egreso' | 'retiro')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value="egreso">📤 Egreso</option>
                                                <option value="retiro">💰 Retiro de efectivo</option>
                                            </select>
                                        </div>
                                        {tipoMovimiento === 'egreso' && (
                                            <div>
                                                <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
                                                <select
                                                    value={categoria}
                                                    onChange={(e) => setCategoria(e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                                >
                                                    <option value="sueldo">👷 Sueldo / Jornada</option>
                                                    <option value="proveedor">📦 Proveedor / Insumos</option>
                                                    <option value="otro">📝 Otro</option>
                                                </select>
                                            </div>
                                        )}
                                        {tipoMovimiento === 'retiro' && <div />}
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Método de pago</label>
                                            <select
                                                value={metodoPagoEgreso}
                                                onChange={(e) => setMetodoPagoEgreso(e.target.value as 'efectivo' | 'transferencia')}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                            >
                                                <option value="efectivo">💵 Efectivo</option>
                                                <option value="transferencia">🏦 Transferencia</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Detalle (opcional)</label>
                                            <input
                                                type="text"
                                                value={descripcion}
                                                onChange={(e) => setDescripcion(e.target.value)}
                                                placeholder={tipoMovimiento === 'retiro' ? 'Ej: retiro para gastos' : 'Ej: nombre del empleado, proveedor...'}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-500 mb-1 block">Monto</label>
                                            <input
                                                type="number"
                                                min="1"
                                                value={monto}
                                                onChange={(e) => setMonto(e.target.value)}
                                                placeholder="0"
                                                required
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={guardando || !monto}
                                        className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                                    >
                                        {guardando ? 'Guardando...' : 'Registrar'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Cierre de caja */}
                        {caja.estado === 'abierta' && (
                            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lock className="text-gray-600" size={20} />
                                    <h3 className="text-lg font-bold text-gray-900">Cerrar Caja</h3>
                                </div>
                                {!confirmandoCierre ? (
                                    <div>
                                        {/* Resumen */}
                                        <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm space-y-1">
                                            <div className="flex justify-between"><span className="text-gray-500">Saldo inicial</span><span className="font-semibold">{formatPeso(parseFloat(String(caja.saldo_inicial)) || 0)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">+ Ingresos efectivo</span><span className="font-semibold text-green-600">+{formatPeso(resumen.ingresos_efectivo.total)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">− Egresos efectivo</span><span className="font-semibold text-red-500">−{formatPeso(egresosEfectivo)}</span></div>
                                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2"><span className="font-bold">Efectivo esperado en caja</span><span className="font-bold text-emerald-600 text-lg">{formatPeso(saldoEfectivo)}</span></div>
                                            <div className="flex justify-between"><span className="text-gray-500">Ingresos transferencia</span><span className="font-semibold text-blue-600">{formatPeso(resumen.ingresos_transferencia.total)}</span></div>
                                            {egresosTransferencia > 0 && (
                                                <div className="flex justify-between"><span className="text-gray-500">− Egresos transferencia</span><span className="font-semibold text-red-400">−{formatPeso(egresosTransferencia)}</span></div>
                                            )}
                                        </div>

                                        {/* Arqueo previo al cierre */}
                                        <div className="border border-gray-200 rounded-xl p-4 mb-5">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">Arqueo de caja</p>
                                            <div className="flex items-center gap-3 mb-3">
                                                <label className="text-sm text-gray-500 whitespace-nowrap">Efectivo contado</label>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={efectivoContado}
                                                    onChange={(e) => setEfectivoContado(e.target.value)}
                                                    placeholder={String(saldoEfectivo)}
                                                    className="w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:ring-2 focus:ring-emerald-500"
                                                />
                                            </div>
                                            {efectivoContado !== '' && (() => {
                                                const diff = parseFloat(efectivoContado) - saldoEfectivo;
                                                if (diff === 0) return (
                                                    <div className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                                        ✓ Sin diferencia — caja cuadra perfecto
                                                    </div>
                                                );
                                                return (
                                                    <div className={`rounded-lg p-3 ${diff > 0 ? 'bg-blue-50 border border-blue-200' : 'bg-red-50 border border-red-200'}`}>
                                                        <p className={`text-sm font-bold mb-1 ${diff > 0 ? 'text-blue-700' : 'text-red-700'}`}>
                                                            {diff > 0 ? `▲ Sobrante: ${formatPeso(diff)}` : `▼ Faltante: ${formatPeso(Math.abs(diff))}`}
                                                        </p>
                                                        <p className={`text-xs ${diff > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                            Revisá los movimientos de arriba antes de cerrar. Podés cancelar y agregar egresos o retiros faltantes.
                                                        </p>
                                                    </div>
                                                );
                                            })()}
                                        </div>

                                        <button
                                            onClick={() => setConfirmandoCierre(true)}
                                            className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-lg font-medium text-sm transition-colors"
                                        >
                                            Cerrar caja del día
                                        </button>
                                    </div>
                                ) : (
                                    <div>
                                        {/* Resumen arqueo en confirmación */}
                                        {efectivoContado !== '' && (() => {
                                            const diff = parseFloat(efectivoContado) - saldoEfectivo;
                                            if (diff === 0) return null;
                                            return (
                                                <div className={`rounded-lg p-3 mb-4 text-sm font-bold ${diff > 0 ? 'bg-blue-50 text-blue-700' : 'bg-red-50 text-red-700'}`}>
                                                    {diff > 0 ? `▲ Sobrante: ${formatPeso(diff)}` : `▼ Faltante: ${formatPeso(Math.abs(diff))}`}
                                                </div>
                                            );
                                        })()}
                                        <label className="text-sm font-medium text-gray-700 mb-2 block">Notas de cierre (opcional)</label>
                                        <textarea
                                            value={notas}
                                            onChange={(e) => setNotas(e.target.value)}
                                            placeholder="Observaciones del día..."
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-emerald-500 mb-4"
                                        />
                                        <div className="flex gap-3">
                                            <button
                                                onClick={cerrarCaja}
                                                disabled={guardando}
                                                className="px-6 py-2 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
                                            >
                                                {guardando ? 'Cerrando...' : 'Confirmar cierre'}
                                            </button>
                                            <button
                                                onClick={() => setConfirmandoCierre(false)}
                                                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resumen cierre (si cerrada) */}
                        {caja.estado === 'cerrada' && (
                            <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Lock className="text-gray-400" size={18} />
                                    <h3 className="text-lg font-bold text-gray-700">Caja cerrada</h3>
                                    {caja.closed_at && (
                                        <span className="text-xs text-gray-400 ml-2">
                                            {new Date(caja.closed_at).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                </div>
                                {caja.efectivo_contado != null && (
                                    <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-4 mb-3 text-sm">
                                        <div>
                                            <span className="text-gray-500">Efectivo esperado</span>
                                            <p className="font-bold text-gray-800">{formatPeso(saldoEfectivo)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Efectivo contado</span>
                                            <p className="font-bold text-gray-800">{formatPeso(caja.efectivo_contado)}</p>
                                        </div>
                                        <div>
                                            <span className="text-gray-500">Diferencia</span>
                                            <p className={`font-bold text-lg ${
                                                (caja.diferencia_cierre ?? 0) === 0 ? 'text-gray-600'
                                                : (caja.diferencia_cierre ?? 0) > 0 ? 'text-blue-600'
                                                : 'text-red-600'
                                            }`}>
                                                {(caja.diferencia_cierre ?? 0) === 0 ? '✓ $0'
                                                    : (caja.diferencia_cierre ?? 0) > 0
                                                        ? `▲ +${formatPeso(caja.diferencia_cierre ?? 0)}`
                                                        : `▼ ${formatPeso(caja.diferencia_cierre ?? 0)}`}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                {caja.notas_cierre && (
                                    <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">{caja.notas_cierre}</p>
                                )}
                            </div>
                        )}
                    </>
                )}
                {/* Historial de cajas anteriores */}
                <div className="mb-6">
                    <button
                        onClick={cargarHistorial}
                        className="flex items-center gap-2 px-5 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium text-sm transition-colors"
                    >
                        <span>{historialVisible ? '▲ Ocultar' : '▼ Ver'} historial de cajas anteriores</span>
                    </button>

                    {historialVisible && (
                        <div className="bg-white rounded-2xl shadow-xl p-6 mt-3">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Historial de Cajas</h3>
                            {loadingHistorial ? (
                                <p className="text-gray-400 text-sm">Cargando...</p>
                            ) : historial.length === 0 ? (
                                <p className="text-gray-400 text-sm">No hay cajas anteriores registradas.</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-gray-100">
                                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Fecha</th>
                                                <th className="text-right py-2 px-3 text-gray-500 font-medium">Saldo inicial</th>
                                                <th className="text-right py-2 px-3 text-gray-500 font-medium">💵 Efectivo</th>
                                                <th className="text-right py-2 px-3 text-gray-500 font-medium">🏦 Transferencia</th>
                                                <th className="text-right py-2 px-3 text-gray-500 font-medium">Egresos</th>
                                                <th className="text-right py-2 px-3 text-gray-500 font-medium">Saldo cierre</th>
                                                <th className="text-right py-2 px-3 text-gray-500 font-medium">Diferencia</th>
                                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Estado</th>
                                                <th className="text-left py-2 px-3 text-gray-500 font-medium">Notas</th>
                                                <th className="py-2 px-3"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historial.filter(c => c.id !== caja?.id).map((c) => {
                                                const saldoCierre = c.saldo_inicial + c.ingresos_efectivo - c.total_egresos;
                                                const fechaStr = String(c.fecha).split('T')[0];
                                                const fechaDisplay = new Date(fechaStr + 'T12:00:00').toLocaleDateString('es-AR', {
                                                    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
                                                });
                                                return (
                                                    <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                        <td className="py-3 px-3 font-medium text-gray-900 capitalize">{fechaDisplay}</td>
                                                        <td className="py-3 px-3 text-right text-gray-600">{formatPeso(c.saldo_inicial)}</td>
                                                        <td className="py-3 px-3 text-right">
                                                            <span className="font-semibold text-green-600">{formatPeso(c.ingresos_efectivo)}</span>
                                                            <span className="text-xs text-gray-400 ml-1">({c.cant_efectivo})</span>
                                                        </td>
                                                        <td className="py-3 px-3 text-right">
                                                            <span className="font-semibold text-blue-600">{formatPeso(c.ingresos_transferencia)}</span>
                                                            <span className="text-xs text-gray-400 ml-1">({c.cant_transferencia})</span>
                                                        </td>
                                                        <td className="py-3 px-3 text-right text-red-500 font-semibold">{formatPeso(c.total_egresos)}</td>
                                                        <td className="py-3 px-3 text-right font-bold text-emerald-600">{formatPeso(saldoCierre)}</td>
                                                        <td className="py-3 px-3 text-right">
                                                            {c.diferencia_cierre != null ? (
                                                                <span className={`text-sm font-bold ${c.diferencia_cierre === 0 ? 'text-gray-500' : c.diferencia_cierre > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                                                    {c.diferencia_cierre === 0 ? '✓ $0'
                                                                        : c.diferencia_cierre > 0 ? `+${formatPeso(c.diferencia_cierre)}`
                                                                        : formatPeso(c.diferencia_cierre)}
                                                                </span>
                                                            ) : <span className="text-gray-300 text-xs">—</span>}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            {c.estado === 'cerrada' ? (
                                                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gray-100 text-gray-600">🔒 Cerrada</span>
                                                            ) : (
                                                                <button
                                                                    onClick={() => cerrarCajaHistorial(c.id)}
                                                                    disabled={cerrandoHistorialId === c.id}
                                                                    className="text-xs px-2 py-1 bg-gray-800 hover:bg-gray-900 disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                                                                >
                                                                    {cerrandoHistorialId === c.id ? 'Cerrando...' : '🔒 Cerrar'}
                                                                </button>
                                                            )}
                                                        </td>
                                                        <td className="py-3 px-3 text-gray-500 text-xs max-w-[160px]" title={c.notas_cierre || ''}>
                                                            {c.notas_cierre ? (c.notas_cierre.length > 40 ? c.notas_cierre.slice(0, 40) + '…' : c.notas_cierre) : '-'}
                                                        </td>
                                                        <td className="py-3 px-3">
                                                            <button
                                                                onClick={() => verDetalleCaja(c)}
                                                                className="text-gray-400 hover:text-emerald-600 transition-colors"
                                                                title="Ver movimientos"
                                                            >
                                                                <Eye size={16} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Modal detalle caja historial */}
        {detalleCaja && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDetalleCaja(null)}>
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-100">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">
                                Detalle de caja — {new Date(String(detalleCaja.fecha).split('T')[0] + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </h2>
                            <p className="text-sm text-gray-400 mt-0.5 capitalize">
                                {detalleCaja.estado === 'cerrada' ? '🔒 Cerrada' : '🟢 Abierta'}
                                {detalleCaja.estado === 'cerrada' && detalleCaja.diferencia_cierre != null && (
                                    <span className={`ml-2 font-semibold ${detalleCaja.diferencia_cierre === 0 ? 'text-gray-500' : detalleCaja.diferencia_cierre > 0 ? 'text-blue-600' : 'text-red-600'}`}>
                                        {detalleCaja.diferencia_cierre === 0 ? '· ✓ Sin diferencia' : detalleCaja.diferencia_cierre > 0 ? `· ▲ Sobrante $${detalleCaja.diferencia_cierre.toLocaleString('es-AR')}` : `· ▼ Faltante $${Math.abs(detalleCaja.diferencia_cierre).toLocaleString('es-AR')}`}
                                    </span>
                                )}
                            </p>
                        </div>
                        <button onClick={() => setDetalleCaja(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <X size={24} />
                        </button>
                    </div>

                    {loadingDetalle ? (
                        <div className="p-8 text-center text-gray-400">Cargando...</div>
                    ) : (
                        <div className="p-6 space-y-6">
                            {/* Resumen */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="bg-gray-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-1">Saldo inicial</p>
                                    <p className="font-bold text-gray-800">{formatPeso(detalleCaja.saldo_inicial)}</p>
                                </div>
                                <div className="bg-green-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-1">💵 Efectivo ({detalleCaja.cant_efectivo})</p>
                                    <p className="font-bold text-green-700">{formatPeso(detalleCaja.ingresos_efectivo)}</p>
                                </div>
                                <div className="bg-blue-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-1">🏦 Transf. ({detalleCaja.cant_transferencia})</p>
                                    <p className="font-bold text-blue-700">{formatPeso(detalleCaja.ingresos_transferencia)}</p>
                                </div>
                                <div className="bg-red-50 rounded-xl p-3">
                                    <p className="text-xs text-gray-500 mb-1">Egresos</p>
                                    <p className="font-bold text-red-600">{formatPeso(detalleCaja.total_egresos)}</p>
                                </div>
                            </div>

                            {/* Ingresos */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <TrendingUp size={16} className="text-green-600" />
                                    Ingresos del día ({detalleLavados.length} lavados)
                                </h3>
                                {detalleLavados.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Sin ingresos registrados.</p>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-gray-100">
                                                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Hora</th>
                                                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Cliente</th>
                                                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Patente</th>
                                                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Servicio</th>
                                                    <th className="text-right py-2 px-2 text-gray-500 font-medium">Monto</th>
                                                    <th className="text-left py-2 px-2 text-gray-500 font-medium">Método</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {detalleLavados.map((l) => (
                                                    <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                        <td className="py-2 px-2 text-gray-500">{formatHora(l.fecha_pago || l.fecha_entregado)}</td>
                                                        <td className="py-2 px-2 font-medium text-gray-900">{l.nombre_cliente}</td>
                                                        <td className="py-2 px-2 font-mono text-gray-700">{l.patente}</td>
                                                        <td className="py-2 px-2 text-gray-600">
                                                            {l.tipo_limpieza.replace(/_/g, ' ')}
                                                            {l.extras && l.extras_valor ? (
                                                                <span className="block text-xs text-blue-500 mt-0.5">+ {l.extras} ({formatPeso(parseFloat(String(l.extras_valor)))})</span>
                                                            ) : null}
                                                        </td>
                                                        <td className="py-2 px-2 font-bold text-right text-gray-900">{formatPeso(parseFloat(String(l.precio)) || 0)}</td>
                                                        <td className="py-2 px-2">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${l.metodo_pago === 'efectivo' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                                {l.metodo_pago === 'efectivo' ? '💵 Efectivo' : '🏦 Transfer.'}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Egresos */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                    <TrendingDown size={16} className="text-red-500" />
                                    Egresos y Retiros ({detalleEgresos.length})
                                </h3>
                                {detalleEgresos.length === 0 ? (
                                    <p className="text-gray-400 text-sm">Sin egresos registrados.</p>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-100">
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Hora</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Tipo</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Categoría</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Detalle</th>
                                                <th className="text-right py-2 px-2 text-gray-500 font-medium">Monto</th>
                                                <th className="text-left py-2 px-2 text-gray-500 font-medium">Pago</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {detalleEgresos.map((e) => (
                                                <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50">
                                                    <td className="py-2 px-2 text-gray-500">{formatHora(e.created_at)}</td>
                                                    <td className="py-2 px-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.tipo === 'retiro' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                            {e.tipo === 'retiro' ? '💰 Retiro' : '📤 Egreso'}
                                                        </span>
                                                    </td>
                                                    <td className="py-2 px-2 text-gray-700 capitalize">{e.categoria || '-'}</td>
                                                    <td className="py-2 px-2 text-gray-600">{e.descripcion || '-'}</td>
                                                    <td className="py-2 px-2 font-bold text-right text-red-600">{formatPeso(parseFloat(String(e.monto)) || 0)}</td>
                                                    <td className="py-2 px-2">
                                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${e.metodo_pago === 'transferencia' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                                                            {e.metodo_pago === 'transferencia' ? '🏦 Transfer.' : '💵 Efectivo'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {detalleCaja.notas_cierre && (
                                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-2">
                                    📝 {detalleCaja.notas_cierre}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        )}
        </>
    );
}
