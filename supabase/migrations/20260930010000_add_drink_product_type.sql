-- Commit this separately before any constraint refers to the new enum value.
ALTER TYPE public.product_type ADD VALUE IF NOT EXISTS 'DRINK';
