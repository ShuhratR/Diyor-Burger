"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import "./product-quick-view.css";
import { DiyorIcon } from "@/components/diyor-icon";
import { useLanguage } from "@/features/i18n/language-provider";
import { FoodImage } from "./food-image";
import { ProductPurchase } from "./product-purchase";
import { VariantSelector } from "./variant-selector";
import { formatSomoni } from "@/lib/money";
import { productDisplayPrice } from "@/lib/menu/logic";
import type { Product } from "@/lib/menu/types";
import { copy, localizedDescription, localizedIngredients, localizedName } from "@/lib/i18n";

export function ProductQuickView({ product, onClose }: { product: Product; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null);
  const { language } = useLanguage();
  const t = copy[language];
  const name = localizedName(product, language);
  const description = localizedDescription(product, language);
  const ingredients = localizedIngredients(product, language);
  const price = productDisplayPrice(product);
  const kind = product.productType === "COMBO" ? t.combos : product.productType === "PIZZA" ? "Пицца" : "Блюдо";
  const imageStyle = product.imageUrl ? { "--quick-view-image": `url("${product.imageUrl}")` } as CSSProperties : undefined;

  useEffect(() => {
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    const previousOverscroll = document.body.style.overscrollBehavior;
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    closeButton.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab") return;
      const dialog = closeButton.current?.closest('[role="dialog"]');
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.overscrollBehavior = previousOverscroll;
      document.removeEventListener("keydown", onKeyDown);
      opener?.focus({ preventScroll: true });
    };
  }, [onClose]);

  return createPortal(<div className="quick-view-backdrop quick-view-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className={`quick-view quick-view-modal quick-view-${product.productType.toLowerCase()}`} role="dialog" aria-modal="true" aria-labelledby={`product-title-${product.id}`}>
      <button ref={closeButton} type="button" className="quick-view-close" onClick={onClose} aria-label="Закрыть карточку товара"><DiyorIcon name="close-x" /></button>
      <div className="quick-view-image" style={imageStyle}><FoodImage src={product.imageUrl} alt={name} compact /></div>
      <div className="quick-view-content">
        <p className="quick-view-kind">{kind}</p>
        <h2 id={`product-title-${product.id}`}>{name}</h2>
        {description.trim() && <p className="quick-view-description">{description}</p>}
        {product.productType === "COMBO" && product.comboComponents?.length ? <section className="quick-view-section"><h3>Что входит в комбо</h3><ul>{product.comboComponents.map((component) => <li key={component.id}><b>{component.name}</b><span>{component.quantity} шт.{component.description ? ` · ${component.description}` : ""}</span></li>)}</ul></section> : ingredients.trim() && <section className="quick-view-section"><h3>Состав</h3><p>{ingredients}</p></section>}
        {product.productType === "PIZZA" ? <div className="quick-view-variants"><VariantSelector productId={product.id} productName={name} variants={product.variants ?? []} /></div> : <><div className="quick-view-price"><strong>{price === undefined ? "—" : formatSomoni(price)}</strong>{price !== undefined && product.oldPriceDiram != null && product.oldPriceDiram > price && <del>{formatSomoni(product.oldPriceDiram)}</del>}<span className={product.isAvailable ? "in-stock" : "out-of-stock"}>{product.isAvailable ? "В наличии" : t.unavailable}</span></div><ProductPurchase productId={product.id} productName={name} available={product.isAvailable} /></>}
      </div>
    </section>
  </div>, document.body);
}
