-- security_invoker views require the caller to hold SELECT on the source table.
-- restaurant_settings contains restaurant-facing configuration only; writes remain
-- protected by RLS and admin-only policies.
grant select on table public.restaurant_settings to anon;
