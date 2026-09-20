import { notFound } from "next/navigation";
import { CategoryStrip } from "@/components/menu/category-strip";
import { ProductGrid } from "@/components/menu/product-grid";
import { getActiveCategories, getProductsByCategory } from "@/lib/menu/catalog";
export default async function CategoryPage({params}:{params:Promise<{categorySlug:string}>}) { const {categorySlug}=await params; const [categories,result]=await Promise.all([getActiveCategories(),getProductsByCategory(categorySlug)]); if(!result)notFound(); return <section className="section"><h1>{result.category.name}</h1>{categories.data&&<CategoryStrip categories={categories.data} active={categorySlug}/>} {result.products.data?<ProductGrid products={result.products.data}/>:<p className="notice">Меню временно недоступно.</p>}</section>; }
