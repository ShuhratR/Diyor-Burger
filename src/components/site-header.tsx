"use client";
import Link from "next/link";
import { MobileDrawer } from "./mobile-drawer";
import { LanguageSwitch, useLanguage } from "@/features/i18n/language-provider";
import { copy } from "@/lib/i18n";
import { useCart } from "@/features/cart/cart-provider";
export function SiteHeader() { const { language }=useLanguage(); const t=copy[language]; const cart=useCart(); const quantity=cart.items.reduce((sum,item)=>sum+item.quantity,0); return <header className="site-header"><MobileDrawer/><Link className="brand" href="/" aria-label="DIYOR BURGER — главная"><span className="brand-mark">DB</span><span>DIYOR <b>BURGER</b></span></Link><nav aria-label="Быстрая навигация"><LanguageSwitch compact/><Link className="header-icon" href="/search" aria-label={t.search}><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6"/><path d="m16 16 4 4"/></svg></Link><Link className="header-icon cart-icon" href="/cart" aria-label={t.cart}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2l2.1 10.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L20 8H6"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg>{quantity>0&&<span>{quantity}</span>}</Link></nav></header>; }
