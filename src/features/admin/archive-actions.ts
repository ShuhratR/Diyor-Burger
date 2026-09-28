"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const types = ["products", "product_variants", "categories", "delivery_zones", "banners"] as const;
export async function restoreArchived(form: FormData) {
  const table = z.enum(types).parse(form.get("table"));
  const id = z.string().uuid().parse(form.get("id"));
  await requireAdmin();
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("ADMIN_DATA_UNAVAILABLE");
  const payload = { archived_at: null, is_active: true };
  const { error } = await client.from(table).update(payload).eq("id", id);
  if (error) throw new Error("ARCHIVE_RESTORE_FAILED");
  [
    "/admin/archive",
    "/admin/products",
    "/admin/products/[id]",
    "/admin/combos",
    "/admin/categories",
    "/admin/delivery",
    "/admin/banners",
    "/",
    "/menu",
    "/combos",
  ].forEach((path) => revalidatePath(path));
}
