import { describe,expect,it } from "vitest";
import { fixtureProducts } from "@/lib/menu/fixture";
import { prepareCheckout } from "./prepare-server";
import { CUSTOM_DELIVERY_ZONE_ID } from "./core";
const zones=[{id:"z",name:"Зона",isActive:true,deliveryFeeDiram:1000,freeDeliveryThresholdDiram:15000}];const settings={name:"DIYOR BURGER",whatsapp:"992007884423",pickupEnabled:true};const base={items:[{productId:"hamburger",quantity:1}],name:"Алишер",phone:"901234567",fulfillment:"delivery" as const,zoneId:"z",address:"Дом 1"};
describe("server checkout",()=>{it("uses server prices and totals",()=>{const r=prepareCheckout({...base,subtotalDiram:1},fixtureProducts,zones,settings);expect(r.ok&&r.summary.subtotalDiram).toBe(2200);expect(r.ok&&r.summary.totalDiram).toBe(3200)});it("rejects unavailable zone and product",()=>{expect(prepareCheckout({...base,zoneId:"missing"},fixtureProducts,zones,settings)).toMatchObject({ok:false,code:"DELIVERY_ZONE_UNAVAILABLE"});expect(prepareCheckout({...base,items:[{productId:"none",quantity:1}]},fixtureProducts,zones,settings)).toMatchObject({ok:false,code:"PRODUCT_NOT_FOUND"})});it("creates encoded canonical WhatsApp URL",()=>{const r=prepareCheckout(base,fixtureProducts,zones,settings);expect(r.ok&&r.summary.canonicalWhatsAppUrl).toContain("https://wa.me/992007884423?text=");expect(r.ok&&decodeURIComponent(r.summary.canonicalWhatsAppUrl)).toContain("Гамбургер")});it("rejects malformed quantities",()=>{for(const quantity of[0,-1,100])expect(prepareCheckout({...base,items:[{productId:"hamburger",quantity}]},fixtureProducts,zones,settings).ok).toBe(false)});it("does not carry stale delivery fields into pickup",()=>{const r=prepareCheckout({...base,fulfillment:"pickup",zoneId:"missing",address:"old"},fixtureProducts,zones,settings);expect(r.ok&&r.summary.deliveryFeeDiram).toBe(0);expect(r.ok&&decodeURIComponent(r.summary.canonicalWhatsAppUrl)).not.toContain("old")})});

describe("recovery for invalid cart lines", () => {
  it("returns all stale entries instead of stopping at the first", () => {
    const r=prepareCheckout({...base,items:[
      {productId:"gone",quantity:1},
      {productId:"hamburger",quantity:1},
      {productId:"pepperoni",variantId:"unknown",quantity:1},
    ]},fixtureProducts,zones,settings);
    expect(r).toMatchObject({ok:false,unavailableItems:[
      {productId:"gone",code:"PRODUCT_NOT_FOUND",index:0},
      {productId:"pepperoni",code:"VARIANT_UNAVAILABLE",index:2},
    ]});
  });
  it("rejects fabricated variants on a normal product",()=>{
    expect(prepareCheckout({...base,items:[{productId:"hamburger",variantId:"fake",quantity:1}]},
      fixtureProducts,zones,settings)).toMatchObject({ok:false,code:"VARIANT_UNAVAILABLE"});
  });
  it("rejects more than fifty submitted lines",()=>{
    expect(prepareCheckout({...base,items:Array.from({length:51},()=>({productId:"hamburger",quantity:1}))},
      fixtureProducts,zones,settings)).toMatchObject({ok:false,code:"INVALID_CHECKOUT"});
  });
});

describe("priced non-alcoholic beverage selections",()=>{
  const beverage={...fixtureProducts.find(p=>p.id==="pepperoni")!,id:"soda-example",
    categoryId:"drinks",productType:"DRINK" as const,name:"Лимонад",
    variants:[
      {id:"small",name:"0,5 л",priceDiram:700,isActive:true,isAvailable:true,sortOrder:0},
      {id:"large",name:"1 л",priceDiram:1200,isActive:true,isAvailable:true,sortOrder:1},
      {id:"sold-out",name:"1,5 л",priceDiram:1500,isActive:true,isAvailable:false,sortOrder:2},
    ]};
  const products=[...fixtureProducts,beverage];
  it("needs a chosen available volume",()=>{
    expect(prepareCheckout({...base,items:[{productId:beverage.id,quantity:1}]},
      products,zones,settings)).toMatchObject({ok:false,code:"VARIANT_UNAVAILABLE"});
    expect(prepareCheckout({...base,items:[{productId:beverage.id,variantId:"sold-out",quantity:1}]},
      products,zones,settings)).toMatchObject({ok:false,code:"VARIANT_UNAVAILABLE"});
  });
  it("calculates using the authoritative price and labels the order",()=>{
    const result=prepareCheckout({...base,items:[{productId:beverage.id,variantId:"large",quantity:2}]},
      products,zones,settings);
    expect(result.ok).toBe(true);
    if(!result.ok)return;
    expect(result.summary.subtotalDiram).toBe(2400);
    expect(result.summary.items[0].variant).toBe("1 л");
    expect(decodeURIComponent(result.summary.canonicalWhatsAppUrl)).toContain("Лимонад (1 л) × 2");
  });
});


