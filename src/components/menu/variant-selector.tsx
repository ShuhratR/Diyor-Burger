"use client";
import { useState } from "react";
import { formatSomoni } from "@/lib/money";
import type { Variant } from "@/lib/menu/types";
import { useCart } from "@/features/cart/cart-provider";
export function VariantSelector({variants,productId}:{variants:Variant[];productId:string}) { const [selected,setSelected]=useState<string>(); const variant=variants.find(v=>v.id===selected); const cart=useCart(); return <section className="variant-selector"><h2>Выберите размер</h2><div>{variants.map(v=><button className={v.id===selected?"selected":""} type="button" key={v.id} disabled={!v.isActive} onClick={()=>setSelected(v.id)}>{v.name}<b>{formatSomoni(v.priceDiram)}</b></button>)}</div><button type="button" className="disabled-cta" disabled={!variant} onClick={()=>variant&&cart.addItem({productId,variantId:variant.id,quantity:1})}>{variant ? `Добавить · ${formatSomoni(variant.priceDiram)}` : "Выберите размер"}</button></section>; }
