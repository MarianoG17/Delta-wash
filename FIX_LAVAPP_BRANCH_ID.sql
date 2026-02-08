-- Fix LAVAPP neon_branch_id mismatch
-- Problema: LAVAPP tiene neon_branch_id = "tamy" pero el branch real en Neon se llama "Lavadero"
-- Branch ID correcto: br-orange-band-ah85rblj
UPDATE empresas
SET neon_branch_id = 'br-orange-band-ah85rblj'
WHERE id = 48
    AND nombre = 'LAVAPP';
-- Verificar el cambio
SELECT id,
    nombre,
    neon_branch_id,
    branch_url,
    estado
FROM empresas
WHERE id = 48;