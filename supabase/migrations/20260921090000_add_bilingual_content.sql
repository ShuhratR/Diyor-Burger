-- Additive bilingual content support. Existing Russian content stays authoritative
-- and is copied into the Tajik fallback fields until the owner supplies translations.
alter table public.categories add column if not exists name_tj text;
alter table public.products add column if not exists name_tj text, add column if not exists description_tj text, add column if not exists ingredients_text_tj text;
alter table public.product_variants add column if not exists name_tj text;
alter table public.combo_components add column if not exists name_tj text, add column if not exists description_tj text, add column if not exists archived_at timestamptz;
alter table public.delivery_zones add column if not exists name_tj text;
alter table public.banners add column if not exists title_tj text, add column if not exists body_tj text;
alter table public.restaurant_settings add column if not exists main_address_tj text, add column if not exists pickup_address_tj text, add column if not exists pickup_note_tj text, add column if not exists hero_title_tj text, add column if not exists hero_subtitle_tj text;

update public.categories set name_tj = name where name_tj is null;
update public.products set name_tj = name, description_tj = description, ingredients_text_tj = ingredients_text where name_tj is null or description_tj is null or ingredients_text_tj is null;
update public.product_variants set name_tj = name where name_tj is null;
update public.combo_components set name_tj = name, description_tj = description where name_tj is null or description_tj is null;
update public.delivery_zones set name_tj = name where name_tj is null;
update public.banners set title_tj = title, body_tj = body where title_tj is null or body_tj is null;
update public.restaurant_settings set main_address_tj = main_address, pickup_address_tj = pickup_address, pickup_note_tj = pickup_note, hero_title_tj = hero_title, hero_subtitle_tj = hero_subtitle where main_address_tj is null or pickup_address_tj is null or pickup_note_tj is null or hero_title_tj is null or hero_subtitle_tj is null;

create index if not exists combo_components_active_idx on public.combo_components(product_id, sort_order) where archived_at is null;
