import { SearchExperience } from "@/components/menu/search-experience";
import { getActiveCategories, getActiveProducts } from "@/lib/menu/catalog";
import { filterProducts, searchMatches } from "@/lib/menu/logic";
import type { ProductFilters } from "@/lib/menu/types";

type SearchParams = { q?: string; category?: string; min?: string; max?: string; size?: string; sort?: ProductFilters["sort"] };
function diramParam(value?: string) { const parsed = Number(value); return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : undefined; }

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const query = params.q ?? "";
  const [categoriesState, allProductsState] = await Promise.all([getActiveCategories(), getActiveProducts()]);
  const category = categoriesState.data?.find((item) => item.slug === params.category);
  const filters: ProductFilters = { category: category?.id, minPriceDiram: diramParam(params.min), maxPriceDiram: diramParam(params.max), pizzaSize: params.size, sort: params.sort };
  const filtersActive = Boolean(params.category || filters.minPriceDiram !== undefined || filters.maxPriceDiram !== undefined || filters.pizzaSize || filters.sort);
  // Filter the already loaded catalogue; search and suggestions share one snapshot.
  const resultsState = query.trim() || filtersActive
    ? { data: allProductsState.data
      ? filterProducts(query.trim()
        ? searchMatches(allProductsState.data, query, categoriesState.data ?? [])
        : allProductsState.data, filters)
      : null }
    : null;

  return <SearchExperience initialQuery={query} results={resultsState?.data ?? null} suggestions={allProductsState.data ?? []} categories={categoriesState.data ?? []} filters={{ category: params.category, minPriceDiram: filters.minPriceDiram, maxPriceDiram: filters.maxPriceDiram, pizzaSize: filters.pizzaSize, sort: filters.sort }} filtersActive={filtersActive}/>;
}
