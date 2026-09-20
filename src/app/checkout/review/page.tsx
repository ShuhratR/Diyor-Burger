import { CheckoutReviewEntry } from "@/features/checkout/checkout-review-entry";
import { getActiveDeliveryZones, getPublicRestaurantSettings } from "@/lib/menu/catalog";

export default async function CheckoutReviewPage() {
  const [zones, settings] = await Promise.all([getActiveDeliveryZones(), getPublicRestaurantSettings()]);
  if (!zones.data || !settings.data) return <section className="section"><h1>Оформление заказа</h1><p className="notice">Данные оформления временно недоступны.</p></section>;
  return <CheckoutReviewEntry activeZoneIds={zones.data.filter((zone) => zone.isActive).map((zone) => zone.id)} pickupEnabled={settings.data.pickupEnabled} />;
}
