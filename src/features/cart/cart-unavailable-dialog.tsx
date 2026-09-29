"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { key, type CartItem } from "./logic";
import { unavailableLabel, type UnavailableCartItem } from "./availability";
import "./cart-unavailable-dialog.css";

const message: Record<UnavailableCartItem["code"], string> = {
  PRODUCT_NOT_FOUND: "Это блюдо больше не продаётся.",
  PRODUCT_UNAVAILABLE: "Это блюдо сейчас закончилось.",
  VARIANT_UNAVAILABLE: "Выбранный размер или объём больше недоступен.",
};

export function CartUnavailableDialog({
  issues, items, removeItem, onClose,
}: {
  issues: readonly UnavailableCartItem[];
  items: readonly CartItem[];
  removeItem: (item: CartItem) => void;
  onClose: () => void;
}) {
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.body.style.overflow;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.style.overflow = "hidden";
    first.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const buttons = document.querySelectorAll<HTMLElement>(
        ".cart-unavailable-modal button:not([disabled]), .cart-unavailable-modal a[href]",
      );
      if (!buttons.length) return;
      if (event.shiftKey && document.activeElement === buttons[0]) {
        event.preventDefault(); buttons[buttons.length - 1].focus();
      } else if (!event.shiftKey && document.activeElement === buttons[buttons.length - 1]) {
        event.preventDefault(); buttons[0].focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
      opener?.focus({ preventScroll: true });
    };
  }, [onClose]);

  function remove(issue: UnavailableCartItem) {
    const item = items.find(row => key(row) === key(issue));
    if (item) removeItem(item);
  }
  return createPortal(
    <div className="cart-unavailable-backdrop">
      <section role="dialog" aria-modal="true" aria-labelledby="cart-unavailable-heading"
        className="cart-unavailable-modal">
        <button ref={first} type="button" className="cart-unavailable-close"
          onClick={onClose} aria-label="Закрыть предупреждение">×</button>
        <div className="cart-unavailable-sign" aria-hidden="true">!</div>
        <h2 id="cart-unavailable-heading">Некоторые блюда больше недоступны</h2>
        <p>Ресторан обновил меню. Уберите эти позиции, чтобы продолжить оформление. Остальная корзина сохранится.</p>
        <ul>{issues.map(issue => <li key={key(issue)}>
          <div><strong>{unavailableLabel(issue, items)}</strong><small>{message[issue.code]}</small></div>
          <button type="button" onClick={() => remove(issue)} aria-label={`Удалить ${unavailableLabel(issue, items)}`}>
            Удалить
          </button>
        </li>)}</ul>
        <button type="button" className="cart-unavailable-remove-all"
          onClick={() => issues.forEach(remove)}>Удалить все недоступные</button>
        <Link href="/cart" className="cart-unavailable-to-cart">Посмотреть корзину</Link>
      </section>
    </div>, document.body,
  );
}
