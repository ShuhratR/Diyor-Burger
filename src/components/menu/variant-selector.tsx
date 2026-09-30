"use client";
import { useState } from "react";
import { formatSomoni } from "@/lib/money";
import type { Variant } from "@/lib/menu/types";
import { variantHeading } from "@/lib/menu/variant-kind";
import { useCart } from "@/features/cart/cart-provider";
import { useFeedback } from "@/features/feedback/feedback-provider";
export function VariantSelector({
  variants,
  productId,
  productName,
  productType = "PIZZA",
  productAvailable = true,
}: {
  variants: Variant[];
  productId: string;
  productName?: string;
  productType?: "PIZZA" | "DRINK";
  productAvailable?: boolean;
}) {
  const [selected, setSelected] = useState<string>();
  const [addState, setAddState] = useState<"idle" | "adding" | "added">("idle");
  const variant = variants.find((v) => v.id === selected);
  const selectable = Boolean(
    productAvailable && variant?.isActive && variant.isAvailable !== false,
  );
  const cart = useCart();
  const feedback = useFeedback();
  function add() {
    if (!variant || !selectable || addState !== "idle") return;
    setAddState("adding");
    window.setTimeout(() => {
      cart.addItem({ productId, variantId: variant.id, quantity: 1, productName: productName ?? (productType === "DRINK" ? "Напиток" : "Пицца"), variantName: variant.name });
      feedback.notify(
        "Добавлено в корзину",
        `${productName ?? (productType === "DRINK" ? "Напиток" : "Пицца")} · ${variant.name}`,
      );
      setAddState("added");
      window.setTimeout(() => setAddState("idle"), 1100);
    }, 140);
  }
  return (
    <section className="variant-selector">
      <h2>{variantHeading(productType)}</h2>
      <div>
        {variants.map((v) => {
          const available = productAvailable && v.isActive && v.isAvailable !== false;
          return (
            <button
              className={v.id === selected ? "selected" : ""}
              type="button"
              key={v.id}
              disabled={!available}
              onClick={() => setSelected(v.id)}
            >
              {v.name}
              <b>{formatSomoni(v.priceDiram)}</b>
              {v.oldPriceDiram != null && v.oldPriceDiram > v.priceDiram && <del>{formatSomoni(v.oldPriceDiram)}</del>}
              {!available && <small>Нет в наличии</small>}
            </button>
          );
        })}
      </div>
      {variants.filter(v => v.isActive && v.isAvailable !== false).length === 0 && <p role="status">{productType === "DRINK" ? "Доступных объёмов пока нет" : "Доступных размеров пока нет"}</p>}
      <button
        type="button"
        className="disabled-cta"
        data-state={addState}
        disabled={!selectable || addState !== "idle"}
        onClick={add}
      >
        {addState === "adding"
          ? "Добавляем…"
          : addState === "added" && variant
            ? `✓ Добавлено · ${formatSomoni(variant.priceDiram)}`
            : selectable && variant
              ? `Добавить · ${formatSomoni(variant.priceDiram)}`
            : productType === "DRINK" ? "Выберите доступный объём" : "Выберите доступный размер"}
      </button>
    </section>
  );
}
