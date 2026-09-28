-- The checkout API runs for anonymous visitors. The private restaurant_settings
-- table intentionally has admin-only RLS, so expose ONLY the fields needed to
-- prepare public orders, without granting SELECT on the underlying table.
--
-- This limited view is intentionally owner-permission based (not security_invoker).
create or replace view public.public_checkout_settings
with (security_invoker = false)
as
select restaurant_name, order_whatsapp_number, pickup_enabled, pickup_address
from public.restaurant_settings
where id = true;

revoke all on public.public_checkout_settings from public;
grant select on public.public_checkout_settings to anon, authenticated;
comment on view public.public_checkout_settings is
  'Minimal publicly readable checkout configuration; full restaurant_settings remains admin-only.';
