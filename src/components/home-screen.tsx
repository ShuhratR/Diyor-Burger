"use client";

import Link from "next/link";
import { CategoryStrip } from "@/components/menu/category-strip";
import { ProductGrid } from "@/components/menu/product-grid";
import { FoodImage } from "@/components/menu/food-image";
import type { Category, Product, PublicRestaurantSettings } from "@/lib/menu/types";
import { copy } from "@/lib/i18n";
import { useLanguage } from "@/features/i18n/language-provider";
import "./home-visual.css";

export function HomeScreen({ categories, combos, popular, settings }: { categories: Category[]; combos: Product[]; popular: Product[]; settings?: PublicRestaurantSettings }) {
  const { language } = useLanguage(); const t = copy[language];
  const benefits = [
    { label: t.delivery, icon: <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M3 16h11V7H3zM14 11h4l3 3v2h-7zM7 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" /></svg> },
    { label: t.fresh, icon: <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 4C11 4 5 8 5 15c0 2 1 4 3 5 1-5 4-9 10-12-3 3-5 6-6 10 5-1 8-5 8-14Z" /></svg> },
    { label: t.quality, icon: <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m12 3 8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z" /><path d="m8 12 2.5 2.5L16 9" /></svg> },
    { label: t.whatsapp, icon: <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M20 11.5A8 8 0 0 1 8.2 19L4 20l1.1-4A8 8 0 1 1 20 11.5Z" /><path d="M9 8.5c.3 2 1.5 3.5 3.6 4.5.7.3 1.2.2 1.7-.4l.5-.7-1.6-1-.7.6c-.9-.4-1.5-1-1.9-1.8l.5-.7-1-1.5z" /></svg> },
  ];
  return <>
    <section className="home-hero">
      <div className="home-hero-copy"><p className="eyebrow">{settings?.restaurantName ?? "DIYOR BURGER"}</p><h1>{settings?.heroTitle ?? (language === "ru" ? <>Сочные бургеры <em>на любой вкус</em></> : <>Бургерҳои болаззат <em>барои ҳар завқ</em></>)}</h1><p>{settings?.heroSubtitle ?? (language === "ru" ? "Свежие блюда, доставка и самовывоз — легко заказать онлайн." : "Таомҳои тару тоза, расонидан ва худбурд — фармоиш додан осон аст.")}</p><Link className="primary-button" href="/menu">{t.orderNow}<span aria-hidden="true">→</span></Link></div><FoodImage src={settings?.heroImageUrl || "/images/hero-burger-v1.png"} alt="Сочный бургер, картофель фри и напиток DIYOR BURGER" compact/></section>
    <section className="benefit-row" aria-label="Преимущества">{benefits.map((benefit) => <span key={benefit.label}><b>{benefit.icon}</b>{benefit.label}</span>)}</section>
    <section className="section home-categories"><div className="section-heading"><h2>{t.categories}</h2><Link href="/menu">{t.menu} →</Link></div><CategoryStrip categories={categories}/></section>
    <section className="section"><div className="section-heading"><h2>{t.combos}</h2><Link href="/combos">{t.allCombos} →</Link></div>{combos.length?<ProductGrid products={combos}/>:<p className="notice">{language === "ru" ? "Комбо пока не добавлены." : "Комбо ҳоло илова нашудааст."}</p>}</section>
    <section className="section"><div className="section-heading"><h2>{t.popular}</h2><Link href="/menu?sort=popular">{t.allDishes} →</Link></div>{popular.length?<ProductGrid products={popular}/>:<p className="notice">{language === "ru" ? "Блюда временно недоступны." : "Таомҳо муваққатан дастрас нестанд."}</p>}</section>
    <section className="brand-banner"><span className="banner-kicker">DIYOR BURGER</span><strong>{language === "ru" ? "Вкусный выбор на каждый день" : "Интихоби болаззат барои ҳар рӯз"}</strong></section>
  </>;
}
