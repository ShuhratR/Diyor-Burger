"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/cart-provider";
import { DiyorIcon } from "@/components/diyor-icon";
import { useFeedback } from "@/features/feedback/feedback-provider";

export function ProductPurchase({ productId, available, productName }: { productId: string; available: boolean; productName?: string }) {
  const [quantity, setQuantity] = useState(1); const [state, setState] = useState<"idle" | "adding" | "added">("idle"); const cart = useCart(); const feedback = useFeedback();
  function addToCart() { if (!available || state !== "idle") return; setState("adding"); window.setTimeout(() => { cart.addItem({ productId, quantity, productName }); setState("added"); feedback.notify("Добавлено в корзину", productName ? `${productName} · ${quantity} шт.` : `${quantity} шт.`); window.setTimeout(() => setState("idle"), 1300); }, 220); }
  return <div className="product-purchase"><div className="quantity-stepper" aria-label="Количество"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Уменьшить количество"><DiyorIcon name="minus" /></button><b>{quantity}</b><button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Увеличить количество"><DiyorIcon name="plus" /></button></div><button type="button" className="purchase-button" data-state={state} disabled={!available || state !== "idle"} onClick={addToCart}>{!available ? "Нет в наличии" : state === "adding" ? "Добавляем…" : state === "added" ? <>Добавлено <DiyorIcon name="check" /></> : <>Добавить в корзину <DiyorIcon name="cart" /></>}</button></div>;
}
