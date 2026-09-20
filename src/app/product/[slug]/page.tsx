import { notFound } from "next/navigation";
import { FoodImage } from "@/components/menu/food-image";
import { VariantSelector } from "@/components/menu/variant-selector";
import { formatSomoni } from "@/lib/money";
import { getProductBySlug } from "@/lib/menu/catalog";
import { productDisplayPrice } from "@/lib/menu/logic";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const product=await getProductBySlug(slug); if(!product)notFound(); const price=productDisplayPrice(product); return <article className="product-detail"><FoodImage src={product.imageUrl} alt={product.name}/><h1>{product.name}</h1><p className="lead">{product.description}</p><section><h2>Состав</h2><p>{product.ingredientsText}</p></section>{product.productType==="COMBO"&&<section><h2>Что входит в комбо</h2><ol>{product.comboComponents?.map(c=><li key={c.id}>{c.name} × {c.quantity}{c.description?`: ${c.description}`:""}</li>)}</ol></section>}{product.productType==="PIZZA"?<VariantSelector variants={product.variants??[]}/>:<div className="product-price"><strong>{formatSomoni(price??0)}</strong><button disabled={!product.isAvailable} type="button">{product.isAvailable?"Корзина будет доступна позже":"Нет в наличии"}</button></div>}</article>; }
