import { CheckoutPageClient } from "@/features/checkout/checkout-page-client";
import { getActiveDeliveryZones, getActiveProducts, getPublicRestaurantSettings } from "@/lib/menu/catalog";

export default async function CheckoutPage() {
  const [products, settings, zones] = await Promise.all([getActiveProducts(), getPublicRestaurantSettings(), getActiveDeliveryZones()]);
  if (!products.data || !settings.data || !zones.data) return <section className="section"><h1>Оформление заказа</h1><p className="notice">Данные для оформления временно недоступны.</p></section>;
  return <CheckoutPageClient products={products.data} settings={settings.data} zones={zones.data} />;
}
