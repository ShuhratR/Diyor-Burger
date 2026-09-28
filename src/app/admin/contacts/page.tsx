import { requireAdmin } from "@/lib/auth/admin";
import ContactsPage from "@/app/contacts/page";
import { AdminContentOverlay } from "@/features/admin/admin-content-overlay";
import { getAdminContentSettings } from "@/features/admin/admin-settings-loader";

export default async function AdminContactsPage() {
  await requireAdmin();
  const settings = await getAdminContentSettings();
  if (!settings) return <p className="notice">Данные недоступны</p>;
  return (
    <AdminContentOverlay title="Контакты" settings={settings}>
      <ContactsPage />
    </AdminContentOverlay>
  );
}
