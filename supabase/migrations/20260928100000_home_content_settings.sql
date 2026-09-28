alter table public.restaurant_settings
  add column if not exists benefit_labels text[] not null default array['Быстрая доставка','Свежие ингредиенты','Высокое качество','Заказ через WhatsApp']::text[],
  add column if not exists promotion_text text not null default 'При заказе 2 больших пиццы — маленькая пицца в подарок!',
  add column if not exists promotion_image_url text;

drop view if exists public.public_restaurant_settings;
create view public.public_restaurant_settings as
select restaurant_name, logo_url, contact_phone_1, contact_phone_2, instagram_url, main_address,
  pickup_enabled, pickup_address, pickup_note, map_latitude, map_longitude, map_url,
  work_open_time, work_close_time, hero_title, hero_subtitle, hero_image_url,
  benefit_labels, promotion_text, promotion_image_url
from public.restaurant_settings;
grant select on public.public_restaurant_settings to anon, authenticated;
