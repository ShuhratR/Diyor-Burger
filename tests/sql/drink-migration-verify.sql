INSERT INTO public.products(product_type,base_price_diram) VALUES ('DRINK', NULL);
DO $$
BEGIN
  BEGIN
    INSERT INTO public.products(product_type,base_price_diram) VALUES ('DRINK',700);
    RAISE EXCEPTION 'Bad drink base price unexpectedly passed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  BEGIN
    INSERT INTO public.products(product_type,base_price_diram) VALUES ('NORMAL',NULL);
    RAISE EXCEPTION 'Normal product without fixed price unexpectedly passed';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  IF (SELECT count(*) FROM public.products) <> 4 THEN
    RAISE EXCEPTION 'Existing rows changed during migration';
  END IF;
END $$;
SELECT 'DRINK pricing migrations passed without changing existing products' AS result;
