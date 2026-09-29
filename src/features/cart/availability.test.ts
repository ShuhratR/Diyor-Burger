import { describe, expect, it } from "vitest";
import { fixtureProducts } from "@/lib/menu/fixture";
import { combineUnavailable, unavailableCartItems, unavailableLabel } from "./availability";
import type { CartItem } from "./logic";

const burger = fixtureProducts.find(p => p.id === "hamburger")!;
const pizza = fixtureProducts.find(p => p.id === "pepperoni")!;
describe("archived/unavailable cart recovery", () => {
  it("returns all unavailable lines, not only the first", () => {
    const items = [{ productId: "archived-combo" }, { productId: burger.id }, { productId: pizza.id, variantId: "archived-size" }];
    expect(unavailableCartItems(items, [burger, pizza]).map(x => x.code))
      .toEqual(["PRODUCT_NOT_FOUND", "VARIANT_UNAVAILABLE"]);
  });
  it("distinguishes an unavailable product and an unavailable pizza size", () => {
    expect(unavailableCartItems([{ productId: burger.id }], [{ ...burger, isAvailable: false }]))
      .toMatchObject([{ code: "PRODUCT_UNAVAILABLE", name: burger.name }]);
    const size = pizza.variants![0];
    expect(unavailableCartItems([{ productId: pizza.id, variantId: size.id }], [
      { ...pizza, variants: pizza.variants!.map(v => v.id === size.id ? { ...v, isAvailable: false } : v) },
    ])).toMatchObject([{ code: "VARIANT_UNAVAILABLE", variantName: size.name }]);
  });
  it("does not accept a fabricated variant on an ordinary burger", () => {
    expect(unavailableCartItems([{ productId: burger.id, variantId: "fake" }], [burger]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE" }]);
  });
  it("shows saved names and positional fallback for legacy carts", () => {
    const issue = unavailableCartItems([{ productId: "deleted", variantId: "variant" }], [])[0];
    expect(unavailableLabel(issue, [{ productId: "deleted", variantId: "variant", quantity: 1,
      productName: "Комбо №6", variantName: "Большой" }])).toBe("Комбо №6 · Большой");
    expect(unavailableLabel(issue, [{ productId: "deleted", variantId: "variant", quantity: 1 }]))
      .toBe("Позиция №1");
  });
  it("keeps issues present after one or more removals", () => {
    const cart: CartItem[] = [{ productId: "old", quantity: 1 }, { productId: burger.id, quantity: 1 }];
    const server = unavailableCartItems(cart, [burger]);
    expect(combineUnavailable([], server, cart)).toHaveLength(1);
    expect(combineUnavailable([], server, cart.slice(1))).toHaveLength(0);
  });
  it("detects unavailable drink volumes, but preserves valid sizes", () => {
    const drink = { ...pizza, id: "cola-sizes", name: "Coca-Cola", productType: "DRINK" as const, variants: [
      { id: "small", name: "0,5 л", priceDiram: 700, isActive: true, isAvailable: true, sortOrder: 0 },
      { id: "large", name: "1 л", priceDiram: 1200, isActive: true, isAvailable: false, sortOrder: 1 },
    ] };
    expect(unavailableCartItems([{ productId: drink.id, variantId: "large" }], [drink]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE", name: "Coca-Cola", variantName: "1 л" }]);
    expect(unavailableCartItems([{ productId: drink.id, variantId: "small" }], [drink])).toEqual([]);
    expect(unavailableCartItems([{ productId: drink.id }], [drink]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE" }]);
  });
});
