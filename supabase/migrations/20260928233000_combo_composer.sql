-- One transaction saves the combo and its ordered composition. A custom entry is
-- stored only in combo_components, not as an incomplete publicly sellable product.
create or replace function public.save_combo_with_components(
  p_combo jsonb,
  p_components jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_category_id uuid;
  v_name text;
  v_slug text;
  v_price integer;
  v_old_price integer;
  v_item jsonb;
  v_ref uuid;
  v_match record;
  v_item_name text;
  v_qty integer;
  v_position integer := 0;
  v_count integer;
begin
  if auth.uid() is null or not public.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if jsonb_typeof(p_combo) is distinct from 'object'
     or jsonb_typeof(p_components) is distinct from 'array' then
    raise exception 'INVALID_COMBO_PAYLOAD';
  end if;
  v_count := jsonb_array_length(p_components);
  if v_count < 1 or v_count > 30 then
    raise exception 'COMBO_NEEDS_1_TO_30_ITEMS';
  end if;

  v_id := nullif(p_combo->>'id', '')::uuid;
  v_category_id := (p_combo->>'categoryId')::uuid;
  v_name := btrim(coalesce(p_combo->>'name', ''));
  v_slug := btrim(coalesce(p_combo->>'slug', ''));
  v_price := (p_combo->>'priceDiram')::integer;
  v_old_price := nullif(p_combo->>'oldPriceDiram', '')::integer;

  if char_length(v_name) not between 1 and 120
     or char_length(v_slug) > 120
     or v_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
     or v_price is null or v_price < 0
     or (v_old_price is not null and v_old_price <= v_price)
     or char_length(coalesce(p_combo->>'nameTj','')) > 120
     or char_length(coalesce(p_combo->>'description','')) > 1000
     or char_length(coalesce(p_combo->>'descriptionTj','')) > 1000
     or char_length(coalesce(p_combo->>'imageUrl','')) > 2048
     or coalesce((p_combo->>'sortOrder')::integer, -1) not between 0 and 9999 then
    raise exception 'INVALID_COMBO_FIELDS';
  end if;

  perform 1 from public.categories
    where id = v_category_id and archived_at is null;
  if not found then raise exception 'COMBO_CATEGORY_NOT_FOUND'; end if;

  if v_id is null then
    insert into public.products (
      category_id, name, name_tj, slug, description, description_tj,
      product_type, base_price_diram, old_price_diram, image_url, sort_order,
      is_available, is_active, is_popular
    ) values (
      v_category_id, v_name, coalesce(nullif(btrim(p_combo->>'nameTj'),''), v_name),
      v_slug, coalesce(p_combo->>'description',''),
      coalesce(nullif(btrim(p_combo->>'descriptionTj'),''), p_combo->>'description', ''),
      'COMBO', v_price, v_old_price, nullif(p_combo->>'imageUrl',''),
      (p_combo->>'sortOrder')::integer, (p_combo->>'isAvailable')::boolean,
      (p_combo->>'isActive')::boolean, (p_combo->>'isPopular')::boolean
    ) returning id into v_id;
  else
    update public.products set
      category_id = v_category_id,
      name = v_name,
      name_tj = coalesce(nullif(btrim(p_combo->>'nameTj'),''),v_name),
      slug = v_slug,
      description = coalesce(p_combo->>'description',''),
      description_tj = coalesce(nullif(btrim(p_combo->>'descriptionTj'),''),
                                p_combo->>'description',''),
      base_price_diram = v_price,
      old_price_diram = v_old_price,
      image_url = nullif(p_combo->>'imageUrl',''),
      sort_order = (p_combo->>'sortOrder')::integer,
      is_available = (p_combo->>'isAvailable')::boolean,
      is_active = (p_combo->>'isActive')::boolean,
      is_popular = (p_combo->>'isPopular')::boolean
    where id = v_id and product_type = 'COMBO' and archived_at is null
    returning id into v_id;
    if not found then raise exception 'COMBO_NOT_FOUND'; end if;

    -- Retain the previous component rows as archived history.
    update public.combo_components
      set archived_at = now()
      where product_id = v_id and archived_at is null;
  end if;

  for v_item in select value from jsonb_array_elements(p_components) loop
    if jsonb_typeof(v_item) is distinct from 'object' then
      raise exception 'INVALID_COMBO_ITEM';
    end if;
    v_qty := (v_item->>'quantity')::integer;
    v_item_name := btrim(coalesce(v_item->>'name',''));
    v_ref := nullif(v_item->>'productId','')::uuid;
    if v_qty is null or v_qty not between 1 and 99
       or char_length(v_item_name) not between 1 and 120 then
      raise exception 'INVALID_COMBO_ITEM';
    end if;

    if v_ref is not null then
      select id,name,name_tj,description,description_tj
      into v_match from public.products
      where id = v_ref and product_type <> 'COMBO'
        and archived_at is null and is_active = true;
      if not found then raise exception 'COMBO_COMPONENT_PRODUCT_NOT_FOUND'; end if;
    else
      -- Exact matches also link when an admin typed the whole existing name.
      select id,name,name_tj,description,description_tj
      into v_match from public.products
      where lower(btrim(name)) = lower(v_item_name)
        and product_type <> 'COMBO' and archived_at is null and is_active = true
      order by name, id limit 1;
      if found then v_ref := v_match.id; end if;
    end if;

    insert into public.combo_components (
      product_id, component_product_id, name, name_tj,
      description, description_tj, quantity, sort_order
    ) values (
      v_id, v_ref,
      case when v_ref is null then v_item_name else v_match.name end,
      case when v_ref is null then v_item_name else coalesce(v_match.name_tj,v_match.name) end,
      case when v_ref is null then null else v_match.description end,
      case when v_ref is null then null else v_match.description_tj end,
      v_qty, v_position
    );
    v_position := v_position + 1;
  end loop;

  insert into public.audit_logs (
    admin_id, action, entity_type, entity_id, after_data
  ) values (
    auth.uid(),
    case when nullif(p_combo->>'id','') is null then 'create' else 'update' end,
    'combo', v_id,
    jsonb_build_object('slug',v_slug,'priceDiram',v_price,'componentCount',v_count)
  );
  return v_id;
end;
$$;

revoke all on function public.save_combo_with_components(jsonb,jsonb) from public, anon;
grant execute on function public.save_combo_with_components(jsonb,jsonb) to authenticated;
comment on function public.save_combo_with_components(jsonb,jsonb) is
  'Admin-only atomic combo and ordered component save; custom text stays a component.';
