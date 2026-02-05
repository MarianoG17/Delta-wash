'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Survey {
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
    logoUrl: string | null;
    googleMapsUrl: string | null;
  };
}

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const empresaSlug = params.empresaSlug as string;
  const token = params.token as string;

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const [showGoogleRedirect, setShowGoogleRedirect] = useState(false);
  const [googleMapsUrl, setGoogleMapsUrl] = useState<string | null>(null);

  useEffect(() => {
    loadSurvey();
  }, [empresaSlug, token]);

  const loadSurvey = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/survey/${empresaSlug}/${token}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Error al cargar la encuesta');
        return;
      }

      setSurvey(data.survey);
    } catch (err) {
      setError('No se pudo cargar la encuesta');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`/api/survey/${empresaSlug}/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment })
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Error al enviar respuesta');
        return;
      }

      setSubmitted(true);

      // Si debe redirigir a Google Maps
      if (data.redirectToGoogle && data.googleMapsUrl) {
        setShowGoogleRedirect(true);
        setGoogleMapsUrl(data.googleMapsUrl);
      }

    } catch (err) {
      alert('Error al enviar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando encuesta...</p>
        </div>
      </div>
    );
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error</h1>
          <p className="text-gray-600">{error || 'No se pudo cargar la encuesta. El enlace puede ser inválido o haber expirado.'}</p>
        </div>
      </div>
    );
  }

  if (survey.alreadyResponded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias!</h1>
          <p className="text-gray-600">Ya has respondido esta encuesta anteriormente.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    if (showGoogleRedirect && googleMapsUrl) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">¡Muchísimas gracias!</h1>
            <p className="text-gray-600 mb-6">
              Tu opinión es muy valiosa para nosotros. ¿Te gustaría dejarnos también una reseña en Google?
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              📍 Ir a Google Maps
            </a>
            <p className="text-xs text-gray-400 mt-4">
              ¡Tienes un 10% de descuento en tu próxima visita!
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">¡Gracias por tu respuesta!</h1>
          <p className="text-gray-600">
            Tu opinión nos ayuda a mejorar nuestro servicio.
          </p>
          {rating >= 4 && (
            <p className="text-sm text-green-600 mt-4 font-semibold">
              ¡Tienes un 10% de descuento en tu próxima visita! 🎉
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {survey.tenant?.name || 'Encuesta de Satisfacción'}
          </h1>
          <p className="text-gray-600">¿Cómo fue tu experiencia?</p>
        </div>

        {/* Vehicle Info */}
        {survey.vehicle && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Vehículo</p>
            <p className="font-semibold text-gray-800">
              {survey.vehicle.marca} - {survey.vehicle.patente}
            </p>
            <p className="text-sm text-gray-600">{survey.vehicle.servicio}</p>
          </div>
        )}

        {/* Survey Form */}
        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-3 text-center">
              Calificación
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= (hoveredRating || rating) ? '⭐' : '☆'}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Comentario (opcional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="¿Algo que quieras compartir con nosotros?"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={4}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || rating === 0}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {submitting ? 'Enviando...' : 'Enviar respuesta'}
          </button>
        </form>
      </div>
    </div>
  );
}
