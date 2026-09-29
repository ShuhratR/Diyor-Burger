"use client";

import { FormEvent, useMemo, useState } from "react";
import { calculateDelivery } from "@/lib/delivery";
import { formatSomoni } from "@/lib/money";
import type { PublicDeliveryZone, PublicRestaurantSettings } from "@/lib/menu/types";
import { FoodImage } from "@/components/menu/food-image";
import { validateCheckoutDraft, type CheckoutDraftData } from "./draft";
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
  onSubmit?: (values: CheckoutDraftData) => Promise<string | void> | string | void;
  zones: PublicDeliveryZone[];
  settings: PublicRestaurantSettings;
  subtotalDiram: number;
  cartLines: CheckoutCartPreviewLine[];
  blocked?: boolean;
  onResolveUnavailable?: () => void;
};

export function CheckoutForm({ initialValues, onSubmit, zones, settings, subtotalDiram, cartLines, blocked = false, onResolveUnavailable }: CheckoutFormProps) {
  const [values, setValues] = useState<CheckoutDraftFields>({
    name: initialValues?.name ?? "",
    phone: initialValues?.phone ?? "",
    fulfillment: initialValues?.fulfillment ?? "delivery",
    zoneId: initialValues?.zoneId,
    address: initialValues?.address,
    comment: initialValues?.comment ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const activeZones = useMemo(() => zones.filter((zone) => zone.isActive), [zones]);
  const selectedZone = activeZones.find((zone) => zone.id === values.zoneId);
  const delivery = values.fulfillment === "pickup"
    ? calculateDelivery(subtotalDiram, "pickup")
    : selectedZone ? calculateDelivery(subtotalDiram, "delivery", selectedZone) : null;

  function update(next: Partial<CheckoutDraftFields>) {
    setValues((current) => ({ ...current, ...next }));
    setErrors((current) => {
      const updated = { ...current };
      for (const key of Object.keys(next)) delete updated[key];
      return updated;
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (blocked) { onResolveUnavailable?.(); return; }
    const result = validateCheckoutDraft(values, { activeZoneIds: activeZones.map((zone) => zone.id), pickupEnabled: settings.pickupEnabled });
    if (!result.success) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmitError(null);
    setSubmitting(true);
    try {
      const message = await onSubmit?.(result.data);
      if (message) setSubmitError(message);
    } catch {
      setSubmitError("Не удалось подготовить заказ. Проверьте корзину и попробуйте снова.");
    } finally {
      setSubmitting(false);
    }
  }

  return <form className={styles.form} onSubmit={submit} noValidate>
    <div className={styles.field}>
      <label htmlFor="checkout-name">Имя</label>
      <input id="checkout-name" name="name" autoComplete="name" value={values.name} onChange={(event) => update({ name: event.target.value })} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "checkout-name-error" : undefined} />
      {errors.name && <p id="checkout-name-error" className={styles.error} role="alert">Введите имя от 2 до 100 символов.</p>}
    </div>

    <div className={styles.field}>
      <label htmlFor="checkout-phone">Телефон</label>
      <input id="checkout-phone" name="phone" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => update({ phone: event.target.value })} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "checkout-phone-error" : undefined} placeholder="+992 90 123 45 67" />
      {errors.phone && <p id="checkout-phone-error" className={styles.error} role="alert">Введите корректный номер телефона.</p>}
    </div>

    <fieldset className={styles.fulfillment}>
      <legend>Способ получения</legend>
      {activeZones.length > 0 && <label className={values.fulfillment === "delivery" ? styles.selected : ""}><input type="radio" name="fulfillment" checked={values.fulfillment === "delivery"} onChange={() => update({ fulfillment: "delivery" })} /> Доставка</label>}
      {settings.pickupEnabled && <label className={values.fulfillment === "pickup" ? styles.selected : ""}><input type="radio" name="fulfillment" checked={values.fulfillment === "pickup"} onChange={() => update({ fulfillment: "pickup", zoneId: undefined, address: undefined })} /> Самовывоз</label>}
    </fieldset>

    {values.fulfillment === "delivery" && <>
      <fieldset className={styles.zones} aria-describedby={errors.zoneId ? "checkout-zone-error" : undefined}>
        <legend>Район доставки</legend>
        {activeZones.map((zone) => <label className={values.zoneId === zone.id ? styles.selected : ""} key={zone.id}>
          <input type="radio" name="zone" value={zone.id} checked={values.zoneId === zone.id} onChange={() => update({ zoneId: zone.id })} />
          <span><strong>{zone.name}</strong><small>{formatSomoni(zone.deliveryFeeDiram)} · Бесплатно от {formatSomoni(zone.freeDeliveryThresholdDiram)}</small></span>
        </label>)}
      </fieldset>
      {errors.zoneId && <p id="checkout-zone-error" className={styles.error} role="alert">{errors.zoneId}</p>}
      <div className={styles.field}>
        <label htmlFor="checkout-address">Точный адрес</label>
        <textarea id="checkout-address" name="address" value={values.address ?? ""} onChange={(event) => update({ address: event.target.value })} aria-invalid={Boolean(errors.address)} aria-describedby={errors.address ? "checkout-address-error" : undefined} placeholder="Махалла, улица, дом, ориентир" />
        {errors.address && <p id="checkout-address-error" className={styles.error} role="alert">{errors.address}</p>}
      </div>
      {delivery && <aside className={styles.deliveryPreview}><b>{delivery.isFreeDelivery ? "Бесплатная доставка" : `Стоимость доставки: ${formatSomoni(delivery.deliveryFeeDiram)}`}</b>{!delivery.isFreeDelivery && delivery.remainingForFreeDeliveryDiram !== null && <p>Добавьте ещё {formatSomoni(Math.max(0, delivery.remainingForFreeDeliveryDiram))} — доставка будет бесплатной.</p>}</aside>}
    </>}

    {values.fulfillment === "pickup" && <aside className={styles.pickup}><b>Самовывоз</b>{settings.pickupAddress ? <p>{settings.pickupAddress}</p> : <p>Точный адрес самовывоза будет уточнён при подтверждении заказа.</p>}{settings.pickupNote && <p>{settings.pickupNote}</p>}</aside>}

    <div className={styles.field}>
      <label htmlFor="checkout-comment">Комментарий <span>(необязательно)</span></label>
      <textarea id="checkout-comment" name="comment" maxLength={500} value={values.comment} onChange={(event) => update({ comment: event.target.value })} aria-invalid={Boolean(errors.comment)} />
      {errors.comment && <p className={styles.error} role="alert">Комментарий слишком длинный.</p>}
    </div>

    <aside className={styles.orderPreview} aria-label="Ваш заказ">
      <div className={styles.orderPreviewHeading}><b>Ваш заказ</b><a href="/cart">Изменить →</a></div>
      <div className={styles.orderLines}>
        {cartLines.map((line) => <div className={styles.orderLine} key={line.id}>
          <FoodImage src={line.imageUrl} alt={line.name} compact />
          <span><b>{line.name}</b><small>{line.variantName ? `${line.variantName} · ` : ""}{line.quantity} шт.</small></span>
          <strong>{formatSomoni(line.priceDiram * line.quantity)}</strong>
        </div>)}
      </div>
      <div className={styles.summary}><span>Сумма товаров <b>{formatSomoni(subtotalDiram)}</b></span><span>Доставка <b>{values.fulfillment === "pickup" ? formatSomoni(0) : delivery ? delivery.isFreeDelivery ? "Бесплатно" : formatSomoni(delivery.deliveryFeeDiram) : "Выберите район"}</b></span><strong>Итого <b>{formatSomoni(delivery?.totalDiram ?? subtotalDiram)}</b></strong></div>
    </aside>

    {blocked && <p className={styles.error} role="status">В корзине есть недоступное блюдо. <button type="button" onClick={onResolveUnavailable}>Посмотреть и удалить</button></p>}
    {submitError && <p className={styles.error} role="alert">{submitError}</p>}
    <button className={styles.submit} type="submit" disabled={submitting || blocked}>{submitting ? "Подготавливаем WhatsApp…" : "Оформить и открыть WhatsApp"}</button>
  </form>;
}
