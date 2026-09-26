import { CategoryStrip } from "@/components/menu/category-strip";
import { ProductGrid } from "@/components/menu/product-grid";
import { getActiveCategories, getActiveProducts } from "@/lib/menu/catalog";
import "@/features/public/public-pages.css";
export default async function MenuPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}) { const params=await searchParams; const [categories,products]=await Promise.all([getActiveCategories(),getActiveProducts({sort:params.sort as "popular"|"price_asc"|"price_desc"|"name"|undefined})]); return <section className="section menu-reference"><div className="menu-heading"><h1>Меню</h1><p>Вкусная еда для любого настроения!</p></div>{categories.data&&<CategoryStrip categories={categories.data}/>} {products.data?<ProductGrid products={products.data}/>:<p className="notice">Меню временно недоступно. Повторите попытку позже.</p>}</section>; }
