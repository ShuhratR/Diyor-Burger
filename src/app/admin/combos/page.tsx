import { AdminWorkspaceBar } from "@/features/admin/admin-workspace-bar";
import { ComboManager, type AdminCombo } from "@/features/admin/combo-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  await requireAdmin();
  const client = await createSupabaseServerClient();
  if (!client) return <p className="notice">Данные недоступны</p>;
  const [
    { data: combos, error: combosError },
    { data: categories, error: categoriesError },
    { data: products, error: productsError },
    { data: components, error: componentsError },
  ] = await Promise.all([
    client.from("products").select("*").eq("product_type", "COMBO")
      .is("archived_at", null).order("sort_order"),
    client.from("categories").select("id,name").is("archived_at", null).order("sort_order"),
    client.from("products").select("id,name,name_tj,product_type").is("archived_at", null)
      .eq("is_active", true).neq("product_type", "COMBO").order("name"),
    client.from("combo_components").select("id,product_id,component_product_id,name,quantity,sort_order")
      .is("archived_at", null).order("sort_order"),
  ]);
  // Do not silently interpret a failed read as an empty composition: doing so
  // could overwrite the existing component list on the next save.
  if (combosError || categoriesError || productsError || componentsError) {
    return <p className="notice">Данные недоступны. Попробуйте обновить страницу.</p>;
  }
  const choices = (products ?? []).map(row => ({
    id: String(row.id),
    name: String(row.name),
    nameTj: row.name_tj == null ? null : String(row.name_tj),
    productType: String(row.product_type),
  }));
  const choiceNames = new Map(choices.map(item => [item.id, item.name]));
  const eligibleIds = new Set(choices.map(item => item.id));
  const componentsByCombo = new Map<string, AdminCombo["components"]>();
  for (const row of components ?? []) {
    const id = String(row.product_id);
    const existing = componentsByCombo.get(id) ?? [];
    const rawLinkedId = row.component_product_id ? String(row.component_product_id) : null;
    const linkedId = rawLinkedId && eligibleIds.has(rawLinkedId) ? rawLinkedId : null;
    existing.push({
      id: String(row.id),
      componentProductId: linkedId,
      name: (linkedId ? choiceNames.get(linkedId) : null) ?? String(row.name),
      quantity: Number(row.quantity),
      sortOrder: Number(row.sort_order),
    });
    componentsByCombo.set(id, existing);
  }
  const customNames = Array.from(new Set(
    (components ?? []).filter(row => !row.component_product_id)
      .map(row => String(row.name).trim()).filter(Boolean)
  )).sort((a, b) => a.localeCompare(b, "ru")).slice(0, 300);

  const list = (combos ?? []).map((row): AdminCombo => ({
    id: String(row.id),
    categoryId: String(row.category_id),
    name: String(row.name),
    nameTj: row.name_tj == null ? null : String(row.name_tj),
    slug: String(row.slug),
    description: String(row.description ?? ""),
    descriptionTj: row.description_tj == null ? null : String(row.description_tj),
    basePriceDiram: Number(row.base_price_diram),
    oldPriceDiram: row.old_price_diram == null ? null : Number(row.old_price_diram),
    imageUrl: row.image_url == null ? null : String(row.image_url),
    sortOrder: Number(row.sort_order),
    isAvailable: Boolean(row.is_available),
    isActive: Boolean(row.is_active),
    isPopular: Boolean(row.is_popular),
    components: (componentsByCombo.get(String(row.id)) ?? [])
      .sort((a, b) => a.sortOrder - b.sortOrder),
  }));
  return <>
    <AdminWorkspaceBar title="Комбо" />
    <ComboManager
      combos={list}
      categories={(categories ?? []).map(row => ({ id: String(row.id), name: String(row.name) }))}
      products={choices}
      customNames={customNames}
    />
  </>;
}
