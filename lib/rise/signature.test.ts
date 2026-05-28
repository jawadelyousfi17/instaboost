import assert from "node:assert/strict";
import crypto from "node:crypto";
import { test } from "node:test";

import { parseSignatureHeader, verifyRiseSignature } from "./signature";

const SECRET = "test-secret";
const NOW = 1_738_096_800;

function sign(body: string, ts: number, secret = SECRET): string {
  return crypto.createHmac("sha256", secret).update(`${ts}.${body}`).digest("hex");
}

test("rejects missing / malformed signature header", () => {
  const body = "{}";
  assert.deepEqual(verifyRiseSignature(body, null, SECRET, NOW), {
    ok: false,
    reason: "bad signature header",
    status: 400,
  });
  assert.equal(verifyRiseSignature(body, "garbage", SECRET, NOW).ok, false);
  assert.equal(parseSignatureHeader("t=,v1="), null);
});

test("rejects stale timestamp (outside ±300s)", () => {
  const ts = NOW - 600;
  const header = `t=${ts},v1=${sign("{}", ts)}`;
  const r = verifyRiseSignature("{}", header, SECRET, NOW);
  assert.deepEqual(r, { ok: false, reason: "stale", status: 400 });
});

test("rejects bad signature", () => {
  const ts = NOW;
  const header = `t=${ts},v1=${"a".repeat(64)}`;
  const r = verifyRiseSignature("{}", header, SECRET, NOW);
  assert.deepEqual(r, { ok: false, reason: "bad signature", status: 401 });

  // right shape, wrong secret
  const wrong = `t=${ts},v1=${sign("{}", ts, "other-secret")}`;
  assert.equal(verifyRiseSignature("{}", wrong, SECRET, NOW).ok, false);
});

test("accepts a valid signature", () => {
  const body = JSON.stringify({ email: "alice@example.com", orderId: "ord_1", timestamp: NOW });
  const header = `t=${NOW},v1=${sign(body, NOW)}`;
  assert.deepEqual(verifyRiseSignature(body, header, SECRET, NOW), { ok: true });
});
