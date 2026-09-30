import { describe, expect, it } from "vitest";
import {
  cartHandoffSignature,
  markWhatsAppHandoff,
  readPendingWhatsAppHandoff,
  snoozeWhatsAppHandoff,
  whatsappHandoffStorageKey,
} from "./whatsapp-handoff";

function memoryStorage() {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  };
}

describe("WhatsApp cart handoff", () => {
  const cart = [
    { productId: "burger", quantity: 2 },
    { productId: "cola", variantId: "1l", quantity: 1 },
  ];

  it("recognizes the exact cart after WhatsApp was opened", () => {
    const storage = memoryStorage();
    markWhatsAppHandoff(storage as Storage, cart, 1000);
    expect(
      readPendingWhatsAppHandoff(storage as Storage, [...cart].reverse(), 1100),
    ).not.toBeNull();
    expect(cartHandoffSignature(cart)).toBe(
      cartHandoffSignature([...cart].reverse()),
    );
  });

  it("never prompts for a cart changed after the handoff", () => {
    const storage = memoryStorage();
    markWhatsAppHandoff(storage as Storage, cart, 1000);
    const changed = [{ ...cart[0], quantity: 3 }, cart[1]];
    expect(
      readPendingWhatsAppHandoff(storage as Storage, changed, 1200),
    ).toBeNull();
    expect(storage.getItem(whatsappHandoffStorageKey)).toBeNull();
  });

  it("snoozes the keep-cart choice for six hours, then asks again", () => {
    const storage = memoryStorage();
    markWhatsAppHandoff(storage as Storage, cart, 1000);
    snoozeWhatsAppHandoff(storage as Storage, cart, 2000);
    expect(
      readPendingWhatsAppHandoff(storage as Storage, cart, 2001),
    ).toBeNull();
    expect(
      readPendingWhatsAppHandoff(
        storage as Storage,
        cart,
        6 * 60 * 60 * 1000 + 2001,
      ),
    ).not.toBeNull();
  });
});
