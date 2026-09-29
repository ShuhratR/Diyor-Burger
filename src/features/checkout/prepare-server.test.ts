import { describe,expect,it } from "vitest";
import { fixtureProducts } from "@/lib/menu/fixture";
import { prepareCheckout } from "./prepare-server";
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
