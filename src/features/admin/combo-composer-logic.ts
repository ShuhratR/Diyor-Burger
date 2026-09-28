export type ComboDraftItem = {
  key: string;
  productId: string | null;
  name: string;
  quantity: number;
};

export type ComboProductChoice = { id: string; name: string; nameTj?: string | null };

export function normalizeSearch(input: string): string {
  return input.normalize("NFKC").trim().toLocaleLowerCase("ru");
}

export function findComboProducts<T extends ComboProductChoice>(
  products: T[],
  query: string,
  limit = 8,
): T[] {
  const normalized = normalizeSearch(query);
  if (!normalized) return [];
  return products.filter(product =>
    normalizeSearch(product.name).includes(normalized) ||
    normalizeSearch(product.nameTj ?? "").includes(normalized)
  ).slice(0, limit);
}

export function moveComboItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= items.length) return items;
  const result = [...items];
  [result[index], result[nextIndex]] = [result[nextIndex], result[index]];
  return result;
}

export function serializeComboItems(items: ComboDraftItem[]) {
  return items.map(item => ({
    productId: item.productId,
    name: item.name.trim(),
    quantity: item.quantity,
  }));
}
