"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import {
  archiveProduct,
  saveProduct,
  toggleProductAvailability,
} from "./product-actions";
import { archiveVariant, saveVariant } from "./variant-actions";
import { AdminImageInput } from "./admin-image-input";
import type { AdminCategoryOption, AdminProduct } from "./product-manager";
import "./admin-manager.css";

const Pencil = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="m4 16.5-.8 4.3 4.3-.8L19 8.5 15.5 5 4 16.5ZM14 6.5l3.5 3.5" />
  </svg>
);

function PizzaSizes({ product }: { product: AdminProduct }) {
  const variants = product.variants ?? [];
  return (
    <section className="admin-pizza-sizes" aria-label="Размеры пиццы">
      <div>
        <p>РАЗМЕРЫ И ЦЕНЫ</p>
        <h3>Размеры пиццы</h3>
        <span>Меняются здесь же — без перехода на отдельную страницу.</span>
      </div>
      {variants.map((variant) => (
        <div className="admin-variant-wrap" key={variant.id}>
          <form action={saveVariant} className="admin-variant-row">
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="productId" value={product.id} />
            <label>
              Размер
              <input name="name" defaultValue={variant.name} required />
            </label>
            <label>
              Цена, сомони
              <input
                name="price"
                defaultValue={String(variant.priceDiram / 100)}
                inputMode="decimal"
                required
              />
            </label>
            <label>
              Старая цена
              <input
                name="oldPrice"
                defaultValue={
                  variant.oldPriceDiram
                    ? String(variant.oldPriceDiram / 100)
                    : ""
                }
                inputMode="decimal"
                placeholder="Нет"
              />
            </label>
            <input
              type="hidden"
              name="nameTj"
              value={variant.nameTj ?? variant.name}
            />
            <input type="hidden" name="sortOrder" value={variant.sortOrder} />
            <label className="admin-inline-check">
              <input
                name="isAvailable"
                type="checkbox"
                defaultChecked={variant.isAvailable}
              />{" "}
              В наличии
            </label>
            <label className="admin-inline-check">
              <input
                name="isActive"
                type="checkbox"
                defaultChecked={variant.isActive}
              />{" "}
              Видно
            </label>
            <button
              type="submit"
              aria-label={`Сохранить размер ${variant.name}`}
            >
              ✓
            </button>
          </form>
          <form action={archiveVariant}>
            <input type="hidden" name="id" value={variant.id} />
            <input type="hidden" name="productId" value={product.id} />
            <button
              type="submit"
              className="admin-icon-danger"
              aria-label={`Архивировать размер ${variant.name}`}
            >
              ×
            </button>
          </form>
        </div>
      ))}
      <form
        action={saveVariant}
        className="admin-variant-row admin-variant-new"
      >
        <input type="hidden" name="productId" value={product.id} />
        <input type="hidden" name="nameTj" value="" />
        <input type="hidden" name="sortOrder" value={variants.length} />
        <label>
          Новый размер
          <input name="name" placeholder="Например, 36 см" required />
        </label>
        <label>
          Цена, сомони
          <input name="price" placeholder="0" inputMode="decimal" required />
        </label>
        <label>
          Старая цена
          <input name="oldPrice" placeholder="Нет" inputMode="decimal" />
        </label>
        <label className="admin-inline-check">
          <input name="isAvailable" type="checkbox" defaultChecked /> В наличии
        </label>
        <label className="admin-inline-check">
          <input name="isActive" type="checkbox" defaultChecked /> Видно
        </label>
        <button type="submit">＋ Добавить размер</button>
      </form>
    </section>
  );
}

