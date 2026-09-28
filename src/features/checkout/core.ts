import { z } from "zod";
import { calculateDelivery, type DeliveryZone } from "@/lib/delivery";
import { formatSomoni } from "@/lib/money";
import { activeVariants, productDisplayPrice } from "@/lib/menu/logic";
import type { Product } from "@/lib/menu/types";
export type Fulfillment = "delivery" | "pickup";
export const normalizePhone = (v: string) => {
  let d = v.replace(/\D/g, "");
  if (d.length === 9) d = "992" + d;
  return d;
};
export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string(),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1),
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((x) => /^992\d{9}$/.test(x)),
  fulfillment: z.enum(["delivery", "pickup"]),
  zoneId: z.string().optional(),
  address: z.string().trim().max(300).optional(),
  comment: z.string().trim().max(500).optional(),
});
export function prepare(
  input: unknown,
  products: Product[],
  zones: DeliveryZone[],
  settings: {
    pickupEnabled: boolean;
    whatsapp: string;
    pickupAddress?: string;
    name: string;
  },
) {
  const raw = checkoutSchema.parse(input);
  const x =
    raw.fulfillment === "pickup"
      ? { ...raw, zoneId: undefined, address: undefined }
      : raw;
  if (x.fulfillment === "delivery" && (!x.zoneId || !x.address))
    throw Error("DELIVERY_ZONE_REQUIRED");
  if (x.fulfillment === "pickup" && !settings.pickupEnabled)
    throw Error("PICKUP_DISABLED");
  const items = x.items.map((i) => {
    const p = products.find((a) => a.id === i.productId && a.isActive);
    if (!p) throw Error("PRODUCT_NOT_FOUND");
    if (!p.isAvailable) throw Error("PRODUCT_UNAVAILABLE");
    const v = i.variantId
      ? activeVariants(p).find((a) => a.id === i.variantId)
      : undefined;
    if (p.productType === "PIZZA" && !v) throw Error("VARIANT_UNAVAILABLE");
    const price = v?.priceDiram ?? productDisplayPrice(p);
    if (price === undefined) throw Error("PRODUCT_NOT_FOUND");
    return {
      productId: p.id,
      name: p.name,
      variant: v?.name,
      quantity: i.quantity,
      unitPriceDiram: price,
      lineTotalDiram: price * i.quantity,
    };
  });
  const subtotalDiram = items.reduce((s, i) => s + i.lineTotalDiram, 0),
    zone =
      x.fulfillment === "delivery"
        ? zones.find((z) => z.id === x.zoneId)
        : undefined;
  const calc = calculateDelivery(subtotalDiram, x.fulfillment, zone);
  return { ...calc, subtotalDiram, items, customer: x, zone, settings };
}
export function whatsapp(summary: ReturnType<typeof prepare>) {
  const phone = summary.settings.whatsapp.replace(/\D/g, "");
  if (!/^\d{7,16}$/.test(phone))
    throw Error("ORDER_WHATSAPP_NOT_CONFIGURED");
  const lines = [
    `🍔 НОВЫЙ ЗАКАЗ — ${summary.settings.name}`,
    ``,
    `Клиент: ${summary.customer.name}`,
    `Телефон: +${summary.customer.phone}`,
    ``,
    `Способ получения: ${summary.customer.fulfillment === "delivery" ? "Доставка" : "Самовывоз"}`,
  ];
  if (summary.zone) lines.push(`Зона: ${summary.zone.name ?? summary.zone.id}`);
  if (
    summary.customer.fulfillment === "pickup" &&
    summary.settings.pickupAddress
  )
    lines.push(`Адрес самовывоза: ${summary.settings.pickupAddress}`);
  if (summary.customer.address)
    lines.push(`Адрес: ${summary.customer.address}`);
  if (summary.customer.comment)
    lines.push(`Комментарий: ${summary.customer.comment}`);
  lines.push(
    "",
    "ЗАКАЗ:",
    ...summary.items.map(
      (i, n) =>
        `${n + 1}. ${i.name}${i.variant ? ` (${i.variant})` : ""} × ${i.quantity} — ${formatSomoni(i.lineTotalDiram)}`,
    ),
    "",
    `Товары: ${formatSomoni(summary.subtotalDiram)}`,
    `Доставка: ${summary.deliveryFeeDiram ? formatSomoni(summary.deliveryFeeDiram) : summary.customer.fulfillment === "pickup" ? formatSomoni(0) : "БЕСПЛАТНО"}`,
    `ИТОГО: ${formatSomoni(summary.totalDiram)}`,
  );
  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
