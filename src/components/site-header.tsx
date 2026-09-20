import Link from "next/link";
import { MobileDrawer } from "./mobile-drawer";
export function SiteHeader() { return <header className="site-header"><MobileDrawer/><Link className="brand" href="/" aria-label="DIYOR BURGER — главная"><span>DB</span> DIYOR <b>BURGER</b></Link><nav aria-label="Быстрая навигация"><Link href="/search" aria-label="Поиск">⌕</Link><Link href="/cart" aria-label="Корзина">Корзина</Link></nav></header>; }
