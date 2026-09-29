import { describe, expect, it } from "vitest";
import { fixtureProducts } from "@/lib/menu/fixture";
import { combineUnavailable, unavailableCartItems, unavailableLabel } from "./availability";
import type { CartItem } from "./logic";
const burger = fixtureProducts.find(p => p.id === "hamburger")!;
const pizza = fixtureProducts.find(p => p.id === "pepperoni")!;
describe("archived and unavailable cart recovery", () => {
  it("reports all failures while preserving valid items", () => {
    expect(unavailableCartItems([
      { productId: "archived-combo" },
      { productId: burger.id },
      { productId: pizza.id, variantId: "archived-size" },
    ], [burger, pizza]).map(x => x.code)).toEqual(["PRODUCT_NOT_FOUND", "VARIANT_UNAVAILABLE"]);
  });
  it("distinguishes unavailable products and variants", () => {
    expect(unavailableCartItems([{ productId: burger.id }], [{ ...burger, isAvailable: false }]))
      .toMatchObject([{ code: "PRODUCT_UNAVAILABLE", name: burger.name }]);
    const size = pizza.variants![0];
    expect(unavailableCartItems([{ productId: pizza.id, variantId: size.id }], [
      { ...pizza, variants: pizza.variants!.map(v => v.id === size.id ? { ...v, isAvailable: false } : v) },
    ])).toMatchObject([{ code: "VARIANT_UNAVAILABLE", variantName: size.name }]);
  });
  it("rejects fabricated variant IDs on ordinary products", () => {
    expect(unavailableCartItems([{ productId: burger.id, variantId: "fake" }], [burger]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE" }]);
  });
  it("uses a saved name where possible, otherwise a positional fallback", () => {
    const issue = unavailableCartItems([{ productId: "old", variantId: "size" }], [])[0];
    expect(unavailableLabel(issue, [{ productId: "old", variantId: "size", quantity: 1,
      productName: "Комбо №6", variantName: "Большой" }])).toBe("Комбо №6 · Большой");
    expect(unavailableLabel(issue, [{ productId: "old", variantId: "size", quantity: 1 }]))
      .toBe("Позиция №1");
  });
  it("removes resolved issues when matching cart lines disappear", () => {
    const cart: CartItem[] = [{ productId: "old", quantity: 1 }, { productId: burger.id, quantity: 1 }];
    const fromServer = unavailableCartItems(cart, [burger]);
    expect(combineUnavailable([], fromServer, cart)).toHaveLength(1);
    expect(combineUnavailable([], fromServer, cart.slice(1))).toHaveLength(0);
  });
  it("treats a disabled drink volume as unavailable", () => {
    const drink = { ...pizza, id: "cola", name: "Coca-Cola", productType: "DRINK" as const,
      variants: [
        { id: "small", name: "0,5 л", priceDiram: 700, isActive: true, isAvailable: true, sortOrder: 0 },
        { id: "large", name: "1 л", priceDiram: 1200, isActive: true, isAvailable: false, sortOrder: 1 },
      ] };
    expect(unavailableCartItems([{ productId: drink.id, variantId: "large" }], [drink]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE", name: "Coca-Cola", variantName: "1 л" }]);
    expect(unavailableCartItems([{ productId: drink.id }], [drink]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE" }]);
  });
});