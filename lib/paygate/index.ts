import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getAppUrl } from "@/lib/site";

/**
 * PayGate.to crypto/card payment gateway client + delivery logic.
 *
 * Docs: https://documenter.getpostman.com/view/14826208/2sA3Bj9aBi
 *
 * The API is keyless and anonymous. Flow:
 *   1. wallet.php  — create a temporary encrypted receiving wallet bound to a
 *      unique callback URL. Returns `address_in` (encrypted, URL-encoded) and a
 *      secret `ipn_token`.
 *   2. Redirect the customer to the hosted checkout (pay.php multi-provider, or
 *      process-payment.php for a single provider) passing `address_in`.
 *   3. PayGate forwards USDC (Polygon) to our merchant wallet and hits our
 *      callback URL (UNSIGNED) when paid.
 *   4. We re-verify with payment-status.php using the `ipn_token` before
 *      crediting — the callback itself is not trustworthy on its own.
 */

const API_BASE = process.env.PAYGATE_API_BASE?.replace(/\/+$/, "") || "https://api.paygate.to";
const CHECKOUT_BASE =
  process.env.PAYGATE_CHECKOUT_BASE?.replace(/\/+$/, "") || "https://checkout.paygate.to";

/** Merchant USDC (Polygon) wallet that receives instant payouts. Required. */
export function getMerchantAddress(): string {
  const addr = process.env.PAYGATE_MERCHANT_ADDRESS?.trim();
  if (!addr) {
    throw new Error("PAYGATE_MERCHANT_ADDRESS is not set (your USDC Polygon payout wallet)");
  }
  return addr;
}

/** wallet.php response. `address_in` is already URL-encoded — never re-encode it. */
export type PaygateWallet = {
  address_in: string;
  polygon_address_in: string;
  callback_url: string;
  ipn_token: string;
};

/** payment-status.php response. Unpaid orders return only `{ status: "unpaid" }`. */
export type PaygatePaymentStatus = {
  status: "paid" | "unpaid";
  value_coin?: string;
  txid_out?: string;
  coin?: string;
};

/**
 * Create a temporary encrypted receiving wallet for one checkout.
 * `callbackUrl` MUST carry a unique query param (we use `?invoice=<id>`) — reusing
 * a callback returns the same wallet, which would conflate two purchases.
 */
export async function createWallet(callbackUrl: string): Promise<PaygateWallet> {
  const url =
    `${API_BASE}/control/wallet.php` +
    `?address=${encodeURIComponent(getMerchantAddress())}` +
    `&callback=${encodeURIComponent(callbackUrl)}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`PayGate wallet.php failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as Partial<PaygateWallet>;
  if (!json.address_in || !json.ipn_token || !json.polygon_address_in) {
    throw new Error("PayGate wallet.php returned an unexpected shape");
  }
  return json as PaygateWallet;
}

/**
 * Build the hosted checkout URL the customer is redirected to.
 *
 * `addressIn` is inserted verbatim because wallet.php already URL-encodes it;
 * the remaining params are encoded normally. Defaults to multi-provider
 * (`pay.php`) which auto-selects card / Apple Pay / Google Pay / bank by the
 * customer's location and amount. Set PAYGATE_PROVIDER to force a single
 * provider via `process-payment.php` instead.
 */
export function buildCheckoutUrl(opts: {
  addressIn: string;
  amount: number;
  email: string;
  currency: string;
}): string {
  const provider = process.env.PAYGATE_PROVIDER?.trim();
  const q =
    `address=${opts.addressIn}` +
    `&amount=${encodeURIComponent(opts.amount.toString())}` +
    `&email=${encodeURIComponent(opts.email)}` +
    `&currency=${encodeURIComponent(opts.currency)}`;

  return provider
    ? `${CHECKOUT_BASE}/process-payment.php?${q}&provider=${encodeURIComponent(provider)}`
    : `${CHECKOUT_BASE}/pay.php?${q}`;
}

/** Re-verify a payment server-side using the secret token. Source of truth. */
export async function fetchPaymentStatus(ipnToken: string): Promise<PaygatePaymentStatus> {
  const url = `${API_BASE}/control/payment-status.php?ipn_token=${encodeURIComponent(ipnToken)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`PayGate payment-status.php failed: HTTP ${res.status}`);
  }
  return (await res.json()) as PaygatePaymentStatus;
}

/** Thrown when the callback references an unknown invoice id. Maps to HTTP 404. */
export class PaygateOrderNotFoundError extends Error {
  constructor(invoiceId: string) {
    super(`No PayGate order for invoice ${invoiceId}`);
    this.name = "PaygateOrderNotFoundError";
  }
}

export type PaygateDeliveryResult =
  | { status: "credited"; coins: number }
  | { status: "already_paid" }
  | { status: "unpaid" };

/**
 * Handle a callback hit for `invoiceId`. Re-verifies against PayGate, then
 * credits coins exactly once.
 *
 * Idempotency: the coin grant runs only if `updateMany({ status: PENDING })`
 * flips a row (returns count 1). Concurrent / duplicate callbacks see count 0
 * and return `already_paid` without double-crediting.
 *
 * `rawCallback` is whatever query params PayGate appended — stored for audit
 * only; never trusted for the paid decision.
 */
export async function handlePaygateCallback(
  invoiceId: string,
  rawCallback: Record<string, string>,
): Promise<PaygateDeliveryResult> {
  const order = await prisma.paygateOrder.findUnique({ where: { id: invoiceId } });
  if (!order) throw new PaygateOrderNotFoundError(invoiceId);

  if (order.status === "PAID") return { status: "already_paid" };

  // Trust ONLY the server-side status check, not the unsigned callback params.
  const verified = await fetchPaymentStatus(order.ipnToken);
  if (verified.status !== "paid") return { status: "unpaid" };

  // Flip PENDING -> PAID atomically. count === 1 means we won the race to credit.
  const flipped = await prisma.paygateOrder.updateMany({
    where: { id: order.id, status: "PENDING" },
    data: {
      status: "PAID",
      paidAt: new Date(),
      valueCoin: verified.value_coin ?? null,
      coin: verified.coin ?? null,
      txidOut: verified.txid_out ?? null,
      rawCallback: rawCallback as unknown as Prisma.InputJsonValue,
    },
  });
  if (flipped.count === 0) return { status: "already_paid" };

  if (order.coinsGranted > 0 && order.profileId) {
    await prisma.$transaction([
      prisma.profile.update({
        where: { id: order.profileId },
        data: { coins: { increment: order.coinsGranted } },
      }),
      prisma.transaction.create({
        data: { profileId: order.profileId, delta: order.coinsGranted, kind: "TOPUP" },
      }),
    ]);
  }

  return { status: "credited", coins: order.coinsGranted };
}

/** Default callback URL for a given invoice id. */
export function callbackUrlFor(invoiceId: string): string {
  return `${getAppUrl()}/paygate/callback?invoice=${encodeURIComponent(invoiceId)}`;
}
