import type { SupabaseClient } from "@supabase/supabase-js";

type AuditInput = { action:string; entityType:string; entityId?:string; afterData?:Record<string,unknown> };

export async function writeAdminAudit(client:SupabaseClient,input:AuditInput){const{data:{user}}=await client.auth.getUser();const{error}=await client.from("audit_logs").insert({admin_id:user?.id??null,action:input.action,entity_type:input.entityType,entity_id:input.entityId??null,after_data:input.afterData??null});if(error)throw new Error("AUDIT_LOG_FAILED");}
