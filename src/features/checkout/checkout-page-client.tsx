"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Product, PublicDeliveryZone, PublicRestaurantSettings } from "@/lib/menu/types";
import { key, subtotal, type CartItem } from "@/features/cart/logic";
import { useCart } from "@/features/cart/cart-provider";
import { unavailableCartItems, combineUnavailable, type UnavailableCartItem } from "@/features/cart/availability";
import { CartUnavailableDialog } from "@/features/cart/cart-unavailable-dialog";
import { FoodImage } from "@/components/menu/food-image";
import { productDisplayPrice } from "@/lib/menu/logic";
import { CheckoutForm } from "./checkout-form";
import { checkoutDraftStorageKey, readCheckoutDraft, saveCheckoutDraft, type CheckoutDraftData } from "./draft";
import { checkoutReadyStorageKey, saveReady } from "./ready";

type CheckoutPageClientProps = {
  products: Product[];
  settings: PublicRestaurantSettings;
  zones: PublicDeliveryZone[];
};
const availabilityCodes = new Set(["PRODUCT_NOT_FOUND", "PRODUCT_UNAVAILABLE", "VARIANT_UNAVAILABLE"]);
function readServerIssues(value: unknown): UnavailableCartItem[] {
  if (!Array.isArray(value)) return [];
  return value.filter((issue): issue is UnavailableCartItem =>
    issue && typeof issue.productId === "string" &&
    (issue.variantId === undefined || typeof issue.variantId === "string") &&
    typeof issue.code === "string" && availabilityCodes.has(issue.code) &&
    Number.isSafeInteger(issue.index) && issue.index >= 0,
  ).slice(0, 50);
}
export function CheckoutPageClient({ products, settings, zones }: CheckoutPageClientProps) {
  const cart = useCart();
  const [draft, setDraft] = useState<CheckoutDraftData | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const [serverIssues, setServerIssues] = useState<UnavailableCartItem[]>([]);
  const [dismissedSignature, setDismissedSignature] = useState<string | null>(null);
  const availableZones = useMemo(() => zones.filter(zone => zone.isActive), [zones]);
  const localIssues = useMemo(() => unavailableCartItems(cart.items, products), [cart.items, products]);
  const issues = useMemo(() => combineUnavailable(localIssues, serverIssues, cart.items),
    [localIssues, serverIssues, cart.items]);
  const signature = issues.map(issue => key(issue) + "/" + issue.code).join("|");
  const showDialog = cart.ready && issues.length > 0 && dismissedSignature !== signature;
  const blockedKeys = useMemo(() => new Set(issues.map(issue => key(issue))), [issues]);
  const cartLines = useMemo(() => cart.items.flatMap(item => {
    if (blockedKeys.has(key(item))) return [];
    const product = products.find(candidate => candidate.id === item.productId);
    if (!product) return [];
    const variant = item.variantId ? product.variants?.find(candidate => candidate.id === item.variantId) : undefined;
    const priceDiram = variant?.priceDiram ?? productDisplayPrice(product);
    if (priceDiram === undefined) return [];
    return [{ id: key(item), name: product.name, imageUrl: product.imageUrl,
      variantName: variant?.name, quantity: item.quantity, priceDiram }];
  }), [cart.items, products, blockedKeys]);

  useEffect(() => {
    const restored = readCheckoutDraft(sessionStorage.getItem(checkoutDraftStorageKey), availableZones.map(zone => zone.id));
    queueMicrotask(() => { setDraft(restored); setDraftReady(true); });
  }, [availableZones]);

  const removeItem = useCallback((item: CartItem) => {
    cart.removeItem(item);
    sessionStorage.removeItem(checkoutReadyStorageKey);
  }, [cart]);
  const dismiss = useCallback(() => setDismissedSignature(signature), [signature]);

  if (!cart.ready || !draftReady) return <section className="section"><h1>Оформление заказа</h1><p className="notice">Загружаем данные формы…</p></section>;
  if (!cart.items.length) return <section className="section"><h1>Корзина пуста</h1><p className="notice">Добавьте блюда из меню, чтобы оформить заказ.</p><Link className="cta" href="/menu">Перейти в меню</Link></section>;
  async function continueToWhatsApp(data: CheckoutDraftData) {
    saveCheckoutDraft(sessionStorage, data);
    if (issues.length) { setDismissedSignature(null); return "Удалите недоступные блюда из корзины."; }
    try {
      const response = await fetch("/api/checkout/prepare", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: cart.items, ...data }),
        cache: "no-store",
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        const unavailable = readServerIssues(result.unavailableItems);
        if (unavailable.length) {
          setServerIssues(unavailable);
          setDismissedSignature(null);
          sessionStorage.removeItem(checkoutReadyStorageKey);
          return;
        }
        if (availabilityCodes.has(result.code)) return "Меню изменилось. Вернитесь в корзину и обновите страницу.";
        if (result.code === "DELIVERY_ZONE_UNAVAILABLE") return "Зона доставки изменилась. Выберите её ещё раз.";
        if (result.code === "CUSTOM_DELIVERY_AREA_REQUIRED") return "Укажите название города или района доставки.";
        if (result.code === "REQUEST_TOO_LARGE") return "Слишком много данных в форме. Сократите комментарий и попробуйте снова.";
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
    <CheckoutForm cartLines={cartLines} settings={settings} zones={availableZones}
      subtotalDiram={subtotal(cart.items.filter(item => !blockedKeys.has(key(item))), products)}
      initialValues={draft ?? { fulfillment: "delivery" }}
      blocked={issues.length > 0} onResolveUnavailable={() => setDismissedSignature(null)}
      onSubmit={continueToWhatsApp} />
    {showDialog && <CartUnavailableDialog issues={issues} items={cart.items}
      removeItem={removeItem} onClose={dismiss} />}
  </section>;
}
