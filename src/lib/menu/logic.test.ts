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

describe("search across all categories and filters", () => {
  it("returns all pizzas on a category keyword even if a product name omits pizza", () => {
    const pizzas = [
      { ...fixtureProducts.find(item => item.slug === "pepperoni")!,
        id: "american", name: "Американская", slug: "american" },
      { ...fixtureProducts.find(item => item.slug === "pepperoni")!,
        id: "mushrooms", name: "С грибами", slug: "mushrooms" },
    ];
    const results = searchMatches(pizzas, "ПИЦЦА", fixtureCategories);
    expect(results.map(item => item.slug)).toEqual(["american", "mushrooms"]);
    expect(searchMatches(pizzas, "пиццы", fixtureCategories)).toHaveLength(2);
  });
  it("searches a custom category name and Tajik text", () => {
    const product = { ...fixtureProducts[0], categoryId: "wings", name: "Острые" };
    const categories = [...fixtureCategories,
      { id: "wings", name: "Ножки", nameTj: "Пойҳо", slug: "nozhki", isActive: true, sortOrder: 8 }];
    expect(searchMatches([product], "Ножки", categories)).toHaveLength(1);
    expect(searchMatches([product], "Пойҳо", categories)).toHaveLength(1);
    expect(searchMatches([product], "несуществующее", categories)).toEqual([]);
  });
  it("supports search and diram price limits together", () => {
    const pizzas = searchMatches(fixtureProducts, "пицца", fixtureCategories);
    expect(filterProducts(pizzas, { minPriceDiram: 6100, maxPriceDiram: 8000 })).toEqual([]);
    expect(filterProducts(pizzas, { minPriceDiram: 6000, maxPriceDiram: 7000 })).toHaveLength(1);
    expect(filterProducts(pizzas, { category: "pizza", pizzaSize: "30 см" })).toHaveLength(1);
  });
  it("includes names of components when searching combo descriptions", () => {
    expect(searchMatches(fixtureProducts, "Напиток 0.4", fixtureCategories)
      .some(product => product.productType === "COMBO")).toBe(true);
  });
});


describe("drink variant pricing", () => {
  const cola = { ...fixtureProducts.find(p => p.id === "pepperoni")!, id: "drink-cola",
    categoryId: "drinks", productType: "DRINK" as const, name: "Coca-Cola",
    variants: [
      { id: "cola-05", name: "0,5 л", priceDiram: 700, oldPriceDiram: 900, isActive: true, isAvailable: true, sortOrder: 0 },
      { id: "cola-1", name: "1 л", priceDiram: 1200, isActive: true, isAvailable: true, sortOrder: 1 },
      { id: "cola-15", name: "1,5 л", priceDiram: 1500, isActive: true, isAvailable: false, sortOrder: 2 },
    ],
  };
  it("displays the first in-stock volume and its matching old price", () => {
    expect(productDisplayPrice(cola)).toBe(700);
    expect(productDisplayOldPrice(cola)).toBe(900);
    expect(activeVariants(cola).map(v => v.name)).toEqual(["0,5 л", "1 л"]);
  });
  it("does not display price of unavailable volume", () => {
    const modified = { ...cola, variants: cola.variants.map(v => ({ ...v, isAvailable: v.id !== "cola-05" })) };
    expect(productDisplayPrice(modified)).toBe(1200);
    expect(productDisplayOldPrice(modified)).toBeUndefined();
  });
});
