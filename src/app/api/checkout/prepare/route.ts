import { NextResponse } from "next/server";
import { getActiveDeliveryZones, getActiveProducts, getCheckoutRestaurantSettings } from "@/lib/menu/catalog";
import { prepareCheckout } from "@/features/checkout/prepare-server";

export async function POST(request: Request) {
  // Reject malformed requests before touching the database.
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, code: "INVALID_CHECKOUT" }, { status: 400 });
  }
  const [products, zones, settings] = await Promise.all([
    getActiveProducts(), getActiveDeliveryZones(), getCheckoutRestaurantSettings(),
  ]);
  if (!products.data || !zones.data || !settings.data) {
    return NextResponse.json({ ok: false, code: "SETTINGS_UNAVAILABLE" }, { status: 503 });
  }
  const result = prepareCheckout(payload, products.data, zones.data, settings.data);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
