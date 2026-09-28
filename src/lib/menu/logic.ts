import type { Category, Product, ProductFilters } from "./types";
export function activeProducts(products: Product[]) { return products.filter((product) => product.isActive); }
export function productDisplayPrice(product: Product) { const variants = product.variants?.filter((variant) => variant.isActive && variant.isAvailable !== false).sort((a,b) => a.sortOrder-b.sortOrder) ?? []; return product.productType === "PIZZA" ? variants[0]?.priceDiram : product.basePriceDiram; }
/** An old price on a pizza card belongs to the same size whose selling price is displayed. */
export function productDisplayOldPrice(product: Product): number | undefined {
  const price = productDisplayPrice(product);
  if (price == null) return undefined;
  const oldPrice = product.productType === "PIZZA"
    ? activeVariants(product)[0]?.oldPriceDiram
    : product.oldPriceDiram;
  return oldPrice != null && oldPrice > price ? oldPrice : undefined;
}
export function filterProducts(products: Product[], filters: ProductFilters = {}) { let result = activeProducts(products); if (filters.category) result = result.filter((p) => p.categoryId === filters.category); if (filters.pizzaSize) result = result.filter((p) => p.productType === "PIZZA" && p.variants?.some((variant) => variant.isActive && variant.isAvailable !== false && variant.name === filters.pizzaSize)); result = result.filter((p) => { const price = productDisplayPrice(p); return price !== undefined && (filters.minPriceDiram === undefined || price >= filters.minPriceDiram) && (filters.maxPriceDiram === undefined || price <= filters.maxPriceDiram); }); return result.sort((a,b) => { if (filters.sort === "popular") return Number(b.isPopular)-Number(a.isPopular) || a.sortOrder-b.sortOrder; if (filters.sort === "price_asc") return (productDisplayPrice(a) ?? 0)-(productDisplayPrice(b) ?? 0); if (filters.sort === "price_desc") return (productDisplayPrice(b) ?? 0)-(productDisplayPrice(a) ?? 0); if (filters.sort === "name") return a.name.localeCompare(b.name,"ru"); return a.sortOrder-b.sortOrder; }); }
/** Search also matches category names: typing "пицца" returns every pizza,
 * including dishes named only "Американская" or "С грибами". */
export function normalizeCatalogSearch(value: string) {
  return value.trim().toLocaleLowerCase("ru").replace(/ё/g, "е").replace(/пицц[а-я]*/g, "пицц");
}
export function searchMatches(products: Product[], term: string, categories: Category[] = []) {
  const query = normalizeCatalogSearch(term);
  if (!query) return [];
  const categoryById = new Map(categories.map(category => [category.id, category]));
  return activeProducts(products).filter(product => {
    const category = categoryById.get(product.categoryId);
    const haystack = [
      product.name, product.nameTj, product.description, product.descriptionTj,
      product.ingredientsText, product.ingredientsTextTj, product.slug,
      category?.name, category?.nameTj, category?.slug,
      product.productType === "PIZZA" ? "пицца пиццы pizza" : "",
      product.productType === "COMBO" ? "комбо набор combo" : "",
      ...(product.comboComponents ?? []).flatMap(component =>
        [component.name, component.nameTj, component.description, component.descriptionTj]),
    ].filter(Boolean).join(" ");
    return normalizeCatalogSearch(haystack).includes(query);
  });
}
export function activeVariants(product: Product) { return [...(product.variants ?? [])].filter((v) => v.isActive && v.isAvailable !== false).sort((a,b) => a.sortOrder-b.sortOrder); }
export function sortedComboComponents(product: Product) { return [...(product.comboComponents ?? [])].sort((a,b) => a.sortOrder-b.sortOrder); }
