import {
  checkoutSchema,
  CUSTOM_DELIVERY_ZONE_ID,
  type Fulfillment,
} from "./core";

export type CheckoutDraftData = {
  name: string;
  phone: string;
  fulfillment: Fulfillment;
  zoneId?: string;
  customArea?: string;
  address?: string;
  comment?: string;
};

type DraftValidationOptions = {
  activeZoneIds: readonly string[];
  pickupEnabled: boolean;
};
type DraftValidationResult =
  | { success: true; data: CheckoutDraftData }
  | { success: false; errors: Record<string, string> };

const fieldsSchema = checkoutSchema.pick({
  name: true,
  phone: true,
  fulfillment: true,
  zoneId: true,
  customArea: true,
  address: true,
  comment: true,
});
const payloadSchema = fieldsSchema.transform((data) => ({
  version: 1 as const,
  data,
}));
export const checkoutDraftStorageKey = "diyor-checkout-draft";

function friendlySchemaErrors(error: { issues: Array<{ path: PropertyKey[] }> }) {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "");
    if (!field || errors[field]) continue;
    errors[field] =
      field === "name"
        ? "Введите имя минимум из 2 символов."
        : field === "phone"
          ? "Введите корректный номер телефона Таджикистана."
          : field === "customArea"
            ? "Введите название города или района."
            : field === "address"
              ? "Укажите точный адрес."
              : field === "comment"
                ? "Комментарий слишком длинный."
                : "Проверьте это поле.";
  }
  return errors;
}

export function validateCheckoutDraft(
  input: unknown,
  options: DraftValidationOptions,
): DraftValidationResult {
  const result = fieldsSchema.safeParse(input);
  if (!result.success)
    return { success: false, errors: friendlySchemaErrors(result.error) };

  const data = result.data;
  const errors: Record<string, string> = {};

  if (data.fulfillment === "delivery") {
    if (!data.zoneId) {
      errors.zoneId = "Выберите район доставки.";
    } else if (
      data.zoneId !== CUSTOM_DELIVERY_ZONE_ID &&
      !options.activeZoneIds.includes(data.zoneId)
    ) {
      errors.zoneId = "Выберите доступный район доставки.";
    }

    if (
      data.zoneId === CUSTOM_DELIVERY_ZONE_ID &&
      !data.customArea?.trim()
    ) {
      errors.customArea = "Введите название города или района.";
    }
    if (!data.address?.trim()) errors.address = "Укажите точный адрес.";
  }

  if (data.fulfillment === "pickup" && !options.pickupEnabled)
    errors.fulfillment = "Самовывоз временно недоступен.";

  if (Object.keys(errors).length)
    return { success: false, errors };

  return {
    success: true,
    data:
      data.fulfillment === "pickup"
        ? {
            ...data,
            zoneId: undefined,
            customArea: undefined,
            address: undefined,
          }
        : data.zoneId === CUSTOM_DELIVERY_ZONE_ID
          ? data
          : { ...data, customArea: undefined },
  };
}

export function serializeCheckoutDraft(data: CheckoutDraftData): string {
  return JSON.stringify(payloadSchema.parse(data));
}

export function readCheckoutDraft(
  raw: string | null,
  activeZoneIds: readonly string[],
): CheckoutDraftData | null {
  try {
    const parsed = JSON.parse(raw ?? "");
    const result = payloadSchema.safeParse(parsed?.data);
    if (!result.success || parsed?.version !== 1) return null;
    const data = result.data.data;

    if (data.fulfillment === "pickup")
      return {
        ...data,
        zoneId: undefined,
        customArea: undefined,
        address: undefined,
      };

    if (data.zoneId === CUSTOM_DELIVERY_ZONE_ID) return data;
    return activeZoneIds.includes(data.zoneId ?? "")
      ? { ...data, customArea: undefined }
      : { ...data, zoneId: undefined, customArea: undefined };
  } catch {
    return null;
  }
}

export function saveCheckoutDraft(
  storage: Pick<Storage, "setItem">,
  data: CheckoutDraftData,
) {
  storage.setItem(checkoutDraftStorageKey, serializeCheckoutDraft(data));
}
