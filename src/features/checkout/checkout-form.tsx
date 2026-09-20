"use client";

import { FormEvent, useState } from "react";
import { checkoutSchema, type Fulfillment } from "./core";

type CheckoutDraftFields = {
  name: string;
  phone: string;
  fulfillment: Fulfillment;
  zoneId?: string;
  address?: string;
  comment: string;
};

type CheckoutFormProps = {
  initialValues?: Partial<CheckoutDraftFields>;
  onSubmit?: (values: CheckoutDraftFields) => void;
};

const formSchema = checkoutSchema.pick({
  name: true,
  phone: true,
  fulfillment: true,
  comment: true,
});

export function CheckoutForm({ initialValues, onSubmit }: CheckoutFormProps) {
  const [values, setValues] = useState<CheckoutDraftFields>({
    name: initialValues?.name ?? "",
    phone: initialValues?.phone ?? "",
    fulfillment: initialValues?.fulfillment ?? "delivery",
    zoneId: initialValues?.zoneId,
    address: initialValues?.address,
    comment: initialValues?.comment ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const result = formSchema.safeParse(values);
    if (!result.success) {
      setErrors(Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      return;
    }
    setErrors({});
    onSubmit?.({ ...values, name: result.data.name, phone: result.data.phone, comment: result.data.comment ?? "" });
  }

  return <form className="checkout-form" onSubmit={submit} noValidate>
    <label htmlFor="checkout-name">Имя</label>
    <input id="checkout-name" name="name" autoComplete="name" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} aria-invalid={Boolean(errors.name)} />
    {errors.name && <p className="field-error" role="alert">Введите имя от 2 до 100 символов.</p>}

    <label htmlFor="checkout-phone">Телефон</label>
    <input id="checkout-phone" name="phone" inputMode="tel" autoComplete="tel" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} aria-invalid={Boolean(errors.phone)} placeholder="+992 90 123 45 67" />
    {errors.phone && <p className="field-error" role="alert">Введите корректный номер телефона.</p>}

    <fieldset>
      <legend>Способ получения</legend>
      <label><input type="radio" name="fulfillment" checked={values.fulfillment === "delivery"} onChange={() => setValues({ ...values, fulfillment: "delivery" })} /> Доставка</label>
      <label><input type="radio" name="fulfillment" checked={values.fulfillment === "pickup"} onChange={() => setValues({ ...values, fulfillment: "pickup" })} /> Самовывоз</label>
    </fieldset>

    <label htmlFor="checkout-comment">Комментарий <span>(необязательно)</span></label>
    <textarea id="checkout-comment" name="comment" maxLength={500} value={values.comment} onChange={(event) => setValues({ ...values, comment: event.target.value })} />
    {errors.comment && <p className="field-error" role="alert">Комментарий слишком длинный.</p>}

    <button className="checkout-submit" type="submit">Продолжить</button>
  </form>;
}
