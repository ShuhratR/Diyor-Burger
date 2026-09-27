"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const types = ["products", "categories", "delivery_zones"] as const;
export async function restoreArchived(form: FormData) {
  const table = z.enum(types).parse(form.get("table")); const id = z.string().uuid().parse(form.get("id"));
  await requireAdmin(); const client = await createSupabaseServerClient(); if (!client) throw new Error("ADMIN_DATA_UNAVAILABLE");
  const payload = table === "products" ? { archived_at:null, is_active:true } : { archived_at:null, is_active:true };
  const { error } = await client.from(table).update(payload).eq("id", id); if (error) throw new Error("ARCHIVE_RESTORE_FAILED");
  ["/admin/archive", "/admin/products", "/admin/categories", "/admin/delivery", "/", "/menu"].forEach((path)=>revalidatePath(path));
}
