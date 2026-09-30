"use client";

import { FormEvent, useMemo, useState } from "react";
import { calculateDelivery } from "@/lib/delivery";
import { formatSomoni } from "@/lib/money";
import type {
  PublicDeliveryZone,
  PublicRestaurantSettings,
} from "@/lib/menu/types";
import { FoodImage } from "@/components/menu/food-image";
import { CUSTOM_DELIVERY_ZONE_ID } from "./core";
import {
  validateCheckoutDraft,
  type CheckoutDraftData,
} from "./draft";
import styles from "./checkout-form.module.css";

export type CheckoutDraftFields = CheckoutDraftData & { comment: string };

export type CheckoutCartPreviewLine = {
  id: string;
  name: string;
  imageUrl?: string;
  variantName?: string;
  quantity: number;
  priceDiram: number;
};

type CheckoutFormProps = {
  initialValues?: Partial<CheckoutDraftFields>;
  onSubmit?: (
    values: CheckoutDraftData,
  ) => Promise<string | void> | string | void;
  zones: PublicDeliveryZone[];
  settings: PublicRestaurantSettings;
  subtotalDiram: number;
  cartLines: CheckoutCartPreviewLine[];
  blocked?: boolean;
  onResolveUnavailable?: () => void;
};

const fieldLabels: Record<string, string> = {
  name: "Имя",
  phone: "Телефон",
  fulfillment: "Способ получения",
  zoneId: "Район доставки",
  customArea: "Город или район",
  address: "Точный адрес",
  comment: "Комментарий",
};

const fieldIds: Record<string, string> = {
  name: "checkout-name",
  phone: "checkout-phone",
  fulfillment: "checkout-fulfillment",
  zoneId: "checkout-zone",
  customArea: "checkout-custom-area",
  address: "checkout-address",
  comment: "checkout-comment",
};

