import { ProductGrid } from "@/components/menu/product-grid";
import { SearchBox } from "@/components/menu/search-box";
import { searchProducts } from "@/lib/menu/catalog";
export default async function SearchPage({searchParams}:{searchParams:Promise<{q?:string}>}) { const {q=""}=await searchParams; const results=q.trim()?await searchProducts(q):null; return <section className="section"><h1>Поиск</h1><SearchBox initial={q}/>{q&&<h2 className="results-title">Результаты: «{q}»</h2>}{results?.data?<ProductGrid products={results.data}/>:q?<p className="notice">Поиск временно недоступен.</p>:<p className="notice">Введите название блюда или ингредиента.</p>}</section>; }
