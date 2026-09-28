"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Product, PublicDeliveryZone, PublicRestaurantSettings } from "@/lib/menu/types";
import { key, subtotal } from "@/features/cart/logic";
import { useCart } from "@/features/cart/cart-provider";
import { FoodImage } from "@/components/menu/food-image";
import { productDisplayPrice } from "@/lib/menu/logic";
import { CheckoutForm } from "./checkout-form";
import { checkoutDraftStorageKey, readCheckoutDraft, saveCheckoutDraft, type CheckoutDraftData } from "./draft";
import { saveReady } from "./ready";

type CheckoutPageClientProps = {
  products: Product[];
  settings: PublicRestaurantSettings;
  zones: PublicDeliveryZone[];
};

export function CheckoutPageClient({ products, settings, zones }: CheckoutPageClientProps) {
  const cart = useCart();
  const [draft, setDraft] = useState<CheckoutDraftData | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const availableZones = useMemo(() => zones.filter((zone) => zone.isActive), [zones]);
  const cartLines = useMemo(() => cart.items.flatMap((item) => {
    const product = products.find((candidate) => candidate.id === item.productId);
    if (!product) return [];
    const variant = item.variantId ? product.variants?.find((candidate) => candidate.id === item.variantId) : undefined;
    const priceDiram = variant?.priceDiram ?? productDisplayPrice(product);
    if (priceDiram === undefined) return [];
    return [{
      id: key(item),
      name: product.name,
      imageUrl: product.imageUrl,
      variantName: variant?.name,
      quantity: item.quantity,
      priceDiram,
    }];
  }), [cart.items, products]);

  useEffect(() => {
    const restored = readCheckoutDraft(sessionStorage.getItem(checkoutDraftStorageKey), availableZones.map((zone) => zone.id));
    queueMicrotask(() => { setDraft(restored); setDraftReady(true); });
  }, [availableZones]);

  if (!cart.items.length) return <section className="section"><h1>Корзина пуста</h1><p className="notice">Добавьте блюда из меню, чтобы оформить заказ.</p><Link className="cta" href="/menu">Перейти в меню</Link></section>;

  if (!availableZones.length && !settings.pickupEnabled) return <section className="section"><h1>Оформление временно недоступно</h1><p className="notice">Сейчас нет доступного способа получения заказа.</p><Link className="cta" href="/menu">Вернуться в меню</Link></section>;
  if (!draftReady) return <section className="section"><h1>Оформление заказа</h1><p className="notice">Загружаем данные формы…</p></section>;

  async function continueToWhatsApp(data: CheckoutDraftData) {
    saveCheckoutDraft(sessionStorage, data);
    try {
      const response = await fetch("/api/checkout/prepare", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: cart.items, ...data }),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        if (result.code === "PRODUCT_NOT_FOUND" || result.code === "PRODUCT_UNAVAILABLE") return "В корзине есть старое или недоступное блюдо. Удалите его и попробуйте снова.";
        if (result.code === "VARIANT_UNAVAILABLE") return "Выбранный размер пиццы больше недоступен. Вернитесь в корзину и выберите другой.";
        if (result.code === "DELIVERY_ZONE_UNAVAILABLE") return "Зона доставки изменилась. Выберите её ещё раз.";
        if (result.code === "ORDER_WHATSAPP_NOT_CONFIGURED") return "WhatsApp ресторана пока не настроен.";
        return "Не удалось подготовить заказ. Попробуйте ещё раз.";
      }
      saveReady(sessionStorage, result.summary);
      window.location.assign(result.summary.canonicalWhatsAppUrl);
    } catch {
      return "Нет соединения с сервером. Проверьте интернет и попробуйте снова.";
    }
  }

  return <section className="section checkout-reference">
    <div className="checkout-hero page-hero">
      <span className="hero-script">Вкуснее каждый день!</span>
      <h1>Оформление <em>заказа</em></h1>
      <p>Вкусная еда ближе, чем кажется.</p>
      <FoodImage src={cartLines[0]?.imageUrl ?? settings.heroImageUrl ?? "/images/hero-burger-v1.png"} alt="DIYOR BURGER" />
    </div>
    <aside className="checkout-note" aria-label="Способ подтверждения заказа"><span aria-hidden="true">◉</span><p>Мы свяжемся с вами через WhatsApp для подтверждения заказа.</p></aside>
    <CheckoutForm cartLines={cartLines} settings={settings} zones={availableZones} subtotalDiram={subtotal(cart.items, products)} initialValues={draft ?? { fulfillment: availableZones.length ? "delivery" : "pickup" }} onSubmit={continueToWhatsApp} />
  </section>;
}
