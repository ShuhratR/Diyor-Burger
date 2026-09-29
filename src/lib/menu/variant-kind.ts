import type { ProductType } from "./types";

/** Both pizza sizes and bottled-drink volumes have independently priced variants. */
export function hasPricedVariants(productType: ProductType): boolean {
  return productType === "PIZZA" || productType === "DRINK";
}

export function variantHeading(productType: "PIZZA" | "DRINK") {
  return productType === "DRINK" ? "Выберите объём" : "Выберите размер";
}
