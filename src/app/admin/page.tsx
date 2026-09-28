import { requireAdmin } from "@/lib/auth/admin";
import {
  getActiveBanners,
  getActiveCategories,
  getActiveCombos,
  getPopularProducts,
  getPublicRestaurantSettings,
  getCheckoutRestaurantSettings,
} from "@/lib/menu/catalog";
import { AdminClientHome } from "@/features/admin/admin-client-home";

export default async function AdminPage() {
  await requireAdmin();
  const [categories, combos, popular, settings, privateSettings, banners] =
    await Promise.all([
      getActiveCategories(),
      getActiveCombos(),
      getPopularProducts(),
      getPublicRestaurantSettings(),
      getCheckoutRestaurantSettings(),
      getActiveBanners(),
    ]);
  if (!settings.data || !privateSettings.data)
    return (
      <p className="notice">Данные временно недоступны. Обновите страницу.</p>
    );
  return (
    <AdminClientHome
      categories={categories.data ?? []}
      combos={combos ?? []}
      popular={popular ?? []}
      banners={banners.data ?? []}
      settings={{ ...settings.data, whatsapp: privateSettings.data.whatsapp }}
    />
  );
}
