"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { somoniToDiram } from "@/lib/money";
import { blocksLastOrderableVariantArchive } from "@/lib/admin/variant-archive";

const schema=z.object({id:z.string().uuid().optional(),productId:z.string().uuid(),name:z.string().trim().min(1).max(80),nameTj:z.string().trim().max(80),price:z.string(),oldPrice:z.string(),sortOrder:z.coerce.number().int().min(0).max(9999),isActive:z.boolean(),isAvailable:z.boolean()});
function values(form:FormData){return{id:String(form.get("id")??"")||undefined,productId:String(form.get("productId")??""),name:String(form.get("name")??""),nameTj:String(form.get("nameTj")??""),price:String(form.get("price")??""),oldPrice:String(form.get("oldPrice")??""),sortOrder:form.get("sortOrder")??0,isActive:form.get("isActive")==="on",isAvailable:form.get("isAvailable")==="on"};}
async function client(){await requireAdmin();const c=await createSupabaseServerClient();if(!c)throw new Error("ADMIN_DATA_UNAVAILABLE");return c;}
function refresh(id:string){["/admin/products",`/admin/products/${id}`,"/menu","/"].forEach((path)=>revalidatePath(path));}
export async function saveVariant(form:FormData){const d=schema.parse(values(form));const price=somoniToDiram(d.price),oldPrice=somoniToDiram(d.oldPrice);if(price===null||price<0)throw new Error("INVALID_VARIANT_PRICE");if(oldPrice!==null&&oldPrice<=price)throw new Error("INVALID_VARIANT_OLD_PRICE");const c=await client();const payload={product_id:d.productId,name:d.name,name_tj:d.nameTj||d.name,price_diram:price,old_price_diram:oldPrice,sort_order:d.sortOrder,is_active:d.isActive,is_available:d.isAvailable};const r=d.id?await c.from("product_variants").update(payload).eq("id",d.id):await c.from("product_variants").insert(payload);if(r.error)throw new Error("VARIANT_SAVE_FAILED");refresh(d.productId);}
export async function archiveVariant(form: FormData) {
  const id = z.string().uuid().parse(form.get("id"));
  const productId = z.string().uuid().parse(form.get("productId"));
  const c = await client();
  const { data: target, error: lookupError } = await c.from("product_variants")
    .select("id,is_active,is_available")
    .eq("id", id).eq("product_id", productId).is("archived_at", null).maybeSingle();
  if (lookupError) throw new Error("VARIANT_LOOKUP_FAILED");
  if (!target) throw new Error("VARIANT_NOT_FOUND");

  if (target.is_active && target.is_available) {
    const { count, error: countError } = await c.from("product_variants")
      .select("id", { count: "exact", head: true })
      .eq("product_id", productId).eq("is_active", true)
      .eq("is_available", true).is("archived_at", null);
    if (countError || count === null) throw new Error("VARIANT_COUNT_FAILED");
    if (blocksLastOrderableVariantArchive({
      isActive: target.is_active,
      isAvailable: target.is_available,
    }, count)) throw new Error("LAST_ORDERABLE_VARIANT");
  }
  const { data, error } = await c.from("product_variants")
    .update({ archived_at: new Date().toISOString(), is_active: false })
    .eq("id", id).eq("product_id", productId).is("archived_at", null)
    .select("id").single();
  if (error || !data) throw new Error("VARIANT_ARCHIVE_FAILED");
  refresh(productId);
}
