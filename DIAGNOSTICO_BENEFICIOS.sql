-- Diagnóstico: Verificar estado de beneficios y relación con encuestas
-- Ejecutar en Neon branch "Lo de Nano"

-- 1. Ver últimos beneficios con su estado y survey relacionado
SELECT 
  b.id as beneficio_id,
  b.status,
  b.redeemed_at,
  b.client_phone,
  b.survey_id,
  b.created_at as beneficio_creado,
  s.id as encuesta_id,
  s.responded_at as encuesta_respondida
FROM benefits b
LEFT JOIN surveys s ON s.id = b.survey_id
ORDER BY b.created_at DESC
LIMIT 10;

-- 2. Ver encuestas respondidas con su beneficio asociado
SELECT 
  s.id as encuesta_id,
  s.client_phone,
  s.responded_at,
  sr.rating,
  b.id as beneficio_id,
  b.status as beneficio_estado,
  b.redeemed_at as beneficio_canjeado
FROM surveys s
LEFT JOIN survey_responses sr ON sr.survey_id = s.id
LEFT JOIN benefits b ON b.survey_id = s.id
WHERE s.responded_at IS NOT NULL
ORDER BY s.responded_at DESC
LIMIT 10;

-- 3. Verificar si hay beneficios sin redeemed_at actualizado
SELECT 
  id,
  status,
  redeemed_at,
  client_phone,
  survey_id,
  created_at
FROM benefits
WHERE status = 'redeemed' AND redeemed_at IS NULL;
