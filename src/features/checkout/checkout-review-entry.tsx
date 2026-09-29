"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart-provider";
import {
  checkoutDraftStorageKey,
  readCheckoutDraft,
  validateCheckoutDraft,
} from "./draft";
import { saveReady } from "./ready";
import type { PreparedCheckout } from "./prepare-server";
import { formatSomoni } from "@/lib/money";
import { CartUnavailableDialog } from "@/features/cart/cart-unavailable-dialog";
import { combineUnavailable, type UnavailableCartItem } from "@/features/cart/availability";

export function CheckoutReviewEntry({
  activeZoneIds,
  pickupEnabled,
}: {
  activeZoneIds: string[];
  pickupEnabled: boolean;
}) {
  const cart = useCart();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [summary, setSummary] = useState<PreparedCheckout | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<UnavailableCartItem[]>([]);

  useEffect(() => {
    if (!cart.ready) return;
    if (!cart.items.length) {
      router.replace("/cart");
      return;
    }
    const draft = readCheckoutDraft(
      sessionStorage.getItem(checkoutDraftStorageKey),
      activeZoneIds,
    );
    if (
      !draft ||
      !validateCheckoutDraft(draft, { activeZoneIds, pickupEnabled }).success
    ) {
      router.replace("/checkout");
      return;
    }
    fetch("/api/checkout/prepare", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items: cart.items, ...draft }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (result.ok) queueMicrotask(() => {
          setUnavailable([]);
          setError(null);
          setSummary(result.summary);
        });
        else queueMicrotask(() => {
          setError(result.code);
          setUnavailable(Array.isArray(result.unavailableItems) ? result.unavailableItems : []);
        });
      })
      .catch(() => queueMicrotask(() => setError("SETTINGS_UNAVAILABLE")))
      .finally(() => queueMicrotask(() => setReady(true)));
  }, [activeZoneIds, cart.items, cart.ready, pickupEnabled, router]);

  if (!cart.ready)
    return (
      <section className="section">
        <h1>Проверяем заказ…</h1>
        <p className="notice">Восстанавливаем корзину.</p>
      </section>
    );
  if (!cart.items.length)
    return (
      <section className="section">
        <h1>Корзина пуста</h1>
        <p className="notice">Вернитесь в корзину, чтобы оформить заказ.</p>
        <Link className="cta" href="/cart">
          В корзину
        </Link>
      </section>
    );
  if (!ready)
    return (
      <section className="section">
        <h1>Проверяем заказ…</h1>
        <p className="notice">Проверяем актуальные цены и доступность блюд.</p>
      </section>
    );
  if (error && unavailable.length > 0) {
    const issues = combineUnavailable([], unavailable, cart.items);
    return <section className="section">
      <h1>Меню обновилось</h1>
      <p className="notice">Некоторые позиции больше недоступны. Удалите их, чтобы продолжить оформление.</p>
      <Link className="cta" href="/cart">Перейти в корзину</Link>
      {issues.length > 0 && <CartUnavailableDialog issues={issues} items={cart.items}
        removeItem={item => cart.removeItem(item)} onClose={() => router.push("/cart")} />}
    </section>;
  }
  if (error)
    return (
      <section className="section">
        <h1>Не удалось проверить заказ</h1>
        <p className="notice">
          {error === "PRODUCT_UNAVAILABLE" || error === "PRODUCT_NOT_FOUND"
            ? "В корзине есть старое или недоступное блюдо. Удалите его в корзине и попробуйте снова."
            : error === "VARIANT_UNAVAILABLE"
              ? "Выбранный размер пиццы больше недоступен. Вернитесь в корзину и выберите другой."
              : error === "DELIVERY_ZONE_UNAVAILABLE"
                ? "Эта зона доставки сейчас недоступна. Выберите другую."
                : error === "ORDER_WHATSAPP_NOT_CONFIGURED"
                  ? "Номер WhatsApp ресторана не настроен. Администратору нужно указать его в настройках."
                  : "Проверьте данные заказа и попробуйте снова."}
        </p>
        <Link
          className="cta"
          href={error === "DELIVERY_ZONE_UNAVAILABLE" ? "/checkout" : "/cart"}
        >
          Вернуться
        </Link>
      </section>
    );
  if (!summary) return null;
  return (
    <section className="section checkout-review-reference">
      <div className="review-hero">
        <span>Почти готово</span>
        <h1>Проверьте заказ</h1>
        <p>Цены и доставка проверены по актуальным данным ресторана.</p>
      </div>
      <section className="review-items" aria-label="Позиции заказа">
        {summary.items.map((item) => (
          <article key={`${item.productId}${item.variant ?? ""}`}>
            <span>
              <b>
                {item.name}
                {item.variant ? ` · ${item.variant}` : ""}
              </b>
              <small>
                {item.quantity} шт. · {formatSomoni(item.unitPriceDiram)} за шт.
              </small>
            </span>
            <strong>{formatSomoni(item.lineTotalDiram)}</strong>
          </article>
        ))}
      </section>
      <section className="review-total" aria-label="Итог заказа">
        <p>
          <span>Товары</span>
          <b>{formatSomoni(summary.subtotalDiram)}</b>
        </p>
        <p>
          <span>Доставка</span>
          <b>
            {summary.deliveryFeeDiram
              ? formatSomoni(summary.deliveryFeeDiram)
              : summary.fulfillment === "pickup"
                ? formatSomoni(0)
                : "Бесплатно"}
          </b>
        </p>
        <strong>
          <span>Итого</span>
          <b>{formatSomoni(summary.totalDiram)}</b>
        </strong>
      </section>
      <section className="review-customer" aria-label="Данные клиента">
        <h2>Детали заказа</h2>
        <p>
          <b>{summary.customer.name}</b>
          <br />+{summary.customer.phone}
        </p>
        <p>
          {summary.fulfillment === "delivery" ? (
            <>
              Доставка · {summary.deliveryZone}
              <br />
              {summary.customer.address}
            </>
          ) : (
            <>
              Самовывоз
              {summary.pickupAddress ? ` · ${summary.pickupAddress}` : ""}
            </>
          )}
        </p>
        {summary.customer.comment && (
          <p>Комментарий: {summary.customer.comment}</p>
        )}
      </section>
      <button
        className="cta review-primary"
        onClick={() => {
          saveReady(sessionStorage, summary);
          router.push("/checkout/whatsapp");
        }}
      >
        Подготовить заказ в WhatsApp
      </button>
      <div className="review-actions">
        <Link className="cart-secondary" href="/checkout">
          Изменить данные
        </Link>
        <Link className="cart-secondary" href="/cart">
          Вернуться в корзину
        </Link>
      </div>
    </section>
  );
}
