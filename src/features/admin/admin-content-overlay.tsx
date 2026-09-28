"use client";

import { useState } from "react";
import { SettingsForm } from "@/features/admin/operations-manager";

export type AdminContentSettings = {
  restaurantName: string;
  whatsapp: string;
  phone1?: string;
  phone2?: string;
  instagram?: string;
  mainAddress: string;
  mainAddressTj?: string;
  pickupEnabled: boolean;
  pickupAddress?: string;
  pickupAddressTj?: string;
  pickupNote?: string;
  pickupNoteTj?: string;
  mapUrl?: string;
  openTime?: string;
  closeTime?: string;
  heroTitle?: string;
  heroTitleTj?: string;
  heroSubtitle?: string;
  heroSubtitleTj?: string;
  heroImage?: string;
  benefitLabels?: string[];
  promotionText?: string;
  promotionImage?: string;
  cartEmptyTitle?: string;
  cartEmptyBody?: string;
  cartCheckoutLabel?: string;
  cartWhatsappLabel?: string;
};

export function AdminContentOverlay({
  title,
  settings,
  children,
}: {
  title: string;
  settings: AdminContentSettings;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  return (
    <div
      className={`admin-content-overlay${preview ? " admin-client-preview" : ""}`}
    >
      <aside className="admin-mode-bar" aria-label="Панель администратора">
        <span>
          <i>●</i> Режим администратора · {title}
        </span>
        <div>
          <button type="button" onClick={() => setPreview((value) => !value)}>
            {preview ? "Вернуть редактор" : "Предпросмотр"}
          </button>
          {!preview && (
            <button type="button" onClick={() => setOpen(true)}>
              ✎ Редактировать
            </button>
          )}
        </div>
      </aside>
      {children}
      {!preview && (
        <button
          className="admin-content-pencil"
          type="button"
          aria-label={`Изменить: ${title}`}
          onClick={() => setOpen(true)}
        >
          ✎
        </button>
      )}
      {open && (
        <div
          className="admin-editor-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <section
            className="admin-editor-sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-content-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <small>DIYOR BURGER · РЕДАКТИРОВАНИЕ</small>
                <h2 id="admin-content-title">{title}</h2>
              </div>
              <button
                type="button"
                aria-label="Закрыть"
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </header>
            <SettingsForm settings={settings} close={() => setOpen(false)} />
          </section>
        </div>
      )}
    </div>
  );
}
