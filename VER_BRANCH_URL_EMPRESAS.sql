-- Ejecutar en branch CENTRAL

-- Ver qué branch_url tiene Lo de Nano en la tabla empresas
SELECT 
    id,
    nombre,
    slug,
    branch_url
FROM empresas
WHERE id = 52;

-- PROBLEMA IDENTIFICADO:
-- El branch_url guardado es: postgresql://...@ep-young-hill-ah7zck55-pooler...
-- Tiene "-pooler" al final → es conexión POOLED de Vercel
-- 
-- Pero neon() driver requiere URL DIRECTA (sin -pooler)
-- Ejemplo correcto: postgresql://...@ep-young-hill-ah7zck55.c-3.us-east-1.aws.neon.tech...
--
-- SOLUCIÓN: La tabla empresas debe tener URLs DIRECTAS, no pooled
