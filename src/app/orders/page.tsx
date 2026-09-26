"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readOrderHistory, type OrderHistoryEntry } from "@/features/checkout/order-history";
import { formatSomoni } from "@/lib/money";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderHistoryEntry[] | null>(null);
  useEffect(() => { const timer = window.setTimeout(() => setOrders(readOrderHistory(localStorage)), 0); return () => window.clearTimeout(timer); }, []);
  return <section className="section orders-page"><h1>Мои заказы</h1><p className="orders-note">Здесь хранятся только заказы, которые вы передали в WhatsApp с этого устройства. Подтверждение ресторана показывается отдельно.</p>{orders === null ? <p className="notice">Загружаем историю…</p> : orders.length === 0 ? <div className="orders-empty"><h2>Заказов пока нет</h2><p>Выберите блюда, оформите заказ и отправьте его в WhatsApp.</p><Link className="cta" href="/menu">Перейти в меню</Link></div> : <div className="orders-list">{orders.map((order) => <article key={order.id}><div><b>{new Date(order.createdAt).toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" })}</b><span>{order.itemCount} поз. · {order.fulfillment === "pickup" ? "Самовывоз" : "Доставка"}</span></div><strong>{formatSomoni(order.totalDiram)}</strong><small>Передан в WhatsApp — ожидает подтверждения ресторана</small><Link href="/menu">Повторить в меню</Link></article>)}</div>}</section>;
}
