"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
type DrawerIconName = "home" | "menu" | "combo" | "delivery" | "about" | "phone" | "heart" | "orders" | "settings" | "chevron" | "close" | "instagram" | "location";

type ContactDetails = { phone1?: string; phone2?: string; instagramUrl?: string; address?: string; mapUrl?: string };
const links: { label: string; href: string; icon: DrawerIconName }[] = [
  { label: "Главная", href: "/", icon: "home" }, { label: "Меню", href: "/menu", icon: "menu" },
  { label: "Комбо", href: "/combos", icon: "combo" }, { label: "Доставка", href: "/delivery", icon: "delivery" },
  { label: "О нас", href: "/about", icon: "about" }, { label: "Контакты", href: "/contacts", icon: "phone" },
  { label: "Избранное", href: "/favorites", icon: "heart" }, { label: "Мои заказы", href: "/orders", icon: "orders" }, { label: "Настройки", href: "/settings", icon: "settings" },
];

function DrawerIcon({ name }: { name: DrawerIconName }) {
  const paths: Record<DrawerIconName, ReactNode> = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
    menu: <><path fill="currentColor" stroke="none" d="M3 2h2v6h1V2h2v6c0 1.7-.84 3.16-2.1 3.84V22H4.1V11.84C2.84 11.16 2 9.7 2 8V2h1z"/><path fill="currentColor" stroke="none" d="M16 2c3.2 2.65 3.2 8.05 0 10.7V22h-2V2h2z"/></>,
    combo: <><path d="M4 10a8 8 0 0 1 16 0z"/><path d="M4 13h16M5 17h14M7 21h10"/><path d="M7 7h.01M11 5h.01M15 7h.01M18 8h.01"/></>,
    delivery: <><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 18h6.5l2-7h-5.2l-2.4 4H5"/><path d="M14.5 11 13 7h3.5M16.5 7H20M3 14h3"/></>,
    about: <><circle cx="12" cy="7" r="3.4" fill="currentColor" stroke="none"/><circle cx="5.5" cy="9.5" r="2.5" fill="currentColor" stroke="none"/><circle cx="18.5" cy="9.5" r="2.5" fill="currentColor" stroke="none"/><path fill="currentColor" stroke="none" d="M5 22c0-4.15 3.1-7 7-7s7 2.85 7 7H5zM1.5 22c0-3.2 1.55-5.35 4.75-5.75L7.7 22H1.5zM22.5 22c0-3.2-1.55-5.35-4.75-5.75L16.3 22h6.2z"/></>,
    phone: <path d="M6 3h3l2 5-2 1.7a15 15 0 0 0 5.3 5.3L16 13l5 2v3c0 1.7-1.5 3-3.2 2.8C10.2 20 4 13.8 3.2 6.2 3 4.5 4.3 3 6 3z"/>,
    heart: <path d="M20.8 5.8c-2.1-2.2-5.6-2.2-7.7 0L12 7l-1.1-1.2c-2.1-2.2-5.6-2.2-7.7 0-2.2 2.3-2.2 5.9 0 8.2L12 22l8.8-8c2.2-2.3 2.2-5.9 0-8.2z"/>,
    orders: <><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.8 1.8 0 0 0 .36 1.99l.05.05-2.82 2.82-.05-.05a1.8 1.8 0 0 0-1.99-.36 1.8 1.8 0 0 0-1.1 1.65v.08H9.9v-.08A1.8 1.8 0 0 0 8.8 19.45a1.8 1.8 0 0 0-1.99.36l-.05.05-2.82-2.82.05-.05A1.8 1.8 0 0 0 4.35 15 1.8 1.8 0 0 0 2.7 13.9h-.08V9.9h.08a1.8 1.8 0 0 0 1.65-1.1 1.8 1.8 0 0 0-.36-1.99l-.05-.05 2.82-2.82.05.05A1.8 1.8 0 0 0 8.8 4.35 1.8 1.8 0 0 0 9.9 2.7v-.08h4v.08A1.8 1.8 0 0 0 15 4.35a1.8 1.8 0 0 0 1.99-.36l.05-.05 2.82 2.82-.05.05A1.8 1.8 0 0 0 19.45 8.8a1.8 1.8 0 0 0 1.65 1.1h.08v4h-.08A1.8 1.8 0 0 0 19.4 15z"/></>,
    chevron: <path d="m9 5 7 7-7 7"/>, close: <path d="M5 5l14 14M19 5 5 19"/>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor"/></>,
    location: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0z"/><circle cx="12" cy="10" r="2.5"/></>,
  };
  return <svg className="drawer-icon" viewBox="0 0 24 24" fill={name === "home" || name === "phone" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function MobileDrawer({ contacts = {} }: { contacts?: ContactDetails }) {
  const pathname = usePathname(); const [open, setOpen] = useState(false); const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLElement>(null); const triggerRef = useRef<HTMLButtonElement>(null); const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null); const routeRef = useRef(pathname);
  const closeDrawer = useCallback(() => { if (closing) return; setClosing(true); closeTimer.current = setTimeout(() => { setOpen(false); setClosing(false); triggerRef.current?.focus(); }, 250); }, [closing]);
  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);
  useEffect(() => {
    if (!open) return; const previousOverflow = document.body.style.overflow;
    const focusables = () => Array.from(dialogRef.current?.querySelectorAll<HTMLElement>("button,[href]") ?? []);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") { closeDrawer(); return; } if (event.key !== "Tab") return; const items = focusables(); if (!items.length) return; const [first] = items; const last = items[items.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); } if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); } };
    document.body.style.overflow = "hidden"; window.addEventListener("keydown", onKeyDown); requestAnimationFrame(() => focusables()[0]?.focus());
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKeyDown); };
  }, [open, closeDrawer]);
  useEffect(() => { if (routeRef.current === pathname) return; routeRef.current = pathname; if (closeTimer.current) clearTimeout(closeTimer.current); setClosing(false); setOpen(false); }, [pathname]);
  const adminMode = pathname.startsWith("/admin");
  const adminHref = (href: string) => href === "/" ? "/admin" : href === "/menu" ? "/admin/products" : href === "/combos" ? "/admin/combos" : href === "/delivery" ? "/admin/delivery" : href === "/favorites" ? "/admin/favorites" : href === "/settings" || href === "/contacts" || href === "/about" ? "/admin/settings" : href === "/orders" ? "/admin/cart" : "/admin/products";
  const active = (href: string) => adminMode ? href === "/" : (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`));
  const mapHref = contacts.mapUrl || (contacts.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contacts.address)}` : undefined);
  return <><button ref={triggerRef} className="menu-button" onClick={() => { setClosing(false); setOpen(true); }} aria-expanded={open} aria-label="Открыть меню"><span/><span/><span/></button>{open && <div className={`drawer-backdrop${closing ? " is-closing" : ""}`} onClick={closeDrawer}><aside className={`drawer${closing ? " is-closing" : ""}`} ref={dialogRef} role="dialog" aria-modal="true" aria-label="Навигация" onClick={(event) => event.stopPropagation()}>
    <button className="drawer-close" type="button" onClick={closeDrawer} aria-label="Закрыть меню"><DrawerIcon name="close"/></button><Image className="drawer-brand-art" src="/images/drawer-brand-slogan.jpg" alt="DIYOR BURGER — Вкуснее каждый день" width={1280} height={960} priority/>
    <nav aria-label="Основная навигация">{links.map(({ label, href, icon }) => <Link className={active(href) ? "active" : undefined} key={href} href={adminMode ? adminHref(href) : href}><DrawerIcon name={icon}/><strong>{label}</strong><DrawerIcon name="chevron"/></Link>)}</nav>
    <footer className="drawer-footer">{(contacts.phone1 || contacts.phone2) && <a className="drawer-contact" href={`tel:${(contacts.phone1 || contacts.phone2 || "").replace(/[^+\d]/g, "")}`}><span><DrawerIcon name="phone"/></span><b>{contacts.phone1}{contacts.phone2 && <><br/>{contacts.phone2}</>}</b></a>}{contacts.instagramUrl && <a className="drawer-contact" href={contacts.instagramUrl} target="_blank" rel="noreferrer"><span className="instagram"><DrawerIcon name="instagram"/></span><b>@diyorburger</b></a>}{mapHref && <a className="drawer-contact" href={mapHref} target="_blank" rel="noreferrer"><span><DrawerIcon name="location"/></span><b>{contacts.address}</b></a>}<Image className="drawer-thank-you" src="/images/drawer-thank-you.jpg" alt="Спасибо, что вы с нами!" width={1280} height={960}/></footer>
  </aside></div>}</>;
}