export function CheckoutForm({
  initialValues,
  onSubmit,
  zones,
  settings,
  subtotalDiram,
  cartLines,
  blocked = false,
  onResolveUnavailable,
}: CheckoutFormProps) {
  const [values, setValues] = useState<CheckoutDraftFields>({
    name: initialValues?.name ?? "",
    phone: initialValues?.phone ?? "",
    fulfillment: initialValues?.fulfillment ?? "delivery",
    zoneId: initialValues?.zoneId,
    customArea: initialValues?.customArea,
    address: initialValues?.address,
    comment: initialValues?.comment ?? "",
  });
  const [website, setWebsite] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const activeZones = useMemo(
    () => zones.filter((zone) => zone.isActive),
    [zones],
  );
  const selectedZone = activeZones.find(
    (zone) => zone.id === values.zoneId,
  );
  const customDelivery =
    values.fulfillment === "delivery" &&
    values.zoneId === CUSTOM_DELIVERY_ZONE_ID;
  const delivery =
    values.fulfillment === "pickup"
      ? calculateDelivery(subtotalDiram, "pickup")
      : selectedZone
        ? calculateDelivery(subtotalDiram, "delivery", selectedZone)
        : null;

  function update(next: Partial<CheckoutDraftFields>) {
    setValues((current) => ({ ...current, ...next }));
    setSubmitError(null);
    setErrors((current) => {
      const updated = { ...current };
      for (const key of Object.keys(next)) delete updated[key];
      return updated;
    });
  }

  function focusFirstError(nextErrors: Record<string, string>) {
    const firstKey = Object.keys(nextErrors)[0];
    if (!firstKey) return;
    window.requestAnimationFrame(() => {
      document.getElementById(fieldIds[firstKey] ?? "")?.focus();
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked) {
      onResolveUnavailable?.();
      return;
    }

    const result = validateCheckoutDraft(values, {
      activeZoneIds: activeZones.map((zone) => zone.id),
      pickupEnabled: settings.pickupEnabled,
    });

    if (!result.success) {
      setErrors(result.errors);
      const labels = Object.keys(result.errors)
        .map((key) => fieldLabels[key] ?? key)
        .slice(0, 5);
      setSubmitError(
        labels.length === 1
          ? `Проверьте поле «${labels[0]}».`
          : `Проверьте обязательные поля: ${labels.join(", ")}.`,
      );
      focusFirstError(result.errors);
      return;
    }

    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      // Keep the honeypot out of session storage, but include it in the server
      // request. The server rejects automated submissions that fill it.
      const submission = { ...result.data, website };
      const message = await onSubmit?.(submission);
      if (message) setSubmitError(message);
    } catch {
      setSubmitError(
        "Не удалось подготовить заказ. Проверьте корзину и попробуйте снова.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const deliveryLabel =
    values.fulfillment === "pickup"
      ? formatSomoni(0)
      : customDelivery
        ? "Уточняется"
        : delivery
          ? delivery.isFreeDelivery
            ? "Бесплатно"
            : formatSomoni(delivery.deliveryFeeDiram)
          : "Выберите район";
  const visibleTotalDiram =
    customDelivery ? subtotalDiram : delivery?.totalDiram ?? subtotalDiram;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <div className={styles.honeypot} aria-hidden="true">
        <label htmlFor="checkout-website">Ваш сайт</label>
        <input
          id="checkout-website"
          name="website"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          autoComplete="off"
          tabIndex={-1}
        />
      </div>

      <div className={styles.field}>
        <label htmlFor="checkout-name">Имя</label>
        <input
          id="checkout-name"
          name="name"
          autoComplete="name"
          value={values.name}
          onChange={(event) => update({ name: event.target.value })}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "checkout-name-error" : undefined}
        />
        {errors.name && (
          <p id="checkout-name-error" className={styles.error} role="alert">
            {errors.name}
          </p>
        )}
      </div>

      <div className={styles.field}>
        <label htmlFor="checkout-phone">Телефон</label>
        <input
          id="checkout-phone"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={(event) => update({ phone: event.target.value })}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "checkout-phone-error" : undefined}
          placeholder="+992 90 123 45 67"
        />
        {errors.phone && (
          <p id="checkout-phone-error" className={styles.error} role="alert">
            {errors.phone}
          </p>
        )}
      </div>

      <fieldset
        id="checkout-fulfillment"
        className={styles.fulfillment}
        tabIndex={-1}
      >
        <legend>Способ получения</legend>
        {activeZones.length > 0 && (
          <label
            className={values.fulfillment === "delivery" ? styles.selected : ""}
          >
            <input
              type="radio"
              name="fulfillment"
              checked={values.fulfillment === "delivery"}
              onChange={() => update({ fulfillment: "delivery" })}
            />{" "}
            Доставка
          </label>
        )}
        {settings.pickupEnabled && (
          <label
            className={values.fulfillment === "pickup" ? styles.selected : ""}
          >
            <input
              type="radio"
              name="fulfillment"
              checked={values.fulfillment === "pickup"}
              onChange={() =>
                update({
                  fulfillment: "pickup",
                  zoneId: undefined,
                  customArea: undefined,
                  address: undefined,
                })
              }
            />{" "}
            Самовывоз
          </label>
        )}
      </fieldset>
      {errors.fulfillment && (
        <p className={styles.error} role="alert">
          {errors.fulfillment}
        </p>
      )}

      {values.fulfillment === "delivery" && (
        <>
          <fieldset
            id="checkout-zone"
            className={styles.zones}
            tabIndex={-1}
            aria-describedby={
              errors.zoneId ? "checkout-zone-error" : undefined
            }
          >
            <legend>Район доставки</legend>
            {activeZones.map((zone) => (
              <label
                className={values.zoneId === zone.id ? styles.selected : ""}
                key={zone.id}
              >
                <input
                  type="radio"
                  name="zone"
                  value={zone.id}
                  checked={values.zoneId === zone.id}
                  onChange={() =>
                    update({ zoneId: zone.id, customArea: undefined })
                  }
                />
                <span>
                  <strong>{zone.name}</strong>
                  <small>
                    {formatSomoni(zone.deliveryFeeDiram)} · Бесплатно от{" "}
                    {formatSomoni(zone.freeDeliveryThresholdDiram)}
                  </small>
                </span>
              </label>
            ))}
            <label
              className={
                values.zoneId === CUSTOM_DELIVERY_ZONE_ID
                  ? styles.selected
                  : ""
              }
            >
              <input
                type="radio"
                name="zone"
                value={CUSTOM_DELIVERY_ZONE_ID}
                checked={values.zoneId === CUSTOM_DELIVERY_ZONE_ID}
                onChange={() =>
                  update({ zoneId: CUSTOM_DELIVERY_ZONE_ID })
                }
              />
              <span>
                <strong>Другой район / город</strong>
                <small>Стоимость доставки уточнит менеджер</small>
              </span>
            </label>
          </fieldset>
          {errors.zoneId && (
            <p id="checkout-zone-error" className={styles.error} role="alert">
              {errors.zoneId}
            </p>
          )}

          {customDelivery && (
            <div className={styles.field}>
              <label htmlFor="checkout-custom-area">
                Название города или района
              </label>
              <input
                id="checkout-custom-area"
                name="customArea"
                value={values.customArea ?? ""}
                onChange={(event) =>
                  update({ customArea: event.target.value })
                }
                aria-invalid={Boolean(errors.customArea)}
                aria-describedby={
                  errors.customArea ? "checkout-custom-area-error" : undefined
                }
                placeholder="Например: Гиссар, Вахдат, район Рудаки"
              />
              {errors.customArea && (
                <p
                  id="checkout-custom-area-error"
                  className={styles.error}
                  role="alert"
                >
                  {errors.customArea}
                </p>
              )}
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="checkout-address">Точный адрес</label>
            <textarea
              id="checkout-address"
              name="address"
              value={values.address ?? ""}
              onChange={(event) => update({ address: event.target.value })}
              aria-invalid={Boolean(errors.address)}
              aria-describedby={
                errors.address ? "checkout-address-error" : undefined
              }
              placeholder="Махалла, улица, дом, ориентир"
            />
            {errors.address && (
              <p
                id="checkout-address-error"
                className={styles.error}
                role="alert"
              >
                {errors.address}
              </p>
            )}
          </div>

          {customDelivery ? (
            <aside className={styles.deliveryPreview}>
              <b>Стоимость доставки будет уточнена</b>
              <p>
                Менеджер подтвердит цену доставки для указанного города или
                района в WhatsApp.
              </p>
            </aside>
          ) : (
            delivery && (
              <aside className={styles.deliveryPreview}>
                <b>
                  {delivery.isFreeDelivery
                    ? "Бесплатная доставка"
                    : `Стоимость доставки: ${formatSomoni(
                        delivery.deliveryFeeDiram,
                      )}`}
                </b>
                {!delivery.isFreeDelivery &&
                  delivery.remainingForFreeDeliveryDiram !== null && (
                    <p>
                      Добавьте ещё{" "}
                      {formatSomoni(
                        Math.max(
                          0,
                          delivery.remainingForFreeDeliveryDiram,
                        ),
                      )}{" "}
                      — доставка будет бесплатной.
                    </p>
                  )}
              </aside>
            )
          )}
        </>
      )}

      {values.fulfillment === "pickup" && (
        <aside className={styles.pickup}>
          <b>Самовывоз</b>
          {settings.pickupAddress ? (
            <p>{settings.pickupAddress}</p>
          ) : (
            <p>Точный адрес самовывоза будет уточнён при подтверждении заказа.</p>
          )}
          {settings.pickupNote && <p>{settings.pickupNote}</p>}
        </aside>
      )}

      <div className={styles.field}>
        <label htmlFor="checkout-comment">
          Комментарий <span>(необязательно)</span>
        </label>
        <textarea
          id="checkout-comment"
          name="comment"
          maxLength={500}
          value={values.comment}
          onChange={(event) => update({ comment: event.target.value })}
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={
            errors.comment ? "checkout-comment-error" : undefined
          }
        />
        {errors.comment && (
          <p id="checkout-comment-error" className={styles.error} role="alert">
            {errors.comment}
          </p>
        )}
      </div>

      <aside className={styles.orderPreview} aria-label="Ваш заказ">
        <div className={styles.orderPreviewHeading}>
          <b>Ваш заказ</b>
          <a href="/cart">Изменить →</a>
        </div>
        <div className={styles.orderLines}>
          {cartLines.map((line) => (
            <div className={styles.orderLine} key={line.id}>
              <FoodImage src={line.imageUrl} alt={line.name} compact />
              <span>
                <b>{line.name}</b>
                <small>
                  {line.variantName ? `${line.variantName} · ` : ""}
                  {line.quantity} шт.
                </small>
              </span>
              <strong>
                {formatSomoni(line.priceDiram * line.quantity)}
              </strong>
            </div>
          ))}
        </div>
        <div className={styles.summary}>
          <span>
            Сумма товаров <b>{formatSomoni(subtotalDiram)}</b>
          </span>
          <span>
            Доставка <b>{deliveryLabel}</b>
          </span>
          <strong>
            {customDelivery ? "Итого без доставки" : "Итого"}{" "}
            <b>{formatSomoni(visibleTotalDiram)}</b>
          </strong>
        </div>
      </aside>

      {blocked && (
        <p className={styles.error} role="status">
          В корзине есть недоступное блюдо.{" "}
          <button type="button" onClick={onResolveUnavailable}>
            Посмотреть и удалить
          </button>
        </p>
      )}
      {submitError && (
        <p className={styles.submitError} role="alert" aria-live="assertive">
          {submitError}
        </p>
      )}
      <button
        className={styles.submit}
        type="submit"
        disabled={submitting || blocked}
      >
        {submitting
          ? "Подготавливаем WhatsApp…"
          : "Оформить и открыть WhatsApp"}
      </button>
    </form>
  );
}
