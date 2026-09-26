import { getCheckoutRestaurantSettings, getPublicRestaurantSettings } from "@/lib/menu/catalog";
import { DiyorIcon, type DiyorIconName } from "@/components/diyor-icon";
import { FoodImage } from "@/components/menu/food-image";
import "@/features/public/public-pages.css";
function ContactIcon({ name, tone = "brown" }: { name: DiyorIconName; tone?: "brown" | "green" | "instagram" }) { return <span className={`contact-icon contact-icon-${tone}`}><DiyorIcon name={name}/></span>; }

export default async function ContactsPage() {
  const [settings, checkoutSettings] = await Promise.all([getPublicRestaurantSettings(), getCheckoutRestaurantSettings()]);
  if (!settings.data) return <section className="section"><h1>Контакты</h1><p className="notice">Контакты временно недоступны.</p></section>;
  const s = settings.data;
  const whatsapp = checkoutSettings.data?.whatsapp;
  return <section className="section contacts-page">
    <h1 className="contacts-title">Контакты</h1>
    <div className="page-hero"><span className="hero-script">Вкуснее рядом</span><h1>Всегда <em>на связи!</em></h1><p>Заказывайте быстро и удобно.</p><FoodImage compact src="/images/hero-burger-v1.png" alt="Бургер DIYOR BURGER"/></div>
    <div className="contact-list">
      {s.contactPhone1 && <article className="contact-card"><ContactIcon name="phone"/><div><b>Телефон</b><span>{s.contactPhone1}</span></div><a href={`tel:${s.contactPhone1}`}>Позвонить</a></article>}
      {s.contactPhone2 && <article className="contact-card"><ContactIcon name="phone"/><div><b>Телефон</b><span>{s.contactPhone2}</span></div><a href={`tel:${s.contactPhone2}`}>Позвонить</a></article>}
      {whatsapp && <article className="contact-card"><ContactIcon name="whatsapp" tone="green"/><div><b>WhatsApp</b><span>Быстрые ответы</span></div><a target="_blank" rel="noreferrer" href={`https://wa.me/${whatsapp}`}>Написать</a></article>}
      {s.instagramUrl && <article className="contact-card"><ContactIcon name="instagram" tone="instagram"/><div><b>Instagram</b><span>Официальный профиль</span></div><a target="_blank" rel="noreferrer" href={s.instagramUrl}>Открыть</a></article>}
      <article className="contact-card"><ContactIcon name="location-pin"/><div><b>Адрес</b><span>{s.mainAddress}</span></div>{s.mapUrl && <a target="_blank" rel="noreferrer" href={s.mapUrl}>Маршрут</a>}</article>
      {s.workOpenTime && s.workCloseTime && <article className="contact-card"><ContactIcon name="clock"/><div><b>Время работы</b><span>Ежедневно {s.workOpenTime}–{s.workCloseTime}</span></div></article>}
    </div>
    {s.mapUrl && <section className="contacts-map"><p><b>DIYOR BURGER</b><br/>Откройте карту, чтобы построить маршрут до ресторана.</p><a className="cta" target="_blank" rel="noreferrer" href={s.mapUrl}>Открыть на карте</a></section>}
    <aside className="favorites-tip"><b aria-hidden="true">◖</b><span><strong>Нужна помощь?</strong><br/>Наша команда всегда рядом и готова ответить на ваши вопросы.</span></aside>
  </section>;
}
