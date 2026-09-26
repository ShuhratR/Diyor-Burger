"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { MobileDrawer } from "./mobile-drawer";
import { DiyorIcon } from "./diyor-icon";
import { useLanguage } from "@/features/i18n/language-provider";
import { copy } from "@/lib/i18n";
import { useCart } from "@/features/cart/cart-provider";

function isRoot(pathname: string) { return pathname === "/"; }

export function SiteHeader({ locationLabel }: { locationLabel?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language];
  const cart = useCart();
  const quantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { document.documentElement.dataset.route = pathname; return () => { delete document.documentElement.dataset.route; }; }, [pathname]);
  if (pathname.startsWith("/admin")) return null;
  const root = isRoot(pathname);
  const hasDrawer = root || pathname === "/menu";
  const pageTitle = pathname === "/cart" ? "Корзина" : undefined;

  return <header className={`site-header ${hasDrawer ? "reference-home" : "reference-detail"}`}>
    {hasDrawer ? <MobileDrawer /> : <button className="reference-back" type="button" onClick={() => router.back()} aria-label="Назад">‹</button>}
    <Link className="brand reference-wordmark" href="/" aria-label="DIYOR BURGER — главная"><span className="brand-mark" aria-hidden="true"><i>D</i><b>B</b></span><span>DIYOR <b>BURGER</b></span></Link>
    {pageTitle && <span className="site-header-title">{pageTitle}</span>}
    <nav aria-label="Быстрая навигация">
      {root && locationLabel && <span className="header-location" aria-label="Район доставки"><DiyorIcon name="location-pin"/><span>{locationLabel}</span><b aria-hidden="true">⌄</b></span>}
      {pathname !== "/checkout/whatsapp" && <Link className="header-icon" href="/search" aria-label={t.search}>
        <DiyorIcon name="search"/>
      </Link>}
      <Link className="header-icon cart-icon" href="/cart" aria-label={t.cart}>
        <DiyorIcon name="cart"/>
        {quantity > 0 && <span>{quantity}</span>}
      </Link>
    </nav>
  </header>;
}
