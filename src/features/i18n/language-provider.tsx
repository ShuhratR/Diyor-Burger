"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type AppLanguage = "ru" | "tj";
const STORAGE_KEY = "diyor-burger.language.v1";
type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<AppLanguage>("ru");
  useEffect(() => { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved === "ru" || saved === "tj") setLanguage(saved); }, []);
  const value = useMemo(() => ({ language, setLanguage: (next: AppLanguage) => { setLanguage(next); window.localStorage.setItem(STORAGE_KEY, next); } }), [language]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage() { const value = useContext(LanguageContext); if (!value) throw new Error("useLanguage must be used within LanguageProvider"); return value; }
export function LanguageSwitch({ compact = false }: { compact?: boolean }) { const { language, setLanguage } = useLanguage(); return <div className={`language-switch ${compact ? "language-switch-compact" : ""}`} aria-label="Выбор языка"><button type="button" className={language === "ru" ? "active" : ""} onClick={() => setLanguage("ru")} aria-pressed={language === "ru"}>RU</button><button type="button" className={language === "tj" ? "active" : ""} onClick={() => setLanguage("tj")} aria-pressed={language === "tj"}>TJ</button></div>; }
