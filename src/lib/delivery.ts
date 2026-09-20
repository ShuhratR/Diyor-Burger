export type DeliveryZone = { id: string; isActive: boolean; deliveryFeeDiram: number; freeDeliveryThresholdDiram: number };
export type FulfillmentMethod = "delivery" | "pickup";
export type DeliveryCalculation = { deliveryFeeDiram: number; totalDiram: number; remainingForFreeDeliveryDiram: number | null; isFreeDelivery: boolean };
export function calculateDelivery(subtotalDiram: number, method: FulfillmentMethod, zone?: DeliveryZone): DeliveryCalculation {
  if (!Number.isSafeInteger(subtotalDiram) || subtotalDiram < 0) throw new Error("Invalid subtotal");
  if (method === "pickup") return { deliveryFeeDiram: 0, totalDiram: subtotalDiram, remainingForFreeDeliveryDiram: null, isFreeDelivery: false };
  if (!zone || !zone.isActive) throw new Error("Delivery zone is unavailable");
  const isFreeDelivery = subtotalDiram >= zone.freeDeliveryThresholdDiram;
  const deliveryFeeDiram = isFreeDelivery ? 0 : zone.deliveryFeeDiram;
  return { deliveryFeeDiram, totalDiram: subtotalDiram + deliveryFeeDiram, remainingForFreeDeliveryDiram: isFreeDelivery ? 0 : zone.freeDeliveryThresholdDiram - subtotalDiram, isFreeDelivery };
}