function Editor({
  product,
  categories,
  onSaved,
}: {
  product?: AdminProduct;
  categories: AdminCategoryOption[];
  onSaved: (formData: FormData) => Promise<void>;
}) {
  const [type, setType] = useState<AdminProduct["productType"]>(
    product?.productType ?? "NORMAL",
  );
  const suggested = (kind: AdminProduct["productType"]) =>
    categories.find((item) =>
      kind === "PIZZA"
        ? /пицц/i.test(item.name)
        : kind === "COMBO"
          ? /комбо/i.test(item.name)
          : !/пицц|комбо/i.test(item.name),
    )?.id ?? categories[0]?.id;
  const [category, setCategory] = useState(
    product?.categoryId ?? suggested(type),
  );
  const pizza = type === "PIZZA";
  return (
    <form action={onSaved} className="admin-form admin-editor">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="admin-form-grid">
        <label>
          Название блюда
          <input name="name" required defaultValue={product?.name} />
        </label>
        <label>
          Тип
          <select
            name="productType"
            value={type}
            onChange={(event) => {
              const next = event.target.value as AdminProduct["productType"];
              setType(next);
              if (!product) setCategory(suggested(next));
            }}
          >
            <option value="NORMAL">Блюдо</option>
            <option value="PIZZA">Пицца</option>
            <option value="COMBO">Комбо</option>
          </select>
        </label>
        <label>
          Категория
          <select
            name="categoryId"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Цена, сомони
          <input
            name="price"
            required={!pizza}
            disabled={pizza}
            inputMode="decimal"
            defaultValue={
              product?.basePriceDiram == null
                ? ""
                : String(product.basePriceDiram / 100)
            }
            placeholder={pizza ? "Цены по размерам" : "0"}
          />
        </label>
        <label>
          Старая цена
          <input
            name="oldPrice"
            disabled={pizza}
            inputMode="decimal"
            defaultValue={
              product?.oldPriceDiram ? String(product.oldPriceDiram / 100) : ""
            }
            placeholder="Без скидки"
          />
        </label>
        <label>
          Ярлык акции
          <input
            name="promotionLabel"
            defaultValue={product?.promotionLabel ?? ""}
            placeholder="Например, −20%"
          />
        </label>
      </div>
      <label>
        Описание
        <textarea name="description" defaultValue={product?.description} />
      </label>
      {pizza && (
        <aside className="admin-pizza-price-note">
          <b>Цена пиццы задаётся по размеру</b>
          <span>
            {product
              ? "Ниже добавьте или измените размер и его цену."
              : "Сохраните основу пиццы — затем сразу откроется блок для добавления размеров и цен."}
          </span>
        </aside>
      )}
      <details className="admin-more">
        <summary>Дополнительные поля</summary>
        <label>
          Название TJ
          <input name="nameTj" defaultValue={product?.nameTj ?? ""} />
        </label>
        <label>
          Описание TJ
          <textarea
            name="descriptionTj"
            defaultValue={product?.descriptionTj ?? ""}
          />
        </label>
        <label>
          Slug
          <input
            name="slug"
            required
            pattern="[a-z0-9-]+"
            defaultValue={product?.slug}
          />
        </label>
      </details>
      <AdminImageInput
        prefix="products"
        defaultValue={product?.imageUrl ?? ""}
      />
      <div className="admin-switches">
        <label>
          <input
            name="isAvailable"
            type="checkbox"
            defaultChecked={product?.isAvailable ?? true}
          />{" "}
          В наличии
        </label>
        <label>
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={product?.isActive ?? true}
          />{" "}
          Показывать клиентам
        </label>
        <label>
          <input
            name="isPopular"
            type="checkbox"
            defaultChecked={product?.isPopular ?? false}
          />{" "}
          Популярное
        </label>
      </div>
      <input name="sortOrder" type="hidden" value={product?.sortOrder ?? 0} />
      <button className="admin-save">
        ✓ {product ? "Сохранить изменения" : "Добавить товар"}
      </button>
    </form>
  );
}

