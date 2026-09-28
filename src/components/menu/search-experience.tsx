"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiyorIcon, type DiyorIconName } from "@/components/diyor-icon";
import { FoodImage } from "./food-image";
import { BrandLogo } from "@/components/brand-logo";
import { ProductGrid } from "./product-grid";
import type { Category, Product } from "@/lib/menu/types";
import { formatSomoni } from "@/lib/money";
import { searchMatches } from "@/lib/menu/logic";
import "./search-price-inputs.css";

type SearchFilterState = { category?: string; minPriceDiram?: number; maxPriceDiram?: number; pizzaSize?: string; sort?: "popular" | "price_asc" | "price_desc" | "name" };
type SearchExperienceProps = { initialQuery: string; results: Product[] | null; suggestions: Product[]; categories: Category[]; filters: SearchFilterState; filtersActive: boolean };
const categoryIcons: Record<string, DiyorIconName> = { burgers: "category-burger", hotdogs: "category-hotdog", rolls: "category-roll", pizza: "category-pizza", sides: "category-fries", drinks: "category-drink", combos: "category-combo" };

function resultHref(query: string, filters: SearchFilterState) {
  const params = new URLSearchParams();
  if (query.trim()) params.set("q", query.trim());
  if (filters.category) params.set("category", filters.category);
  if (filters.minPriceDiram !== undefined) params.set("min", String(filters.minPriceDiram));
  if (filters.maxPriceDiram !== undefined) params.set("max", String(filters.maxPriceDiram));
  if (filters.pizzaSize) params.set("size", filters.pizzaSize);
  if (filters.sort) params.set("sort", filters.sort);
  const serialized = params.toString();
  return serialized ? `/search?${serialized}` : "/search";
}

