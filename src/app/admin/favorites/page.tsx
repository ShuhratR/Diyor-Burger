import { requireAdmin } from "@/lib/auth/admin";
import { getActiveProducts } from "@/lib/menu/catalog";
import { FavoritesList } from "@/features/favorites/favorites-list";
import { AdminWorkspaceBar } from "@/features/admin/admin-workspace-bar";

export default async function AdminFavoritesPage() {
  await requireAdmin();
  const products = await getActiveProducts();
  return <><AdminWorkspaceBar title="Избранное"/><FavoritesList products={products.data ?? []}/></>;
}
