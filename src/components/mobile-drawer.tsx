"use client";
import Link from "next/link";
import { useState } from "react";
import { LanguageSwitch, useLanguage } from "@/features/i18n/language-provider";
import { copy } from "@/lib/i18n";
const links=[["home","/"],["menu","/menu"],["combos","/combos"],["contacts","/contacts"],["favorites","/favorites"]] as const;
export function MobileDrawer(){const[open,setOpen]=useState(false);const{language}=useLanguage();const t=copy[language];return <><button className="menu-button" onClick={()=>setOpen(true)} aria-label="Открыть меню"><span/><span/><span/></button>{open&&<div className="drawer-backdrop" onClick={()=>setOpen(false)}><aside className="drawer" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={()=>setOpen(false)} aria-label="Закрыть меню">×</button><p className="drawer-brand"><span>DB</span> DIYOR <b>BURGER</b></p><LanguageSwitch/><nav>{links.map(([key,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{t[key]}<span>›</span></Link>)}</nav></aside></div>}</>}
