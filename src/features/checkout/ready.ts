import { z } from "zod";
import type { PreparedCheckout } from "./prepare-server";
import { makeOrderHistoryEntry, type OrderHistoryEntry } from "./order-history";
export const checkoutReadyStorageKey="diyor-checkout-ready";
const ttlMs=30*60*1000;const schema=z.object({version:z.literal(1),url:z.string().url(),createdAt:z.number().int().nonnegative(),order:z.object({id:z.string(),createdAt:z.number(),totalDiram:z.number(),itemCount:z.number(),fulfillment:z.union([z.literal("delivery"),z.literal("pickup")]),status:z.literal("sent_to_whatsapp")}).optional()});
export function saveReady(storage:Pick<Storage,"setItem">,summary:PreparedCheckout,now=Date.now()){storage.setItem(checkoutReadyStorageKey,JSON.stringify({version:1,url:summary.canonicalWhatsAppUrl,createdAt:now,order:makeOrderHistoryEntry(summary,now)}))}
export function readReady(storage:Pick<Storage,"getItem">,now=Date.now()){try{const x=schema.safeParse(JSON.parse(storage.getItem(checkoutReadyStorageKey)??""));return x.success&&now-x.data.createdAt<=ttlMs?x.data.url:null}catch{return null}}
export function readReadyOrder(storage:Pick<Storage,"getItem">,now=Date.now()):OrderHistoryEntry|null{try{const x=schema.safeParse(JSON.parse(storage.getItem(checkoutReadyStorageKey)??""));return x.success&&now-x.data.createdAt<=ttlMs?x.data.order??null:null}catch{return null}}
export function clearCheckoutSession(storage:Pick<Storage,"removeItem">){storage.removeItem("diyor-checkout-draft");storage.removeItem(checkoutReadyStorageKey)}
