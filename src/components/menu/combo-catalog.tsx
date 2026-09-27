"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/menu/types";
import { ProductGrid } from "./product-grid";

const filters = [
  { id: "all", label: "Все комбо", match: /.*/ },
  { id: "burgers", label: "Бургеры", match: /бургер/i },
  { id: "hotdogs", label: "Хот-доги", match: /хот[- ]?дог/i },
  { id: "rolls", label: "Роллы", match: /ролл|буррит/i },
  { id: "pizza", label: "Пицца", match: /пицц/i },
] as const;

export function ComboCatalog({ combos }: { combos: Product[] }) {
  const [active, setActive] = useState<(typeof filters)[number]["id"]>("all");
  const visible = useMemo(() => {
    const filter = filters.find((item) => item.id === active) ?? filters[0];
    if (filter.id === "all") return combos;
    return combos.filter((combo) => {
      const text = [combo.name, combo.description, ...(combo.comboComponents ?? []).flatMap((item) => [item.name, item.description ?? ""])].join(" ");
      return filter.match.test(text);
    });
  }, [active, combos]);

  return <>
    <div className="combo-filter" role="tablist" aria-label="Категории комбо">
      {filters.map((filter) => <button key={filter.id} type="button" role="tab" aria-selected={active === filter.id} className={active === filter.id ? "selected" : ""} onClick={() => setActive(filter.id)}>{filter.label}</button>)}
    </div>
    {visible.length ? <div className="combo-reference-grid"><ProductGrid products={visible} /></div> : <div className="combo-empty" role="status"><b>Пока нет комбо в этой категории</b><span>Выберите «Все комбо» или загляните чуть позже.</span></div>}
  </>;
}
