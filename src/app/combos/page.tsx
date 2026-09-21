import { ProductGrid } from "@/components/menu/product-grid";
import { getActiveCombos } from "@/lib/menu/catalog";
import "@/features/public/public-pages.css";
export default async function CombosPage() { const combos=await getActiveCombos(); return <section className="section"><div className="page-hero"><h1>Все комбо</h1><p>Вкуснее вместе: выгодные сочетания на любой вкус.</p></div>{combos?<ProductGrid products={combos}/>:<p className="notice">Комбо временно недоступны.</p>}</section>; }
