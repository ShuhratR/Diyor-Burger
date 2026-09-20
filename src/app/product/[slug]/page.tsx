import { notFound } from "next/navigation";
import { FoodImage } from "@/components/menu/food-image";
import { VariantSelector } from "@/components/menu/variant-selector";
import { formatSomoni } from "@/lib/money";
import { getProductBySlug } from "@/lib/menu/catalog";
import { productDisplayPrice } from "@/lib/menu/logic";
import { ProductPurchase } from "@/components/menu/product-purchase";
export default async function ProductPage({params}:{params:Promise<{slug:string}>}) { const {slug}=await params; const product=await getProductBySlug(slug); if(!product)notFound(); const price=productDisplayPrice(product); return <article className="product-detail"><FoodImage src={product.imageUrl} alt={product.name}/><h1>{product.name}</h1><p className="lead">{product.description}</p><section><h2>Состав</h2><p>{product.ingredientsText}</p></section>{product.productType==="COMBO"&&<section><h2>Что входит в комбо</h2><ol>{product.comboComponents?.map(c=><li key={c.id}>{c.name} × {c.quantity}{c.description?`: ${c.description}`:""}</li>)}</ol></section>}{product.productType==="PIZZA"?<VariantSelector productId={product.id} variants={product.variants??[]}/>:<><div className="product-price"><strong>{formatSomoni(price??0)}</strong>{product.isAvailable?<span>В наличии</span>:<span className="availability">Нет в наличии</span>}</div><ProductPurchase productId={product.id} priceDiram={price??0} available={product.isAvailable}/></>}</article>; }
