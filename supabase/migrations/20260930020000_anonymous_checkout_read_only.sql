-- Anonymous checkout needs only these four public fields; the administrative
-- restaurant_settings table retains its restrictive RLS and is never exposed.
CREATE OR REPLACE VIEW public.public_checkout_settings
WITH (security_invoker = false)
AS SELECT restaurant_name, order_whatsapp_number, pickup_enabled, pickup_address
FROM public.restaurant_settings WHERE id = true;

REVOKE ALL ON public.public_checkout_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_checkout_settings TO anon, authenticated;

-- The customer-facing settings view is read-only. Admin CRUD uses the underlying
-- admin-protected table, not this view.
REVOKE ALL ON public.public_restaurant_settings FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.public_restaurant_settings TO anon, authenticated;

-- RLS does not regulate TRUNCATE, so prevent these web-facing roles from
-- truncating any public table. Normal RLS-protected CRUD remains unchanged.
REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon, authenticated;

COMMENT ON VIEW public.public_checkout_settings IS
  'Four strictly read-only fields needed to prepare anonymous WhatsApp checkout.';
