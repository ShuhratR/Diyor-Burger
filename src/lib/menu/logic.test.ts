import { describe, expect, it } from "vitest";
import { fixtureCategories, fixtureProducts } from "./fixture";
import { activeProducts, activeVariants, filterProducts, searchMatches, sortedComboComponents, productDisplayOldPrice, productDisplayPrice } from "./logic";
describe("public menu logic",()=>{ it("returns active categories only",()=>expect(fixtureCategories.filter(c=>c.isActive)).toHaveLength(7)); it("excludes inactive products",()=>expect(activeProducts(fixtureProducts).some(p=>p.slug==="archived-product")).toBe(false)); it("keeps unavailable product available for display state",()=>expect(activeProducts(fixtureProducts).find(p=>p.slug==="village-potatoes")?.isAvailable).toBe(false)); it("sorts active pizza variants",()=>expect(activeVariants(fixtureProducts.find(p=>p.slug==="pepperoni")!).map(v=>v.name)).toEqual(["28 см","30 см","36 см"])); it("sorts combo components",()=>expect(sortedComboComponents(fixtureProducts.find(p=>p.slug==="combo-cheeseburger")!).map(c=>c.name)).toEqual(["Чизбургер","Картофель фри","Напиток 0.4"])); it("matches search case-insensitively",()=>expect(searchMatches(fixtureProducts,"БУРГЕР").length).toBeGreaterThan(1)); it("sorts prices in both directions",()=>{const p=fixtureProducts.filter(x=>x.productType!=="PIZZA");expect(filterProducts(p,{sort:"price_asc"})[0].slug).toBe("cola-04");expect(filterProducts(p,{sort:"price_desc"})[0].slug).toBe("combo-bigburger")}); it("filters pizza by an active available variant size",()=>expect(filterProducts(fixtureProducts,{pizzaSize:"30 см"}).map(p=>p.slug)).toEqual(["pepperoni"])); });

describe("optional old price display", () => {
  it("shows an old price on a combo only when it is greater than the selling price", () => {
    const combo = fixtureProducts.find((p) => p.productType === "COMBO")!;
    expect(productDisplayOldPrice({ ...combo, oldPriceDiram: 5000 })).toBe(5000);
    expect(productDisplayOldPrice({ ...combo, oldPriceDiram: combo.basePriceDiram })).toBeUndefined();
    expect(productDisplayOldPrice(combo)).toBeUndefined();
  });

  it("uses the old price of exactly the displayed pizza size", () => {
    const pizza = fixtureProducts.find((p) => p.productType === "PIZZA")!;
    const variants = pizza.variants!.map((v, index) => ({
      ...v,
      oldPriceDiram: index === 0 ? 7500 : index === 1 ? 9000 : undefined,
    }));
    expect(productDisplayPrice({ ...pizza, variants })).toBe(6000);
    expect(productDisplayOldPrice({ ...pizza, variants })).toBe(7500);
    expect(productDisplayOldPrice({ ...pizza, variants: variants.map((v, i) => ({ ...v, isActive: i !== 0 })) })).toBe(9000);
  });
});
