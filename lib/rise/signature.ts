import crypto from "node:crypto";

/**
 * HMAC-SHA256 signature verification for inbound Rise webhooks.
 *
 * The signature is computed over `"<timestamp>.<raw_request_body>"`, hex
 * encoded, using the shared secret `RISE_WEBHOOK_SECRET`. Everything here is
 * pure (the caller injects `secret` and `nowSeconds`) so it can be unit tested
 * without a server or clock.
 */

/** Max allowed clock skew between Rise and us, in seconds. */
export const MAX_SKEW_SECONDS = 300;

export type SignatureFailure = "bad signature header" | "stale" | "bad signature";

export type VerifyResult =
  | { ok: true }
  | { ok: false; reason: SignatureFailure; status: 400 | 401 };

type ParsedHeader = { ts: number; v1: string };

/** Parse `x-rise-signature: t=<unix_ts>,v1=<hex_hmac_sha256>`. */
export function parseSignatureHeader(header: string | null): ParsedHeader | null {
  if (!header) return null;

  const parts = Object.fromEntries(
    header.split(",").map((p) => {
      const idx = p.indexOf("=");
      return idx === -1 ? [p.trim(), ""] : [p.slice(0, idx).trim(), p.slice(idx + 1).trim()];
    }),
  );

  const ts = Number(parts.t);
  const v1 = parts.v1;
  if (!Number.isFinite(ts) || ts <= 0 || !v1) return null;

  return { ts, v1 };
}

/** Constant-time hex comparison that never throws on malformed input. */
function timingSafeHexEqual(aHex: string, bHex: string): boolean {
  let a: Buffer;
  let b: Buffer;
  try {
    a = Buffer.from(aHex, "hex");
    b = Buffer.from(bHex, "hex");
  } catch {
    return false;
  }
  if (a.length === 0 || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/**
 * Verify a Rise webhook signature.
 *
 * @param rawBody     The raw request body string, captured before JSON parsing.
 * @param header      The `x-rise-signature` header value (or null).
 * @param secret      The shared `RISE_WEBHOOK_SECRET`.
 * @param nowSeconds  Current unix time in seconds (injected for testability).
 */
export function verifyRiseSignature(
  rawBody: string,
  header: string | null,
  secret: string,
  nowSeconds: number,
): VerifyResult {
  const parsed = parseSignatureHeader(header);
  if (!parsed) return { ok: false, reason: "bad signature header", status: 400 };

  if (Math.abs(nowSeconds - parsed.ts) > MAX_SKEW_SECONDS) {
    return { ok: false, reason: "stale", status: 400 };
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${parsed.ts}.${rawBody}`)
    .digest("hex");

  if (!timingSafeHexEqual(parsed.v1, expected)) {
    return { ok: false, reason: "bad signature", status: 401 };
  }

  return { ok: true };
}
