alter table public.product_variants add column if not exists is_available boolean not null default true, add column if not exists archived_at timestamptz;
create index if not exists product_variants_public_active_idx on public.product_variants(product_id, sort_order) where is_active and is_available and archived_at is null;
