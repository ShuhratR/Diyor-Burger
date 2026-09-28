"use client";

import Link from "next/link";
import { CategoryStrip } from "@/components/menu/category-strip";
import { ProductGrid } from "@/components/menu/product-grid";
import { HomeComboCarousel } from "@/components/home-combo-carousel";
import { FoodImage } from "@/components/menu/food-image";
import type {
  Category,
  Product,
  PublicBanner,
  PublicRestaurantSettings,
} from "@/lib/menu/types";
import { copy } from "@/lib/i18n";
import { useLanguage } from "@/features/i18n/language-provider";
import "./home-visual.css";

type EditableSection =
  | "hero"
  | "benefits"
  | "categories"
  | "combos"
  | "popular"
  | "promotion"
  | "banners";
export function HomeScreen({
  categories,
  combos,
  popular,
  banners = [],
  settings,
  adminMode = false,
  onEdit,
}: {
  categories: Category[];
  combos: Product[];
  popular: Product[];
  banners?: PublicBanner[];
  settings?: PublicRestaurantSettings;
  adminMode?: boolean;
  onEdit?: (section: EditableSection) => void;
}) {
  const { language } = useLanguage();
  const t = copy[language];
  const benefits = [
    {
      label: settings?.benefitLabels?.[0] || t.delivery,
      icon: (
        <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M3 16h11V7H3zM14 11h4l3 3v2h-7zM7 19a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
        </svg>
      ),
    },
    {
      label: settings?.benefitLabels?.[1] || t.fresh,
      icon: (
        <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M20 4C11 4 5 8 5 15c0 2 1 4 3 5 1-5 4-9 10-12-3 3-5 6-6 10 5-1 8-5 8-14Z" />
        </svg>
      ),
    },
    {
      label: settings?.benefitLabels?.[2] || t.quality,
      icon: (
        <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24">
          <path d="m12 3 8 3v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z" />
          <path d="m8 12 2.5 2.5L16 9" />
        </svg>
      ),
    },
    {
      label: settings?.benefitLabels?.[3] || t.whatsapp,
      icon: (
        <svg className="benefit-icon" aria-hidden="true" viewBox="0 0 24 24">
          <path d="M20 11.5A8 8 0 0 1 8.2 19L4 20l1.1-4A8 8 0 1 1 20 11.5Z" />
          <path d="M9 8.5c.3 2 1.5 3.5 3.6 4.5.7.3 1.2.2 1.7-.4l.5-.7-1.6-1-.7.6c-.9-.4-1.5-1-1.9-1.8l.5-.7-1-1.5z" />
        </svg>
      ),
    },
  ];
  return (
    <>
      <section className={`home-hero ${adminMode ? "admin-editable" : ""}`}>
        {adminMode && (
          <button
            className="admin-pencil"
            type="button"
            onClick={() => onEdit?.("hero")}
            aria-label="Изменить главный баннер"
          >
            ✎
          </button>
        )}
        <div className="home-hero-copy">
          <p className="eyebrow">
            {settings?.restaurantName ?? "DIYOR BURGER"}
          </p>
          <h1>
            {settings?.heroTitle ??
              (language === "ru" ? (
                <>
                  Сочные бургеры <em>на любой вкус</em>
                </>
              ) : (
                <>
                  Бургерҳои болаззат <em>барои ҳар завқ</em>
                </>
              ))}
          </h1>
          <p>
            {settings?.heroSubtitle ??
              (language === "ru"
                ? "Свежие ингредиенты. Настоящий вкус. Всегда с вами!"
                : "Маҳсулоти тару тоза. Таъми ҳақиқӣ. Ҳамеша бо шумо!")}
          </p>
          <Link
            className="primary-button"
            href={adminMode ? "/admin/products" : "/menu"}
          >
            {language === "ru" ? "Заказать сейчас" : "Ҳозир фармоиш диҳед"}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
        <FoodImage
          src={settings?.heroImageUrl || "/images/hero-burger-v1.png"}
          alt="Сочный бургер, картофель фри и напиток DIYOR BURGER"
          compact
        />
      </section>
      {banners.length > 0 && (
        <section
          className={`section home-live-banners ${adminMode ? "admin-editable" : ""}`}
          aria-label="Акции и объявления"
        >
          {adminMode && (
            <button
              className="admin-pencil"
              type="button"
              onClick={() => onEdit?.("banners")}
              aria-label="Изменить баннеры"
            >
              ✎
            </button>
          )}
          <div className="live-banner-strip">
            {banners.map((banner) => (
              <Link
                className="live-banner"
                key={banner.id}
                href={banner.targetUrl || "/menu"}
              >
                <div>
                  <span>DIYOR BURGER</span>
                  <strong>{banner.title}</strong>
                  {banner.body && <p>{banner.body}</p>}
                </div>
                {banner.imageUrl && (
                  <FoodImage compact src={banner.imageUrl} alt={banner.title} />
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
      <section
        className={`benefit-row ${adminMode ? "admin-editable" : ""}`}
        aria-label="Преимущества"
      >
        {adminMode && (
          <button
            className="admin-pencil"
            type="button"
            onClick={() => onEdit?.("benefits")}
            aria-label="Изменить преимущества"
          >
            ✎
          </button>
        )}
        {benefits.map((benefit) => (
          <span key={benefit.label}>
            <b>{benefit.icon}</b>
            {benefit.label}
          </span>
        ))}
      </section>
      <section
        className={`section home-categories ${adminMode ? "admin-editable" : ""}`}
      >
        {adminMode && (
          <button
            className="admin-pencil"
            type="button"
            onClick={() => onEdit?.("categories")}
            aria-label="Изменить категории"
          >
            ✎
          </button>
        )}
        <CategoryStrip
          categories={categories}
          showAll={false}
          showImages
          basePath={adminMode ? "/admin/products" : "/menu"}
        />
      </section>
      <section
        className={`section home-combos ${adminMode ? "admin-editable" : ""}`}
      >
        {adminMode && (
          <button
            className="admin-pencil"
            type="button"
            onClick={() => onEdit?.("combos")}
            aria-label="Изменить комбо"
          >
            ✎
          </button>
        )}
        <div className="section-heading">
          <h2>{t.combos}</h2>
          <Link href={adminMode ? "/admin/combos" : "/combos"}>
            {t.allCombos} →
          </Link>
        </div>
        {combos.length ? (
          <HomeComboCarousel combos={combos} autoPlay={!adminMode} />
        ) : (
          <p className="notice">
            {language === "ru"
              ? "Комбо пока не добавлены."
              : "Комбо ҳоло илова нашудааст."}
          </p>
        )}
      </section>
      <section
        className={`section home-popular ${adminMode ? "admin-editable" : ""}`}
      >
        {adminMode && (
          <button
            className="admin-pencil"
            type="button"
            onClick={() => onEdit?.("popular")}
            aria-label="Изменить популярные блюда"
          >
            ✎
          </button>
        )}
        <div className="section-heading">
          <h2>{t.popular}</h2>
          <Link href={adminMode ? "/admin/products" : "/menu?sort=popular"}>
            {t.allDishes} →
          </Link>
        </div>
        {popular.length ? (
          <ProductGrid products={popular} />
        ) : (
          <p className="notice">
            {language === "ru"
              ? "Блюда временно недоступны."
              : "Таомҳо муваққатан дастрас нестанд."}
          </p>
        )}
      </section>
      <section className={`brand-banner ${adminMode ? "admin-editable" : ""}`}>
        {adminMode && (
          <button
            className="admin-pencil"
            type="button"
            onClick={() => onEdit?.("promotion")}
            aria-label="Изменить акцию"
          >
            ✎
          </button>
        )}
        <div>
          <span className="banner-kicker">DIYOR BURGER</span>
          <strong>
            {settings?.promotionText ??
              (language === "ru" ? (
                <>
                  При заказе 2 больших пиццы —{" "}
                  <em>маленькая пицца в подарок!</em>
                </>
              ) : (
                <>
                  Бо фармоиши 2 пиццаи калон — <em>пиццаи хурд тӯҳфа!</em>
                </>
              ))}
          </strong>
        </div>
        <FoodImage
          src={settings?.promotionImageUrl || "/images/pizza-v1.png"}
          alt="Акция DIYOR BURGER"
          compact
        />
      </section>
    </>
  );
}
