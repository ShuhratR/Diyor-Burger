"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { MobileDrawer } from "./mobile-drawer";
import { BrandLogo } from "./brand-logo";
import { DiyorIcon } from "./diyor-icon";
import { useLanguage } from "@/features/i18n/language-provider";
import { copy } from "@/lib/i18n";
import { useCart } from "@/features/cart/cart-provider";

function isRoot(pathname: string) { return pathname === "/"; }

type HeaderContacts = { phone1?: string; phone2?: string; instagramUrl?: string; address?: string; mapUrl?: string };
export function SiteHeader({ locationLabel, contacts }: { locationLabel?: string; contacts?: HeaderContacts }) {
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useLanguage();
  const t = copy[language];
  const cart = useCart();
  const quantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  useEffect(() => { document.documentElement.dataset.route = pathname; return () => { delete document.documentElement.dataset.route; }; }, [pathname]);
  const adminMode = pathname.startsWith("/admin");
  const root = isRoot(pathname) || adminMode;
  const hasDrawer = root || pathname === "/menu" || pathname === "/admin/products";
  const pageTitle = pathname === "/cart" ? "Корзина" : undefined;

  return <header className={`site-header ${hasDrawer ? "reference-home" : "reference-detail"}`}>
    {hasDrawer ? <MobileDrawer contacts={contacts} /> : <button className="reference-back" type="button" onClick={() => router.back()} aria-label="Назад">‹</button>}
    <Link className="brand reference-wordmark" href={adminMode ? "/admin" : "/"} aria-label="DIYOR BURGER — главная"><BrandLogo /></Link>
    {pageTitle && <span className="site-header-title">{pageTitle}</span>}
    <nav aria-label="Быстрая навигация">
      {root && locationLabel && <span className="header-location" aria-label="Район доставки"><DiyorIcon name="location-pin"/><span>{locationLabel}</span><b aria-hidden="true">⌄</b></span>}
      {pathname !== "/checkout/whatsapp" && <Link className="header-icon" href={adminMode ? "/admin/products" : "/search"} aria-label={adminMode ? "Редактировать блюда" : t.search}>
        <DiyorIcon name="search"/>
      </Link>}
      <Link className="header-icon cart-icon" href={adminMode ? "/admin/cart" : "/cart"} aria-label={t.cart}>
        <DiyorIcon name="cart"/>
        {quantity > 0 && <span>{quantity}</span>}
      </Link>
    </nav>
  </header>;
}
