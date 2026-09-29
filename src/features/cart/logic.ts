import { z } from "zod";
import { productDisplayPrice } from "@/lib/menu/logic";
import { hasPricedVariants } from "@/lib/menu/variant-kind";
import type { Product } from "@/lib/menu/types";

export const MAX_QUANTITY_PER_LINE = 99;
export const MAX_CART_LINES = 50;
export type CartItem = {
  productId: string;
  variantId?: string;
  quantity: number;
  /** Display-only snapshots. Never used for pricing or order authorization. */
  productName?: string;
  variantName?: string;
};
const lineSchema = z.object({
  productId: z.string().min(1).max(120),
  variantId: z.string().min(1).max(120).optional(),
  quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_LINE),
  productName: z.string().trim().min(1).max(120).optional(),
  variantName: z.string().trim().min(1).max(120).optional(),
});
const schema = z.object({ version: z.literal(1), items: z.array(lineSchema).max(MAX_CART_LINES) });
export const parseCart = (raw: string | null): CartItem[] => {
  try { return schema.parse(JSON.parse(raw ?? "{}")).items; }
  catch { return []; }
};
export const key = (item: Pick<CartItem, "productId" | "variantId">) =>
  `${item.productId}:${item.variantId ?? ""}`;
export function add(items: CartItem[], item: CartItem) {
  const found = items.find(row => key(row) === key(item));
  return found
    ? items.map(row => key(row) === key(item)
      ? { ...row, quantity: Math.min(MAX_QUANTITY_PER_LINE, row.quantity + item.quantity),
          productName: item.productName ?? row.productName,
          variantName: item.variantName ?? row.variantName }
      : row)
    : (items.length >= MAX_CART_LINES ? items : [...items, { ...item, quantity: Math.min(MAX_QUANTITY_PER_LINE, item.quantity) }]);
}
export const subtotal = (items: CartItem[], products: Product[]) => items.reduce((sum, item) => {
  const product = products.find(p => p.id === item.productId && p.isActive && p.isAvailable);
  if (!product) return sum;
  if (hasPricedVariants(product.productType)) {
    const variant = product.variants?.find(v => v.id === item.variantId && v.isActive && v.isAvailable !== false);
    return variant ? sum + variant.priceDiram * item.quantity : sum;
  }
  if (item.variantId) return sum;
  const price = productDisplayPrice(product);
  return price == null ? sum : sum + price * item.quantity;
}, 0);
