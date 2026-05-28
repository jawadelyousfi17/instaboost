import { NextResponse } from "next/server";

import {
  handleRiseOrder,
  verifyRiseSignature,
  describeRiseError,
  UserNotFoundError,
  type RisePayload,
} from "@/lib/rise";

// `upadte` is the agreed wire path with Rise — do NOT "fix" the typo.
// Needs the Node runtime for node:crypto + Prisma; never cache.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const secret = process.env.RISE_WEBHOOK_SECRET;
  if (!secret) {
    console.error("rise webhook: RISE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "server", detail: "RISE_WEBHOOK_SECRET is not set on Elyosoft" },
      { status: 500 },
    );
  }

  // Raw body, captured before any JSON parsing — the signature covers these bytes.
  const raw = await req.text();
  const header = req.headers.get("x-rise-signature");

  const verdict = verifyRiseSignature(raw, header, secret, Math.floor(Date.now() / 1000));
  if (!verdict.ok) {
    const ip = req.headers.get("x-forwarded-for") ?? "unknown";
    console.warn(`rise webhook: ${verdict.reason} from ${ip}`);
    return NextResponse.json({ error: verdict.reason }, { status: verdict.status });
  }

  let payload: RisePayload;
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  try {
    await handleRiseOrder(payload);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof UserNotFoundError) {
      return NextResponse.json(
        { error: "user not found", detail: `no Elyosoft user for email ${payload.email}` },
        { status: 404 },
      );
    }
    const detail = describeRiseError(e);
    console.error("rise webhook:", detail, e);
    return NextResponse.json({ error: "server", detail }, { status: 500 });
  }
}
