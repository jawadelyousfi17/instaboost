"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

const FOLLOW_RE = /^[a-zA-Z0-9._]{1,30}$/;
const ALLOWED_TYPES = ["FOLLOW", "LIKE", "VIEW"] as const;
type AllowedType = (typeof ALLOWED_TYPES)[number];

function urlError(error: string) {
  return `/orders/new?error=${encodeURIComponent(error)}`;
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const rawType = formData.get("type");
  const rawTarget = formData.get("target");
  const rawQuantity = formData.get("quantity");

  if (
    typeof rawType !== "string" ||
    !ALLOWED_TYPES.includes(rawType as AllowedType)
  ) {
    redirect(urlError("Pick a valid order type"));
  }
  const type = rawType as AllowedType;

  if (typeof rawTarget !== "string" || !rawTarget.trim()) {
    redirect(urlError("Target is required"));
  }
  const target = rawTarget.trim().replace(/^@/, "");

  if (type === "FOLLOW") {
    if (!FOLLOW_RE.test(target)) {
      redirect(urlError("Enter a valid Instagram username"));
    }
  } else {
    if (!/^https?:\/\//i.test(target)) {
      redirect(urlError("Enter the full Instagram post URL"));
    }
  }

  const quantity = Number(rawQuantity);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10000) {
    redirect(urlError("Quantity must be between 1 and 10,000"));
  }

  const COST_PER_ACTION = 10;
  const REWARD_PER_ACTION = 5;
  const totalCost = quantity * COST_PER_ACTION;

  if (me.coins < totalCost) {
    redirect(urlError("Not enough coins — top up first"));
  }

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        profileId: me.id,
        type,
        target,
        quantityRequested: quantity,
        costPerAction: COST_PER_ACTION,
        rewardPerAction: REWARD_PER_ACTION,
        status: "ACTIVE",
      },
    });

    await tx.profile.update({
      where: { id: me.id },
      data: { coins: { decrement: totalCost } },
    });

    await tx.transaction.create({
      data: {
        profileId: me.id,
        delta: -totalCost,
        kind: "SPEND",
        orderId: order.id,
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/earn");
  redirect("/");
}
