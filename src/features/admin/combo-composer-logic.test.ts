import { describe, expect, it } from "vitest";
import {
  findComboProducts, moveComboItem, normalizeSearch, serializeComboItems,
  type ComboDraftItem,
} from "./combo-composer-logic";

const products = [
  { id: "burger", name: "Гамбургер", nameTj: "Ҳамбургер" },
  { id: "fries", name: "Картофель фри", nameTj: "Картошкаи фри" },
  { id: "cola", name: "Coca-Cola 0.4", nameTj: null },
];

describe("searchable combo composition", () => {
  it("finds a catalog product by a substring and Tajik name", () => {
    expect(findComboProducts(products, "гам").map(p => p.id)).toEqual(["burger"]);
    expect(findComboProducts(products, "ФРИ").map(p => p.id)).toEqual(["fries"]);
    expect(findComboProducts(products, "coca").map(p => p.id)).toEqual(["cola"]);
    expect(findComboProducts(products, "Ҳам").map(p => p.id)).toEqual(["burger"]);
    expect(normalizeSearch(" Coca-Cola ")).toBe("coca-cola");
  });
  it("does not offer every item on an empty search", () => {
    expect(findComboProducts(products, "")).toEqual([]);
  });
  it("moves selected items without changing their identity or quantity", () => {
    const draft: ComboDraftItem[] = [
      { key: "1", productId: "burger", name: "Гамбургер", quantity: 1 },
      { key: "2", productId: null, name: "Соус фирменный", quantity: 2 },
      { key: "3", productId: "cola", name: "Coca-Cola 0.4", quantity: 1 },
    ];
    expect(moveComboItem(draft, 2, -1).map(x => x.key)).toEqual(["1", "3", "2"]);
    expect(moveComboItem(draft, 0, -1)).toBe(draft);
    expect(draft.map(x => x.key)).toEqual(["1", "2", "3"]);
  });
  it("serializes existing choices and custom names in displayed order", () => {
    const draft: ComboDraftItem[] = [
      { key: "a", productId: "burger", name: "Гамбургер", quantity: 1 },
      { key: "b", productId: null, name: "  Соус фирменный  ", quantity: 2 },
      { key: "c", productId: "cola", name: "Coca-Cola 0.4", quantity: 1 },
    ];
    expect(serializeComboItems(draft)).toEqual([
      { productId: "burger", name: "Гамбургер", quantity: 1 },
      { productId: null, name: "Соус фирменный", quantity: 2 },
      { productId: "cola", name: "Coca-Cola 0.4", quantity: 1 },
    ]);
  });
});
