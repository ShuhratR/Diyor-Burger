"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, PublicDeliveryZone, PublicRestaurantSettings } from "@/lib/menu/types";
import { subtotal } from "@/features/cart/logic";
import { useCart } from "@/features/cart/cart-provider";
import { CheckoutForm } from "./checkout-form";
import { checkoutDraftStorageKey, readCheckoutDraft, saveCheckoutDraft, type CheckoutDraftData } from "./draft";

type CheckoutPageClientProps = {
  products: Product[];
  settings: PublicRestaurantSettings;
  zones: PublicDeliveryZone[];
};

export function CheckoutPageClient({ products, settings, zones }: CheckoutPageClientProps) {
  const cart = useCart();
  const router = useRouter();
  const [draft, setDraft] = useState<CheckoutDraftData | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const availableZones = useMemo(() => zones.filter((zone) => zone.isActive), [zones]);

  useEffect(() => {
    const restored = readCheckoutDraft(sessionStorage.getItem(checkoutDraftStorageKey), availableZones.map((zone) => zone.id));
    queueMicrotask(() => { setDraft(restored); setDraftReady(true); });
  }, [availableZones]);

  if (!cart.items.length) return <section className="section"><h1>Корзина пуста</h1><p className="notice">Добавьте блюда из меню, чтобы оформить заказ.</p><Link className="cta" href="/menu">Перейти в меню</Link></section>;

  if (!availableZones.length && !settings.pickupEnabled) return <section className="section"><h1>Оформление временно недоступно</h1><p className="notice">Сейчас нет доступного способа получения заказа.</p><Link className="cta" href="/menu">Вернуться в меню</Link></section>;
  if (!draftReady) return <section className="section"><h1>Оформление заказа</h1><p className="notice">Загружаем данные формы…</p></section>;

  function continueToReview(data: CheckoutDraftData) {
    saveCheckoutDraft(sessionStorage, data);
    router.push("/checkout/review");
  }

  return <section className="section"><h1>Оформление заказа</h1><p className="notice">Проверьте данные перед следующим шагом.</p><CheckoutForm settings={settings} zones={availableZones} subtotalDiram={subtotal(cart.items, products)} initialValues={draft ?? { fulfillment: availableZones.length ? "delivery" : "pickup" }} onSubmit={continueToReview} /></section>;
}
