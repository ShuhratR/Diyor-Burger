"use client";
import { useState } from "react";
import { formatSomoni } from "@/lib/money";
import type { Variant } from "@/lib/menu/types";
export function VariantSelector({variants}:{variants:Variant[]}) { const [selected,setSelected]=useState<string>(); const variant=variants.find(v=>v.id===selected); return <section className="variant-selector"><h2>Выберите размер</h2><div>{variants.map(v=><button className={v.id===selected?"selected":""} type="button" key={v.id} onClick={()=>setSelected(v.id)}>{v.name}<b>{formatSomoni(v.priceDiram)}</b></button>)}</div><button type="button" className="disabled-cta" disabled={!variant}>{variant ? `Выбран: ${variant.name}` : "Выберите размер"}</button></section>; }
