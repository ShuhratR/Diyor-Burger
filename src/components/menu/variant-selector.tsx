"use client";
import { useState } from "react";
import { formatSomoni } from "@/lib/money";
import type { Variant } from "@/lib/menu/types";
import { useCart } from "@/features/cart/cart-provider";
import { useFeedback } from "@/features/feedback/feedback-provider";
export function VariantSelector({variants,productId,productName}:{variants:Variant[];productId:string;productName?:string}) { const [selected,setSelected]=useState<string>(); const [adding,setAdding]=useState(false); const variant=variants.find(v=>v.id===selected); const cart=useCart(); const feedback=useFeedback(); function add(){if(!variant||adding)return;setAdding(true);window.setTimeout(()=>{cart.addItem({productId,variantId:variant.id,quantity:1});feedback.notify("Добавлено в корзину",`${productName??"Пицца"} · ${variant.name}`);setAdding(false)},220)} return <section className="variant-selector"><h2>Выберите размер</h2><div>{variants.map(v=><button className={v.id===selected?"selected":""} type="button" key={v.id} disabled={!v.isActive} onClick={()=>setSelected(v.id)}>{v.name}<b>{formatSomoni(v.priceDiram)}</b></button>)}</div><button type="button" className="disabled-cta" data-state={adding?"adding":"idle"} disabled={!variant||adding} onClick={add}>{adding?"Добавляем…":variant ? `Добавить · ${formatSomoni(variant.priceDiram)}` : "Выберите размер"}</button></section>; }
