-- Migration: 2025-12-05_add_nila_equivalent.sql
-- Description: Add nila_equivalent column to credit_packs table for USD→NILA conversion

BEGIN;

-- Add nila_equivalent column to credit_packs table
ALTER TABLE public.credit_packs
ADD COLUMN IF NOT EXISTS nila_equivalent numeric(18,8);

-- Add comment explaining the column
COMMENT ON COLUMN public.credit_packs.nila_equivalent IS 'Equivalent value in NILA tokens based on current USD→NILA exchange rate';

COMMIT;