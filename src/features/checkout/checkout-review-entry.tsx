"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { checkoutDraftStorageKey, readCheckoutDraft, validateCheckoutDraft } from "./draft";
import { saveReady } from "./ready";
import type { PreparedCheckout } from "./prepare-server";
import { formatSomoni } from "@/lib/money";

export function CheckoutReviewEntry({ activeZoneIds, pickupEnabled }: { activeZoneIds: string[]; pickupEnabled: boolean }) {
  const cart = useCart();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [summary,setSummary]=useState<PreparedCheckout|null>(null); const [error,setError]=useState<string|null>(null);

  useEffect(() => {
    if (!cart.items.length) { router.replace("/cart"); return; }
    const draft = readCheckoutDraft(sessionStorage.getItem(checkoutDraftStorageKey), activeZoneIds);
    if (!draft || !validateCheckoutDraft(draft, { activeZoneIds, pickupEnabled }).success) { router.replace("/checkout"); return; }
    fetch("/api/checkout/prepare",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({items:cart.items,...draft})}).then((r)=>r.json()).then((result)=>{if(result.ok)queueMicrotask(()=>setSummary(result.summary));else queueMicrotask(()=>setError(result.code))}).catch(()=>queueMicrotask(()=>setError("SETTINGS_UNAVAILABLE"))).finally(()=>queueMicrotask(()=>setReady(true)));
  }, [activeZoneIds, cart.items, pickupEnabled, router]);

  if (!cart.items.length) return <section className="section"><h1>Корзина пуста</h1><p className="notice">Вернитесь в корзину, чтобы оформить заказ.</p><Link className="cta" href="/cart">В корзину</Link></section>;
  if (!ready) return <section className="section"><h1>Проверяем заказ…</h1><p className="notice">Проверяем актуальные цены и доступность блюд.</p></section>;
  if(error)return <section className="section"><h1>Не удалось проверить заказ</h1><p className="notice">{error==="PRODUCT_UNAVAILABLE"?"Некоторые товары больше недоступны.":error==="VARIANT_UNAVAILABLE"?"Выбранный размер больше недоступен.":error==="DELIVERY_ZONE_UNAVAILABLE"?"Эта зона доставки сейчас недоступна. Выберите другую.":"Проверьте данные заказа и попробуйте снова."}</p><Link className="cta" href={error==="DELIVERY_ZONE_UNAVAILABLE"?"/checkout":"/cart"}>Вернуться</Link></section>;
  if(!summary)return null;
  return <section className="section"><h1>Проверьте заказ</h1>{summary.items.map(i=><article className="cart-line" key={`${i.productId}${i.variant??""}`}><b>{i.name}{i.variant?` · ${i.variant}`:""} × {i.quantity}</b><span>{formatSomoni(i.lineTotalDiram)}</span><small>{formatSomoni(i.unitPriceDiram)} за шт.</small></article>)}<div className="notice"><p>Товары: <b>{formatSomoni(summary.subtotalDiram)}</b></p><p>Доставка: <b>{summary.deliveryFeeDiram?formatSomoni(summary.deliveryFeeDiram):summary.fulfillment==="pickup"?formatSomoni(0):"Бесплатно"}</b></p><p>ИТОГО: <b>{formatSomoni(summary.totalDiram)}</b></p></div><div className="notice"><p><b>{summary.customer.name}</b><br/>+{summary.customer.phone}</p><p>{summary.fulfillment==="delivery"?`Доставка · ${summary.deliveryZone}\n${summary.customer.address}`:`Самовывоз${summary.pickupAddress?` · ${summary.pickupAddress}`:""}`}</p>{summary.customer.comment&&<p>Комментарий: {summary.customer.comment}</p>}</div><button className="cta" onClick={()=>{saveReady(sessionStorage,summary);router.push("/checkout/whatsapp")}}>Отправить заказ в WhatsApp</button><Link className="cta" href="/checkout">Изменить данные</Link><Link className="cta" href="/cart">Вернуться в корзину</Link></section>;
}
