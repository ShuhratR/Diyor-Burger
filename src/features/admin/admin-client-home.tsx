"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HomeScreen } from "@/components/home-screen";
import { AdminImageInput } from "@/features/admin/admin-image-input";
import { saveSettings } from "@/features/admin/operations-actions";
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
  const [pending, startTransition] = useTransition();
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
  const submit = () => {
    if (!isSettingsEditor || !formRef.current) return;
    const data = new FormData(formRef.current);
    startTransition(async () => {
      await saveSettings(data);
      setSection(null);
      router.refresh();
    });
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
                action={(data) =>
                  startTransition(async () => {
                    await saveSettings(data);
                    setSection(null);
                    router.refresh();
                  })
                }
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
                <details>
                  <summary>Контакты и доставка</summary>
                  <label>
                    WhatsApp для заказов
                    <input
                      name="whatsapp"
                      required
                      inputMode="tel"
                      defaultValue={settings.whatsapp}
                    />
                  </label>
                  <label>
                    Телефон
                    <input
                      name="phone1"
                      defaultValue={settings.contactPhone1 ?? ""}
                    />
                  </label>
                  <label>
                    Адрес
                    <input
                      name="mainAddress"
                      defaultValue={settings.mainAddress}
                    />
                  </label>
                </details>
                <input
                  type="hidden"
                  name="restaurantName"
                  value={settings.restaurantName}
                />
                <input
                  type="hidden"
                  name="whatsapp"
                  value={settings.whatsapp}
                />
                <input
                  type="hidden"
                  name="phone1"
                  value={settings.contactPhone1 ?? ""}
                />
                <input
                  type="hidden"
                  name="phone2"
                  value={settings.contactPhone2 ?? ""}
                />
                <input
                  type="hidden"
                  name="instagram"
                  value={settings.instagramUrl ?? ""}
                />
                <input
                  type="hidden"
                  name="mainAddress"
                  value={settings.mainAddress}
                />
                <input
                  type="hidden"
                  name="mainAddressTj"
                  value={settings.mainAddress}
                />
                <input
                  type="hidden"
                  name="pickupAddress"
                  value={settings.pickupAddress ?? ""}
                />
                <input
                  type="hidden"
                  name="pickupAddressTj"
                  value={settings.pickupAddress ?? ""}
                />
                <input
                  type="hidden"
                  name="pickupNote"
                  value={settings.pickupNote ?? ""}
                />
                <input
                  type="hidden"
                  name="pickupNoteTj"
                  value={settings.pickupNote ?? ""}
                />
                <input
                  type="hidden"
                  name="mapUrl"
                  value={settings.mapUrl ?? ""}
                />
                <input
                  type="hidden"
                  name="openTime"
                  value={settings.workOpenTime ?? ""}
                />
                <input
                  type="hidden"
                  name="closeTime"
                  value={settings.workCloseTime ?? ""}
                />
                <input
                  type="hidden"
                  name="heroTitle"
                  value={settings.heroTitle ?? ""}
                />
                <input
                  type="hidden"
                  name="heroTitleTj"
                  value={settings.heroTitle ?? ""}
                />
                <input
                  type="hidden"
                  name="heroSubtitle"
                  value={settings.heroSubtitle ?? ""}
                />
                <input
                  type="hidden"
                  name="heroSubtitleTj"
                  value={settings.heroSubtitle ?? ""}
                />
                <input
                  type="hidden"
                  name="heroImage"
                  value={settings.heroImageUrl ?? ""}
                />
                <input
                  type="hidden"
                  name="benefit1"
                  value={settings.benefitLabels?.[0] ?? "Быстрая доставка"}
                />
                <input
                  type="hidden"
                  name="benefit2"
                  value={settings.benefitLabels?.[1] ?? "Свежие ингредиенты"}
                />
                <input
                  type="hidden"
                  name="benefit3"
                  value={settings.benefitLabels?.[2] ?? "Высокое качество"}
                />
                <input
                  type="hidden"
                  name="benefit4"
                  value={settings.benefitLabels?.[3] ?? "Заказ через WhatsApp"}
                />
                <input
                  type="hidden"
                  name="promotionText"
                  value={
                    settings.promotionText ??
                    "При заказе 2 больших пиццы — маленькая пицца в подарок!"
                  }
                />
                <input
                  type="hidden"
                  name="promotionImage"
                  value={settings.promotionImageUrl ?? ""}
                />
                <input
                  type="hidden"
                  name="cartEmptyTitle"
                  value={settings.cartEmptyTitle ?? "Ваша корзина пока пуста"}
                />
                <input
                  type="hidden"
                  name="cartEmptyBody"
                  value={
                    settings.cartEmptyBody ??
                    "Добавьте любимые блюда, хот-доги и другие вкусные позиции из меню."
                  }
                />
                <input
                  type="hidden"
                  name="cartCheckoutLabel"
                  value={settings.cartCheckoutLabel ?? "Оформить заказ"}
                />
                <input
                  type="hidden"
                  name="cartWhatsappLabel"
                  value={
                    settings.cartWhatsappLabel ?? "Подготовить заказ в WhatsApp"
                  }
                />
                <input
                  type="hidden"
                  name="pickupEnabled"
                  value={settings.pickupEnabled ? "on" : ""}
                />
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
