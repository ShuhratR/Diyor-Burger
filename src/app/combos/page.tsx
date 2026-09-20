import { ProductGrid } from "@/components/menu/product-grid";
import { getActiveCombos } from "@/lib/menu/catalog";
export default async function CombosPage() { const combos=await getActiveCombos(); return <section className="section"><h1>Все комбо</h1>{combos?<ProductGrid products={combos}/>:<p className="notice">Комбо временно недоступны.</p>}</section>; }
