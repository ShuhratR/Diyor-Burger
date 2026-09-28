"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { createCategoryForProduct } from "./category-actions";
import { AdminImageInput } from "./admin-image-input";
import { useAdminSave } from "./admin-submit";
import type { AdminCategoryOption } from "./product-manager";
import "./inline-category.css";

export function InlineCategoryDialog({
  categories,
  onCreated,
  onClose,
}: {
  categories: AdminCategoryOption[];
  onCreated: (category: AdminCategoryOption) => void;
  onClose: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const existing = categories.find(
    item => item.name.trim().toLocaleLowerCase("ru") === name.trim().toLocaleLowerCase("ru"),
  );
  const { submit, pending, error } = useAdminSave({
    action: createCategoryForProduct,
    onSuccess: category => {
      onCreated(category);
      router.refresh();
    },
    successTitle: "Раздел создан и выбран для товара",
    errorTitle: "Не удалось создать раздел",
  });

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !pending && !uploading) {
        event.preventDefault();
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [onClose, pending, uploading]);

  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="inline-category-layer" onMouseDown={event => {
      if (event.target === event.currentTarget && !pending && !uploading) onClose();
    }}>
      <section className="inline-category-dialog" role="dialog" aria-modal="true"
        aria-labelledby="inline-category-title">
        <header>
          <div>
            <p>НОВЫЙ РАЗДЕЛ МЕНЮ</p>
            <h2 id="inline-category-title">Добавить категорию</h2>
            <span>После создания она сразу появится в выбранной категории товара.</span>
          </div>
          <button type="button" aria-label="Закрыть создание категории"
            disabled={pending || uploading} onClick={onClose}>×</button>
        </header>
        <form action={submit} aria-busy={pending || uploading} className="inline-category-form">
          <label>Название раздела
            <input ref={inputRef} name="name" required maxLength={80} value={name}
              onChange={event => setName(event.target.value)}
              placeholder="Например, Ножки или Крылышки" />
          </label>
          {existing && <div className="inline-category-existing" role="status">
            Такой раздел уже есть.
            <button type="button" onClick={() => onCreated(existing)}>
              Выбрать «{existing.name}»
            </button>
          </div>}
          <label>Название на таджикском (необязательно)
            <input name="nameTj" maxLength={80} placeholder="При необходимости" />
          </label>
          <input name="sortOrder" type="hidden" value={categories.length} />
          <input name="isActive" type="hidden" value="on" />
          <div className="inline-category-photo">
            <b>Фотография раздела <span>* обязательно</span></b>
            <p>Фото будет использоваться в категориях клиентского меню. JPEG, PNG или WebP, до 5 МБ.</p>
            <AdminImageInput prefix="categories"
              onUrlChange={setImageUrl}
              onUploadingChange={setUploading} />
          </div>
          {!imageUrl && <p className="inline-category-photo-note" role="status">
            {uploading ? "Дождитесь окончания загрузки фотографии…" :
              "Сначала загрузите фотографию. Без неё создать категорию нельзя."}
          </p>}
          {error && <p className="admin-form-error" role="alert">{error}</p>}
          <button type="submit" className="admin-save" disabled={
            pending || uploading || !imageUrl || Boolean(existing) || !name.trim()
          }>
            {pending ? "Создаём раздел…" : "✓ Создать и выбрать раздел"}
          </button>
        </form>
      </section>
    </div>,
    document.body,
  );
}
