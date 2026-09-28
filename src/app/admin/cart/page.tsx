import { requireAdmin } from "@/lib/auth/admin";
import { getActiveProducts, getPublicRestaurantSettings } from "@/lib/menu/catalog";
import { ReferenceCartView } from "@/features/cart/reference-cart-view";
import { AdminWorkspaceBar } from "@/features/admin/admin-workspace-bar";

export default async function AdminCartPage() {
  await requireAdmin();
  const [products,settings] = await Promise.all([getActiveProducts(),getPublicRestaurantSettings()]);
  return <><AdminWorkspaceBar title="Корзина"/><ReferenceCartView products={products.data ?? []} settings={settings.data??undefined} adminMode/></>;
}
