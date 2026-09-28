import { requireAdmin } from "@/lib/auth/admin";
import {
  getActiveProducts,
  getPublicRestaurantSettings,
} from "@/lib/menu/catalog";
import { ReferenceCartView } from "@/features/cart/reference-cart-view";
import { AdminContentOverlay } from "@/features/admin/admin-content-overlay";
import { getAdminContentSettings } from "@/features/admin/admin-settings-loader";

export default async function AdminCartPage() {
  await requireAdmin();
  const [products, settings, adminSettings] = await Promise.all([
    getActiveProducts(),
    getPublicRestaurantSettings(),
    getAdminContentSettings(),
  ]);
  if (!adminSettings) return <p className="notice">Данные недоступны</p>;
  return (
    <AdminContentOverlay title="Корзина" settings={adminSettings}>
      <ReferenceCartView
        products={products.data ?? []}
        settings={settings.data ?? undefined}
        adminMode
      />
    </AdminContentOverlay>
  );
}
