import type { ProductType } from "./types";

/** Both pizzas and multi-volume drinks derive their selling price from a selected, orderable variant. */
export function hasPricedVariants(type: ProductType): boolean {
  return type === "PIZZA" || type === "DRINK";
}
