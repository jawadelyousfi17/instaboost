import { NextResponse } from "next/server";

import { handlePaygateCallback, PaygateOrderNotFoundError } from "@/lib/paygate";

// PayGate's bot hits this with GET when a payment settles. The callback is
// UNSIGNED, so we never trust its query params — handlePaygateCallback
// re-verifies status server-side via payment-status.php before crediting.
// Needs the Node runtime (Prisma); never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const invoice = url.searchParams.get("invoice");
  if (!invoice) {
    return NextResponse.json({ error: "missing invoice" }, { status: 400 });
  }

  // Capture every query param PayGate appended, for audit storage only.
  const raw: Record<string, string> = {};
  url.searchParams.forEach((v, k) => {
    raw[k] = v;
  });

  try {
    const result = await handlePaygateCallback(invoice, raw);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    if (e instanceof PaygateOrderNotFoundError) {
      return NextResponse.json({ error: "unknown invoice" }, { status: 404 });
    }
    const detail = e instanceof Error ? e.message.slice(0, 200) : String(e);
    console.error("paygate callback:", detail, e);
    return NextResponse.json({ error: "server", detail }, { status: 500 });
  }
}
