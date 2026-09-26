"use client";

import Link from "next/link";
import { useState } from "react";
import { formatSomoni } from "@/lib/money";
import { productDisplayPrice } from "@/lib/menu/logic";
import type { Product } from "@/lib/menu/types";
import { useCart } from "@/features/cart/cart-provider";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { FoodImage } from "./food-image";
import { useLanguage } from "@/features/i18n/language-provider";
import { copy, localizedDescription, localizedName } from "@/lib/i18n";

export function ProductCard({ product }: { product: Product }) {
  const price = productDisplayPrice(product);
  const cart = useCart();
  const favorites = useFavorites();
  const [added, setAdded] = useState(false);
  const direct = product.productType !== "PIZZA" && product.isAvailable;
  const { language } = useLanguage();
  const t = copy[language];
  const name = localizedName(product, language);
  const description = localizedDescription(product, language);
  const line = cart.items.find((item) => item.productId === product.id && !item.variantId);
  const quantity = line?.quantity ?? 1;
  const lineTotal = (price ?? 0) * quantity;

  function addToCart() {
    cart.addItem({ productId: product.id, quantity: 1 });
    setAdded(true);
  }

  return <article className={`product-card ${!product.isAvailable ? "unavailable" : ""}`}>
    <Link href={`/product/${product.slug}`}><FoodImage src={product.imageUrl} alt={name} compact/><div className="product-card-copy"><h3>{name}</h3><p>{description}</p><strong>{price === undefined ? "—" : `${product.productType === "PIZZA" ? `${t.priceFrom} ` : ""}${formatSomoni(price)}`}</strong>{!product.isAvailable && <span className="availability">{t.unavailable}</span>}</div></Link>
    <div className="card-actions"><button onClick={() => favorites.toggle(product.id)} aria-label={favorites.has(product.id) ? "Удалить из избранного" : "Добавить в избранное"}>{favorites.has(product.id) ? "♥" : "♡"}</button>{direct ? <button onClick={addToCart} aria-label={`${t.add} ${name}`}>+</button> : <Link aria-label={`Открыть ${name}`} href={`/product/${product.slug}`}>+</Link>}</div>
    {added && <div className="added-sheet-backdrop" role="presentation" onClick={() => setAdded(false)}><section className="added-sheet" role="dialog" aria-modal="true" aria-label="Товар добавлен в корзину" onClick={(event) => event.stopPropagation()}><button className="added-sheet-close" type="button" onClick={() => setAdded(false)} aria-label="Закрыть">×</button><p className="added-sheet-title"><span>✓</span>Товар добавлен в корзину!</p><div className="added-sheet-product"><FoodImage src={product.imageUrl} alt={name} compact/><div><b>{name}</b><p>{description}</p><strong>{formatSomoni(lineTotal)}</strong></div><div className="added-sheet-quantity"><button type="button" onClick={() => line && cart.setQuantity(line, quantity - 1)} aria-label="Уменьшить количество">−</button><b>{quantity}</b><button type="button" onClick={() => line && cart.setQuantity(line, quantity + 1)} aria-label="Увеличить количество">+</button></div></div><Link className="added-sheet-cart" href="/cart" onClick={() => setAdded(false)}><span>Корзина · {cart.totalQuantity} шт.</span><strong>Перейти в корзину →</strong></Link><button type="button" className="cart-secondary" onClick={() => setAdded(false)}>Продолжить покупки</button></section></div>}
  </article>;
}