export function SearchExperience({ initialQuery, results, suggestions, categories, filters, filtersActive }: SearchExperienceProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState<SearchFilterState>(filters);
  const maxCatalogPrice = useMemo(() => Math.max(0, ...suggestions.map((product) => Math.max(product.basePriceDiram ?? 0, ...(product.variants?.map((variant) => variant.priceDiram) ?? [])))), [suggestions]);
  const pizzaSizes = useMemo(() => [...new Set(suggestions.filter((product) => product.productType === "PIZZA").flatMap((product) => product.variants?.filter((variant) => variant.isActive && variant.isAvailable !== false).map((variant) => variant.name) ?? []))], [suggestions]);
  const visibleSuggestions = useMemo(() => searchMatches(suggestions, query, categories).slice(0, 5), [query, suggestions, categories]);
  const hasResults = Boolean(initialQuery || filtersActive);
  useEffect(() => { document.documentElement.dataset.searchFiltersOpen = filtersOpen ? "true" : ""; return () => { delete document.documentElement.dataset.searchFiltersOpen; }; }, [filtersOpen]);
  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);
  useEffect(() => {
    if (filtersOpen || query.trim() === initialQuery.trim()) return;
    const timer = window.setTimeout(() => {
      router.replace(resultHref(query, filters), { scroll: false });
    }, 450);
    return () => window.clearTimeout(timer);
  }, [query, initialQuery, filters, filtersOpen, router]);
  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); router.push(resultHref(query, filters)); }
  function applyFilters() {
    if (draft.minPriceDiram !== undefined && draft.maxPriceDiram !== undefined &&
        draft.minPriceDiram > draft.maxPriceDiram) return;
    router.push(resultHref(query, draft));
    setFiltersOpen(false);
  }

  if (filtersOpen) return <section className="section filter-reference" aria-label="Фильтры меню">
    <header className="filter-reference-header"><BrandLogo /><button type="button" onClick={() => setFiltersOpen(false)} aria-label="Закрыть фильтры">×</button></header>
    <div className="reference-hero filter-hero"><h1>Фильтры</h1><p>Найдите именно то, что хочется</p><span className="hero-script">Вкусный выбор всегда рядом!</span><FoodImage compact src="/images/hero-burger-v1.png" alt="Бургер DIYOR BURGER"/></div>
    <section className="filter-block"><h2>Категории</h2><div className="filter-category-grid"><button className={!draft.category ? "selected" : ""} onClick={() => setDraft((value) => ({ ...value, category: undefined, pizzaSize: undefined }))}>Все</button>{categories.map((category) => <button className={draft.category === category.slug ? "selected" : ""} key={category.id} onClick={() => setDraft((value) => ({ ...value, category: category.slug, pizzaSize: category.slug === "pizza" ? value.pizzaSize : undefined }))}><DiyorIcon name={categoryIcons[category.slug] ?? "category-other"}/><span>{category.name}</span></button>)}</div></section>
    <section className="filter-block">
      <div className="filter-block-title">
        <h2>Диапазон цены</h2>
        <span>{formatSomoni(draft.minPriceDiram ?? 0)} – {formatSomoni(draft.maxPriceDiram ?? maxCatalogPrice)}</span>
      </div>
      <div className="filter-price-inputs">
        <label>От, сомони
          <input type="number" min="0" step="1" inputMode="numeric"
            value={draft.minPriceDiram === undefined ? "" : String(draft.minPriceDiram / 100)}
            placeholder="0"
            onChange={event => {
              const raw = event.target.value;
              setDraft(value => ({ ...value, minPriceDiram: raw === "" ? undefined : Math.max(0, Math.round(Number(raw) * 100)) }));
            }}/>
        </label>
        <label>До, сомони
          <input type="number" min="0" step="1" inputMode="numeric"
            value={draft.maxPriceDiram === undefined ? "" : String(draft.maxPriceDiram / 100)}
            placeholder={String(Math.ceil(maxCatalogPrice / 100))}
            onChange={event => {
              const raw = event.target.value;
              setDraft(value => ({ ...value, maxPriceDiram: raw === "" ? undefined : Math.max(0, Math.round(Number(raw) * 100)) }));
            }}/>
        </label>
      </div>
      <div className="filter-ranges">
        <label>От<input type="range" min="0" max={maxCatalogPrice || 100} step="100"
          value={Math.min(draft.minPriceDiram ?? 0, maxCatalogPrice || 100)}
          onChange={event => setDraft(value => ({ ...value, minPriceDiram: Math.min(Number(event.target.value), value.maxPriceDiram ?? maxCatalogPrice) }))}/></label>
        <label>До<input type="range" min="0" max={maxCatalogPrice || 100} step="100"
          value={Math.min(draft.maxPriceDiram ?? (maxCatalogPrice || 100), maxCatalogPrice || 100)}
          onChange={event => setDraft(value => ({ ...value, maxPriceDiram: Math.max(Number(event.target.value), value.minPriceDiram ?? 0) }))}/></label>
      </div>
      {draft.minPriceDiram !== undefined && draft.maxPriceDiram !== undefined && draft.minPriceDiram > draft.maxPriceDiram &&
        <p className="filter-price-warning" role="alert">Минимальная цена не должна превышать максимальную.</p>}
    </section>
    {draft.category === "pizza" && pizzaSizes.length > 0 && <section className="filter-block"><h2>Размер пиццы</h2><div className="pizza-size-filter"><button className={!draft.pizzaSize ? "selected" : ""} type="button" onClick={() => setDraft((value) => ({ ...value, pizzaSize: undefined }))}>Все</button>{pizzaSizes.map((size) => <button className={draft.pizzaSize === size ? "selected" : ""} type="button" key={size} onClick={() => setDraft((value) => ({ ...value, pizzaSize: size }))}>{size}</button>)}</div></section>}
    <section className="filter-block"><h2>Сортировка</h2><div className="filter-sort-list">{([ ["popular", "По популярности"], ["price_asc", "Сначала дешевле"], ["price_desc", "Сначала дороже"], ["name", "По названию"] ] as const).map(([value, label]) => <label key={value}><input type="radio" name="sort" checked={(draft.sort ?? "popular") === value} onChange={() => setDraft((current) => ({ ...current, sort: value }))}/><span>{label}</span></label>)}</div></section>
    <div className="filter-price-actions">
      <button className="filter-reset" type="button" onClick={() => setDraft({})}>Сбросить фильтры</button>
      <button className="cta filter-apply" type="button" onClick={applyFilters}
        disabled={draft.minPriceDiram !== undefined && draft.maxPriceDiram !== undefined && draft.minPriceDiram > draft.maxPriceDiram}>
        Показать результаты <span>→</span>
      </button>
    </div>
  </section>;

  return <section className={`section search-reference ${hasResults ? "search-results" : ""}`}>
    <form className="search-box" onSubmit={submit} role="search"><DiyorIcon name="search" className="search-box-icon"/><input autoFocus={!initialQuery} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти блюдо" aria-label="Поиск по меню" />{query && <button type="button" onClick={() => setQuery("")} aria-label="Очистить поиск"><DiyorIcon name="close-x"/></button>}<button type="button" onClick={() => setFiltersOpen(true)} aria-label="Открыть фильтры"><DiyorIcon name="filter-sliders"/></button></form>
    {!hasResults && <div className="search-suggestions" aria-label="Подсказки поиска">{visibleSuggestions.map((product) => <Link key={product.id} href={resultHref(product.name, filters)}><DiyorIcon name="search"/><b>{product.name}</b><FoodImage compact src={product.imageUrl} alt={product.name}/><i aria-hidden="true">›</i></Link>)}</div>}
    {hasResults && <><div className="search-result-top"><div className="filter-row" aria-label="Категории поиска"><Link className={!filters.category ? "selected" : ""} href={resultHref(query, { ...filters, category: undefined })}>Все</Link>{categories.slice(0, 3).map((category) => <Link className={filters.category === category.slug ? "selected" : ""} key={category.id} href={resultHref(query, { ...filters, category: category.slug })}><DiyorIcon name={categoryIcons[category.slug] ?? "category-other"}/>{category.name}</Link>)}</div></div>{results ? <ProductGrid products={results}/> : <p className="notice">Поиск временно недоступен.</p>}</>}
  </section>;
}
