-- Test only: minimal copy of the existing product-type constraint, no live data.
CREATE TYPE public.product_type AS ENUM ('NORMAL', 'PIZZA', 'COMBO');
CREATE TABLE public.products (
  id integer generated always as identity primary key,
  product_type public.product_type not null default 'NORMAL',
  base_price_diram integer,
  CONSTRAINT product_price_by_type CHECK (
    (product_type = 'PIZZA' AND base_price_diram IS NULL)
    OR (product_type <> 'PIZZA' AND base_price_diram IS NOT NULL)
  )
);
INSERT INTO public.products(product_type,base_price_diram) VALUES
  ('NORMAL',800), ('PIZZA',NULL), ('COMBO',4300);
