import { z } from "zod";
import { calculateDelivery, type DeliveryZone } from "@/lib/delivery";
import { formatSomoni } from "@/lib/money";
import { activeVariants, productDisplayPrice } from "@/lib/menu/logic";
import { hasPricedVariants } from "@/lib/menu/variant-kind";
import type { Product } from "@/lib/menu/types";

export type Fulfillment = "delivery" | "pickup";
export const CUSTOM_DELIVERY_ZONE_ID = "__other__";

export const normalizePhone = (v: string) => {
  let d = v.replace(/\D/g, "");
  if (d.length === 9) d = "992" + d;
  return d;
};

/**
 * Customer-entered text is displayed inside the restaurant's WhatsApp order.
 * Flatten controls/newlines/bidi overrides so a user cannot visually forge
 * extra order headers or totals while keeping normal Tajik/Russian text intact.
 */
export const normalizeCustomerText = (value: string) =>
  value
    .replace(/[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const safeText = (max: number, min = 0) =>
  z.string()
    .transform(normalizeCustomerText)
    .pipe(z.string().min(min).max(max));

export const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().trim().min(1).max(100),
        variantId: z.string().trim().min(1).max(100).optional(),
        quantity: z.number().int().min(1).max(99),
      }),
    )
    .min(1).max(50),
  name: safeText(100, 2),
  phone: z
    .string()
    .max(40)
    .transform(normalizePhone)
    .refine((x) => /^992\d{9}$/.test(x)),
  fulfillment: z.enum(["delivery", "pickup"]),
  zoneId: z.string().trim().min(1).max(100).optional(),
  customArea: safeText(120, 2).optional(),
  address: safeText(300).optional(),
  comment: safeText(500).optional(),
  // Honeypot: real customers never see or fill this field.
  website: z.string().max(0).optional(),
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
      ? { ...raw, zoneId: undefined, customArea: undefined, address: undefined }
      : raw.zoneId === CUSTOM_DELIVERY_ZONE_ID
        ? raw
        : { ...raw, customArea: undefined };

  if (x.fulfillment === "delivery" && (!x.zoneId || !x.address))
    throw Error("DELIVERY_ZONE_REQUIRED");
  if (
    x.fulfillment === "delivery" &&
    x.zoneId === CUSTOM_DELIVERY_ZONE_ID &&
    !x.customArea
  )
    throw Error("CUSTOM_DELIVERY_AREA_REQUIRED");
  if (x.fulfillment === "pickup" && !settings.pickupEnabled)
    throw Error("PICKUP_DISABLED");

  const items = x.items.map((i) => {
    const p = products.find((a) => a.id === i.productId && a.isActive);
    if (!p) throw Error("PRODUCT_NOT_FOUND");
    if (!p.isAvailable) throw Error("PRODUCT_UNAVAILABLE");
    const v = i.variantId
      ? activeVariants(p).find((a) => a.id === i.variantId)
      : undefined;
    if (hasPricedVariants(p.productType) && !v) throw Error("VARIANT_UNAVAILABLE");
    if (!hasPricedVariants(p.productType) && i.variantId) throw Error("VARIANT_UNAVAILABLE");
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

  const subtotalDiram = items.reduce((s, i) => s + i.lineTotalDiram, 0);
  const customDelivery =
    x.fulfillment === "delivery" && x.zoneId === CUSTOM_DELIVERY_ZONE_ID;
  const zone =
    x.fulfillment === "delivery" && !customDelivery
      ? zones.find((z) => z.id === x.zoneId)
      : undefined;

  // For an address outside configured zones we do not invent a fee or label it
  // as free. The manager confirms delivery price in WhatsApp.
  const calc = customDelivery
    ? {
        deliveryFeeDiram: 0,
        totalDiram: subtotalDiram,
        remainingForFreeDeliveryDiram: null,
        isFreeDelivery: false,
      }
    : calculateDelivery(subtotalDiram, x.fulfillment, zone);

  return {
    ...calc,
    subtotalDiram,
    items,
    customer: x,
    zone,
    customDelivery,
    settings,
  };
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

  if (summary.customDelivery && summary.customer.customArea)
    lines.push(`Район/город: ${summary.customer.customArea} (вне списка)`);
  else if (summary.zone)
    lines.push(`Зона: ${summary.zone.name ?? summary.zone.id}`);

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
    `Доставка: ${
      summary.customDelivery
        ? "УТОЧНЯЕТСЯ"
        : summary.deliveryFeeDiram
          ? formatSomoni(summary.deliveryFeeDiram)
          : summary.customer.fulfillment === "pickup"
            ? formatSomoni(0)
            : "БЕСПЛАТНО"
    }`,
    summary.customDelivery
      ? `ИТОГО ПО ТОВАРАМ (без доставки): ${formatSomoni(summary.totalDiram)}`
      : `ИТОГО: ${formatSomoni(summary.totalDiram)}`,
  );

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join("\n"))}`;
}
