"use client";
import Link from "next/link";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/features/cart/cart-provider";
import { clearCheckoutSession, readReady } from "./ready";
export function WhatsAppReady(){const router=useRouter();const cart=useCart();const[url,setUrl]=useState<string|null>(null);const[opened,setOpened]=useState(false);useEffect(()=>queueMicrotask(()=>setUrl(readReady(sessionStorage))),[]);if(url===null)return <section className="section"><h1>Проверяем заказ…</h1></section>;if(!url){router.replace("/checkout/review");return <section className="section"><h1>Проверяем заказ…</h1></section>;}return <section className="section"><h1>Заказ готов к отправке</h1><p className="notice">Откройте WhatsApp и отправьте подготовленное сообщение.</p><a className="cta" href={url} target="_blank" rel="noreferrer" onClick={()=>setOpened(true)}>Открыть WhatsApp</a>{opened&&<div className="notice"><p>Если вы уже отправили заказ, можете очистить корзину.</p><button className="cta" onClick={()=>{cart.clearCart();clearCheckoutSession(sessionStorage);router.push("/")}}>Я отправил заказ — очистить корзину</button></div>}<Link className="cta" href="/checkout/review">Вернуться к проверке</Link></section>}
