-- Allow branch_url to be NULL for archived empresas
-- This is needed because when we archive an empresa and delete its Neon branch,
-- we need to clear the branch_url field
ALTER TABLE empresas
ALTER COLUMN branch_url DROP NOT NULL;
-- Also allow neon_branch_id to be NULL (if it isn't already)
ALTER TABLE empresas
ALTER COLUMN neon_branch_id DROP NOT NULL;
-- Verify the changes
SELECT column_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'empresas'
    AND column_name IN ('branch_url', 'neon_branch_id');