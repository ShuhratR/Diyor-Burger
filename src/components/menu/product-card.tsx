"use client";

import { useState } from "react";
import { formatSomoni } from "@/lib/money";
import { productDisplayPrice, productDisplayOldPrice } from "@/lib/menu/logic";
import { hasPricedVariants } from "@/lib/menu/variant-kind";
import type { Product } from "@/lib/menu/types";
import { useCart } from "@/features/cart/cart-provider";
import { useFavorites } from "@/features/favorites/favorites-provider";
import { FoodImage } from "./food-image";
import { useLanguage } from "@/features/i18n/language-provider";
import { copy, localizedDescription, localizedName } from "@/lib/i18n";
import { ProductQuickView } from "./product-quick-view";
import { useFeedback } from "@/features/feedback/feedback-provider";

export function ProductCard({ product, onQuickViewChange }: { product: Product; onQuickViewChange?: (open: boolean) => void }) {
  const price = productDisplayPrice(product);
  const oldPrice = productDisplayOldPrice(product);
  const cart = useCart();
  const favorites = useFavorites();
  const [addState, setAddState] = useState<"idle" | "adding" | "added">("idle");
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const direct = !hasPricedVariants(product.productType) && product.isAvailable;
  const { language } = useLanguage();
  const t = copy[language];
  const name = localizedName(product, language);
  const description = localizedDescription(product, language);
  const feedback = useFeedback();

  function addToCart() {
    if (addState !== "idle") return;
    setAddState("adding");
    window.setTimeout(() => { cart.addItem({ productId: product.id, quantity: 1, productName: product.name }); setAddState("added"); feedback.notify("Добавлено в корзину", name); window.setTimeout(() => setAddState("idle"), 1300); }, 220);
  }

  function openQuickView() {
    onQuickViewChange?.(true);
    setQuickViewOpen(true);
  }
  function closeQuickView() {
    onQuickViewChange?.(false);
    setQuickViewOpen(false);
  }

  function toggleFavorite() { const wasFavorite = favorites.has(product.id); favorites.toggle(product.id); feedback.notify(wasFavorite ? "Удалено из избранного" : "Добавлено в избранное", name); }

  return <article className={`product-card ${!product.isAvailable ? "unavailable" : ""}`}>
    <button className="product-card-open" type="button" onClick={openQuickView} aria-label={`Открыть ${name}`}>{product.promotionLabel && <span className="product-promo">{product.promotionLabel}</span>}<FoodImage src={product.imageUrl} alt={name} compact/><div className="product-card-copy"><h3>{name}</h3><p>{description}</p><strong>{price === undefined ? "—" : `${hasPricedVariants(product.productType) ? `${t.priceFrom} ` : ""}${formatSomoni(price)}`}</strong>{oldPrice !== undefined && <del>{formatSomoni(oldPrice)}</del>}{!product.isAvailable && <span className="availability">{t.unavailable}</span>}</div></button>
    <div className="card-actions"><button onClick={toggleFavorite} aria-label={favorites.has(product.id) ? "Удалить из избранного" : "Добавить в избранное"}>{favorites.has(product.id) ? "♥" : "♡"}</button>{direct ? <button className="card-add" data-state={addState} disabled={addState !== "idle"} onClick={addToCart} aria-label={`${t.add} ${name}`}>{addState === "adding" ? "…" : addState === "added" ? "✓" : "+"}</button> : <button type="button" onClick={openQuickView} aria-label={`Открыть ${name}`}>+</button>}</div>
    {quickViewOpen && <ProductQuickView product={product} onClose={closeQuickView} />}
  </article>;
}
