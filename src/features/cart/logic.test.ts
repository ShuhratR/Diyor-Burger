import{expect,it,describe}from"vitest";import{add,parseCart,subtotal}from"./logic";import{fixtureProducts}from"@/lib/menu/fixture";describe("cart",()=>{it("adds and merges",()=>expect(add(add([],{productId:"hamburger",quantity:1}),{productId:"hamburger",quantity:1})[0].quantity).toBe(2));it("keeps variants",()=>expect(add([{productId:"pepperoni",variantId:"pep-28",quantity:1}],{productId:"pepperoni",variantId:"pep-36",quantity:1})).toHaveLength(2));it("rejects malformed",()=>expect(parseCart("bad")).toEqual([]));it("uses current price",()=>expect(subtotal([{productId:"hamburger",quantity:2}],fixtureProducts)).toBe(4400));});

describe("snapshot and beverage cart lines",()=>{
  it("preserves legacy carts and non-price labels",()=>{
    expect(parseCart(JSON.stringify({version:1,items:[{productId:"old",quantity:1}]})))
      .toEqual([{productId:"old",quantity:1}]);
    const item={productId:"hamburger",quantity:1,productName:"Гамбургер"};
    expect(parseCart(JSON.stringify({version:1,items:[item]}))).toEqual([item]);
    expect(add([item],{...item,quantity:2})[0]).toMatchObject({quantity:3,productName:"Гамбургер"});
  });
  it("keeps different sizes as independent lines",()=>{
    const a=add([],{productId:"lemonade",variantId:"small",quantity:1});
    expect(add(a,{productId:"lemonade",variantId:"large",quantity:1})).toHaveLength(2);
  });
  it("does not include forged or unavailable variant prices",()=>{
    expect(subtotal([{productId:"pepperoni",variantId:"unknown",quantity:1}],fixtureProducts)).toBe(0);
    expect(subtotal([{productId:"hamburger",variantId:"fake",quantity:1}],fixtureProducts)).toBe(0);
  });
});
