import Link from "next/link";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminShell } from "@/features/admin/admin-shell";
import { getActiveCategories, getActiveProducts, getActiveDeliveryZones, getPublicRestaurantSettings, getCheckoutRestaurantSettings } from "@/lib/menu/catalog";
import { dashboard } from "@/lib/admin/dashboard";

const sections = [
  ["/admin/products", "Блюда", "Цены, фото, наличие и описание", "🍔"],
  ["/admin/combos", "Комбо", "Состав и выгодные наборы", "🍟"],
  ["/admin/banners", "Главный экран", "Баннеры и фотографии", "✦"],
  ["/admin/categories", "Категории", "Разделы каталога", "▦"],
  ["/admin/delivery", "Доставка", "Зоны и стоимость", "⌁"],
  ["/admin/settings", "Ресторан", "Логотип, контакты и самовывоз", "⚙"],
] as const;

export default async function AdminPage() {
  await requireAdmin();
  const [products, categories, zones, settings, privateSettings] = await Promise.all([getActiveProducts(), getActiveCategories(), getActiveDeliveryZones(), getPublicRestaurantSettings(), getCheckoutRestaurantSettings()]);
  if (!products.data || !categories.data || !zones.data || !settings.data || !privateSettings.data) return <AdminShell title="Главная"><section className="admin-card"><h2>Данные временно недоступны</h2><p>Обновите страницу или проверьте подключение к базе.</p></section></AdminShell>;
  const state = dashboard(products.data, categories.data, zones.data, { ...settings.data, orderWhatsApp: privateSettings.data.whatsapp });
  const metrics = [["Блюда", state.metrics.products], ["Комбо", state.metrics.combos], ["Категории", state.metrics.categories], ["Зоны", state.metrics.zones]];
  return <AdminShell title="Главная"><section className="admin-home"><div className="admin-home-hero"><p>DIYOR BURGER · УПРАВЛЕНИЕ</p><h2>Что хотите изменить?</h2><span>Выберите раздел — все изменения сразу попадут к клиентам после сохранения.</span><Link href="/admin/products">＋ Добавить блюдо</Link></div><div className="admin-metrics">{metrics.map(([label,value])=><div key={label}><b>{value}</b><span>{label}</span></div>)}</div>{state.warnings.length>0&&<section className="admin-attention"><b>Требует внимания</b>{state.warnings.map((warning)=><span key={warning}>{warning}</span>)}</section>}<div className="admin-section-grid">{sections.map(([href,title,description,icon])=><Link href={href} key={href}><i aria-hidden="true">{icon}</i><div><b>{title}</b><span>{description}</span></div><em>→</em></Link>)}</div></section></AdminShell>;
}
