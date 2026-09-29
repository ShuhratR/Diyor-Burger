import{expect,it,describe}from"vitest";import{add,parseCart,subtotal}from"./logic";import{fixtureProducts}from"@/lib/menu/fixture";describe("cart",()=>{it("adds and merges",()=>expect(add(add([],{productId:"hamburger",quantity:1}),{productId:"hamburger",quantity:1})[0].quantity).toBe(2));it("keeps variants",()=>expect(add([{productId:"pepperoni",variantId:"pep-28",quantity:1}],{productId:"pepperoni",variantId:"pep-36",quantity:1})).toHaveLength(2));it("rejects malformed",()=>expect(parseCart("bad")).toEqual([]));it("uses current price",()=>expect(subtotal([{productId:"hamburger",quantity:2}],fixtureProducts)).toBe(4400));});


describe("stale cart labels and drink variants", () => {
  it("preserves legacy carts without saved titles", () => {
    expect(parseCart(JSON.stringify({ version: 1, items: [{ productId: "old", quantity: 1 }] })))
      .toEqual([{ productId: "old", quantity: 1 }]);
  });
  it("keeps display-only snapshots without trusting prices", () => {
    const item = { productId: "hamburger", quantity: 1, productName: "Гамбургер" };
    expect(parseCart(JSON.stringify({ version: 1, items: [item] }))).toEqual([item]);
    expect(add([item], { ...item, quantity: 2 })[0]).toMatchObject({ quantity: 3, productName: "Гамбургер" });
  });
  it("never counts an unavailable size or forged variant in total", () => {
    expect(subtotal([{ productId: "pepperoni", variantId: "missing", quantity: 1 }], fixtureProducts)).toBe(0);
    expect(subtotal([{ productId: "hamburger", variantId: "fake", quantity: 1 }], fixtureProducts)).toBe(0);
  });
  it("keeps drink volumes on separate lines, merges repeated volume", () => {
    const initial = add([], { productId: "cola", variantId: "small", quantity: 1 });
    expect(add(initial, { productId: "cola", variantId: "large", quantity: 1 })).toHaveLength(2);
    expect(add(initial, { productId: "cola", variantId: "small", quantity: 2 })[0].quantity).toBe(3);
  });
});
