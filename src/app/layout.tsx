import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/bottom-nav";
import { SiteHeader } from "@/components/site-header";
import { CartProvider } from "@/features/cart/cart-provider";
import { FavoritesProvider } from "@/features/favorites/favorites-provider";
export const metadata: Metadata = { title: "DIYOR BURGER", description: "Закажите любимые блюда DIYOR BURGER" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="ru"><body><CartProvider><FavoritesProvider><div className="app-shell"><SiteHeader /><main>{children}</main><BottomNav /></div></FavoritesProvider></CartProvider></body></html>; }
