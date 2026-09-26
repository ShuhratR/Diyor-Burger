import Link from "next/link";
import { FoodImage } from "@/components/menu/food-image";
import { getActiveDeliveryZones, getPublicRestaurantSettings } from "@/lib/menu/catalog";
import { formatSomoni } from "@/lib/money";

export default async function DeliveryPage() {
  const [zones, settings] = await Promise.all([getActiveDeliveryZones(), getPublicRestaurantSettings()]);
  const restaurant = settings.data;
  return <section className="section public-info-page"><div className="page-hero"><h1>Доставка <em>DIYOR</em></h1><p>Стоимость и условия автоматически берутся из актуальных настроек ресторана.</p><FoodImage compact src="/images/hero-burger-v1.png" alt="Доставка DIYOR BURGER"/></div><h2>Зоны доставки</h2><div className="delivery-zone-list">{zones.data?.map((zone) => <article key={zone.id}><b>{zone.name}</b><span>Доставка: {formatSomoni(zone.deliveryFeeDiram)}</span><small>{zone.freeDeliveryThresholdDiram > 0 ? `Бесплатно от ${formatSomoni(zone.freeDeliveryThresholdDiram)}` : "Бесплатной доставки нет"}</small></article>)}</div>{!zones.data?.length && <p className="notice">Зоны доставки временно недоступны. Свяжитесь с рестораном для уточнения.</p>}{restaurant?.pickupEnabled && <article className="pickup-card"><b>Самовывоз</b><span>{restaurant.pickupAddress || restaurant.mainAddress}</span>{restaurant.pickupNote && <small>{restaurant.pickupNote}</small>}</article>}<Link className="cta" href="/menu">Выбрать блюда</Link></section>;
}
