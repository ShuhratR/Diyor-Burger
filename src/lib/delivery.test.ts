import { describe, expect, it } from "vitest";
import { calculateDelivery, type DeliveryZone } from "./delivery";
const kushoniyon: DeliveryZone = { id: "kushoniyon", isActive: true, deliveryFeeDiram: 1000, freeDeliveryThresholdDiram: 15000 };
const vakhsh: DeliveryZone = { id: "vakhsh", isActive: true, deliveryFeeDiram: 2000, freeDeliveryThresholdDiram: 25000 };
const bokhtar: DeliveryZone = { id: "bokhtar", isActive: true, deliveryFeeDiram: 2000, freeDeliveryThresholdDiram: 25000 };
describe("calculateDelivery", () => {
  it("calculates Kushoniyon threshold", () => { expect(calculateDelivery(14900, "delivery", kushoniyon).deliveryFeeDiram).toBe(1000); expect(calculateDelivery(15000, "delivery", kushoniyon).deliveryFeeDiram).toBe(0); });
  it("calculates Vakhsh threshold", () => { expect(calculateDelivery(24900, "delivery", vakhsh).deliveryFeeDiram).toBe(2000); expect(calculateDelivery(25000, "delivery", vakhsh).deliveryFeeDiram).toBe(0); });
  it("calculates Bokhtar threshold", () => { expect(calculateDelivery(24900, "delivery", bokhtar).deliveryFeeDiram).toBe(2000); expect(calculateDelivery(25000, "delivery", bokhtar).deliveryFeeDiram).toBe(0); });
  it("never charges pickup", () => expect(calculateDelivery(12000, "pickup").deliveryFeeDiram).toBe(0));
  it("reports progress to free delivery without a negative remainder", () => { expect(calculateDelivery(14900, "delivery", kushoniyon).remainingForFreeDeliveryDiram).toBe(100); expect(calculateDelivery(15000, "delivery", kushoniyon).remainingForFreeDeliveryDiram).toBe(0); });
  it("rejects inactive zones", () => expect(() => calculateDelivery(10000, "delivery", { ...kushoniyon, isActive: false })).toThrow("unavailable"));
});
