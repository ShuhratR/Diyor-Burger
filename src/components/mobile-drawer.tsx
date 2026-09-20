"use client";
import Link from "next/link";
import { useState } from "react";
const links=[["Главная","/"],["Меню","/menu"],["Комбо","/combos"],["Контакты","/contacts"],["Избранное","/favorites"]] as const;
export function MobileDrawer(){const[open,setOpen]=useState(false);return <><button className="menu-button" onClick={()=>setOpen(true)} aria-label="Открыть меню">☰</button>{open&&<div className="drawer-backdrop" onClick={()=>setOpen(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button onClick={()=>setOpen(false)} aria-label="Закрыть меню">×</button><p className="drawer-brand">DIYOR <b>BURGER</b></p><nav>{links.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}<span>›</span></Link>)}</nav></aside></div>}</>}
