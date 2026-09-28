"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { writeAdminAudit } from "@/lib/admin/audit-log";
import { somoniToDiram } from "@/lib/money";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const productTypes = ["NORMAL", "PIZZA", "COMBO"] as const;
const schema = z.object({ id:z.string().uuid().optional(), categoryId:z.string().uuid(), name:z.string().trim().min(1).max(120), nameTj:z.string().trim().max(120), description:z.string().trim().max(1000), descriptionTj:z.string().trim().max(1000), slug:z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(120), productType:z.enum(productTypes), price:z.string(), oldPrice:z.string(), promotionLabel:z.string().trim().max(40), imageUrl:z.string().trim().url().max(2048).optional().or(z.literal("")), sortOrder:z.coerce.number().int().min(0).max(9999), isAvailable:z.boolean(), isActive:z.boolean(), isPopular:z.boolean() });

function values(form: FormData) { return { id:String(form.get("id") ?? "") || undefined, categoryId:String(form.get("categoryId") ?? ""), name:String(form.get("name") ?? ""), nameTj:String(form.get("nameTj") ?? ""), description:String(form.get("description") ?? ""), descriptionTj:String(form.get("descriptionTj") ?? ""), slug:String(form.get("slug") || `dish-${crypto.randomUUID()}`), productType:String(form.get("productType") ?? "NORMAL"), price:String(form.get("price") ?? ""), oldPrice:String(form.get("oldPrice") ?? ""), promotionLabel:String(form.get("promotionLabel") ?? ""), imageUrl:String(form.get("imageUrl") ?? ""), sortOrder:form.get("sortOrder") ?? 0, isAvailable:form.get("isAvailable") === "on", isActive:form.get("isActive") === "on", isPopular:form.get("isPopular") === "on" }; }
async function client() { await requireAdmin(); const c = await createSupabaseServerClient(); if (!c) throw new Error("ADMIN_DATA_UNAVAILABLE"); return c; }
function refresh() { ["/admin/products", "/menu", "/", "/combos"].forEach((path) => revalidatePath(path)); }

export async function saveProduct(form: FormData) {
  const d = schema.parse(values(form)); const price = somoniToDiram(d.price); const oldPrice = somoniToDiram(d.oldPrice);
  if (d.productType !== "PIZZA" && (price === null || price < 0)) throw new Error("INVALID_PRICE");
  if (oldPrice !== null && (price === null || oldPrice <= price)) throw new Error("INVALID_OLD_PRICE");
  const c = await client();
  const payload = { category_id:d.categoryId, name:d.name, name_tj:d.nameTj || d.name, description:d.description, description_tj:d.descriptionTj || d.description, slug:d.slug, product_type:d.productType, base_price_diram:d.productType === "PIZZA" ? null : price, old_price_diram:d.productType === "PIZZA" ? null : oldPrice, promotion_label:d.promotionLabel || null, image_url:d.imageUrl || null, sort_order:d.sortOrder, is_available:d.isAvailable, is_active:d.isActive, is_popular:d.isPopular };
  const result = d.id
    ? await c.from("products").update(payload).eq("id", d.id)
    : await c.from("products").insert(payload).select("id").single();
  if (result.error) throw new Error("PRODUCT_SAVE_FAILED");
  await writeAdminAudit(c, { action:d.id ? "update" : "create", entityType:"product", entityId:d.id, afterData:{ slug:d.slug, oldPrice, promotionLabel:d.promotionLabel } }); refresh();
  return { id: d.id ?? result.data?.id ?? null };
}
export async function toggleProductAvailability(form: FormData) { const id=z.string().uuid().parse(form.get("id")); const current=z.enum(["true","false"]).parse(form.get("current")) === "true"; const c=await client(); const { error }=await c.from("products").update({is_available:!current}).eq("id",id); if(error) throw new Error("PRODUCT_AVAILABILITY_FAILED"); refresh(); }
export async function archiveProduct(form: FormData) { const id=z.string().uuid().parse(form.get("id")); const c=await client(); const { error }=await c.from("products").update({archived_at:new Date().toISOString(),is_active:false}).eq("id",id); if(error) throw new Error("PRODUCT_ARCHIVE_FAILED"); refresh(); }
