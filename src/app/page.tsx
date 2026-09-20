import { HomeScreen } from "@/components/home-screen";
import { getActiveCategories, getActiveCombos, getPopularProducts } from "@/lib/menu/catalog";
export default async function Home() { const [categories,combos,popular]=await Promise.all([getActiveCategories(),getActiveCombos(),getPopularProducts()]); return <HomeScreen categories={categories.data??[]} combos={combos??[]} popular={popular??[]}/>; }
