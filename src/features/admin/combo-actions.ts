"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { writeAdminAudit } from "@/lib/admin/audit-log";
import { somoniToDiram, parseOptionalOldPriceDiram } from "@/lib/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  productId: z.string().uuid().nullable(),
  name: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(99),
});
const comboSchema = z.object({
  id: z.string().uuid().optional(),
  categoryId: z.string().uuid(),
  name: z.string().trim().min(1).max(120),
  nameTj: z.string().trim().max(120),
  slug: z.string().trim().toLowerCase()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120),
  description: z.string().trim().max(1000),
  descriptionTj: z.string().trim().max(1000),
  price: z.string(),
  oldPrice: z.string(),
  imageUrl: z.string().trim().url().max(2048).optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  isAvailable: z.boolean(),
  isActive: z.boolean(),
  isPopular: z.boolean(),
  components: z.array(itemSchema).min(1).max(30),
});

async function client() {
  await requireAdmin();
  const c = await createSupabaseServerClient();
  if (!c) throw new Error("ADMIN_DATA_UNAVAILABLE");
  return c;
}
function refresh() {
  ["/admin/combos", "/admin/products", "/combos", "/", "/menu", "/search"]
    .forEach(path => revalidatePath(path));
}
function values(form: FormData) {
  let components: unknown;
  try {
    components = JSON.parse(String(form.get("components") ?? "[]"));
  } catch {
    throw new Error("INVALID_COMBO_COMPONENTS");
  }
  return {
    id: String(form.get("id") ?? "") || undefined,
    categoryId: String(form.get("categoryId") ?? ""),
    name: String(form.get("name") ?? ""),
    nameTj: String(form.get("nameTj") ?? ""),
    slug: String(form.get("slug") || `combo-${crypto.randomUUID()}`),
    description: String(form.get("description") ?? ""),
    descriptionTj: String(form.get("descriptionTj") ?? ""),
    price: String(form.get("price") ?? ""),
    oldPrice: String(form.get("oldPrice") ?? ""),
    imageUrl: String(form.get("imageUrl") ?? ""),
    sortOrder: form.get("sortOrder") ?? 0,
    isAvailable: form.get("isAvailable") === "on",
    isActive: form.get("isActive") === "on",
    isPopular: form.get("isPopular") === "on",
    components,
  };
}

/** Single database transaction: combo and complete ordered composition either
 * both save, or neither does. Custom entries are not standalone products. */
export async function saveCombo(form: FormData) {
  const d = comboSchema.parse(values(form));
  const price = somoniToDiram(d.price);
  if (price === null) throw new Error("INVALID_PRICE");
  const oldPrice = parseOptionalOldPriceDiram(d.oldPrice, price);
  const c = await client();
  const { data, error } = await c.rpc("save_combo_with_components", {
    p_combo: {
      id: d.id ?? null,
      categoryId: d.categoryId,
      name: d.name,
      nameTj: d.nameTj,
      slug: d.slug,
      description: d.description,
      descriptionTj: d.descriptionTj,
      priceDiram: price,
      oldPriceDiram: oldPrice,
      imageUrl: d.imageUrl || null,
      sortOrder: d.sortOrder,
      isAvailable: d.isAvailable,
      isActive: d.isActive,
      isPopular: d.isPopular,
    },
    p_components: d.components,
  });
  if (error || !data) throw new Error("COMBO_SAVE_FAILED");
  refresh();
  return { id: String(data) };
}

export async function archiveCombo(form: FormData) {
  const id = z.string().uuid().parse(form.get("id"));
  const c = await client();
  const { data, error } = await c.from("products")
    .update({ archived_at: new Date().toISOString(), is_active: false })
    .eq("id", id).eq("product_type", "COMBO").is("archived_at", null)
    .select("id").single();
  if (error || !data) throw new Error("COMBO_ARCHIVE_FAILED");
  await writeAdminAudit(c, { action: "archive", entityType: "combo", entityId: id });
  refresh();
}
