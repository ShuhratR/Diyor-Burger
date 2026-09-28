"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const homeSection = z.enum(["hero", "benefits", "promotion"]);
const value = (form: FormData, name: string) => String(form.get(name) ?? "").trim();

/** Only update the visible home-section fields; never replace all restaurant settings. */
export async function saveHomeSection(form: FormData) {
  await requireAdmin();
  const section = homeSection.parse(form.get("section"));
  const client = await createSupabaseServerClient();
  if (!client) throw new Error("ADMIN_DATA_UNAVAILABLE");

  let payload: Record<string, unknown>;
  if (section === "hero") {
    const fields = z.object({
      restaurantName: z.string().min(1).max(120),
      heroTitle: z.string().max(160),
      heroSubtitle: z.string().max(300),
      heroImage: z.string().url().or(z.literal("")),
    }).parse({
      restaurantName: value(form, "restaurantName"),
      heroTitle: value(form, "heroTitle"),
      heroSubtitle: value(form, "heroSubtitle"),
      heroImage: value(form, "heroImage"),
    });
    payload = {
      restaurant_name: fields.restaurantName,
      hero_title: fields.heroTitle || null,
      hero_subtitle: fields.heroSubtitle || null,
      hero_image_url: fields.heroImage || null,
    };
  } else if (section === "benefits") {
    const labels = [1, 2, 3, 4].map(index =>
      z.string().max(80).parse(value(form, `benefit${index}`))
    );
    payload = { benefit_labels: labels.filter(Boolean) };
  } else {
    const fields = z.object({
      promotionText: z.string().max(300),
      promotionImage: z.string().url().or(z.literal("")),
    }).parse({
      promotionText: value(form, "promotionText"),
      promotionImage: value(form, "promotionImage"),
    });
    payload = {
      promotion_text: fields.promotionText,
      promotion_image_url: fields.promotionImage || null,
    };
  }

  const { error } = await client.from("restaurant_settings").update(payload).eq("id", true);
  if (error) throw new Error("HOME_SECTION_SAVE_FAILED");
  ["/", "/admin", "/admin/settings", "/menu"].forEach(path => revalidatePath(path));
}
