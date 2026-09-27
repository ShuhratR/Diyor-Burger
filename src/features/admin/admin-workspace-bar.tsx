"use client";

import { useRouter } from "next/navigation";
import "./admin-client-home.css";

export function AdminWorkspaceBar({ title }: { title: string }) {
  const router = useRouter();
  return <aside className="admin-mode-bar admin-workspace-bar" aria-label="Панель администратора"><span><i>●</i> Администратор · {title}</span><div><button type="button" onClick={() => router.push("/admin")}>К витрине</button><button type="button" onClick={() => router.push(title === "Комбо" ? "/combos" : "/menu")}>Предпросмотр</button></div></aside>;
}
