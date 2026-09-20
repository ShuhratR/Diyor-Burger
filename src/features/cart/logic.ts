import { z } from "zod";
import { productDisplayPrice } from "@/lib/menu/logic";
import type { Product } from "@/lib/menu/types";
export const MAX_QUANTITY_PER_LINE=99; export type CartItem={productId:string;variantId?:string;quantity:number};
const schema=z.object({version:z.literal(1),items:z.array(z.object({productId:z.string().min(1),variantId:z.string().min(1).optional(),quantity:z.number().int().min(1).max(MAX_QUANTITY_PER_LINE)}))});
export const parseCart=(raw:string|null):CartItem[]=>{try{return schema.parse(JSON.parse(raw??"{}")).items}catch{return[]}};
export const key=(i:Pick<CartItem,"productId"|"variantId">)=>`${i.productId}:${i.variantId??""}`;
export function add(items:CartItem[],item:CartItem){const found=items.find(x=>key(x)===key(item));return found?items.map(x=>key(x)===key(item)?{...x,quantity:Math.min(MAX_QUANTITY_PER_LINE,x.quantity+item.quantity)}:x):[...items,{...item,quantity:Math.min(MAX_QUANTITY_PER_LINE,item.quantity)}]}
export const subtotal=(items:CartItem[],products:Product[])=>items.reduce((sum,i)=>{const p=products.find(x=>x.id===i.productId);if(!p||!p.isAvailable)return sum;const price=i.variantId?p.variants?.find(v=>v.id===i.variantId&&v.isActive)?.priceDiram:productDisplayPrice(p);return sum+(price??0)*i.quantity},0);
