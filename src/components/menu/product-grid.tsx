import type { Product } from "@/lib/menu/types";
import { ProductCard } from "./product-card";
export function ProductGrid({products}:{products:Product[]}) { return products.length ? <div className="product-grid">{products.map(product=><ProductCard product={product} key={product.id}/>)}</div> : <p className="notice">Подходящих блюд пока нет.</p>; }
