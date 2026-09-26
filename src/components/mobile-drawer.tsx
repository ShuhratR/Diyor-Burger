"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/features/i18n/language-provider";
import { DiyorIcon, type DiyorIconName } from "./diyor-icon";
const links:{label:string;href:string;icon:DiyorIconName}[]=[{label:"Главная",href:"/",icon:"category-other"},{label:"Меню",href:"/menu",icon:"utensils"},{label:"Комбо",href:"/combos",icon:"category-combo"},{label:"Доставка",href:"/checkout",icon:"scooter"},{label:"Контакты",href:"/contacts",icon:"phone"},{label:"Избранное",href:"/favorites",icon:"heart-outline"}];
export function MobileDrawer(){
  const [open,setOpen]=useState(false);
  const dialogRef=useRef<HTMLElement>(null);
  useLanguage();
  useEffect(()=>{
    if(!open)return;
    const previousOverflow=document.body.style.overflow;
    const focusables=()=>Array.from(dialogRef.current?.querySelectorAll<HTMLElement>('button,[href]')??[]);
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){setOpen(false);return;}
      if(event.key!=="Tab")return;
      const items=focusables(); if(!items.length)return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    };
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",onKeyDown);
    focusables()[0]?.focus();
    return()=>{document.body.style.overflow=previousOverflow;window.removeEventListener("keydown",onKeyDown);};
  },[open]);
  return <><button className="menu-button" onClick={()=>setOpen(true)} aria-expanded={open} aria-label="Открыть меню"><span/><span/><span/></button>{open&&<div className="drawer-backdrop" onClick={()=>setOpen(false)}><aside className="drawer" ref={dialogRef} role="dialog" aria-modal="true" aria-label="Меню" onClick={e=>e.stopPropagation()}><button className="drawer-close" onClick={()=>setOpen(false)} aria-label="Закрыть меню">×</button><p className="drawer-brand"><span>DB</span> DIYOR <b>BURGER</b></p><p className="drawer-script">Вкуснее каждый день! <b>♕</b></p><nav>{links.map(({label,href,icon})=><Link key={href} href={href} onClick={()=>setOpen(false)}><DiyorIcon name={icon}/><strong>{label}</strong><span>›</span></Link>)}</nav><footer className="drawer-footer"><p>DIYOR BURGER</p><Link href="/contacts" onClick={()=>setOpen(false)}>Контакты и помощь</Link></footer></aside></div>}</>}
