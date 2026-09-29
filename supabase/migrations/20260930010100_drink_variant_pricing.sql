-- Migration 2 of 2. Existing NORMAL/COMBO prices and PIZZA sizes are unchanged.
-- DRINK means a bottled drink with independent volume and price per variant;
-- a drink with just one fixed price can still be NORMAL in the Drinks category.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS product_price_by_type;
ALTER TABLE public.products ADD CONSTRAINT product_price_by_type CHECK (
  (product_type IN ('PIZZA', 'DRINK') AND base_price_diram IS NULL)
  OR
  (product_type NOT IN ('PIZZA', 'DRINK') AND base_price_diram IS NOT NULL)
);
