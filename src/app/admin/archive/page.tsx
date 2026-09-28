import { requireAdmin } from "@/lib/auth/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AdminWorkspaceBar } from "@/features/admin/admin-workspace-bar";
import { restoreArchived } from "@/features/admin/archive-actions";

type Entry = {
  id: string;
  name: string;
  kind: "products" | "product_variants" | "categories" | "delivery_zones" | "banners";
  label: string;
  archivedAt: string;
};
export default async function ArchivePage() {
  await requireAdmin();
  const client = await createSupabaseServerClient();
  if (!client) return <p className="notice">Данные недоступны</p>;
  const [products, variants, categories, zones, banners] = await Promise.all([
    client
      .from("products")
      .select("id,name,product_type,archived_at")
      .not("archived_at", "is", null),
    client
      .from("product_variants")
      .select("id,name,archived_at")
      .not("archived_at", "is", null),
    client
      .from("categories")
      .select("id,name,archived_at")
      .not("archived_at", "is", null),
    client
      .from("delivery_zones")
      .select("id,name,archived_at")
      .not("archived_at", "is", null),
    client
      .from("banners")
      .select("id,title,archived_at")
      .not("archived_at", "is", null),
  ]);
  const entries: Entry[] = [
    ...(products.data ?? []).map((x) => ({
      id: String(x.id),
      name: String(x.name),
      kind: "products" as const,
      label: x.product_type === "COMBO" ? "Комбо" : "Товар",
      archivedAt: String(x.archived_at),
    })),
    ...(variants.data ?? []).map((x) => ({
      id: String(x.id),
      name: String(x.name),
      kind: "product_variants" as const,
      label: "Размер пиццы",
      archivedAt: String(x.archived_at),
    })),
    ...(categories.data ?? []).map((x) => ({
      id: String(x.id),
      name: String(x.name),
      kind: "categories" as const,
      label: "Категория",
      archivedAt: String(x.archived_at),
    })),
    ...(zones.data ?? []).map((x) => ({
      id: String(x.id),
      name: String(x.name),
      kind: "delivery_zones" as const,
      label: "Зона доставки",
      archivedAt: String(x.archived_at),
    })),
    ...(banners.data ?? []).map((x) => ({
      id: String(x.id),
      name: String(x.title),
      kind: "banners" as const,
      label: "Баннер",
      archivedAt: String(x.archived_at),
    })),
  ];
  return (
    <>
      <AdminWorkspaceBar title="Архив" />
      <section className="admin-workspace">
        <header className="admin-workspace-head">
          <div>
            <p>СКРЫТОЕ ОТ КЛИЕНТОВ</p>
            <h2>Архив</h2>
            <span>Восстановленные позиции снова появятся в витрине.</span>
          </div>
        </header>
        {entries.length ? (
          <div className="admin-product-grid">
            {entries.map((entry) => (
              <article
                className="admin-product-card"
                key={`${entry.kind}-${entry.id}`}
              >
                <div>
                  <span>{entry.label}</span>
                  <h3>{entry.name}</h3>
                  <p>
                    В архиве с{" "}
                    {new Date(entry.archivedAt).toLocaleDateString("ru-RU")}
                  </p>
                  <form action={restoreArchived}>
                    <input type="hidden" name="id" value={entry.id} />
                    <input type="hidden" name="table" value={entry.kind} />
                    <button className="admin-save">↺ Восстановить</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="notice">Архив пока пуст.</p>
        )}
      </section>
    </>
  );
}
