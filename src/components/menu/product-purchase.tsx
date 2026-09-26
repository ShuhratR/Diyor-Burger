"use client";

import { useState } from "react";
import { useCart } from "@/features/cart/cart-provider";
import { DiyorIcon } from "@/components/diyor-icon";

export function ProductPurchase({ productId, available }: { productId: string; available: boolean }) {
  const [quantity, setQuantity] = useState(1); const cart = useCart();
  return <div className="product-purchase"><div className="quantity-stepper" aria-label="Количество"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Уменьшить количество"><DiyorIcon name="minus" /></button><b>{quantity}</b><button type="button" onClick={() => setQuantity((value) => value + 1)} aria-label="Увеличить количество"><DiyorIcon name="plus" /></button></div><button type="button" className="purchase-button" disabled={!available} onClick={() => cart.addItem({ productId, quantity })}>{available ? <>Добавить в корзину <DiyorIcon name="cart" /></> : "Нет в наличии"}</button></div>;
}
