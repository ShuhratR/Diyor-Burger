import { NextResponse } from "next/server";
import {
  getActiveDeliveryZones,
  getActiveProducts,
  getCheckoutRestaurantSettings,
} from "@/lib/menu/catalog";
import { prepareCheckout } from "@/features/checkout/prepare-server";

const MAX_CHECKOUT_BODY_CHARS = 32_000;

function json(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "cache-control": "no-store" },
  });
}

export async function POST(request: Request) {
  // Cheap abuse guard: do not let malformed/oversized checkout payloads reach
  // the database or product validation path.
  const announcedLength = Number(request.headers.get("content-length") ?? "0");
  if (
    Number.isFinite(announcedLength) &&
    announcedLength > MAX_CHECKOUT_BODY_CHARS
  ) {
    return json({ ok: false, code: "REQUEST_TOO_LARGE" }, 413);
  }

  let payload: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_CHECKOUT_BODY_CHARS)
      return json({ ok: false, code: "REQUEST_TOO_LARGE" }, 413);
    payload = JSON.parse(raw);
  } catch {
    return json({ ok: false, code: "INVALID_CHECKOUT" }, 400);
  }

  const [products, zones, settings] = await Promise.all([
    getActiveProducts(),
    getActiveDeliveryZones(),
    getCheckoutRestaurantSettings(),
  ]);
  if (!products.data || !zones.data || !settings.data) {
    return json({ ok: false, code: "SETTINGS_UNAVAILABLE" }, 503);
  }

  const result = prepareCheckout(
    payload,
    products.data,
    zones.data,
    settings.data,
  );
  return json(result, result.ok ? 200 : 400);
}
