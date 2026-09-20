import Link from "next/link";
import type { Category } from "@/lib/menu/types";
export function CategoryStrip({categories, active}:{categories:Category[];active?:string}) { return <nav className="category-strip" aria-label="Категории"><Link className={!active?"selected":""} href="/menu">Все</Link>{categories.map(c=><Link className={active===c.slug?"selected":""} key={c.id} href={`/menu/${c.slug}`}>{c.name}</Link>)}</nav>; }
