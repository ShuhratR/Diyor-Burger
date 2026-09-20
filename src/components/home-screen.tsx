"use client";

import Link from "next/link";
import { CategoryStrip } from "@/components/menu/category-strip";
import { ProductGrid } from "@/components/menu/product-grid";
import { FoodImage } from "@/components/menu/food-image";
import type { Category, Product } from "@/lib/menu/types";
import { copy } from "@/lib/i18n";
import { useLanguage } from "@/features/i18n/language-provider";

export function HomeScreen({ categories, combos, popular }: { categories: Category[]; combos: Product[]; popular: Product[] }) {
  const { language } = useLanguage(); const t = copy[language];
  return <>
    <section className="home-hero">
      <div className="home-hero-copy"><p className="eyebrow">DIYOR BURGER</p><h1>{language === "ru" ? <>Сочные бургеры <em>на любой вкус</em></> : <>Бургерҳои болаззат <em>барои ҳар завқ</em></>}</h1><p>{language === "ru" ? "Свежие блюда, доставка и самовывоз — легко заказать онлайн." : "Таомҳои тару тоза, расонидан ва худбурд — фармоиш додан осон аст."}</p><Link className="primary-button" href="/menu">{t.orderNow}<span aria-hidden="true">→</span></Link></div><FoodImage alt="DIYOR BURGER" compact/></section>
    <section className="benefit-row" aria-label="Преимущества"><span><b>↗</b>{t.delivery}</span><span><b>◒</b>{t.fresh}</span><span><b>✓</b>{t.quality}</span><span><b>◉</b>{t.whatsapp}</span></section>
    <section className="section home-categories"><div className="section-heading"><h2>{t.categories}</h2><Link href="/menu">{t.menu} →</Link></div><CategoryStrip categories={categories}/></section>
    <section className="section"><div className="section-heading"><h2>{t.combos}</h2><Link href="/combos">{t.allCombos} →</Link></div>{combos.length?<ProductGrid products={combos}/>:<p className="notice">{language === "ru" ? "Комбо пока не добавлены." : "Комбо ҳоло илова нашудааст."}</p>}</section>
    <section className="section"><div className="section-heading"><h2>{t.popular}</h2><Link href="/menu?sort=popular">{t.allDishes} →</Link></div>{popular.length?<ProductGrid products={popular}/>:<p className="notice">{language === "ru" ? "Блюда временно недоступны." : "Таомҳо муваққатан дастрас нестанд."}</p>}</section>
    <section className="brand-banner"><span className="banner-kicker">DIYOR BURGER</span><strong>{language === "ru" ? "Вкусный выбор на каждый день" : "Интихоби болаззат барои ҳар рӯз"}</strong></section>
  </>;
}
