-- Defense-in-depth hardening for the public menu/admin boundary.
-- Public menu data stays readable; writes remain admin-only and are enforced by RLS.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_profiles
    where id = auth.uid() and is_active
  )
$$;
revoke all on function private.is_admin() from public, anon;
grant execute on function private.is_admin() to authenticated, service_role;

-- Keep the compatibility helper non-privileged. The actual privileged lookup
-- lives outside the exposed public API schema.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select private.is_admin()
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated, service_role;

alter policy "admin profiles self read"
  on public.admin_profiles
  using ((id = auth.uid()) or private.is_admin());
alter policy "admin profiles admin manage"
  on public.admin_profiles
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin categories manage"
  on public.categories
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin products manage"
  on public.products
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin variants manage"
  on public.product_variants
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin combo components manage"
  on public.combo_components
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin delivery zones manage"
  on public.delivery_zones
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin settings manage"
  on public.restaurant_settings
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin banners manage"
  on public.banners
  using (private.is_admin())
  with check (private.is_admin());
alter policy "admin audit logs read"
  on public.audit_logs
  using (private.is_admin());
alter policy "admin audit logs insert"
  on public.audit_logs
  with check (private.is_admin());

alter policy "active admins upload restaurant media"
  on storage.objects
  with check ((bucket_id = 'restaurant-media') and private.is_admin());
alter policy "active admins update restaurant media"
  on storage.objects
  using ((bucket_id = 'restaurant-media') and private.is_admin())
  with check ((bucket_id = 'restaurant-media') and private.is_admin());
alter policy "active admins delete restaurant media"
  on storage.objects
  using ((bucket_id = 'restaurant-media') and private.is_admin());

-- The combo saver no longer bypasses RLS. Every write now has to satisfy the
-- same admin policies as direct admin operations.
alter function public.save_combo_with_components(jsonb, jsonb) security invoker;
revoke all on function public.save_combo_with_components(jsonb, jsonb) from public, anon;
grant execute on function public.save_combo_with_components(jsonb, jsonb) to authenticated;

-- Trigger functions do not need to be callable from the public API.
alter function public.touch_updated_at() set search_path = '';
revoke all on function public.touch_updated_at() from public, anon, authenticated;

-- Public settings views should run as the caller, not as their creator.
-- RLS plus column-level grants provide the public read boundary.
drop policy if exists "public safe settings read" on public.restaurant_settings;
create policy "public safe settings read"
  on public.restaurant_settings
  for select
  to anon, authenticated
  using (id = true);

alter view public.public_restaurant_settings set (security_invoker = true);
alter view public.public_checkout_settings set (security_invoker = true);

revoke all on table public.restaurant_settings from anon;
grant select (
  restaurant_name,
  logo_url,
  order_whatsapp_number,
  contact_phone_1,
  contact_phone_2,
  instagram_url,
  main_address,
  pickup_enabled,
  pickup_address,
  pickup_note,
  map_latitude,
  map_longitude,
  map_url,
  work_open_time,
  work_close_time,
  hero_title,
  hero_subtitle,
  hero_image_url,
  benefit_labels,
  promotion_text,
  promotion_image_url,
  cart_empty_title,
  cart_empty_body,
  cart_checkout_label,
  cart_whatsapp_label
) on public.restaurant_settings to anon;

-- Admins keep full current settings access, but newly-added columns are not
-- automatically exposed to every signed-in account.
revoke select on table public.restaurant_settings from authenticated;
grant select (
  id,
  restaurant_name,
  logo_url,
  order_whatsapp_number,
  contact_phone_1,
  contact_phone_2,
  instagram_url,
  main_address,
  pickup_enabled,
  pickup_address,
  pickup_note,
  map_latitude,
  map_longitude,
  map_url,
  work_open_time,
  work_close_time,
  hero_title,
  hero_subtitle,
  hero_image_url,
  created_at,
  updated_at,
  main_address_tj,
  pickup_address_tj,
  pickup_note_tj,
  hero_title_tj,
  hero_subtitle_tj,
  benefit_labels,
  promotion_text,
  promotion_image_url,
  cart_empty_title,
  cart_empty_body,
  cart_checkout_label,
  cart_whatsapp_label
) on public.restaurant_settings to authenticated;

grant select on public.public_restaurant_settings to anon, authenticated;
grant select on public.public_checkout_settings to anon, authenticated;

-- Anonymous visitors can only read public catalog data. Console/F12 requests
-- cannot write because both SQL privileges and RLS deny them.
revoke insert, update, delete, truncate, references, trigger
  on public.categories,
     public.products,
     public.product_variants,
     public.combo_components,
     public.delivery_zones,
     public.banners
  from anon;
revoke all on public.admin_profiles, public.audit_logs from anon;

-- Signed-in users still need DML grants for the admin UI, but RLS restricts
-- those writes to active admin_profiles only.
revoke truncate, references, trigger
  on public.admin_profiles,
     public.categories,
     public.products,
     public.product_variants,
     public.combo_components,
     public.delivery_zones,
     public.restaurant_settings,
     public.banners,
     public.audit_logs
  from authenticated;
revoke update, delete on public.audit_logs from authenticated;
