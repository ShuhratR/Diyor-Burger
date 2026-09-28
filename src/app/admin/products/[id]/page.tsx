import { redirect } from "next/navigation";

// Размеры пиццы редактируются в карточке товара на /admin/products.
// Старые ссылки сохраняем, но не оставляем параллельную техническую форму.
export default async function Page(){ redirect("/admin/products"); }
