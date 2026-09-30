"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DiyorIcon } from "@/components/diyor-icon";
import { useCart } from "@/features/cart/cart-provider";
import { clearCheckoutSession } from "./ready";
import {
  clearWhatsAppHandoff,
  readPendingWhatsAppHandoff,
  snoozeWhatsAppHandoff,
} from "./whatsapp-handoff";

export function WhatsAppCartRecovery() {
  const cart = useCart();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  const refresh = useCallback(() => {
    if (!cart.ready) return;
    setOpen(
      Boolean(
        readPendingWhatsAppHandoff(localStorage, cart.items),
      ),
    );
  }, [cart.items, cart.ready]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === "diyor-whatsapp-handoff" || event.key === "diyor-cart")
        refresh();
    };
    window.addEventListener("focus", onFocus);
    window.addEventListener("storage", onStorage);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  if (!mounted || !open || !cart.ready) return null;

  return createPortal(
    <div className="cart-return-backdrop">
      <section
        className="cart-return-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-return-title"
        aria-describedby="cart-return-copy"
      >
        <div className="cart-return-icon" aria-hidden="true">
          <DiyorIcon name="whatsapp" />
        </div>
        <p className="cart-return-kicker">ПОСЛЕ WHATSAPP</p>
        <h2 id="cart-return-title">Что сделать с этой корзиной?</h2>
        <p id="cart-return-copy">
          Этот же заказ уже открывался в WhatsApp. Если вы его отправили —
          очистите корзину. Если ещё нет, оставьте её: мы не удалим заказ
          автоматически.
        </p>
        <div className="cart-return-actions">
          <button
            type="button"
            className="cart-return-clear"
            autoFocus
            onClick={() => {
              cart.clearCart();
              clearCheckoutSession(sessionStorage);
              clearWhatsAppHandoff(localStorage);
              setOpen(false);
            }}
          >
            <DiyorIcon name="check-circle" />
            <span>
              <b>Заказ отправлен</b>
              <small>Очистить корзину</small>
            </span>
          </button>
          <button
            type="button"
            className="cart-return-keep"
            onClick={() => {
              snoozeWhatsAppHandoff(localStorage, cart.items);
              setOpen(false);
            }}
          >
            <DiyorIcon name="cart" />
            <span>
              <b>Оставить корзину</b>
              <small>Не спрашивать ещё 6 часов</small>
            </span>
          </button>
        </div>
        <p className="cart-return-note">
          Если после отправки вы измените товары или количество, старое
          подтверждение не сможет очистить новую корзину.
        </p>
      </section>
    </div>,
    document.body,
  );
}
