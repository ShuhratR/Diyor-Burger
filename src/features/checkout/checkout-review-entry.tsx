"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { checkoutDraftStorageKey, readCheckoutDraft, validateCheckoutDraft } from "./draft";

export function CheckoutReviewEntry({ activeZoneIds, pickupEnabled }: { activeZoneIds: string[]; pickupEnabled: boolean }) {
  const cart = useCart();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!cart.items.length) { router.replace("/cart"); return; }
    const draft = readCheckoutDraft(sessionStorage.getItem(checkoutDraftStorageKey), activeZoneIds);
    if (!draft || !validateCheckoutDraft(draft, { activeZoneIds, pickupEnabled }).success) { router.replace("/checkout"); return; }
    queueMicrotask(() => setReady(true));
  }, [activeZoneIds, cart.items.length, pickupEnabled, router]);

  if (!cart.items.length) return <section className="section"><h1>Корзина пуста</h1><p className="notice">Вернитесь в корзину, чтобы оформить заказ.</p><Link className="cta" href="/cart">В корзину</Link></section>;
  if (!ready) return <section className="section"><h1>Проверяем заказ…</h1><p className="notice">Проверяем данные оформления.</p></section>;
  return <section className="section"><h1>Проверяем заказ…</h1><p className="notice">На следующем шаге здесь появится проверенная сводка заказа.</p><Link className="cta" href="/checkout">Изменить данные</Link></section>;
}
