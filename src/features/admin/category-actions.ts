"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { writeAdminAudit } from "@/lib/admin/audit-log";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const categorySchema = z.object({ id:z.string().uuid().optional(), name:z.string().trim().min(1,"Укажите название на русском").max(80), nameTj:z.string().trim().max(80), slug:z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,"Slug: латинские буквы, цифры и дефисы").max(80), imageUrl:z.union([z.literal(""),z.string().url()]), sortOrder:z.coerce.number().int().min(0).max(9999), isActive:z.boolean() });
function formValue(form: FormData) { return { id:String(form.get("id")??"") || undefined,name:String(form.get("name")??""),nameTj:String(form.get("nameTj")??""),slug:String(form.get("slug")??""),imageUrl:String(form.get("imageUrl")??""),sortOrder:form.get("sortOrder")??0,isActive:form.get("isActive")==="on" }; }
async function adminClient(){ await requireAdmin(); const client=await createSupabaseServerClient(); if(!client) throw new Error("ADMIN_DATA_UNAVAILABLE"); return client; }
function done(){ revalidatePath("/admin/categories"); revalidatePath("/menu"); revalidatePath("/"); }

export async function saveCategory(form:FormData){ const data=categorySchema.parse(formValue(form)); const client=await adminClient(); const payload={name:data.name,name_tj:data.nameTj||data.name,slug:data.slug,image_url:data.imageUrl||null,sort_order:data.sortOrder,is_active:data.isActive}; const result=data.id?await client.from("categories").update(payload).eq("id",data.id):await client.from("categories").insert(payload); if(result.error) throw new Error("CATEGORY_SAVE_FAILED"); await writeAdminAudit(client,{action:data.id?"update":"create",entityType:"category",entityId:data.id,afterData:{slug:data.slug,isActive:data.isActive}}); done(); }
export async function toggleCategory(form:FormData){ const id=z.string().uuid().parse(form.get("id")); const current=z.enum(["true","false"]).parse(form.get("current"))==="true"; const client=await adminClient(); const {error}=await client.from("categories").update({is_active:!current}).eq("id",id); if(error)throw new Error("CATEGORY_TOGGLE_FAILED"); await writeAdminAudit(client,{action:"availability",entityType:"category",entityId:id,afterData:{isActive:!current}}); done(); }
export async function archiveCategory(form:FormData){ const id=z.string().uuid().parse(form.get("id")); const client=await adminClient(); const {error}=await client.from("categories").update({archived_at:new Date().toISOString(),is_active:false}).eq("id",id); if(error)throw new Error("CATEGORY_ARCHIVE_FAILED"); await writeAdminAudit(client,{action:"archive",entityType:"category",entityId:id}); done(); }
