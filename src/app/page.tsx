import { HomeScreen } from "@/components/home-screen";
import { getActiveCategories, getActiveCombos, getPopularProducts, getPublicRestaurantSettings } from "@/lib/menu/catalog";
export default async function Home() { const [categories,combos,popular,settings]=await Promise.all([getActiveCategories(),getActiveCombos(),getPopularProducts(),getPublicRestaurantSettings()]); return <HomeScreen categories={categories.data??[]} combos={combos??[]} popular={popular??[]} settings={settings.data??undefined}/>; }
