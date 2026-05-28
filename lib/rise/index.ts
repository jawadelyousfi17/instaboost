import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";

export { verifyRiseSignature, parseSignatureHeader, MAX_SKEW_SECONDS } from "./signature";

/** Signed purchase event delivered by the Rise store. Prices are in cents. */
export type RisePayload = {
  email: string;
  price: number;
  currency: string;
  productId: string;
  productTitle: string;
  orderId: string;
  timestamp: number;
};

/**
 * Optional per-product coin overrides, keyed by Rise `productId`. Anything not
 * listed falls back to `priceToCoins(price)`.
 *
 * TODO: fill in real productId → coin mappings if specific Rise products should
 * grant a fixed coin amount regardless of price.
 */
export const RISE_PRODUCT_MAP: Record<string, number> = {};

/**
 * Convert a Rise price (cents) into Elyosoft coins.
 *
 * Mirrors the topup ratio in `app/topup/packages.ts`: $1 → 500 coins, i.e.
 * $20 (2000 cents) → 10,000 coins. So coins = cents * 5.
 */
export function priceToCoins(priceCents: number): number {
  return Math.max(0, Math.round((priceCents / 100) * 500));
}

/** Thrown when no Elyosoft user matches the purchase email. Maps to HTTP 404. */
export class UserNotFoundError extends Error {
  constructor(email: string) {
    super(`No Elyosoft user for email ${email}`);
    this.name = "UserNotFoundError";
  }
}

/**
 * Resolve a Supabase auth user id from an email, case-insensitively.
 *
 * Auth lives in Supabase while app data lives in Neon (Prisma), so we cannot
 * join across them — we ask the Supabase admin API. supabase-js has no email
 * filter, so we paginate `listUsers`.
 *
 * NOTE: O(users) per call. Fine at current scale; if the user base grows large,
 * replace with a Postgres function/RPC that indexes on `auth.users.email`.
 */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const target = email.trim().toLowerCase();
  const perPage = 1000;

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((u) => u.email?.toLowerCase() === target);
    if (match) return match.id;

    if (data.users.length < perPage) return null; // last page reached
  }
}

/**
 * Deliver a verified Rise purchase. Caller MUST verify the HMAC signature first.
 *
 * 1. Dedupe on `orderId` (no-op if already processed).
 * 2. Resolve the user by email (Supabase auth → Prisma Profile). 404 if absent.
 * 3. In one transaction: write the `rise_orders` ledger row, credit coins, and
 *    record a TOPUP transaction.
 *
 * Idempotency is enforced by the `order_id` primary key: a concurrent duplicate
 * that races past the pre-check hits a P2002 we swallow as success.
 */
export async function handleRiseOrder(p: RisePayload): Promise<void> {
  // 1. dedupe
  const existing = await prisma.riseOrder.findUnique({ where: { orderId: p.orderId } });
  if (existing) return;

  // 2. resolve user — auth user, then app profile
  const userId = await findAuthUserIdByEmail(p.email);
  if (!userId) throw new UserNotFoundError(p.email);

  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (!profile) throw new UserNotFoundError(p.email);

  const coins = RISE_PRODUCT_MAP[p.productId] ?? priceToCoins(p.price);

  // 3. ledger + coin grant in one transaction
  try {
    await prisma.$transaction(async (tx) => {
      await tx.riseOrder.create({
        data: {
          orderId: p.orderId,
          profileId: profile.id,
          email: p.email,
          priceCents: p.price,
          currency: p.currency,
          productId: p.productId,
          productName: p.productTitle,
          coinsGranted: coins,
          rawPayload: p as unknown as Prisma.InputJsonValue,
        },
      });

      if (coins > 0) {
        await tx.profile.update({
          where: { id: profile.id },
          data: { coins: { increment: coins } },
        });
        await tx.transaction.create({
          data: { profileId: profile.id, delta: coins, kind: "TOPUP" },
        });
      }
    });
  } catch (e) {
    // Concurrent duplicate delivery raced past the dedupe check — treat as done.
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return;
    throw e;
  }
}
