-- Клиент должен видеть временно недоступные блюда, чтобы не казалось, что меню
-- «пропало». Покупка по-прежнему блокируется в прикладной логике.
drop policy if exists "public active products" on public.products;
create policy "public active products" on public.products for select using (
  is_active and archived_at is null
);

drop policy if exists "public active variants" on public.product_variants;
create policy "public active variants" on public.product_variants for select using (
  is_active and archived_at is null and exists (
    select 1
    from public.products p
    where p.id = product_id
      and p.is_active
      and p.archived_at is null
  )
);
