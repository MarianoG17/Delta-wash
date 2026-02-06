-- PROBLEMA: survey_lookup tiene entrada pero /survey/[token] no encuentra la encuesta
-- Verificar qué branch_url se guardó vs donde está realmente la encuesta

-- 1. Ver qué se guardó en survey_lookup (ejecutar en CENTRAL)
SELECT 
    survey_token,
    empresa_id,
    branch_url,
    created_at
FROM survey_lookup
WHERE survey_token = 'ac943322-11b2-486a-a41a-8f1ade9577fe';

-- 2. Verificar si la encuesta existe en el branch lo-de-nano
-- (ejecutar en branch: lo-de-nano)
SELECT 
    id,
    survey_token,
    visit_id,
    client_phone,
    vehicle_marca,
    created_at
FROM surveys
WHERE survey_token = 'ac943322-11b2-486a-a41a-8f1ade9577fe';

-- 3. Si la encuesta NO está en lo-de-nano, buscar en qué branch está
-- (ejecutar en CADA branch hasta encontrarla)
-- Branches a revisar: Deltawash, mariano, mariano-coques, lo-de-mirta

-- HIPÓTESIS: 
-- El tokenPayload.branchUrl del JWT puede no coincidir con el branch real
-- donde se creó la encuesta, porque getDBConnection() puede estar
-- conectándose a un branch diferente.
