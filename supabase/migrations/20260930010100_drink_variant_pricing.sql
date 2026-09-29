-- Existing NORMAL/COMBO fixed prices and PIZZA variant prices stay unchanged.
-- DRINK has independently priced volume variants; fixed-price drinks stay NORMAL.
ALTER TABLE public.products DROP CONSTRAINT IF EXISTS product_price_by_type;
ALTER TABLE public.products ADD CONSTRAINT product_price_by_type CHECK (
  (product_type IN ('PIZZA', 'DRINK') AND base_price_diram IS NULL)
  OR
  (product_type NOT IN ('PIZZA', 'DRINK') AND base_price_diram IS NOT NULL)
);
