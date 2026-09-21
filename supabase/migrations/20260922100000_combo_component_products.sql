alter table public.combo_components
  add column if not exists component_product_id uuid references public.products(id) on delete restrict;

create index if not exists combo_components_component_product_idx
  on public.combo_components(component_product_id)
  where archived_at is null;
