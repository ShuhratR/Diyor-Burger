import { HomeScreen } from "@/components/home-screen";
import {
  getActiveBanners,
  getActiveCategories,
  getActiveCombos,
  getPopularProducts,
  getPublicRestaurantSettings,
} from "@/lib/menu/catalog";
export default async function Home() {
  const [categories, combos, popular, settings, banners] = await Promise.all([
    getActiveCategories(),
    getActiveCombos(),
    getPopularProducts(),
    getPublicRestaurantSettings(),
    getActiveBanners(),
  ]);
  return (
    <HomeScreen
      categories={categories.data ?? []}
      combos={combos ?? []}
      popular={popular ?? []}
      settings={settings.data ?? undefined}
      banners={banners.data ?? []}
    />
  );
}