export function ProductWorkspace({
  products,
  categories,
}: {
  products: AdminProduct[];
  categories: AdminCategoryOption[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [current, setCurrent] = useState<AdminProduct | "new" | null>(() =>
    searchParams.get("edit")
      ? products.find((product) => product.id === searchParams.get("edit")) ?? null
      : searchParams.get("new") === "1"
        ? "new"
        : null,
  );
  useEffect(() => {
    const editing = searchParams.get("edit");
    if (editing) {
      setCurrent(products.find((product) => product.id === editing) ?? null);
    }
  }, [products, searchParams]);
  const saveAndContinue = async (formData: FormData) => {
    const result = await saveProduct(formData);
    if (result?.id) {
      router.replace(`/admin/products?edit=${result.id}`);
      router.refresh();
      return;
    }
    router.refresh();
  };
  return (
    <section className="admin-workspace">
      <header className="admin-workspace-head">
        <div>
          <p>КАТАЛОГ ДЛЯ КЛИЕНТОВ</p>
          <h2>Блюда и цены</h2>
          <span>Нажмите карандаш, чтобы изменить именно эту карточку.</span>
        </div>
        <button
          className="admin-add"
          type="button"
          onClick={() => setCurrent("new")}
        >
          ＋ Добавить товар
        </button>
      </header>
      <div className="admin-product-grid">
        {products.map((product) => (
          <article className="admin-product-card" key={product.id}>
            <div className="admin-product-image">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt="" />
              ) : (
                <b>
                  DIYOR
                  <br />
                  BURGER
                </b>
              )}
              <button
                type="button"
                aria-label={`Изменить ${product.name}`}
                onClick={() => setCurrent(product)}
              >
                <Pencil />
              </button>
            </div>
            <div>
              <span>
                {product.productType === "PIZZA"
                  ? "Пицца"
                  : product.productType === "COMBO"
                    ? "Комбо"
                    : "Блюдо"}
              </span>
              <em className={product.isAvailable ? "ok" : "off"}>
                {product.isAvailable ? "В наличии" : "Нет в наличии"}
              </em>
              <h3>{product.name}</h3>
              <p>{product.description || "Описание ещё не заполнено"}</p>
              <strong>
                {product.basePriceDiram == null
                  ? "Цены по размерам"
                  : `${product.basePriceDiram / 100} сом`}
              </strong>
              {product.oldPriceDiram &&
                product.basePriceDiram &&
                product.oldPriceDiram > product.basePriceDiram && (
                  <del>{product.oldPriceDiram / 100} сом</del>
                )}
              {product.promotionLabel && <mark>{product.promotionLabel}</mark>}
            </div>
          </article>
        ))}
      </div>
      {current && (
        <div
          className="admin-editor-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setCurrent(null);
          }}
        >
          <section
            className="admin-editor-sheet"
            role="dialog"
            aria-modal="true"
          >
            <header>
              <div>
                <p>{current === "new" ? "НОВЫЙ ТОВАР" : "РЕДАКТИРОВАНИЕ"}</p>
                <h2>{current === "new" ? "Добавить товар" : current.name}</h2>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setCurrent(null)}
              >
                ×
              </button>
            </header>
            <Editor
              product={current === "new" ? undefined : current}
              categories={categories}
              onSaved={saveAndContinue}
            />
            {current !== "new" && current.productType === "PIZZA" && (
              <PizzaSizes product={current} />
            )}{" "}
            {current !== "new" && (
              <footer>
                <form action={toggleProductAvailability}>
                  <input name="id" type="hidden" value={current.id} />
                  <input
                    name="current"
                    type="hidden"
                    value={String(current.isAvailable)}
                  />
                  <button>
                    {current.isAvailable
                      ? "Снять с наличия"
                      : "Вернуть в наличие"}
                  </button>
                </form>
                <form action={archiveProduct}>
                  <input name="id" type="hidden" value={current.id} />
                  <button className="danger">Архивировать</button>
                </form>
              </footer>
            )}
          </section>
        </div>
      )}
    </section>
  );
}
