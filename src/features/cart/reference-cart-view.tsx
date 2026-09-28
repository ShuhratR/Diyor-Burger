"use client";

import Link from "next/link";
import type { Product, PublicRestaurantSettings } from "@/lib/menu/types";
import { useCart } from "./cart-provider";
import { formatSomoni } from "@/lib/money";
import { subtotal } from "./logic";
import { FoodImage } from "@/components/menu/food-image";
import { DiyorIcon } from "@/components/diyor-icon";

export function ReferenceCartView({ products, adminMode=false, settings }: { products: Product[]; adminMode?:boolean; settings?:PublicRestaurantSettings }) {
  const cart = useCart();
  if (!cart.items.length) return <section className="section cart-reference empty-cart-reference">
    <div className="cart-empty-art"><FoodImage src="/images/hero-burger-v1.png" alt="Бургер и корзина" compact/><span>♕</span></div>
    <h1>{settings?.cartEmptyTitle || "Ваша корзина пока пуста"}</h1><p>{settings?.cartEmptyBody || "Добавьте любимые блюда, хот-доги и другие вкусные позиции из меню."}</p>
    <Link className="cta" href={adminMode?"/admin/products":"/menu"}>Перейти в меню <span aria-hidden="true">→</span></Link><Link className="cart-secondary" href={adminMode?"/admin":"/"}>⌂ На главную</Link>
    <aside className="brand-banner"><div><span className="banner-kicker">ПОДАРОК</span><strong>Вкусные моменты <em>начинаются здесь!</em></strong></div></aside>
  </section>;
  const sum = subtotal(cart.items, products);
  return <section className="section cart-reference">
    <div className="reference-hero"><span className="hero-script">Вкуснее каждый день!</span><h1>Ваша корзина <em>ближе к вкусному моменту!</em></h1><p>Проверьте заказ и оформите доставку.</p><FoodImage src={products.find((product) => product.id === cart.items[0]?.productId)?.imageUrl ?? "/images/hero-burger-v1.png"} alt="Блюдо из вашей корзины" compact /></div>
    <div className="cart-reference-list">{cart.items.map((item) => {
      const product = products.find((entry) => entry.id === item.productId);
      if (!product) return <p className="notice" key={`${item.productId}${item.variantId ?? ""}`}>Товар больше недоступен <button onClick={() => cart.removeItem(item)}>Удалить</button></p>;
      const variant = item.variantId ? product.variants?.find((entry) => entry.id === item.variantId) : undefined;
      const price = variant?.priceDiram ?? product.basePriceDiram ?? 0;
      return <article className="cart-reference-item" key={`${item.productId}${item.variantId ?? ""}`}><FoodImage src={product.imageUrl} alt={product.name} compact/><div><button className="cart-trash" onClick={() => cart.removeItem(item)} aria-label={`Удалить ${product.name}`}><DiyorIcon name="trash" /></button><h2>{product.name}{variant ? ` · ${variant.name}` : ""}</h2><p>{product.description}</p><div className="cart-reference-footer"><div className="quantity-control"><button onClick={() => cart.setQuantity(item, item.quantity - 1)} aria-label="Уменьшить"><DiyorIcon name="minus" /></button><b>{item.quantity}</b><button onClick={() => cart.setQuantity(item, item.quantity + 1)} aria-label="Увеличить"><DiyorIcon name="plus" /></button></div><strong>{formatSomoni(price * item.quantity)}</strong></div></div></article>;
    })}</div>
    <section className="cart-reference-total"><p><span>Сумма заказа</span><b>{formatSomoni(sum)}</b></p><p><span>Доставка</span><span>Выбирается при оформлении</span></p><strong>Итого к оплате <b>{formatSomoni(sum)}</b></strong></section>
    <Link className="cta cart-primary" href="/checkout">{settings?.cartCheckoutLabel || "Оформить заказ"} <span aria-hidden="true">→</span></Link><Link className="cart-whatsapp-note" href="/checkout"><DiyorIcon name="whatsapp" />{settings?.cartWhatsappLabel || "Подготовить заказ в WhatsApp"}</Link>
  </section>;
}
