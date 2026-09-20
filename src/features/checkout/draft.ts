import { checkoutSchema, type Fulfillment } from "./core";

export type CheckoutDraftData = {
  name: string;
  phone: string;
  fulfillment: Fulfillment;
  zoneId?: string;
  address?: string;
  comment?: string;
};

type DraftValidationOptions = { activeZoneIds: readonly string[]; pickupEnabled: boolean };
type DraftValidationResult = { success: true; data: CheckoutDraftData } | { success: false; errors: Record<string, string> };

const fieldsSchema = checkoutSchema.pick({ name: true, phone: true, fulfillment: true, zoneId: true, address: true, comment: true });
const payloadSchema = fieldsSchema.transform((data) => ({ version: 1 as const, data }));
export const checkoutDraftStorageKey = "diyor-checkout-draft";

export function validateCheckoutDraft(input: unknown, options: DraftValidationOptions): DraftValidationResult {
  const result = fieldsSchema.safeParse(input);
  if (!result.success) return { success: false, errors: Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])) };
  const data = result.data;
  const errors: Record<string, string> = {};
  if (data.fulfillment === "delivery") {
    if (!data.zoneId) errors.zoneId = "Выберите район доставки.";
    else if (!options.activeZoneIds.includes(data.zoneId)) errors.zoneId = "Выберите доступный район доставки.";
    if (!data.address?.trim()) errors.address = "Укажите точный адрес.";
  }
  if (data.fulfillment === "pickup" && !options.pickupEnabled) errors.fulfillment = "Самовывоз временно недоступен.";
  if (Object.keys(errors).length) return { success: false, errors };
  return { success: true, data: data.fulfillment === "pickup" ? { ...data, zoneId: undefined, address: undefined } : data };
}

export function serializeCheckoutDraft(data: CheckoutDraftData): string { return JSON.stringify(payloadSchema.parse(data)); }

export function readCheckoutDraft(raw: string | null, activeZoneIds: readonly string[]): CheckoutDraftData | null {
  try {
    const parsed = JSON.parse(raw ?? "");
    const result = payloadSchema.safeParse(parsed?.data);
    if (!result.success || parsed?.version !== 1) return null;
    const data = result.data.data;
    if (data.fulfillment === "pickup") return { ...data, zoneId: undefined, address: undefined };
    return activeZoneIds.includes(data.zoneId ?? "") ? data : { ...data, zoneId: undefined };
  } catch { return null; }
}

export function saveCheckoutDraft(storage: Pick<Storage, "setItem">, data: CheckoutDraftData) { storage.setItem(checkoutDraftStorageKey, serializeCheckoutDraft(data)); }
