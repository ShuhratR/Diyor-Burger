create extension if not exists pgcrypto;

create type public.product_type as enum ('NORMAL', 'PIZZA', 'COMBO');

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table public.categories (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  image_url text, is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz
);
create table public.products (
  id uuid primary key default gen_random_uuid(), category_id uuid references public.categories(id),
  name text not null, slug text not null unique, product_type public.product_type not null default 'NORMAL',
  description text not null default '', ingredients_text text not null default '', image_url text,
  base_price_diram integer check (base_price_diram is null or base_price_diram >= 0),
  is_available boolean not null default true, is_active boolean not null default true, is_popular boolean not null default false,
  sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz,
  constraint product_price_by_type check ((product_type = 'PIZZA' and base_price_diram is null) or (product_type <> 'PIZZA' and base_price_diram is not null))
);
create table public.product_variants (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null, price_diram integer not null check (price_diram >= 0), is_active boolean not null default true, sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.combo_components (
  id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade,
  name text not null, description text, quantity integer not null default 1 check (quantity > 0), sort_order integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.delivery_zones (
  id uuid primary key default gen_random_uuid(), name text not null, slug text not null unique,
  delivery_fee_diram integer not null check (delivery_fee_diram >= 0), free_delivery_threshold_diram integer not null check (free_delivery_threshold_diram >= 0),
  is_active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz
);
create table public.restaurant_settings (
  id boolean primary key default true check (id), restaurant_name text not null, logo_url text,
  order_whatsapp_number text not null check (order_whatsapp_number ~ '^[0-9]+$'), contact_phone_1 text, contact_phone_2 text,
  instagram_url text, main_address text not null default '', pickup_enabled boolean not null default true, pickup_address text, pickup_note text,
  map_latitude numeric(9,6), map_longitude numeric(9,6), map_url text, work_open_time time, work_close_time time,
  hero_title text, hero_subtitle text, hero_image_url text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.banners (
  id uuid primary key default gen_random_uuid(), title text not null, body text, image_url text, target_url text,
  is_active boolean not null default true, sort_order integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz
);
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(), admin_id uuid references public.admin_profiles(id), action text not null, entity_type text not null, entity_id uuid,
  before_data jsonb, after_data jsonb, created_at timestamptz not null default now()
);

create index products_public_idx on public.products(category_id, sort_order) where is_active and is_available and archived_at is null;
create index delivery_zones_public_idx on public.delivery_zones(sort_order) where is_active and archived_at is null;

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admin_profiles where id = auth.uid() and is_active)
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at = now(); return new; end $$;
create trigger categories_touch before update on public.categories for each row execute function public.touch_updated_at();
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();
create trigger variants_touch before update on public.product_variants for each row execute function public.touch_updated_at();
create trigger combo_components_touch before update on public.combo_components for each row execute function public.touch_updated_at();
create trigger delivery_zones_touch before update on public.delivery_zones for each row execute function public.touch_updated_at();
create trigger restaurant_settings_touch before update on public.restaurant_settings for each row execute function public.touch_updated_at();
create trigger banners_touch before update on public.banners for each row execute function public.touch_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.combo_components enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.restaurant_settings enable row level security;
alter table public.banners enable row level security;
alter table public.audit_logs enable row level security;

create policy "admin profiles self read" on public.admin_profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "admin profiles admin manage" on public.admin_profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public active categories" on public.categories for select using (is_active and archived_at is null);
create policy "admin categories manage" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public active products" on public.products for select using (is_active and is_available and archived_at is null);
create policy "admin products manage" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public active variants" on public.product_variants for select using (is_active and exists (select 1 from public.products p where p.id = product_id and p.is_active and p.is_available and p.archived_at is null));
create policy "admin variants manage" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public combo components" on public.combo_components for select using (exists (select 1 from public.products p where p.id = product_id and p.product_type = 'COMBO' and p.is_active and p.is_available and p.archived_at is null));
create policy "admin combo components manage" on public.combo_components for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public active delivery zones" on public.delivery_zones for select using (is_active and archived_at is null);
create policy "admin delivery zones manage" on public.delivery_zones for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin settings manage" on public.restaurant_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public active banners" on public.banners for select using (is_active and archived_at is null);
create policy "admin banners manage" on public.banners for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin audit logs read" on public.audit_logs for select to authenticated using (public.is_admin());
create policy "admin audit logs insert" on public.audit_logs for insert to authenticated with check (public.is_admin());

create view public.public_restaurant_settings as select restaurant_name, logo_url, contact_phone_1, contact_phone_2, instagram_url, main_address, pickup_enabled, pickup_address, pickup_note, map_latitude, map_longitude, map_url, work_open_time, work_close_time, hero_title, hero_subtitle, hero_image_url from public.restaurant_settings;
grant select on public.public_restaurant_settings to anon, authenticated;

insert into public.restaurant_settings (restaurant_name, order_whatsapp_number, main_address, pickup_enabled, work_open_time, work_close_time)
values ('DIYOR BURGER', '992007884423', 'ноҳияи Кушониён', true, '08:00', '00:00');
insert into public.delivery_zones (name, slug, delivery_fee_diram, free_delivery_threshold_diram, is_active, sort_order) values
  ('Кушониён', 'kushoniyon', 1000, 15000, true, 1), ('Вахш', 'vakhsh', 2000, 25000, true, 2), ('Бохтар', 'bokhtar', 2000, 25000, true, 3);
