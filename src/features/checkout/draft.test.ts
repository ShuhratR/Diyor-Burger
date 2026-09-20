import { describe, expect, it } from "vitest";
import { readCheckoutDraft, serializeCheckoutDraft, validateCheckoutDraft } from "./draft";

const options = { activeZoneIds: ["zone-a"], pickupEnabled: true };
const delivery = { name: "Алишер", phone: "+992 90 123 45 67", fulfillment: "delivery" as const, zoneId: "zone-a", address: "Улица 1", comment: "" };

describe("checkout draft", () => {
  it("serializes and restores a valid draft", () => { const raw = serializeCheckoutDraft(delivery); expect(readCheckoutDraft(raw, options.activeZoneIds)).toMatchObject({ ...delivery, phone: "992901234567" }); });
  it("ignores malformed or unknown-version storage", () => { expect(readCheckoutDraft("{", options.activeZoneIds)).toBeNull(); expect(readCheckoutDraft(JSON.stringify({ version: 2, data: delivery }), options.activeZoneIds)).toBeNull(); });
  it("ignores an invalid fulfillment from storage", () => { expect(readCheckoutDraft(JSON.stringify({ version: 1, data: { ...delivery, fulfillment: "courier" } }), options.activeZoneIds)).toBeNull(); });
  it("clears a zone that is no longer active", () => { const raw = serializeCheckoutDraft({ ...delivery, zoneId: "old-zone" }); expect(readCheckoutDraft(raw, options.activeZoneIds)?.zoneId).toBeUndefined(); });
  it("requires delivery zone and address", () => { expect(validateCheckoutDraft({ ...delivery, zoneId: undefined }, options).success).toBe(false); expect(validateCheckoutDraft({ ...delivery, address: undefined }, options).success).toBe(false); });
  it("accepts pickup without delivery-only fields and rejects disabled pickup", () => { const pickup = { name: "Алишер", phone: "901234567", fulfillment: "pickup" as const }; expect(validateCheckoutDraft(pickup, options).success).toBe(true); expect(validateCheckoutDraft(pickup, { ...options, pickupEnabled: false }).success).toBe(false); });
  it("rejects an empty name and invalid phone", () => { expect(validateCheckoutDraft({ ...delivery, name: " " }, options).success).toBe(false); expect(validateCheckoutDraft({ ...delivery, phone: "123" }, options).success).toBe(false); });
});
