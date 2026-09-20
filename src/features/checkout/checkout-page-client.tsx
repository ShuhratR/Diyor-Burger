"use client";

import Link from "next/link";
import type { Product, PublicDeliveryZone, PublicRestaurantSettings } from "@/lib/menu/types";
import { subtotal } from "@/features/cart/logic";
import { useCart } from "@/features/cart/cart-provider";
import { CheckoutForm } from "./checkout-form";

type CheckoutPageClientProps = {
  products: Product[];
  settings: PublicRestaurantSettings;
  zones: PublicDeliveryZone[];
};

export function CheckoutPageClient({ products, settings, zones }: CheckoutPageClientProps) {
  const cart = useCart();

  if (!cart.items.length) return <section className="section"><h1>Корзина пуста</h1><p className="notice">Добавьте блюда из меню, чтобы оформить заказ.</p><Link className="cta" href="/menu">Перейти в меню</Link></section>;

  const availableZones = zones.filter((zone) => zone.isActive);
  if (!availableZones.length && !settings.pickupEnabled) return <section className="section"><h1>Оформление временно недоступно</h1><p className="notice">Сейчас нет доступного способа получения заказа.</p><Link className="cta" href="/menu">Вернуться в меню</Link></section>;

  return <section className="section"><h1>Оформление заказа</h1><p className="notice">Проверьте данные перед следующим шагом.</p><CheckoutForm settings={settings} zones={availableZones} subtotalDiram={subtotal(cart.items, products)} initialValues={{ fulfillment: availableZones.length ? "delivery" : "pickup" }} /></section>;
}
