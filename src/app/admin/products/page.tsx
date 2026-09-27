import { ProductWorkspace } from "@/features/admin/product-workspace";
import { AdminWorkspaceBar } from "@/features/admin/admin-workspace-bar";
import type { AdminProduct } from "@/features/admin/product-manager";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function Page() {
  await requireAdmin();
  const client = await createSupabaseServerClient();
  if (!client) return <p className="notice">Данные недоступны</p>;
  const [{ data: products, error }, { data: categories }] = await Promise.all([
    client.from("products").select("*, product_variants(*)").is("archived_at", null).order("sort_order"),
    client.from("categories").select("id,name").is("archived_at", null).order("sort_order"),
  ]);
  if (error) return <p className="notice">Данные недоступны</p>;
  const list = (products as Record<string, unknown>[]).map((row): AdminProduct => ({
    id: String(row.id), categoryId: String(row.category_id), name: String(row.name), nameTj: row.name_tj as string | undefined,
    description: String(row.description ?? ""), descriptionTj: row.description_tj as string | undefined, slug: String(row.slug),
    productType: row.product_type as AdminProduct["productType"], basePriceDiram: row.base_price_diram as number | null, oldPriceDiram: row.old_price_diram as number | null, promotionLabel: row.promotion_label as string | null,
    imageUrl: row.image_url as string | undefined, sortOrder: Number(row.sort_order), isAvailable: Boolean(row.is_available),
    isActive: Boolean(row.is_active), isPopular: Boolean(row.is_popular),
    variants: (Array.isArray(row.product_variants) ? row.product_variants : []).filter((variant) => !variant.archived_at).map((variant) => ({
      id: String(variant.id), name: String(variant.name), nameTj: variant.name_tj as string | undefined,
      priceDiram: Number(variant.price_diram), oldPriceDiram: variant.old_price_diram as number | null, sortOrder: Number(variant.sort_order), isActive: Boolean(variant.is_active), isAvailable: Boolean(variant.is_available),
    })).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
  return <><AdminWorkspaceBar title="Блюда" /><ProductWorkspace products={list} categories={(categories ?? []).map((category) => ({ id: String(category.id), name: String(category.name) }))} /></>;
}
