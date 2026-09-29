import type { Product } from "@/lib/menu/types";
import { key, type CartItem } from "./logic";
import { hasPricedVariants } from "@/lib/menu/variant-kind";

export type AvailabilityCode =
  | "PRODUCT_NOT_FOUND"
  | "PRODUCT_UNAVAILABLE"
  | "VARIANT_UNAVAILABLE";
export type UnavailableCartItem = {
  productId: string;
  variantId?: string;
  code: AvailabilityCode;
  index: number;
  name?: string;
  variantName?: string;
};
/** Compare saved cart IDs with the current public, orderable catalog. */
export function unavailableCartItems(
  items: readonly Pick<CartItem, "productId" | "variantId">[],
  products: readonly Product[],
): UnavailableCartItem[] {
  const byId = new Map(products.map(product => [product.id, product]));
  const issues: UnavailableCartItem[] = [];
  items.forEach((item, index) => {
    const product = byId.get(item.productId);
    const base = { productId: item.productId, variantId: item.variantId, index };
    if (!product || !product.isActive) {
      issues.push({ ...base, code: "PRODUCT_NOT_FOUND" });
      return;
    }
    if (!product.isAvailable) {
      issues.push({ ...base, code: "PRODUCT_UNAVAILABLE", name: product.name });
      return;
    }
    if (hasPricedVariants(product.productType)) {
      const variant = product.variants?.find(v => v.id === item.variantId);
      if (!item.variantId || !variant || !variant.isActive || variant.isAvailable === false) {
        issues.push({ ...base, code: "VARIANT_UNAVAILABLE", name: product.name,
          variantName: variant?.name });
      }
    } else if (item.variantId) {
      issues.push({ ...base, code: "VARIANT_UNAVAILABLE", name: product.name });
    }
  });
  return issues;
}
/** Saved labels are display-only. They must never determine order prices or availability. */
export function unavailableLabel(issue: UnavailableCartItem, cartItems: readonly CartItem[]): string {
  const stored = cartItems.find(item => key(item) === key(issue));
  const name = issue.name || stored?.productName || `Позиция №${issue.index + 1}`;
  const variant = issue.variantName || stored?.variantName;
  return variant ? `${name} · ${variant}` : name;
}
export function combineUnavailable(
  fromPage: readonly UnavailableCartItem[],
  fromServer: readonly UnavailableCartItem[],
  cartItems: readonly CartItem[],
): UnavailableCartItem[] {
  const inCart = new Map(cartItems.map((item, index) => [key(item), index]));
  const all = new Map<string, UnavailableCartItem>();
  for (const issue of [...fromPage, ...fromServer]) {
    const index = inCart.get(key(issue));
    if (index === undefined) continue;
    all.set(key(issue), { ...issue, index });
  }
  return [...all.values()].sort((a, b) => a.index - b.index);
}
