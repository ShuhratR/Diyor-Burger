import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { getPublicRestaurantSettings } from "@/lib/menu/catalog";

export default async function AboutPage() {
  const settings = await getPublicRestaurantSettings(); const restaurant = settings.data;
  return <section className="section public-info-page about-page"><div className="about-brand"><BrandLogo/></div><h1>О нас</h1><p className="about-lead">{restaurant?.restaurantName || "DIYOR BURGER"} — меню, доставка и контакты ресторана в одном месте.</p><div className="about-facts"><article><b>Адрес</b><span>{restaurant?.mainAddress || "Уточняется"}</span></article>{restaurant?.workOpenTime && restaurant.workCloseTime && <article><b>Время работы</b><span>Ежедневно {restaurant.workOpenTime}–{restaurant.workCloseTime}</span></article>}{restaurant?.pickupEnabled && <article><b>Самовывоз</b><span>{restaurant.pickupAddress || restaurant.mainAddress}</span></article>}</div><Link className="cta" href="/contacts">Связаться с рестораном</Link></section>;
}
