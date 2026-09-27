import { ComboCatalog } from "@/components/menu/combo-catalog";
import { getActiveCombos } from "@/lib/menu/catalog";
import "@/features/public/public-pages.css";
export default async function CombosPage() { const combos=await getActiveCombos(); return <section className="section combos-reference"><div className="section-heading"><div><h1>Все комбо</h1><p>Вкуснее вместе! Выгодные комбо на любой вкус.</p></div></div>{combos?<ComboCatalog combos={combos}/>:<p className="notice">Комбо временно недоступны.</p>}</section>; }
