-- Migration 1 of 2. Commit enum addition before using it in a constraint.
-- No existing products are modified.
ALTER TYPE public.product_type ADD VALUE IF NOT EXISTS 'DRINK';
