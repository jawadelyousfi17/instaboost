"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import {
  buildCheckoutUrl,
  callbackUrlFor,
  createWallet,
} from "@/lib/paygate";
import { TOPUP_PACKAGES, riseProductUrl, type TopupPrice } from "./packages";

export async function processTopup(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const price = formData.get("price");
  if (typeof price !== "string" || !(price in TOPUP_PACKAGES)) {
    redirect("/topup?error=Pick+a+package");
  }

  // Email carries the buyer identity to Rise via `?u=`, then back to us in the
  // /upadte-user webhook so we can match the purchase to this user.
  let email = typeof data.claims.email === "string" ? data.claims.email : undefined;
  if (!email) {
    const { data: u } = await supabase.auth.getUser();
    email = u.user?.email ?? undefined;
  }
  if (!email) redirect("/topup?error=No+email+on+your+account");

  // Backfill the profile email so the Rise webhook can match this buyer by
  // email in Neon. Cheap and idempotent — only writes when it changed.
  if (me.email?.toLowerCase() !== email.toLowerCase()) {
    await prisma.profile.update({
      where: { id: me.id },
      data: { email: email.toLowerCase() },
    });
  }

  // Hand off to the Rise store to pay. Coins are credited by the /upadte-user
  // webhook once Rise confirms the purchase — NOT here.
  redirect(riseProductUrl(price as TopupPrice, email));
}

/**
 * Top up via PayGate.to (crypto / card / Apple Pay / Google Pay / bank).
 *
 * Steps, all server-side:
 *   1. Auth the user and resolve their email (backfilled to the profile so the
 *      callback can attribute the purchase).
 *   2. Generate a PayGate receiving wallet bound to a unique callback that
 *      carries our invoice id.
 *   3. Persist a PENDING PaygateOrder ledger row holding the chosen package's
 *      coins plus the secret `ipn_token`.
 *   4. Redirect the customer to PayGate's hosted checkout.
 *
 * Coins are credited by /paygate/callback after server-side payment
 * verification — NEVER here.
 */
export async function processPaygateTopup(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const price = formData.get("price");
  if (typeof price !== "string" || !(price in TOPUP_PACKAGES)) {
    redirect("/topup?error=Pick+a+package");
  }
  const priceKey = price as TopupPrice;

  let email = typeof data.claims.email === "string" ? data.claims.email : undefined;
  if (!email) {
    const { data: u } = await supabase.auth.getUser();
    email = u.user?.email ?? undefined;
  }
  if (!email) redirect("/topup?error=No+email+on+your+account");
  email = email.toLowerCase();

  if (me.email?.toLowerCase() !== email) {
    await prisma.profile.update({ where: { id: me.id }, data: { email } });
  }

  const coins = TOPUP_PACKAGES[priceKey];
  const amount = Number(priceKey);

  // Pre-generate the invoice id so the callback URL is unique per checkout.
  const invoiceId = crypto.randomUUID();

  let checkoutUrl: string;
  try {
    const wallet = await createWallet(callbackUrlFor(invoiceId));

    await prisma.paygateOrder.create({
      data: {
        id: invoiceId,
        profileId: me.id,
        email,
        priceCents: Math.round(amount * 100),
        currency: "USD",
        coinsGranted: coins,
        addressIn: wallet.address_in,
        polygonAddressIn: wallet.polygon_address_in,
        ipnToken: wallet.ipn_token,
      },
    });

    checkoutUrl = buildCheckoutUrl({
      addressIn: wallet.address_in,
      amount,
      email,
      currency: "USD",
    });
  } catch (e) {
    console.error("paygate topup: failed to start checkout", e);
    redirect("/topup?error=Could+not+start+payment.+Try+again.");
  }

  // Outside try/catch — redirect() throws NEXT_REDIRECT by design.
  redirect(checkoutUrl);
}
