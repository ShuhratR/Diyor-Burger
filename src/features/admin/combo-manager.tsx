"use client";

import { useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { useAdminSave } from "./admin-submit";
import { archiveCombo, saveCombo } from "./combo-actions";
import { AdminImageInput } from "./admin-image-input";
import {
  findComboProducts, moveComboItem, normalizeSearch, serializeComboItems,
  type ComboDraftItem, type ComboProductChoice,
} from "./combo-composer-logic";
import "./admin-manager.css";
import "./combo-composer.css";

type Category = { id: string; name: string };
type ProductChoice = ComboProductChoice & { productType: string };
export type AdminCombo = {
  id: string;
  categoryId: string;
  name: string;
  nameTj?: string | null;
  slug: string;
  description: string;
  descriptionTj?: string | null;
  basePriceDiram: number;
  oldPriceDiram?: number | null;
  imageUrl?: string | null;
  sortOrder: number;
  isAvailable: boolean;
  isActive: boolean;
  isPopular: boolean;
  components: {
    id: string;
    componentProductId: string | null;
    name: string;
    quantity: number;
    sortOrder: number;
  }[];
};

function Pencil() {
  return <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5ZM14 6.5l3.5 3.5" />
  </svg>;
}

function ComboComposer({
  rows, setRows, products, customNames,
}: {
  rows: ComboDraftItem[];
  setRows: Dispatch<SetStateAction<ComboDraftItem[]>>;
  products: ProductChoice[];
  customNames: string[];
}) {
  const [activeSearch, setActiveSearch] = useState<string | null>(null);
  const patch = (key: string, change: Partial<ComboDraftItem>) =>
    setRows(current => current.map(row => row.key === key ? { ...row, ...change } : row));

  return <section className="combo-composer" aria-label="Состав комбо">
    <div className="combo-composer-title">
      <div>
        <span>СОСТАВ НАБОРА</span>
        <h3>Что входит в комбо</h3>
        <p>Найдите блюдо или введите своё название. Порядок строк будет виден клиентам.</p>
      </div>
      <strong>{rows.length}/30</strong>
    </div>
    <div className="combo-composer-items">
      {rows.map((row, index) => {
        const query = normalizeSearch(row.name);
        const found = activeSearch === row.key && query ? findComboProducts(products, query) : [];
        const custom = activeSearch === row.key && query
          ? customNames.filter(name => normalizeSearch(name).includes(query)
              && !products.some(product => normalizeSearch(product.name) === normalizeSearch(name)))
              .slice(0, 4)
          : [];
        return <div className="combo-composer-item" key={row.key}>
          <div className="combo-composer-number" aria-label={"Позиция " + (index + 1)}>{index + 1}</div>
          <div className="combo-composer-fields">
            <div className="combo-search-wrap">
              <label>
                Название продукта
                <input
                  type="search"
                  value={row.name}
                  required
                  maxLength={120}
                  autoComplete="off"
                  placeholder="Например, гамбургер, фри, Coca-Cola…"
                  aria-label={"Название позиции " + (index + 1)}
                  aria-expanded={activeSearch === row.key && (found.length > 0 || custom.length > 0)}
                  onFocus={() => setActiveSearch(row.key)}
                  onChange={event => {
                    patch(row.key, { name: event.target.value, productId: null });
                    setActiveSearch(row.key);
                  }}
                />
              </label>
              {activeSearch === row.key && query && (
                <div className="combo-search-options" role="group" aria-label="Результаты поиска">
                  {found.map(product =>
                    <button
                      type="button"
                      className="combo-search-choice"
                      key={product.id}
                      onClick={() => {
                        patch(row.key, { productId: product.id, name: product.name });
                        setActiveSearch(null);
                      }}
                    >
                      <span>{product.name}</span>
                      <small>{product.productType === "PIZZA" ? "Пицца" : "Блюдо из меню"}</small>
                    </button>
                  )}
                  {custom.map(name =>
                    <button
                      type="button"
                      className="combo-search-choice"
                      key={name}
                      onClick={() => {
                        patch(row.key, { productId: null, name });
                        setActiveSearch(null);
                      }}
                    ><span>{name}</span><small>Ранее добавляли вручную</small></button>
                  )}
                  <button
                    type="button"
                    className="combo-search-custom"
                    onClick={() => {
                      patch(row.key, { productId: null, name: row.name.trim() });
                      setActiveSearch(null);
                    }}
                  >＋ Использовать название «{row.name.trim()}»</button>
                </div>
              )}
              <small className="combo-item-kind">
                {row.productId ? "✓ Выбран существующий товар" :
                  row.name.trim() ? "Если совпадения нет — сохранится как позиция комбо" :
                    "Можно выбрать товар или вписать новый"}
              </small>
            </div>
            <label className="combo-quantity">
              Количество
              <input
                type="number"
                min={1}
                max={99}
                step={1}
                required
                value={row.quantity}
                aria-label={"Количество позиции " + (index + 1)}
                onChange={event => patch(row.key, { quantity: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="combo-composer-controls">
            <button type="button" title="Переместить выше" aria-label={"Поднять позицию " + (index + 1)}
              disabled={index === 0} onClick={() => setRows(current => moveComboItem(current, index, -1))}>↑</button>
            <button type="button" title="Переместить ниже" aria-label={"Опустить позицию " + (index + 1)}
              disabled={index === rows.length - 1} onClick={() => setRows(current => moveComboItem(current, index, 1))}>↓</button>
            <button type="button" className="combo-remove" title="Удалить из состава"
              aria-label={"Убрать позицию " + (index + 1)}
              onClick={() => {
                setRows(current => current.filter(item => item.key !== row.key));
                if (activeSearch === row.key) setActiveSearch(null);
              }}>×</button>
          </div>
        </div>;
      })}
    </div>
    <button
      type="button"
      className="combo-add-item"
      disabled={rows.length >= 30}
      onClick={() => {
        const key = "draft-" + crypto.randomUUID();
        setRows(current => [...current, { key, productId: null, name: "", quantity: 1 }]);
        setActiveSearch(key);
      }}
    >＋ Добавить позицию</button>
    {rows.length === 0 && <p className="combo-empty-warning" role="status">Добавьте хотя бы одну позицию в набор.</p>}
    <p className="combo-composer-note">Состав сохранится вместе с комбо одной кнопкой ниже. Отдельных сохранений не требуется.</p>
  </section>;
}

function ComboForm({
  combo, categories, products, customNames, close,
}: {
  combo?: AdminCombo;
  categories: Category[];
  products: ProductChoice[];
  customNames: string[];
  close: () => void;
}) {
  const router = useRouter();
  const [rows, setRows] = useState<ComboDraftItem[]>(() =>
    combo?.components.length
      ? combo.components.map(component => ({
          key: component.id,
          productId: component.componentProductId,
          name: component.name,
          quantity: component.quantity,
        }))
      : [{ key: "new-0", productId: null, name: "", quantity: 1 }],
  );
  const { submit, pending, error } = useAdminSave({
    action: saveCombo,
    onSuccess: () => { close(); router.refresh(); },
    successTitle: combo ? "Комбо и состав обновлены" : "Комбо с составом добавлено",
    errorTitle: "Не удалось сохранить комбо",
  });

  return <form action={submit} aria-busy={pending} className="admin-form admin-editor combo-editor-form">
    {combo && <input name="id" type="hidden" value={combo.id} />}
    <div className="admin-form-grid">
      <label>Категория
        <select name="categoryId" required defaultValue={combo?.categoryId ?? categories[0]?.id}>
          {categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </label>
      <label>Название RU
        <input name="name" required maxLength={120} defaultValue={combo?.name ?? ""} />
      </label>
      <label>Цена, сомони
        <input name="price" required inputMode="decimal" defaultValue={combo ? String(combo.basePriceDiram / 100) : ""} />
      </label>
      <label>Старая цена, сомони (необязательно)
        <input name="oldPrice" inputMode="decimal" placeholder="Без скидки"
          defaultValue={combo?.oldPriceDiram != null ? String(combo.oldPriceDiram / 100) : ""} />
      </label>
      <label>Порядок
        <input name="sortOrder" type="number" min="0" max="9999" defaultValue={combo?.sortOrder ?? 0} />
      </label>
    </div>
    <label>Описание RU
      <textarea name="description" maxLength={1000} defaultValue={combo?.description ?? ""} />
    </label>
    <details className="admin-more">
      <summary>Дополнительные поля</summary>
      <label>Название TJ<input name="nameTj" maxLength={120} defaultValue={combo?.nameTj ?? ""} /></label>
      <label>Описание TJ<textarea name="descriptionTj" maxLength={1000} defaultValue={combo?.descriptionTj ?? ""} /></label>
      <label>Slug<input name="slug" pattern="[a-z0-9-]+" defaultValue={combo?.slug ?? ""} placeholder="Создаётся автоматически" /></label>
    </details>
    <AdminImageInput prefix="combos" defaultValue={combo?.imageUrl ?? ""} />
    <div className="admin-switches">
      <label><input name="isAvailable" type="checkbox" defaultChecked={combo?.isAvailable ?? true} /> В наличии</label>
      <label><input name="isActive" type="checkbox" defaultChecked={combo?.isActive ?? true} /> Показывать клиентам</label>
      <label><input name="isPopular" type="checkbox" defaultChecked={combo?.isPopular ?? false} /> Популярное</label>
    </div>
    <ComboComposer rows={rows} setRows={setRows} products={products} customNames={customNames} />
    <input type="hidden" name="components" value={JSON.stringify(serializeComboItems(rows))} />
    {error && <p className="admin-form-error" role="alert">{error}</p>}
    <button type="submit" className="admin-save combo-save-all" disabled={pending || rows.length === 0}>
      {pending ? "Сохраняем комбо и состав…" : combo ? "✓ Сохранить комбо и весь состав" : "✓ Добавить комбо с составом"}
    </button>
  </form>;
}

export function ComboManager({
  combos, categories, products, customNames,
}: {
  combos: AdminCombo[];
  categories: Category[];
  products: ProductChoice[];
  customNames: string[];
}) {
  const [current, setCurrent] = useState<AdminCombo | "new" | null>(null);
  const close = () => setCurrent(null);
  return <section className="admin-workspace">
    <header className="admin-workspace-head">
      <div>
        <p>ВЫГОДНЫЕ НАБОРЫ</p>
        <h2>Комбо</h2>
        <span>Добавляйте, ищите и переставляйте позиции прямо при создании комбо.</span>
      </div>
      <button className="admin-add" type="button" onClick={() => setCurrent("new")}>＋ Добавить комбо</button>
    </header>
    <div className="admin-product-grid">
      {combos.map(combo => <article className="admin-product-card" key={combo.id}>
        <div className="admin-product-image">
          {combo.imageUrl ? <img src={combo.imageUrl} alt="" /> : <b>DIYOR<br />BURGER</b>}
          <button type="button" aria-label={"Изменить " + combo.name} onClick={() => setCurrent(combo)}><Pencil /></button>
        </div>
        <div>
          <span>КОМБО</span>
          <em className={combo.isAvailable ? "ok" : "off"}>{combo.isAvailable ? "В наличии" : "Нет в наличии"}</em>
          <h3>{combo.name}</h3>
          <p>{combo.components.map(item => item.name + " × " + item.quantity).join(" · ") || "Состав пока не добавлен"}</p>
          <strong>{combo.basePriceDiram / 100} сом</strong>
          {combo.oldPriceDiram != null && combo.oldPriceDiram > combo.basePriceDiram &&
            <del>{combo.oldPriceDiram / 100} сом</del>}
        </div>
      </article>)}
    </div>
    {current && <div className="admin-editor-backdrop"
      onMouseDown={event => { if (event.target === event.currentTarget) close(); }}>
      <section className="admin-editor-sheet" role="dialog" aria-modal="true">
        <header>
          <div>
            <p>{current === "new" ? "НОВОЕ КОМБО" : "РЕДАКТИРОВАНИЕ"}</p>
            <h2>{current === "new" ? "Добавить комбо" : current.name}</h2>
          </div>
          <button type="button" aria-label="Закрыть" onClick={close}>×</button>
        </header>
        <ComboForm
          key={current === "new" ? "new" : current.id}
          combo={current === "new" ? undefined : current}
          categories={categories}
          products={products}
          customNames={customNames}
          close={close}
        />
        {current !== "new" && <footer>
          <form action={archiveCombo}>
            <input type="hidden" name="id" value={current.id} />
            <button className="danger">Архивировать</button>
          </form>
        </footer>}
      </section>
    </div>}
  </section>;
}
