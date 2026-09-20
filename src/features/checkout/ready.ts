import { z } from "zod";
import type { PreparedCheckout } from "./prepare-server";
export const checkoutReadyStorageKey="diyor-checkout-ready";
const ttlMs=30*60*1000;const schema=z.object({version:z.literal(1),url:z.string().url(),createdAt:z.number().int().nonnegative()});
export function saveReady(storage:Pick<Storage,"setItem">,summary:PreparedCheckout,now=Date.now()){storage.setItem(checkoutReadyStorageKey,JSON.stringify({version:1,url:summary.canonicalWhatsAppUrl,createdAt:now}))}
export function readReady(storage:Pick<Storage,"getItem">,now=Date.now()){try{const x=schema.safeParse(JSON.parse(storage.getItem(checkoutReadyStorageKey)??""));return x.success&&now-x.data.createdAt<=ttlMs?x.data.url:null}catch{return null}}
export function clearCheckoutSession(storage:Pick<Storage,"removeItem">){storage.removeItem("diyor-checkout-draft");storage.removeItem(checkoutReadyStorageKey)}
