"use client";

import { LanguageSwitch } from "@/features/i18n/language-provider";

export default function SettingsPage() {
  return <section className="section settings-page"><h1>Настройки</h1><article className="settings-card"><div><b>Язык приложения</b><span>Выберите удобный язык интерфейса.</span></div><LanguageSwitch/></article><p className="settings-note">Настройки сохраняются на этом устройстве.</p></section>;
}
