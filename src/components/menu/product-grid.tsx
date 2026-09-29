import type { Product } from "@/lib/menu/types";
import { ProductCard } from "./product-card";
export function ProductGrid({products,onQuickViewChange}:{products:Product[];onQuickViewChange?:(open:boolean)=>void}) { return products.length ? <div className="product-grid menu-product-grid">{products.map(product=><ProductCard product={product} onQuickViewChange={onQuickViewChange} key={product.id}/>)}</div> : <p className="notice">Подходящих блюд пока нет.</p>; }
