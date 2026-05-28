"use server";

import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
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

  // Hand off to the Rise store to pay. Coins are credited by the /upadte-user
  // webhook once Rise confirms the purchase — NOT here.
  redirect(riseProductUrl(price as TopupPrice, email));
}
