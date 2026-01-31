'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SurveyData {
    token: string;
    alreadyResponded: boolean;
    respondedAt?: string;
    vehicle?: {
        marca: string;
        patente: string;
        servicio: string;
    };
    tenant?: {
        name: string;
        logoUrl?: string;
        googleMapsUrl: string;
    };
}

interface SubmitResponse {
    success: boolean;
    message: string;
    benefit?: {
        type: string;
        description: string;
    };
    showGoogleMaps: boolean;
    googleMapsUrl?: string;
}

export default function SurveyPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [survey, setSurvey] = useState<SurveyData | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [submitResponse, setSubmitResponse] = useState<SubmitResponse | null>(null);

    useEffect(() => {
        loadSurvey();
    }, [token]);

    const loadSurvey = async () => {
        try {
            const res = await fetch(`/api/survey/${token}`);
            if (!res.ok) {
                throw new Error('Encuesta no encontrada');
            }
            const data = await res.json();
            setSurvey(data.survey);
        } catch (err) {
            setError('No se pudo cargar la encuesta. El enlace puede ser inválido o haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            alert('Por favor, seleccioná una calificación');
            return;
        }

        setSubmitting(true);

        try {
            const res = await fetch(`/api/survey/${token}/submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment: comment.trim() || null })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar la encuesta');
            }

            setSubmitResponse(data);
            setSubmitted(true);

        } catch (err) {
            alert(err instanceof Error ? err.message : 'Error al enviar la encuesta');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando encuesta...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        );
    }

    if (!survey) {
        return null;
    }

    if (survey.alreadyResponded) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="text-green-500 text-5xl mb-4">✓</div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Ya respondida</h1>
                    <p className="text-gray-600">Esta encuesta ya fue completada anteriormente.</p>
                    <p className="text-sm text-gray-500 mt-4">
                        Fecha: {new Date(survey.respondedAt!).toLocaleDateString('es-AR')}
                    </p>
                </div>
            </div>
        );
    }

    if (submitted && submitResponse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                    <div className="text-center mb-6">
                        <div className="text-green-500 text-5xl mb-4">🙌</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">
                            ¡Gracias por tu opinión!
                        </h1>
                    </div>

                    {submitResponse.benefit && (
                        <div className="bg-gradient-to-r from-yellow-100 to-yellow-200 rounded-xl p-6 mb-6 text-center border-2 border-yellow-300">
                            <div className="text-3xl mb-2">🎁</div>
                            <p className="font-bold text-lg text-gray-800 mb-1">
                                Tenés un 10% de descuento
                            </p>
                            <p className="text-sm text-gray-700">
                                en cualquier servicio de {survey.tenant?.name || 'DeltaWash'} para tu próxima visita
                            </p>
                            <p className="text-xs text-gray-600 mt-3">
                                El beneficio se aplica identificando tu número de celular
                            </p>
                        </div>
                    )}

                    {submitResponse.showGoogleMaps && submitResponse.googleMapsUrl && (
                        <div className="text-center">
                            <p className="text-gray-700 mb-4">
                                Si te gustó el servicio, ¿nos ayudás dejándonos tu reseña en Google?
                            </p>
                            <a
                                href={submitResponse.googleMapsUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg"
                            >
                                ⭐ Calificar en Google
                            </a>
                        </div>
                    )}

                    {!submitResponse.showGoogleMaps && (
                        <div className="text-center">
                            <p className="text-gray-700">
                                Vamos a usar tu opinión para seguir mejorando 💪
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
                {/* Header con branding */}
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        {survey.tenant?.name || 'DeltaWash'}
                    </h1>
                    {survey.vehicle && (
                        <div className="text-sm text-gray-600 bg-gray-100 rounded-lg p-3 mt-3">
                            <p className="font-semibold">{survey.vehicle.marca}</p>
                            <p className="text-xs">{survey.vehicle.patente} • {survey.vehicle.servicio}</p>
                        </div>
                    )}
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Rating */}
                    <div>
                        <label className="block text-center text-lg font-semibold text-gray-800 mb-4">
                            ¿Cómo calificás el servicio?
                        </label>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    className="text-5xl transition-transform hover:scale-110 focus:outline-none"
                                >
                                    {(hoverRating || rating) >= star ? '⭐' : '☆'}
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-gray-600 mt-2">
                                {rating === 5 && '¡Excelente!'}
                                {rating === 4 && 'Muy bueno'}
                                {rating === 3 && 'Bueno'}
                                {rating === 2 && 'Regular'}
                                {rating === 1 && 'Necesita mejorar'}
                            </p>
                        )}
                    </div>

                    {/* Comentario opcional */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Comentario (opcional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="¿Querés contarnos algo más?"
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        />
                    </div>

                    {/* Botón submit */}
                    <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-colors shadow-lg disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Enviando...' : 'Enviar respuesta'}
                    </button>
                </form>

                {/* Footer */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    Son solo 10 segundos y a nosotros nos ayuda a mejorar ❤️
                </p>
            </div>
        </div>
    );
}
