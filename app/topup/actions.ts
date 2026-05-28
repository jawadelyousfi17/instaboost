"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { TOPUP_PACKAGES, type TopupPrice } from "./packages";

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
  const coins = TOPUP_PACKAGES[price as TopupPrice];

  // MOCK PAYMENT — in production, redirect to Stripe Checkout here and
  // perform this credit only after the webhook confirms `checkout.session.completed`.
  await prisma.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: me.id },
      data: { coins: { increment: coins } },
    });
    await tx.transaction.create({
      data: {
        profileId: me.id,
        delta: coins,
        kind: "TOPUP",
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/topup");
  redirect("/?topup=success");
}
