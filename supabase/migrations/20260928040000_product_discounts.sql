alter table public.products add column if not exists old_price_diram integer check (old_price_diram is null or old_price_diram >= 0);
alter table public.products add column if not exists promotion_label text check (promotion_label is null or char_length(promotion_label) <= 40);
alter table public.product_variants add column if not exists old_price_diram integer check (old_price_diram is null or old_price_diram >= 0);

alter table public.products add constraint products_discount_price_check check (old_price_diram is null or base_price_diram is null or old_price_diram > base_price_diram) not valid;
alter table public.product_variants add constraint variants_discount_price_check check (old_price_diram is null or old_price_diram > price_diram) not valid;
