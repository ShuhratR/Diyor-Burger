"use client";

import { useRef, useState } from "react";
import { useFeedback } from "@/features/feedback/feedback-provider";
import { useRouter } from "next/navigation";
import { HomeScreen } from "@/components/home-screen";
import { AdminImageInput } from "@/features/admin/admin-image-input";
import { saveHomeSection } from "@/features/admin/admin-home-actions";
import type {
  Category,
  Product,
  PublicBanner,
  PublicRestaurantSettings,
} from "@/lib/menu/types";
import "./admin-client-home.css";

type Section =
  | "hero"
  | "benefits"
  | "categories"
  | "combos"
  | "popular"
  | "promotion"
  | "banners"
  | null;
type Settings = PublicRestaurantSettings & { whatsapp: string };

const titles: Record<Exclude<Section, null>, string> = {
  hero: "Главный экран",
  benefits: "Преимущества",
  categories: "Категории",
  combos: "Комбо",
  popular: "Популярные блюда",
  promotion: "Акция",
  banners: "Баннеры",
};

export function AdminClientHome({
  categories,
  combos,
  popular,
  banners,
  settings,
}: {
  categories: Category[];
  combos: Product[];
  popular: Product[];
  banners: PublicBanner[];
  settings: Settings;
}) {
  const [section, setSection] = useState<Section>(null);
  const [preview, setPreview] = useState(false);
  const [pending, setPending] = useState(false);
  const [saveError, setSaveError] = useState("");
  const feedback = useFeedback();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const isSettingsEditor =
    section === "hero" || section === "benefits" || section === "promotion";
  const openSection = (next: Exclude<Section, null>) => {
    if (next === "hero" || next === "benefits" || next === "promotion")
      setSection(next);
    else
      router.push(
        next === "combos"
          ? "/admin/combos"
          : next === "categories"
            ? "/admin/categories"
            : next === "banners"
              ? "/admin/banners"
              : "/admin/products",
      );
  };
  const submitData = async (data: FormData) => {
    if (pending) return;
    setPending(true);
    setSaveError("");
    try {
      await saveHomeSection(data);
      setSection(null);
      router.refresh();
      feedback.notify("Изменения опубликованы");
    } catch {
      const message = "Не удалось сохранить раздел. Проверьте поля и повторите попытку.";
      setSaveError(message);
      feedback.notify("Ошибка сохранения", message);
    } finally {
      setPending(false);
    }
  };
  const submit = () => {
    if (!isSettingsEditor || !formRef.current || pending) return;
    const form = formRef.current;
    if (form.reportValidity()) void submitData(new FormData(form));
  };
  return (
    <div
      className={`admin-client-mode${preview ? " admin-client-preview" : ""}`}
    >
      <aside className="admin-mode-bar" aria-label="Панель администратора">
        <span>
          <i>●</i> Режим администратора
        </span>
        <div>
          <button type="button" onClick={() => router.push("/")}>
            Отменить
          </button>
          <button type="button" onClick={() => setPreview(!preview)}>
            {preview ? "Вернуть правки" : "Предпросмотр"}
          </button>
          <button
            type="button"
            className="admin-save"
            disabled={!isSettingsEditor || pending}
            onClick={submit}
          >
            {pending ? "Сохранение…" : "Сохранить"}
          </button>
        </div>
      </aside>
      <HomeScreen
        categories={categories}
        combos={combos}
        popular={popular}
        banners={banners}
        settings={settings}
        adminMode={!preview}
        onEdit={openSection}
      />
      {!preview && (
        <button
          className="admin-add-fab"
          type="button"
          onClick={() => router.push("/admin/products?new=1")}
          aria-label="Добавить блюдо"
        >
          <span>＋</span>
          <b>Добавить блюдо</b>
        </button>
      )}
      {section && (
        <div
          className="admin-editor-backdrop"
          role="presentation"
          onClick={() => setSection(null)}
        >
          <section
            className="admin-editor-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>DIYOR BURGER · РЕДАКТИРОВАНИЕ</small>
                <h2 id="admin-editor-title">{titles[section]}</h2>
              </div>
              <button
                type="button"
                onClick={() => setSection(null)}
                aria-label="Закрыть"
              >
                ×
              </button>
            </header>
            {isSettingsEditor ? (
              <form
                ref={formRef}
                className="admin-inline-form"
                action={submitData}
                aria-busy={pending}
              >
                {section === "hero" && (
                  <>
                    <label>
                      Название ресторана
                      <input
                        name="restaurantName"
                        required
                        defaultValue={settings.restaurantName}
                      />
                    </label>
                    <label>
                      Заголовок баннера
                      <input
                        name="heroTitle"
                        defaultValue={settings.heroTitle ?? ""}
                      />
                    </label>
                    <label>
                      Описание баннера
                      <textarea
                        name="heroSubtitle"
                        defaultValue={settings.heroSubtitle ?? ""}
                      />
                    </label>
                    <AdminImageInput
                      name="heroImage"
                      prefix="settings"
                      defaultValue={settings.heroImageUrl ?? ""}
                    />
                  </>
                )}
                {section === "benefits" && (
                  <>
                    <label>
                      Преимущество 1
                      <input
                        name="benefit1"
                        defaultValue={
                          settings.benefitLabels?.[0] ?? "Быстрая доставка"
                        }
                      />
                    </label>
                    <label>
                      Преимущество 2
                      <input
                        name="benefit2"
                        defaultValue={
                          settings.benefitLabels?.[1] ?? "Свежие ингредиенты"
                        }
                      />
                    </label>
                    <label>
                      Преимущество 3
                      <input
                        name="benefit3"
                        defaultValue={
                          settings.benefitLabels?.[2] ?? "Высокое качество"
                        }
                      />
                    </label>
                    <label>
                      Преимущество 4
                      <input
                        name="benefit4"
                        defaultValue={
                          settings.benefitLabels?.[3] ?? "Заказ через WhatsApp"
                        }
                      />
                    </label>
                  </>
                )}
                {section === "promotion" && (
                  <>
                    <label>
                      Текст акции
                      <textarea
                        name="promotionText"
                        defaultValue={
                          settings.promotionText ??
                          "При заказе 2 больших пиццы — маленькая пицца в подарок!"
                        }
                      />
                    </label>
                    <AdminImageInput
                      name="promotionImage"
                      prefix="settings"
                      defaultValue={settings.promotionImageUrl ?? ""}
                    />
                  </>
                )}
                <input type="hidden" name="section" value={section} />
                {saveError && <p className="admin-form-error" role="alert">{saveError}</p>}
                <button className="admin-sheet-save" disabled={pending}>
                  {pending ? "Сохранение…" : "Сохранить и опубликовать"}
                </button>
              </form>
            ) : (
              <div className="admin-editor-note">
                <p>
                  Этот блок уже использует клиентский дизайн. Нажмите кнопку
                  ниже, чтобы изменить его содержимое в том же проекте.
                </p>
                <button
                  type="button"
                  className="admin-sheet-save"
                  onClick={() => openSection(section)}
                >
                  Открыть редактор
                </button>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
