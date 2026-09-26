"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { clearCheckoutSession, readReady } from "./ready";

export function ReferenceWhatsAppReady() {
  const router = useRouter(); const cart = useCart(); const [url, setUrl] = useState<string | null>(null); const [opened, setOpened] = useState(false);
  useEffect(() => queueMicrotask(() => setUrl(readReady(sessionStorage))), []);
  if (url === null) return <section className="section whatsapp-ready-reference"><h1>Проверяем заказ…</h1></section>;
  if (!url) { router.replace("/checkout/review"); return <section className="section whatsapp-ready-reference"><h1>Проверяем заказ…</h1></section>; }
  return <section className="section whatsapp-ready-reference">
    <div className="ready-check" aria-hidden="true">✓</div><h1>Заказ готов к отправке</h1><p className="notice">Откройте WhatsApp и отправьте подготовленное сообщение. После отправки ресторан свяжется с вами для подтверждения.</p>
    <section className="ready-process" aria-label="Что дальше"><span><b>1</b>Заказ готов</span><span><b>2</b>WhatsApp</span><span><b>3</b>Готовим</span><span><b>4</b>Доставка</span></section>
    <a className="cta" href={url} target="_blank" rel="noreferrer" onClick={() => setOpened(true)}>Открыть WhatsApp</a>
    {opened && <button className="cart-secondary" onClick={() => { cart.clearCart(); clearCheckoutSession(sessionStorage); router.push("/"); }}>Я отправил заказ — очистить корзину</button>}
    <div className="ready-actions"><Link className="cart-secondary" href="/cart">Посмотреть корзину</Link><Link className="cart-secondary" href="/menu">Сделать ещё заказ</Link><Link className="cart-secondary" href="/">На главную</Link></div>
  </section>;
}
