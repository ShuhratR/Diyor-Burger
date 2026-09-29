import { checkoutSchema, prepare, whatsapp } from "./core";
import { unavailableCartItems, type UnavailableCartItem } from "@/features/cart/availability";
import type { Product, PublicDeliveryZone } from "@/lib/menu/types";

type Settings = { name: string; whatsapp: string; pickupEnabled: boolean; pickupAddress?: string };
export type PreparedCheckout = {
  items: Array<{ productId: string; name: string; variant: string | null; quantity: number; unitPriceDiram: number; lineTotalDiram: number; imageUrl?: string }>;
  subtotalDiram: number; fulfillment: "delivery" | "pickup"; deliveryZone: string | null;
  deliveryFeeDiram: number; freeDelivery: boolean; totalDiram: number;
  customer: { name: string; phone: string; address: string | null; comment: string | null };
  pickupAddress: string | null; canonicalWhatsAppUrl: string;
};
export type PrepareResult = { ok: true; summary: PreparedCheckout } |
  { ok: false; code: string; unavailableItems?: UnavailableCartItem[] };

function code(error: unknown) {
  const message = error instanceof Error ? error.message : "";
  if (message === "Delivery zone is unavailable") return "DELIVERY_ZONE_UNAVAILABLE";
  if (message === "Invalid subtotal") return "EMPTY_CART";
  if (message) return message;
  return "INVALID_CHECKOUT";
}

export function prepareCheckout(input: unknown, products: Product[], zones: PublicDeliveryZone[], settings: Settings): PrepareResult {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID_CHECKOUT" };
  const unavailableItems = unavailableCartItems(parsed.data.items, products);
  if (unavailableItems.length > 0)
    return { ok: false, code: unavailableItems[0].code, unavailableItems };
  try {
    const value = prepare(input, products, zones, settings);
    return { ok: true, summary: {
      items: value.items.map(item => ({ ...item, variant: item.variant ?? null,
        imageUrl: products.find(product => product.id === item.productId)?.imageUrl })),
      subtotalDiram: value.subtotalDiram, fulfillment: value.customer.fulfillment,
      deliveryZone: value.zone?.name ?? null, deliveryFeeDiram: value.deliveryFeeDiram,
      freeDelivery: value.isFreeDelivery, totalDiram: value.totalDiram,
      customer: { name: value.customer.name, phone: value.customer.phone,
        address: value.customer.address ?? null, comment: value.customer.comment || null },
      pickupAddress: value.customer.fulfillment === "pickup" ? settings.pickupAddress ?? null : null,
      canonicalWhatsAppUrl: whatsapp(value),
    } };
  } catch (error) { return { ok: false, code: code(error) }; }
}
