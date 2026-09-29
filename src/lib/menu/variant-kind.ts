import type { ProductType } from "./types";

/** Pizza sizes and beverage volumes have separately priced and stock-managed choices. */
export function hasPricedVariants(productType: ProductType): boolean {
  return productType === "PIZZA" || productType === "DRINK";
}

export function variantHeading(productType: "PIZZA" | "DRINK") {
  return productType === "DRINK" ? "Выберите объём" : "Выберите размер";
}
