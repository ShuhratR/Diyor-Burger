drop policy if exists "public active variants" on public.product_variants;
create policy "public active variants" on public.product_variants for select using (
  is_active and is_available and archived_at is null and exists (
    select 1 from public.products p where p.id = product_id and p.is_active and p.is_available and p.archived_at is null
  )
);
