import { ProductGrid } from "@/components/menu/product-grid";
import { getActiveCombos } from "@/lib/menu/catalog";
import "@/features/public/public-pages.css";
export default async function CombosPage() { const combos=await getActiveCombos(); return <section className="section combos-reference"><div className="section-heading"><div><h1>Все комбо</h1><p>Вкуснее вместе! Выгодные комбо на любой вкус.</p></div></div><nav className="filter-row" aria-label="Категории комбо"><a className="selected" href="#all">Все комбо</a><a href="#burgers">Бургеры</a><a href="#hotdogs">Хот-доги</a><a href="#rolls">Роллы</a><a href="#pizza">Пицца</a></nav>{combos?<div className="combo-reference-grid"><ProductGrid products={combos}/></div>:<p className="notice">Комбо временно недоступны.</p>}</section>; }
