"use client";
import Link from "next/link";
import type { Category } from "@/lib/menu/types";
import { useLanguage } from "@/features/i18n/language-provider";
import { copy, localizedName } from "@/lib/i18n";
import { DiyorIcon, type DiyorIconName } from "@/components/diyor-icon";
import { FoodImage } from "./food-image";
const categoryIcons: Record<string, DiyorIconName> = { burgers:"category-burger", hotdogs:"category-hotdog", rolls:"category-roll", pizza:"category-pizza", sides:"category-fries", drinks:"category-drink", combos:"category-combo" };
export function CategoryStrip({categories, active, showAll=true, showImages=true}:{categories:Category[];active?:string;showAll?:boolean;showImages?:boolean}) { const{language}=useLanguage();const t=copy[language];return <nav className={`category-strip category-strip-visual ${showImages?"category-strip-images":""}`} aria-label={t.categories}>{showAll&&<Link className={!active?"selected":""} href="/menu"><DiyorIcon name="category-other" className="category-glyph"/>{language==="ru"?"Все":"Ҳама"}</Link>}{categories.map((c,index)=><Link className={active===c.slug||(!active&&!showAll&&index===0)?"selected":""} key={c.id} href={`/menu/${c.slug}`}>{showImages&&c.imageUrl?<FoodImage compact src={c.imageUrl} alt=""/>:<DiyorIcon name={categoryIcons[c.slug] ?? "category-other"} className="category-glyph"/>}<span>{localizedName(c,language)}</span></Link>)}</nav>; }
