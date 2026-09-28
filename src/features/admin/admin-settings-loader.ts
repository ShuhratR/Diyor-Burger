import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminContentSettings } from "@/features/admin/admin-content-overlay";

export async function getAdminContentSettings(): Promise<AdminContentSettings | null> {
  const c = await createSupabaseServerClient();
  if (!c) return null;
  const { data, error } = await c
    .from("restaurant_settings")
    .select("*")
    .eq("id", true)
    .maybeSingle();
  if (error || !data) return null;
  const x = data as Record<string, unknown>;
  return {
    restaurantName: String(x.restaurant_name),
    whatsapp: String(x.order_whatsapp_number),
    phone1: x.contact_phone_1 as string | undefined,
    phone2: x.contact_phone_2 as string | undefined,
    instagram: x.instagram_url as string | undefined,
    mainAddress: String(x.main_address ?? ""),
    mainAddressTj: x.main_address_tj as string | undefined,
    pickupEnabled: Boolean(x.pickup_enabled),
    pickupAddress: x.pickup_address as string | undefined,
    pickupAddressTj: x.pickup_address_tj as string | undefined,
    pickupNote: x.pickup_note as string | undefined,
    pickupNoteTj: x.pickup_note_tj as string | undefined,
    mapUrl: x.map_url as string | undefined,
    openTime: x.work_open_time as string | undefined,
    closeTime: x.work_close_time as string | undefined,
    heroTitle: x.hero_title as string | undefined,
    heroTitleTj: x.hero_title_tj as string | undefined,
    heroSubtitle: x.hero_subtitle as string | undefined,
    heroSubtitleTj: x.hero_subtitle_tj as string | undefined,
    heroImage: x.hero_image_url as string | undefined,
    benefitLabels: x.benefit_labels as string[] | undefined,
    promotionText: x.promotion_text as string | undefined,
    promotionImage: x.promotion_image_url as string | undefined,
    cartEmptyTitle: x.cart_empty_title as string | undefined,
    cartEmptyBody: x.cart_empty_body as string | undefined,
    cartCheckoutLabel: x.cart_checkout_label as string | undefined,
    cartWhatsappLabel: x.cart_whatsapp_label as string | undefined,
  };
}
