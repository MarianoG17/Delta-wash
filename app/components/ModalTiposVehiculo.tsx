'use client';

import { useState, useEffect } from 'react';

interface TipoVehiculo {
    id: number;
    nombre: string;
    orden: number;
    activo: boolean;
}

interface ModalTiposVehiculoProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function ModalTiposVehiculo({ isOpen, onClose, onUpdate }: ModalTiposVehiculoProps) {
    const [tipos, setTipos] = useState<TipoVehiculo[]>([]);
    const [loading, setLoading] = useState(false);
    const [editando, setEditando] = useState<number | null>(null);
    const [nuevoNombre, setNuevoNombre] = useState('');
    const [agregando, setAgregando] = useState(false);

    useEffect(() => {
        if (isOpen) {
            cargarTipos();
        }
    }, [isOpen]);

    const cargarTipos = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/tipos-vehiculo', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTipos(data.tipos || []);
            }
        } catch (error) {
            console.error('Error al cargar tipos:', error);
            alert('Error al cargar tipos de vehículo');
        } finally {
            setLoading(false);
        }
    };

    const handleEditar = (id: number, nombreActual: string) => {
        setEditando(id);
        setNuevoNombre(nombreActual);
    };

    const handleCancelarEdicion = () => {
        setEditando(null);
        setNuevoNombre('');
    };

    const handleGuardarEdicion = async (id: number) => {
        if (!nuevoNombre.trim()) {
            alert('El nombre no puede estar vacío');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tipos-vehiculo/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: nuevoNombre.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                setEditando(null);
                setNuevoNombre('');
                cargarTipos();
                onUpdate();
            } else {
                alert(data.error || 'Error al actualizar tipo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar tipo de vehículo');
        }
    };

    const handleAgregar = async () => {
        if (!nuevoNombre.trim()) {
            alert('El nombre no puede estar vacío');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/tipos-vehiculo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ nombre: nuevoNombre.trim() })
            });

            const data = await response.json();

            if (response.ok) {
                setAgregando(false);
                setNuevoNombre('');
                cargarTipos();
                onUpdate();
            } else {
                alert(data.error || 'Error al crear tipo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al crear tipo de vehículo');
        }
    };

    const handleEliminar = async (id: number, nombre: string) => {
        if (!confirm(`¿Estás seguro de eliminar "${nombre}"?\n\nSolo se puede eliminar si no tiene precios asociados.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/tipos-vehiculo/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                cargarTipos();
                onUpdate();
            } else {
                alert(data.error || 'Error al eliminar tipo');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar tipo de vehículo');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">Gestionar Tipos de Vehículo</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Administra los tipos de vehículos disponibles para tu lavadero
                    </p>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <p className="mt-2 text-gray-600">Cargando...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {tipos.map((tipo) => (
                                <div
                                    key={tipo.id}
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    {editando === tipo.id ? (
                                        <>
                                            <input
                                                type="text"
                                                value={nuevoNombre}
                                                onChange={(e) => setNuevoNombre(e.target.value)}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') handleGuardarEdicion(tipo.id);
                                                    if (e.key === 'Escape') handleCancelarEdicion();
                                                }}
                                            />
                                            <button
                                                onClick={() => handleGuardarEdicion(tipo.id)}
                                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            >
                                                ✓ Guardar
                                            </button>
                                            <button
                                                onClick={handleCancelarEdicion}
                                                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <span className="flex-1 font-medium text-gray-800">
                                                {tipo.nombre}
                                            </span>
                                            <button
                                                onClick={() => handleEditar(tipo.id, tipo.nombre)}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleEliminar(tipo.id, tipo.nombre)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Formulario agregar nuevo */}
                            {agregando ? (
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border-2 border-green-300">
                                    <input
                                        type="text"
                                        value={nuevoNombre}
                                        onChange={(e) => setNuevoNombre(e.target.value)}
                                        placeholder="Nombre del nuevo tipo..."
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleAgregar();
                                            if (e.key === 'Escape') {
                                                setAgregando(false);
                                                setNuevoNombre('');
                                            }
                                        }}
                                    />
                                    <button
                                        onClick={handleAgregar}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        ✓ Agregar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setAgregando(false);
                                            setNuevoNombre('');
                                        }}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setAgregando(true)}
                                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                                >
                                    ➕ Agregar nuevo tipo de vehículo
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
