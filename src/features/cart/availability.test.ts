import { describe, expect, it } from "vitest";
import { fixtureProducts } from "@/lib/menu/fixture";
import { combineUnavailable, unavailableCartItems, unavailableLabel } from "./availability";
import type { CartItem } from "./logic";

const burger = fixtureProducts.find(p => p.id === "hamburger")!;
const pizza = fixtureProducts.find(p => p.id === "pepperoni")!;
const drink = { ...pizza, id: "drink-cola", name: "Coca-Cola", categoryId: "drinks",
  productType: "DRINK" as const, variants: [
    { id: "cola-05", name: "0,5 л", priceDiram: 700, isActive: true, isAvailable: true, sortOrder: 0 },
    { id: "cola-1", name: "1 л", priceDiram: 1200, isActive: true, isAvailable: false, sortOrder: 1 },
  ] };

describe("archived/unavailable cart recovery", () => {
  it("returns every unavailable position, not just the first", () => {
    const items = [
      { productId: "archived-combo" },
      { productId: burger.id },
      { productId: pizza.id, variantId: "archived-size" },
    ];
    expect(unavailableCartItems(items, [burger, pizza]).map(x => x.code))
      .toEqual(["PRODUCT_NOT_FOUND", "VARIANT_UNAVAILABLE"]);
  });
  it("distinguishes out-of-stock product and pizza size", () => {
    expect(unavailableCartItems([{ productId: burger.id }], [{ ...burger, isAvailable: false }]))
      .toMatchObject([{ code: "PRODUCT_UNAVAILABLE", name: burger.name }]);
    const size = pizza.variants![0];
    expect(unavailableCartItems([{ productId: pizza.id, variantId: size.id }], [
      { ...pizza, variants: pizza.variants!.map(v => v.id === size.id ? { ...v, isAvailable: false } : v) },
    ])).toMatchObject([{ code: "VARIANT_UNAVAILABLE", variantName: size.name }]);
  });
  it("rejects fabricated variant on an ordinary burger", () => {
    expect(unavailableCartItems([{ productId: burger.id, variantId: "fake" }], [burger]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE" }]);
  });
  it("shows stored names in new carts and index in old carts", () => {
    const issue = unavailableCartItems([{ productId: "deleted", variantId: "variant" }], [])[0];
    expect(unavailableLabel(issue, [{ productId: "deleted", variantId: "variant", quantity: 1,
      productName: "Комбо №6", variantName: "Большой" }])).toBe("Комбо №6 · Большой");
    expect(unavailableLabel(issue, [{ productId: "deleted", variantId: "variant", quantity: 1 }]))
      .toBe("Позиция №1");
  });
  it("keeps valid cart lines after one or many removals", () => {
    const cart: CartItem[] = [{ productId: "old", quantity: 1 }, { productId: burger.id, quantity: 1 }];
    const server = unavailableCartItems(cart, [burger]);
    expect(combineUnavailable([], server, cart)).toHaveLength(1);
    expect(combineUnavailable([], server, cart.slice(1))).toHaveLength(0);
  });
  it("identifies disabled drink volume without removing valid burger", () => {
    const issues = unavailableCartItems([
      { productId: burger.id }, { productId: drink.id, variantId: "cola-1" },
    ], [burger, drink]);
    expect(issues).toMatchObject([{ code: "VARIANT_UNAVAILABLE", index: 1,
      name: "Coca-Cola", variantName: "1 л" }]);
  });
  it("requires a selected drink volume", () => {
    expect(unavailableCartItems([{ productId: drink.id }], [drink]))
      .toMatchObject([{ code: "VARIANT_UNAVAILABLE" }]);
  });
});
