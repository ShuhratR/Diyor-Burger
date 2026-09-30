import type { CartItem } from "@/features/cart/logic";

export const whatsappHandoffStorageKey = "diyor-whatsapp-handoff";
const VERSION = 1 as const;
const MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const KEEP_SNOOZE_MS = 6 * 60 * 60 * 1000;

type Handoff = {
  version: typeof VERSION;
  signature: string;
  openedAt: number;
  dismissedUntil?: number;
};

type ReadWriteStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export function cartHandoffSignature(items: CartItem[]) {
  return items
    .map((item) => ({
      productId: item.productId,
      variantId: item.variantId ?? "",
      quantity: item.quantity,
    }))
    .sort((a, b) =>
      `${a.productId}:${a.variantId}`.localeCompare(
        `${b.productId}:${b.variantId}`,
      ),
    )
    .map(
      (item) =>
        `${item.productId}:${item.variantId}:${item.quantity}`,
    )
    .join("|");
}

function parse(raw: string | null): Handoff | null {
  try {
    const value = JSON.parse(raw ?? "");
    if (
      value?.version !== VERSION ||
      typeof value.signature !== "string" ||
      !Number.isSafeInteger(value.openedAt) ||
      value.openedAt < 0 ||
      (value.dismissedUntil !== undefined &&
        (!Number.isSafeInteger(value.dismissedUntil) ||
          value.dismissedUntil < 0))
    )
      return null;
    return value as Handoff;
  } catch {
    return null;
  }
}

export function markWhatsAppHandoff(
  storage: Pick<Storage, "setItem">,
  items: CartItem[],
  now = Date.now(),
) {
  if (!items.length) return;
  const value: Handoff = {
    version: VERSION,
    signature: cartHandoffSignature(items),
    openedAt: now,
  };
  storage.setItem(whatsappHandoffStorageKey, JSON.stringify(value));
}

export function readPendingWhatsAppHandoff(
  storage: ReadWriteStorage,
  items: CartItem[],
  now = Date.now(),
): Handoff | null {
  const currentSignature = cartHandoffSignature(items);
  const handoff = parse(storage.getItem(whatsappHandoffStorageKey));

  if (!handoff) {
    storage.removeItem(whatsappHandoffStorageKey);
    return null;
  }
  if (
    !items.length ||
    now - handoff.openedAt > MAX_AGE_MS ||
    handoff.signature !== currentSignature
  ) {
    storage.removeItem(whatsappHandoffStorageKey);
    return null;
  }
  if ((handoff.dismissedUntil ?? 0) > now) return null;
  return handoff;
}

export function snoozeWhatsAppHandoff(
  storage: ReadWriteStorage,
  items: CartItem[],
  now = Date.now(),
) {
  const handoff = parse(storage.getItem(whatsappHandoffStorageKey));
  const signature = cartHandoffSignature(items);
  if (!handoff || !items.length || handoff.signature !== signature) {
    storage.removeItem(whatsappHandoffStorageKey);
    return;
  }
  storage.setItem(
    whatsappHandoffStorageKey,
    JSON.stringify({
      ...handoff,
      dismissedUntil: now + KEEP_SNOOZE_MS,
    } satisfies Handoff),
  );
}

export function clearWhatsAppHandoff(
  storage: Pick<Storage, "removeItem">,
) {
  storage.removeItem(whatsappHandoffStorageKey);
}