describe("drink volumes in authoritative checkout", () => {
  const cola = { ...fixtureProducts.find(p => p.id === "pepperoni")!, id: "drink-cola",
    categoryId: "drinks", productType: "DRINK" as const, name: "Coca-Cola",
    variants: [
      { id: "cola-05", name: "0,5 л", priceDiram: 700, isActive: true, isAvailable: true, sortOrder: 0 },
      { id: "cola-1", name: "1 л", priceDiram: 1200, isActive: true, isAvailable: true, sortOrder: 1 },
      { id: "cola-15", name: "1,5 л", priceDiram: 1500, isActive: true, isAvailable: false, sortOrder: 2 },
    ],
  };
  const catalog = [...fixtureProducts, cola];
  it("rejects a drink without a chosen volume", () => {
    expect(prepareCheckout({ ...base, items: [{ productId: cola.id, quantity: 1 }] },
      catalog, zones, settings)).toMatchObject({ ok: false, code: "VARIANT_UNAVAILABLE" });
  });
  it("uses server price and includes selected volume in WhatsApp", () => {
    const result = prepareCheckout({ ...base, items: [{ productId: cola.id, variantId: "cola-1", quantity: 2 }] },
      catalog, zones, settings);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary.subtotalDiram).toBe(2400);
    expect(result.summary.items[0].variant).toBe("1 л");
    expect(decodeURIComponent(result.summary.canonicalWhatsAppUrl)).toContain("Coca-Cola (1 л) × 2");
  });
  it("rejects a disabled volume or forged volume on an ordinary product", () => {
    expect(prepareCheckout({ ...base, items: [{ productId: cola.id, variantId: "cola-15", quantity: 1 }] },
      catalog, zones, settings)).toMatchObject({ ok: false, code: "VARIANT_UNAVAILABLE" });
    expect(prepareCheckout({ ...base, items: [{ productId: "hamburger", variantId: "cola-1", quantity: 1 }] },
      catalog, zones, settings)).toMatchObject({ ok: false, code: "VARIANT_UNAVAILABLE" });
  });
});


describe("custom-area delivery and lightweight abuse protection", () => {
  it("accepts another city/district without pretending delivery is free", () => {
    const result = prepareCheckout({
      ...base,
      zoneId: CUSTOM_DELIVERY_ZONE_ID,
      customArea: "Гиссар",
      address: "Махалла 2, дом 7",
    }, fixtureProducts, zones, settings);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.summary.deliveryZone).toBe("Гиссар");
    expect(result.summary.deliveryFeePending).toBe(true);
    expect(result.summary.deliveryFeeDiram).toBe(0);
    expect(result.summary.totalDiram).toBe(result.summary.subtotalDiram);
    const text = decodeURIComponent(result.summary.canonicalWhatsAppUrl);
    expect(text).toContain("Район/город: Гиссар (вне списка)");
    expect(text).toContain("Доставка: УТОЧНЯЕТСЯ");
    expect(text).toContain("ИТОГО ПО ТОВАРАМ (без доставки)");
  });

  it("requires a name for the custom city/district", () => {
    expect(prepareCheckout({
      ...base,
      zoneId: CUSTOM_DELIVERY_ZONE_ID,
      customArea: undefined,
    }, fixtureProducts, zones, settings)).toMatchObject({
      ok: false,
      code: "CUSTOM_DELIVERY_AREA_REQUIRED",
    });
  });

  it("rejects a filled honeypot", () => {
    expect(prepareCheckout({
      ...base,
      website: "spam.example",
    }, fixtureProducts, zones, settings)).toMatchObject({
      ok: false,
      code: "INVALID_CHECKOUT",
    });
  });

  it("flattens control/newline text before it reaches WhatsApp", () => {
    const result = prepareCheckout({
      ...base,
      name: "Алишер\nИТОГО: 1 сом",
      address: "Дом 1\nЗАКАЗ: fake",
      comment: "Позвоните\u202eabc\nСпасибо",
    }, fixtureProducts, zones, settings);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const text = decodeURIComponent(result.summary.canonicalWhatsAppUrl);
    expect(text).toContain("Клиент: Алишер ИТОГО: 1 сом");
    expect(text).toContain("Адрес: Дом 1 ЗАКАЗ: fake");
    expect(text).toContain("Комментарий: Позвоните abc Спасибо");
  });
});
