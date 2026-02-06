este-- Verificar si el nuevo token se registró en survey_lookup
-- Ejecutar en Neon: base CENTRAL

SELECT 
    survey_token,
    empresa_id,
    branch_url,
    created_at
FROM survey_lookup
WHERE survey_token = 'de03028a-1fc6-4d3d-b83b-92b00b70dc2a';

-- Si no aparece, verificar TODOS los registros:
SELECT 
    survey_token,
    empresa_id,
    branch_url,
    created_at
FROM survey_lookup
ORDER BY created_at DESC
LIMIT 10;

-- También verificar que la encuesta SÍ se creó en el branch lo-de-nano:
-- Ejecutar en branch: lo-de-nano
SELECT 
    id,
    survey_token,
    visit_id,
    client_phone,
    vehicle_marca,
    created_at
FROM surveys
WHERE survey_token = 'de03028a-1fc6-4d3d-b83b-92b00b70dc2a';
