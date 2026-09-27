import { requireAdmin } from "@/lib/auth/admin";
import { getActiveProducts } from "@/lib/menu/catalog";
import { ReferenceCartView } from "@/features/cart/reference-cart-view";
import { AdminWorkspaceBar } from "@/features/admin/admin-workspace-bar";

export default async function AdminCartPage() {
  await requireAdmin();
  const products = await getActiveProducts();
  return <><AdminWorkspaceBar title="Корзина"/><ReferenceCartView products={products.data ?? []}/></>;
}
