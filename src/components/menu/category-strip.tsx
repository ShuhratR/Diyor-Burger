import Link from "next/link";
import type { Category } from "@/lib/menu/types";
import { useLanguage } from "@/features/i18n/language-provider";
import { copy, localizedName } from "@/lib/i18n";
export function CategoryStrip({categories, active}:{categories:Category[];active?:string}) { const{language}=useLanguage();const t=copy[language];return <nav className="category-strip" aria-label={t.categories}><Link className={!active?"selected":""} href="/menu">{language==="ru"?"Все":"Ҳама"}</Link>{categories.map(c=><Link className={active===c.slug?"selected":""} key={c.id} href={`/menu/${c.slug}`}>{localizedName(c,language)}</Link>)}</nav>; }
