import { z } from "zod";
import type { PreparedCheckout } from "./prepare-server";
export const checkoutReadyStorageKey="diyor-checkout-ready";
const schema=z.object({version:z.literal(1),url:z.string().url()});
export function saveReady(storage:Pick<Storage,"setItem">,summary:PreparedCheckout){storage.setItem(checkoutReadyStorageKey,JSON.stringify({version:1,url:summary.canonicalWhatsAppUrl}))}
export function readReady(storage:Pick<Storage,"getItem">){try{const x=schema.safeParse(JSON.parse(storage.getItem(checkoutReadyStorageKey)??""));return x.success?x.data.url:null}catch{return null}}
export function clearCheckoutSession(storage:Pick<Storage,"removeItem">){storage.removeItem("diyor-checkout-draft");storage.removeItem(checkoutReadyStorageKey)}
