-- Add 'archivado' to the allowed estado values
-- Current constraint only allows: 'activo', 'suspendido', 'cancelado', 'vencido'
-- We need to add 'archivado' for the archive system to work
-- Drop the old constraint
ALTER TABLE empresas DROP CONSTRAINT empresas_estado_check;
-- Create new constraint with 'archivado' included
ALTER TABLE empresas
ADD CONSTRAINT empresas_estado_check CHECK (
        estado = ANY (
            ARRAY ['activo'::text, 'suspendido'::text, 'cancelado'::text, 'vencido'::text, 'archivado'::text]
        )
    );
-- Verify the constraint was updated
SELECT con.conname,
    pg_get_constraintdef(con.oid)
FROM pg_constraint con
    INNER JOIN pg_class rel ON rel.oid = con.conrelid
WHERE rel.relname = 'empresas'
    AND con.conname = 'empresas_estado_check';