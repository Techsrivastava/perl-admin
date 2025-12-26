-- Migration: Add purpose column to ledger table
ALTER TABLE public.ledger ADD COLUMN IF NOT EXISTS purpose text;

-- Update existing records if any
UPDATE public.ledger SET purpose = reference_type WHERE purpose IS NULL;

-- Optional: Add index for performance on filtering by purpose
CREATE INDEX IF NOT EXISTS idx_ledger_purpose ON public.ledger(purpose);
