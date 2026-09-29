-- Run AFTER the previous enum migration has committed.
-- NORMAL / COMBO retain fixed prices; PIZZA / DRINK are priced per variant.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS product_price_by_type;
ALTER TABLE public.products ADD CONSTRAINT product_price_by_type CHECK (
  (product_type IN ('PIZZA', 'DRINK') AND base_price_diram IS NULL)
  OR
  (product_type NOT IN ('PIZZA', 'DRINK') AND base_price_diram IS NOT NULL)
);
