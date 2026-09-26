import type { Metadata } from "next";
import "./globals.css";
import "./visual.css";
import "./reference-ui.css";
import "@/components/diyor-icon.css";
import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/features/cart/cart-provider";
import { FavoritesProvider } from "@/features/favorites/favorites-provider";
import { LanguageProvider } from "@/features/i18n/language-provider";
import { getPublicRestaurantSettings } from "@/lib/menu/catalog";
export const metadata: Metadata = { title: "DIYOR BURGER", description: "Закажите любимые блюда DIYOR BURGER" };
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { const settings = await getPublicRestaurantSettings(); return <html lang="ru"><body><LanguageProvider><CartProvider><FavoritesProvider><div className="app-shell"><SiteHeader locationLabel={settings.data?.mainAddress || undefined}/><main className="reference-main">{children}</main><BottomNav /></div></FavoritesProvider></CartProvider></LanguageProvider></body></html>; }
