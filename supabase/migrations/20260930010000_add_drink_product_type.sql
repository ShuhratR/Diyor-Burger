-- Run as migration 1, committing this transaction before migration 2.
-- No existing menu records are modified.
ALTER TYPE public.product_type ADD VALUE IF NOT EXISTS 'DRINK';
