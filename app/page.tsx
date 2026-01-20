'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Car, LogOut, History, Plus, Send, Users, Wallet, Ban, DollarSign, TrendingUp } from 'lucide-react';
import { getAuthUser, clearAuth, getLoginUrl } from '@/lib/auth-utils';
import UpsellBanner from './components/UpsellBanner';

interface Registro {
    id: number;
    marca_modelo: string;
    patente: string;
    tipo_limpieza: string;
    nombre_cliente: string;
    celular: string;
    fecha_ingreso: string;
    estado: string;
    tipo_vehiculo?: string;
    precio?: number;
    extras?: string;
    extras_valor?: number;
    pagado?: boolean;
    metodo_pago?: string;
    usa_cuenta_corriente?: boolean;
}

export default function Home() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [userId, setUserId] = useState<number | null>(null);
    const [userRole, setUserRole] = useState<string>('operador');
    const [mounted, setMounted] = useState(false);
    const [preciosDinamicos, setPreciosDinamicos] = useState<any>(null);
    const [empresaNombre, setEmpresaNombre] = useState<string>('DeltaWash');

    // Form states
    const [marca, setMarca] = useState('');
    const [modelo, setModelo] = useState('');
    const [patente, setPatente] = useState('');
    const [tipoVehiculo, setTipoVehiculo] = useState('auto');
    const [tiposLimpieza, setTiposLimpieza] = useState<string[]>([]);
    const [nombreCliente, setNombreCliente] = useState('');
    const [celular, setCelular] = useState('');
    const [extras, setExtras] = useState('');
    const [extrasValor, setExtrasValor] = useState('');
    const [precio, setPrecio] = useState(0);
    const [usaCuentaCorriente, setUsaCuentaCorriente] = useState(false);
    const [cuentaCorriente, setCuentaCorriente] = useState<any>(null);
    const [pagado, setPagado] = useState(false);
    const [metodoPago, setMetodoPago] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    // Estados para el modal de pago
    const [showModalPago, setShowModalPago] = useState(false);
    const [registroParaPago, setRegistroParaPago] = useState<number | null>(null);
    const [metodoPagoModal, setMetodoPagoModal] = useState<string>('efectivo');

    // Estados para upselling
    const [showUpsellBanner, setShowUpsellBanner] = useState(false);
    const [upsellPromocion, setUpsellPromocion] = useState<any>(null);
    const [upsellCliente, setUpsellCliente] = useState<any>(null);
    const [descuentoAplicado, setDescuentoAplicado] = useState(0);

    // Registros en proceso y listos
    const [registrosEnProceso, setRegistrosEnProceso] = useState<Registro[]>([]);
    const [registrosListos, setRegistrosListos] = useState<Registro[]>([]);

    useEffect(() => {
        setMounted(true);
        if (typeof window !== 'undefined') {
            const user = getAuthUser();
            if (!user) {
                router.push(getLoginUrl());
            } else {
                console.log(`[App] Usuario ${user.isSaas ? 'SaaS' : 'DeltaWash legacy'} detectado`);
                setUsername(user.nombre);
                setUserId(user.id);
                setUserRole(user.rol);

                // Cargar nombre de empresa según tipo de usuario
                if (user.isSaas) {
                    // Usuario SaaS: cargar nombre de empresa desde localStorage
                    const nombreEmpresa = localStorage.getItem('empresaNombre');
                    if (nombreEmpresa) {
                        setEmpresaNombre(nombreEmpresa);
                    }
                } else {
                    // Usuario Legacy: siempre mostrar "DeltaWash"
                    setEmpresaNombre('DeltaWash');
                }

                cargarPreciosDinamicos();
                cargarRegistrosEnProceso();
            }
        }
    }, [router]);

    const cargarPreciosDinamicos = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/listas-precios/obtener-precios', {
                headers: authToken ? {
                    'Authorization': `Bearer ${authToken}`
                } : {}
            });
            const data = await res.json();
            if (data.success) {
                setPreciosDinamicos(data.precios);
            }
        } catch (error) {
            console.error('Error cargando precios:', error);
            // Si falla, quedará null y usará los precios hardcodeados como fallback
        }
    };

    const cargarRegistrosEnProceso = async () => {
        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const fetchOptions = authToken ? {
                headers: { 'Authorization': `Bearer ${authToken}` }
            } : {};

            const resEnProceso = await fetch('/api/registros?estado=en_proceso', fetchOptions);
            const dataEnProceso = await resEnProceso.json();
            if (dataEnProceso.success && Array.isArray(dataEnProceso.registros)) {
                setRegistrosEnProceso(dataEnProceso.registros);
            } else {
                setRegistrosEnProceso([]);
            }

            const resListos = await fetch('/api/registros?estado=listo', fetchOptions);
            const dataListos = await resListos.json();
            if (dataListos.success && Array.isArray(dataListos.registros)) {
                setRegistrosListos(dataListos.registros);
            } else {
                setRegistrosListos([]);
            }
        } catch (error) {
            console.error('Error cargando registros:', error);
            setRegistrosEnProceso([]);
            setRegistrosListos([]);
        }
    };

    // Buscar cuenta corriente por celular
    const buscarCuentaCorriente = async (celularBuscar: string) => {
        if (!celularBuscar || celularBuscar.length < 8) {
            setCuentaCorriente(null);
            setUsaCuentaCorriente(false);
            return;
        }

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch(`/api/cuentas-corrientes?celular=${celularBuscar}`, {
                headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
            });
            const data = await res.json();

            if (data.success && data.found) {
                setCuentaCorriente(data.cuenta);
            } else {
                setCuentaCorriente(null);
                setUsaCuentaCorriente(false);
            }
        } catch (error) {
            console.error('Error buscando cuenta corriente:', error);
            setCuentaCorriente(null);
            setUsaCuentaCorriente(false);
        }
    };

    // Detectar clientes elegibles para upselling
    const detectarUpselling = async (celularBuscar: string, nombreCliente: string) => {
        if (!celularBuscar || celularBuscar.length < 8) {
            return;
        }

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/upselling/detectar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ celular: celularBuscar })
            });

            const data = await res.json();

            if (data.success && data.elegible) {
                setUpsellPromocion(data.promocion);
                setUpsellCliente(data.cliente);
                setShowUpsellBanner(true);
            }
        } catch (error) {
            console.error('Error detectando upselling:', error);
        }
    };

    // Handlers para el banner de upselling
    const handleUpsellAceptar = (descuento: number) => {
        setDescuentoAplicado(descuento);
        setShowUpsellBanner(false);

        // Aplicar descuento al precio actual
        const precioConDescuento = upsellPromocion.descuento_porcentaje > 0
            ? precio * (1 - upsellPromocion.descuento_porcentaje / 100)
            : precio - upsellPromocion.descuento_fijo;

        setPrecio(Math.max(0, precioConDescuento));
        setMessage(`✅ ¡Descuento aplicado! Ahorrás $${(precio - Math.max(0, precioConDescuento)).toLocaleString('es-AR')}`);
    };

    const handleUpsellRechazar = () => {
        setShowUpsellBanner(false);
        setMessage('👍 Entendido. Seguimos con el registro normal.');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleUpsellInteresFuturo = () => {
        setShowUpsellBanner(false);
        setMessage('📝 Perfecto! Te lo ofreceremos en su próxima visita.');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleUpsellCerrar = () => {
        setShowUpsellBanner(false);
    };

    // Función para calcular el precio según tipo de vehículo y lavado
    const calcularPrecio = (tipoVeh: string, tiposLav: string[]) => {
        // Validación defensiva
        if (!tiposLav || !Array.isArray(tiposLav) || tiposLav.length === 0) {
            return 0;
        }

        // Precios fallback por servicio y vehículo
        const preciosFallback: { [servicio: string]: { [vehiculo: string]: number } } = {
            'simple_exterior': { 'auto': 15000, 'mono': 20000, 'camioneta': 25000, 'camioneta_xl': 28000, 'moto': 10000 },
            'simple': { 'auto': 22000, 'mono': 30000, 'camioneta': 35000, 'camioneta_xl': 38000, 'moto': 15000 },
            'con_cera': { 'auto': 2000, 'mono': 2000, 'camioneta': 5000, 'camioneta_xl': 4000, 'moto': 0 },
            'pulido': { 'auto': 35000, 'mono': 45000, 'camioneta': 50000, 'camioneta_xl': 55000, 'moto': 0 },
            'limpieza_chasis': { 'auto': 20000, 'mono': 30000, 'camioneta': 35000, 'camioneta_xl': 40000, 'moto': 0 },
            'limpieza_motor': { 'auto': 15000, 'mono': 20000, 'camioneta': 25000, 'camioneta_xl': 30000, 'moto': 10000 }
        };

        let total = 0;

        // Calcular precio por cada servicio seleccionado
        tiposLav.forEach(tipo => {
            // Intentar primero desde precios dinámicos de la BD
            // IMPORTANTE: Verificar con !== undefined para permitir precios en $0
            if (preciosDinamicos && preciosDinamicos[tipoVeh] && preciosDinamicos[tipoVeh][tipo] !== undefined) {
                total += preciosDinamicos[tipoVeh][tipo];
            }
            // Si no existe en BD, usar fallback (solo para compatibilidad con datos antiguos)
            else if (preciosFallback[tipo] && preciosFallback[tipo][tipoVeh] !== undefined) {
                total += preciosFallback[tipo][tipoVeh];
            }
        });

        return total;
    };

    // Función para obtener precio individual de UN solo servicio
    const obtenerPrecioIndividual = (tipoVeh: string, tipoServicio: string): number => {
        const preciosFallback: { [servicio: string]: { [vehiculo: string]: number } } = {
            'simple_exterior': { 'auto': 15000, 'mono': 20000, 'camioneta': 25000, 'camioneta_xl': 28000, 'moto': 10000 },
            'simple': { 'auto': 22000, 'mono': 30000, 'camioneta': 35000, 'camioneta_xl': 38000, 'moto': 15000 },
            'con_cera': { 'auto': 2000, 'mono': 2000, 'camioneta': 5000, 'camioneta_xl': 4000, 'moto': 0 },
            'pulido': { 'auto': 35000, 'mono': 45000, 'camioneta': 50000, 'camioneta_xl': 55000, 'moto': 0 },
            'limpieza_chasis': { 'auto': 20000, 'mono': 30000, 'camioneta': 35000, 'camioneta_xl': 40000, 'moto': 0 },
            'limpieza_motor': { 'auto': 15000, 'mono': 20000, 'camioneta': 25000, 'camioneta_xl': 30000, 'moto': 10000 }
        };

        // Precio desde BD
        if (preciosDinamicos && preciosDinamicos[tipoVeh] && preciosDinamicos[tipoVeh][tipoServicio] !== undefined) {
            return preciosDinamicos[tipoVeh][tipoServicio];
        }

        // Fallback
        if (preciosFallback[tipoServicio] && preciosFallback[tipoServicio][tipoVeh] !== undefined) {
            return preciosFallback[tipoServicio][tipoVeh];
        }

        return 0;
    };

    // Recalcular precio cuando cambia el tipo de vehículo, tipos de limpieza o extras
    useEffect(() => {
        const precioBase = calcularPrecio(tipoVehiculo, tiposLimpieza);
        const valorExtras = parseFloat(extrasValor) || 0;
        let precioTotal = precioBase + valorExtras;

        // Si hay descuento de upselling aplicado, aplicarlo al precio total
        if (descuentoAplicado > 0 && upsellPromocion) {
            if (upsellPromocion.descuento_porcentaje > 0) {
                precioTotal = precioTotal * (1 - upsellPromocion.descuento_porcentaje / 100);
            } else {
                precioTotal = precioTotal - upsellPromocion.descuento_fijo;
            }
            precioTotal = Math.max(0, precioTotal);
        }

        setPrecio(precioTotal);
    }, [tipoVehiculo, tiposLimpieza, extrasValor, preciosDinamicos, descuentoAplicado, upsellPromocion]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (tiposLimpieza.length === 0) {
            setMessage('❌ Debes seleccionar al menos un tipo de limpieza');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({
                    marca_modelo: `${marca} ${modelo}`.trim(),
                    patente: patente.toUpperCase(),
                    tipo_vehiculo: tipoVehiculo,
                    tipo_limpieza: tiposLimpieza.join(', '),
                    nombre_cliente: nombreCliente,
                    celular: celular,
                    extras: extras || null,
                    extras_valor: parseFloat(extrasValor) || 0,
                    precio: precio,
                    usuario_id: userId,
                    usa_cuenta_corriente: usaCuentaCorriente,
                    cuenta_corriente_id: usaCuentaCorriente && cuentaCorriente ? cuentaCorriente.id : null,
                    pagado: pagado,
                    metodo_pago: pagado ? metodoPago : null,
                }),
            });

            const data = await res.json();

            if (data.success) {
                let mensaje = '✅ Auto registrado exitosamente';
                if (data.cuenta_corriente) {
                    mensaje += `\n💰 Saldo descontado: $${data.cuenta_corriente.monto_descontado.toLocaleString('es-AR')}`;
                    mensaje += `\n💳 Nuevo saldo: $${data.cuenta_corriente.saldo_nuevo.toLocaleString('es-AR')}`;
                }
                setMessage(mensaje);
                // Limpiar formulario
                setMarca('');
                setModelo('');
                setPatente('');
                setTipoVehiculo('auto');
                setTiposLimpieza([]);
                setNombreCliente('');
                setCelular('');
                setExtras('');
                setExtrasValor('');
                setPrecio(0);
                setUsaCuentaCorriente(false);
                setCuentaCorriente(null);
                setPagado(false);
                setMetodoPago('');
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
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/marcar-listo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
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
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/enviar-whatsapp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (data.success) {
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

    const registrarPago = (id: number) => {
        setRegistroParaPago(id);
        setMetodoPagoModal('efectivo'); // Reiniciar a efectivo
        setShowModalPago(true);
    };

    const confirmarPago = async () => {
        if (!registroParaPago) return;

        try {
            console.log('Registrando pago:', { id: registroParaPago, metodo_pago: metodoPagoModal });

            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/registrar-pago', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id: registroParaPago, metodo_pago: metodoPagoModal }),
            });

            console.log('Response status:', res.status);

            if (!res.ok) {
                const errorText = await res.text();
                console.error('Error response:', errorText);
                alert(`❌ Error del servidor: ${res.status}`);
                return;
            }

            const data = await res.json();
            console.log('Response data:', data);

            if (data.success) {
                alert('✅ Pago registrado exitosamente');
                setShowModalPago(false);
                setRegistroParaPago(null);
                cargarRegistrosEnProceso();
            } else {
                alert('❌ ' + (data.message || 'Error desconocido'));
            }
        } catch (error) {
            console.error('Error completo al registrar pago:', error);
            alert('❌ Error al registrar pago: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const marcarComoEntregado = async (id: number) => {
        if (!confirm('¿Marcar este auto como entregado?')) {
            return;
        }

        try {
            console.log('Marcando como entregado:', { id });

            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/marcar-entregado', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id }),
            });

            console.log('Response status:', res.status);

            const data = await res.json();
            console.log('Response data:', data);

            if (data.success) {
                alert('✅ Auto marcado como entregado');
                cargarRegistrosEnProceso();
            } else {
                // Manejar error de pago pendiente
                if (data.error === 'pago_pendiente') {
                    const confirmarRegistroPago = confirm(
                        '⚠️ PAGO PENDIENTE\n\n' +
                        data.message + '\n\n' +
                        '¿Deseas registrar el pago ahora?'
                    );
                    if (confirmarRegistroPago) {
                        registrarPago(id);
                    }
                } else {
                    alert('❌ Error al marcar como entregado: ' + (data.message || data.error || 'Error desconocido'));
                }
            }
        } catch (error) {
            console.error('Error completo al marcar como entregado:', error);
            alert('❌ Error al marcar como entregado: ' + (error instanceof Error ? error.message : 'Error desconocido'));
        }
    };

    const cancelarRegistro = async (id: number) => {
        const motivo = prompt('¿Por qué se cancela? (opcional)');
        if (motivo === null) return;

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/cancelar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
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

    const anularRegistro = async (id: number) => {
        const motivo = prompt('⚠️ ¿Por qué se anula este registro?\n\nEl registro quedará marcado como anulado y NO se contará en estadísticas ni facturación.\nSi usó cuenta corriente, se revertirá el saldo.');

        if (motivo === null) return; // Usuario canceló

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/anular', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id, motivo, usuario_id: userId }),
            });

            const data = await res.json();

            if (data.success) {
                let mensaje = '✅ Registro anulado exitosamente';
                if (data.saldo_revertido) {
                    mensaje += `\n💰 Saldo revertido: $${data.saldo_revertido.toLocaleString('es-AR')}`;
                }
                alert(mensaje);
                cargarRegistrosEnProceso();
            } else {
                alert('❌ Error: ' + data.message);
            }
        } catch (error) {
            alert('❌ Error al anular registro');
        }
    };

    const eliminarRegistro = async (id: number) => {
        if (!confirm('⚠️ ¿ELIMINAR este registro permanentemente?\n\nEsta acción NO se puede deshacer.\nSi usó cuenta corriente, se revertirá el movimiento.')) {
            return;
        }

        try {
            const user = getAuthUser();
            const authToken = user?.isSaas
                ? localStorage.getItem('authToken')
                : localStorage.getItem('lavadero_token');

            const res = await fetch('/api/registros/eliminar', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(authToken && { 'Authorization': `Bearer ${authToken}` })
                },
                body: JSON.stringify({ id }),
            });

            const data = await res.json();

            if (data.success) {
                let mensaje = '✅ Registro eliminado exitosamente';
                if (data.cuenta_corriente_revertida) {
                    mensaje += '\n💰 Movimiento de cuenta corriente revertido';
                }
                alert(mensaje);
                cargarRegistrosEnProceso();
            } else {
                alert('❌ Error al eliminar registro');
            }
        } catch (error) {
            alert('❌ Error al eliminar registro');
        }
    };

    const handleLogout = () => {
        const redirectUrl = getLoginUrl(true); // Detectar ANTES de limpiar
        clearAuth();
        router.push(redirectUrl);
    };

    if (!mounted) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 via-cyan-500 to-teal-500 p-4 overflow-x-hidden">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex justify-between items-start mb-3">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-2">
                                <Car size={32} />
                                <h1 className="text-3xl font-bold">{empresaNombre}</h1>
                            </div>
                            <p className="text-sm opacity-90">Bienvenido/a, {username}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all flex-shrink-0"
                        >
                            <LogOut size={18} />
                            <span className="text-sm hidden sm:inline">Salir</span>
                        </button>
                    </div>
                    {userRole === 'admin' && (
                        <div className="flex flex-wrap gap-2">
                            <Link
                                href="/reportes"
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                            >
                                <TrendingUp size={16} />
                                <span>Reportes</span>
                            </Link>
                            <Link
                                href="/cuentas-corrientes"
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                            >
                                <Wallet size={16} />
                                <span>Cuentas</span>
                            </Link>
                            <Link
                                href="/listas-precios"
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                            >
                                <DollarSign size={16} />
                                <span>Precios</span>
                            </Link>
                            <Link
                                href="/usuarios"
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                            >
                                <Users size={16} />
                                <span>Usuarios</span>
                            </Link>
                            <Link
                                href="/clientes"
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                            >
                                <Users size={16} />
                                <span>Clientes</span>
                            </Link>
                            <Link
                                href="/historial"
                                className="flex items-center gap-2 px-3 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all text-sm"
                            >
                                <History size={16} />
                                <span>Historial</span>
                            </Link>
                            {/* Solo mostrar Upselling para usuarios SaaS */}
                            {getAuthUser()?.isSaas && (
                                <Link
                                    href="/admin/upselling"
                                    className="flex items-center gap-2 px-3 py-2 bg-purple-500/90 hover:bg-purple-600 text-white rounded-lg transition-all text-sm"
                                >
                                    <TrendingUp size={16} />
                                    <span>Upselling</span>
                                </Link>
                            )}
                        </div>
                    )}
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

                                        if (value.length >= 6) {
                                            try {
                                                const user = getAuthUser();
                                                const authToken = user?.isSaas
                                                    ? localStorage.getItem('authToken')
                                                    : localStorage.getItem('lavadero_token');

                                                const res = await fetch(`/api/registros/buscar-patente?patente=${value}`, {
                                                    headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
                                                });
                                                const data = await res.json();

                                                if (data.found) {
                                                    setMarca(data.data.marca);
                                                    setModelo(data.data.modelo);
                                                    setNombreCliente(data.data.nombre_cliente);
                                                    setCelular(data.data.celular);
                                                    // Autocompletar tipo de vehículo si está disponible
                                                    if (data.data.tipo_vehiculo) {
                                                        setTipoVehiculo(data.data.tipo_vehiculo);
                                                    }
                                                    // Buscar cuenta corriente automáticamente
                                                    if (data.data.celular && data.data.celular.length >= 8) {
                                                        buscarCuentaCorriente(data.data.celular);
                                                        // Detectar upselling para clientes frecuentes al autocompletar
                                                        if (data.data.nombre_cliente) {
                                                            detectarUpselling(data.data.celular, data.data.nombre_cliente);
                                                        }
                                                    }
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
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    Tipo de Vehículo
                                </label>
                                <select
                                    value={tipoVehiculo}
                                    onChange={(e) => setTipoVehiculo(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    required
                                >
                                    <option value="auto">Auto</option>
                                    <option value="mono">Mono (SUV)</option>
                                    <option value="camioneta">Camioneta</option>
                                    <option value="camioneta_xl">Camioneta XL</option>
                                    <option value="moto">Moto</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Tipos de Limpieza (puedes seleccionar varios)
                                </label>
                                <div className="space-y-2">
                                    {[
                                        { value: 'simple_exterior', label: 'Simple Exterior (solo por fuera)' },
                                        { value: 'simple', label: 'Simple' },
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
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setCelular(value);
                                        // Buscar cuenta corriente cuando el celular tiene suficientes dígitos
                                        if (value.length >= 8) {
                                            buscarCuentaCorriente(value);
                                            // Detectar upselling para clientes frecuentes
                                            if (nombreCliente) {
                                                detectarUpselling(value, nombreCliente);
                                            }
                                        } else {
                                            setCuentaCorriente(null);
                                            setUsaCuentaCorriente(false);
                                        }
                                    }}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                    placeholder="11-12345678"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Formato: código de área + número (ej: 11-12345678)
                                </p>
                                {cuentaCorriente && (
                                    <div className={`mt-2 p-3 rounded-lg ${parseFloat(cuentaCorriente.saldo_actual) >= 0 ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={usaCuentaCorriente}
                                                onChange={(e) => setUsaCuentaCorriente(e.target.checked)}
                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                            />
                                            <span className="text-sm font-medium text-green-900">
                                                Usar Cuenta Corriente
                                            </span>
                                        </label>
                                        {userRole === 'admin' && (
                                            <>
                                                <p className={`text-xs mt-1 ml-6 ${parseFloat(cuentaCorriente.saldo_actual) >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                                                    💰 Saldo actual: <strong>${parseFloat(cuentaCorriente.saldo_actual).toLocaleString('es-AR')}</strong>
                                                </p>
                                                {usaCuentaCorriente && precio > 0 && (
                                                    <p className={`text-xs mt-1 ml-6 ${(parseFloat(cuentaCorriente.saldo_actual) - precio) >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                                                        Saldo después del lavado: <strong>${(parseFloat(cuentaCorriente.saldo_actual) - precio).toLocaleString('es-AR')}</strong>
                                                    </p>
                                                )}
                                            </>
                                        )}
                                        {userRole !== 'admin' && (
                                            <p className={`text-xs mt-1 ml-6 ${parseFloat(cuentaCorriente.saldo_actual) >= 0 ? 'text-green-700' : 'text-orange-700'}`}>
                                                {parseFloat(cuentaCorriente.saldo_actual) >= 0
                                                    ? '✅ Cliente tiene cuenta corriente disponible'
                                                    : '⚠️ Cliente tiene cuenta corriente (saldo en negativo)'}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="border-t border-gray-200 pt-4">
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Extras (Opcional)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Descripción
                                        </label>
                                        <input
                                            type="text"
                                            value={extras}
                                            onChange={(e) => setExtras(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            placeholder="Ej: Lavado de tapizados"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-600 mb-1">
                                            Valor ($)
                                        </label>
                                        <input
                                            type="number"
                                            value={extrasValor}
                                            onChange={(e) => setExtrasValor(e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                                            placeholder="0"
                                            min="0"
                                            step="1000"
                                        />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    Agrega servicios adicionales y su costo
                                </p>
                            </div>

                            {precio > 0 && (
                                <div className={`${descuentoAplicado > 0 ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                                    <p className="text-xs font-semibold text-blue-900 mb-3">📋 Resumen de Servicios:</p>
                                    {descuentoAplicado > 0 && (
                                        <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 mb-3">
                                            <p className="text-xs font-bold text-purple-900">
                                                🎉 Descuento Upselling Aplicado: {upsellPromocion?.descuento_porcentaje > 0 ? `${upsellPromocion.descuento_porcentaje}%` : `$${upsellPromocion?.descuento_fijo.toLocaleString('es-AR')}`}
                                            </p>
                                        </div>
                                    )}
                                    <div className="space-y-2 mb-3">
                                        {/* Mostrar cada servicio seleccionado con su precio individual */}
                                        {tiposLimpieza.map((tipo) => {
                                            const precioServicio = obtenerPrecioIndividual(tipoVehiculo, tipo);
                                            if (precioServicio === 0) return null;

                                            // Nombres legibles para cada servicio
                                            const nombreServicio = {
                                                'simple_exterior': 'Simple Exterior (solo por fuera)',
                                                'simple': 'Simple (completo)',
                                                'con_cera': 'Con Cera (incremento)',
                                                'pulido': 'Pulido',
                                                'limpieza_chasis': 'Limpieza de Chasis',
                                                'limpieza_motor': 'Limpieza de Motor'
                                            }[tipo] || tipo;

                                            return (
                                                <div key={tipo} className="flex justify-between text-sm items-center">
                                                    <span className="text-gray-700 flex items-center gap-1">
                                                        <span className="text-blue-500">•</span>
                                                        {nombreServicio}
                                                    </span>
                                                    <span className="font-semibold text-gray-900">
                                                        ${precioServicio.toLocaleString('es-AR')}
                                                    </span>
                                                </div>
                                            );
                                        })}

                                        {/* Extras */}
                                        {extrasValor && parseFloat(extrasValor) > 0 && (
                                            <div className="flex justify-between text-sm items-center">
                                                <span className="text-gray-700 flex items-center gap-1">
                                                    <span className="text-blue-500">•</span>
                                                    {extras || 'Extras'}
                                                </span>
                                                <span className="font-semibold text-gray-900">
                                                    ${parseFloat(extrasValor).toLocaleString('es-AR')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="border-t border-blue-300 pt-2 flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-900">Precio Total:</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            ${precio.toLocaleString('es-AR')}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Sección de Pago */}
                            {!usaCuentaCorriente && (
                                <div className="border-t border-gray-200 pt-4">
                                    <label className="block text-sm font-medium text-gray-900 mb-3">
                                        💰 Pago
                                    </label>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={pagado}
                                                onChange={(e) => {
                                                    setPagado(e.target.checked);
                                                    if (!e.target.checked) {
                                                        setMetodoPago('');
                                                    }
                                                }}
                                                className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                                            />
                                            <span className="text-sm font-medium text-gray-900">
                                                Cliente pagó al ingresar
                                            </span>
                                        </label>

                                        {pagado && (
                                            <div className="ml-6 space-y-2">
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="metodoPago"
                                                        value="efectivo"
                                                        checked={metodoPago === 'efectivo'}
                                                        onChange={(e) => setMetodoPago(e.target.value)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                    />
                                                    <span className="text-sm text-gray-900">💵 Efectivo</span>
                                                </label>
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="metodoPago"
                                                        value="transferencia"
                                                        checked={metodoPago === 'transferencia'}
                                                        onChange={(e) => setMetodoPago(e.target.value)}
                                                        className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                                                    />
                                                    <span className="text-sm text-gray-900">🏦 Transferencia</span>
                                                </label>
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Si no paga ahora, podrás registrar el pago cuando retire el vehículo
                                    </p>
                                </div>
                            )}

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
                                                    {registro.tipo_vehiculo && (
                                                        <p className="text-xs text-blue-600 font-semibold">
                                                            {registro.tipo_vehiculo === 'auto' && '🚗 Auto'}
                                                            {registro.tipo_vehiculo === 'mono' && '🚙 Mono (SUV)'}
                                                            {registro.tipo_vehiculo === 'camioneta' && '🚐 Camioneta'}
                                                            {registro.tipo_vehiculo === 'camioneta_xl' && '🚐 Camioneta XL'}
                                                            {registro.tipo_vehiculo === 'moto' && '🏍️ Moto'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    {registro.precio && registro.precio > 0 && (
                                                        <span className="text-lg font-bold text-blue-600 block mb-2">
                                                            ${registro.precio.toLocaleString('es-AR')}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Cliente: {registro.nombre_cliente}
                                            </p>

                                            {/* Desglose de servicios */}
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                                                <p className="text-xs font-semibold text-blue-900 mb-2">📋 Servicios incluidos:</p>
                                                {registro.tipo_limpieza.split(', ').map((servicio, idx) => (
                                                    <div key={idx} className="text-xs text-blue-800 flex items-center gap-1">
                                                        <span className="text-blue-500">•</span>
                                                        <span className="capitalize">{servicio.replace(/_/g, ' ')}</span>
                                                    </div>
                                                ))}
                                                {registro.extras && (
                                                    <div className="text-xs text-blue-800 flex items-center gap-1 mt-1">
                                                        <span className="text-blue-500">•</span>
                                                        <span>{registro.extras} <span className="font-semibold">(+${registro.extras_valor?.toLocaleString('es-AR')})</span></span>
                                                    </div>
                                                )}
                                            </div>

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
                                                    {registro.tipo_vehiculo && (
                                                        <p className="text-xs text-blue-600 font-semibold">
                                                            {registro.tipo_vehiculo === 'auto' && '🚗 Auto'}
                                                            {registro.tipo_vehiculo === 'mono' && '🚙 Mono (SUV)'}
                                                            {registro.tipo_vehiculo === 'camioneta' && '🚐 Camioneta'}
                                                            {registro.tipo_vehiculo === 'camioneta_xl' && '🚐 Camioneta XL'}
                                                            {registro.tipo_vehiculo === 'moto' && '🏍️ Moto'}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded font-semibold block mb-1">
                                                        LISTO
                                                    </span>
                                                    {registro.precio && registro.precio > 0 && (
                                                        <span className="text-sm font-bold text-blue-600 block mb-1">
                                                            ${registro.precio.toLocaleString('es-AR')}
                                                        </span>
                                                    )}
                                                    {/* Indicador de estado de pago */}
                                                    {registro.usa_cuenta_corriente ? (
                                                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold block">
                                                            💳 Cta.Cte.
                                                        </span>
                                                    ) : registro.pagado ? (
                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded font-semibold block">
                                                            ✓ Pagado
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold block">
                                                            ⏳ Pendiente
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-2">
                                                Cliente: {registro.nombre_cliente}
                                            </p>

                                            {/* Desglose de servicios */}
                                            <div className="bg-orange-100 border border-orange-300 rounded-lg p-3 mb-3">
                                                <p className="text-xs font-semibold text-orange-900 mb-2">📋 Servicios incluidos:</p>
                                                {registro.tipo_limpieza.split(', ').map((servicio, idx) => (
                                                    <div key={idx} className="text-xs text-orange-800 flex items-center gap-1">
                                                        <span className="text-orange-500">•</span>
                                                        <span className="capitalize">{servicio.replace(/_/g, ' ')}</span>
                                                    </div>
                                                ))}
                                                {registro.extras && (
                                                    <div className="text-xs text-orange-800 flex items-center gap-1 mt-1">
                                                        <span className="text-orange-500">•</span>
                                                        <span>{registro.extras} <span className="font-semibold">(+${registro.extras_valor?.toLocaleString('es-AR')})</span></span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex gap-2">
                                                    {userRole === 'admin' && (
                                                        <button
                                                            onClick={() => enviarWhatsApp(registro.id)}
                                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                                                        >
                                                            <Send size={16} />
                                                            WhatsApp
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => marcarComoEntregado(registro.id)}
                                                        className={`${userRole === 'admin' ? 'flex-1' : 'w-full'} flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm`}
                                                    >
                                                        ✓ Entregado
                                                    </button>
                                                </div>
                                                {/* Mostrar botón de pago solo si no está pagado y no usó cuenta corriente */}
                                                {!registro.pagado && !registro.usa_cuenta_corriente && (
                                                    <button
                                                        onClick={() => registrarPago(registro.id)}
                                                        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
                                                    >
                                                        💰 Registrar Pago
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal de Pago */}
                {showModalPago && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">💰 Registrar Pago</h3>

                            <p className="text-sm text-gray-600 mb-6">
                                Selecciona la forma de pago del cliente:
                            </p>

                            <div className="space-y-3 mb-6">
                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="metodoPagoModal"
                                        value="efectivo"
                                        checked={metodoPagoModal === 'efectivo'}
                                        onChange={(e) => setMetodoPagoModal(e.target.value)}
                                        className="w-5 h-5 text-green-600 border-gray-300 focus:ring-green-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-lg font-semibold text-gray-900">💵 Efectivo</span>
                                        <p className="text-xs text-gray-500">Pago en efectivo</p>
                                    </div>
                                </label>

                                <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                    <input
                                        type="radio"
                                        name="metodoPagoModal"
                                        value="transferencia"
                                        checked={metodoPagoModal === 'transferencia'}
                                        onChange={(e) => setMetodoPagoModal(e.target.value)}
                                        className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-500"
                                    />
                                    <div className="flex-1">
                                        <span className="text-lg font-semibold text-gray-900">🏦 Transferencia</span>
                                        <p className="text-xs text-gray-500">Pago por transferencia bancaria</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowModalPago(false);
                                        setRegistroParaPago(null);
                                    }}
                                    className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmarPago}
                                    className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                                >
                                    Confirmar Pago
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Banner de Upselling - Solo para SaaS */}
                {getAuthUser()?.isSaas && showUpsellBanner && upsellPromocion && upsellCliente && (
                    <UpsellBanner
                        promocion={upsellPromocion}
                        cliente={upsellCliente}
                        clienteNombre={nombreCliente}
                        clienteCelular={celular}
                        onAceptar={handleUpsellAceptar}
                        onRechazar={handleUpsellRechazar}
                        onInteresFuturo={handleUpsellInteresFuturo}
                        onCerrar={handleUpsellCerrar}
                    />
                )}
            </div>
        </div>
    );
}
