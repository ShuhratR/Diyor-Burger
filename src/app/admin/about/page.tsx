import { requireAdmin } from "@/lib/auth/admin";
import AboutPage from "@/app/about/page";
import { AdminContentOverlay } from "@/features/admin/admin-content-overlay";
import { getAdminContentSettings } from "@/features/admin/admin-settings-loader";

export default async function AdminAboutPage() {
  await requireAdmin();
  const settings = await getAdminContentSettings();
  if (!settings) return <p className="notice">Данные недоступны</p>;
  return (
    <AdminContentOverlay title="О нас" settings={settings}>
      <AboutPage />
    </AdminContentOverlay>
  );
}
