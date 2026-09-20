"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
const links = [["Главная", "/"], ["Меню", "/menu"], ["Комбо", "/combos"], ["Избранное", "/favorites"], ["Корзина", "/cart"]] as const;
export function BottomNav() { const pathname=usePathname(); return <nav className="bottom-nav" aria-label="Основная навигация">{links.map(([label, href]) => <Link className={pathname===href || (href!=="/"&&pathname.startsWith(`${href}/`))?"active":""} key={href} href={href}>{label}</Link>)}</nav>; }
