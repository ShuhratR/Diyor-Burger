import { createSupabaseServerClient } from "@/lib/supabase/server";
import{redirect}from"next/navigation";import{evaluateAdminAccess}from"./admin-access";
export async function getAdminUser() { const client = await createSupabaseServerClient(); if (!client) return null; const { data: { user } } = await client.auth.getUser(); if (!user) return null; const { data: profile } = await client.from("admin_profiles").select("id,is_active").eq("id", user.id).maybeSingle(); return evaluateAdminAccess(user,profile?{id:String(profile.id),isActive:Boolean(profile.is_active)}:null)==="AUTHORIZED"?user:null; }
export async function requireAdmin(){const user=await getAdminUser();if(!user)redirect("/admin/login");return user}
