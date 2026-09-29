import type { ProductType } from "./types";

/** Both pizzas and multi-volume drinks derive their selling price from a selected, orderable variant. */
export function hasPricedVariants(type: ProductType): boolean {
  return type === "PIZZA" || type === "DRINK";
}

export function variantHeading(productType: "PIZZA" | "DRINK") {
  return productType === "DRINK" ? "Выберите объём" : "Выберите размер";
}
