"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function fulfillOrder(formData: FormData) {
  const orderId = formData.get("orderId");
  if (typeof orderId !== "string" || !orderId) return;

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) return;

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) return;

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId } });
      if (!order) throw new Error("Order not found");
      if (order.status !== "ACTIVE") throw new Error("Order is not active");
      if (order.profileId === me.id) throw new Error("Cannot fulfill your own order");
      if (order.quantityDelivered >= order.quantityRequested) {
        throw new Error("Order is full");
      }

      const existing = await tx.action.findUnique({
        where: { orderId_actorId: { orderId, actorId: me.id } },
      });
      if (existing) throw new Error("Already fulfilled");

      const reward = order.rewardPerAction;

      const action = await tx.action.create({
        data: { orderId, actorId: me.id, rewardEarned: reward },
      });

      const newDelivered = order.quantityDelivered + 1;
      const isComplete = newDelivered >= order.quantityRequested;

      await tx.order.update({
        where: { id: orderId },
        data: {
          quantityDelivered: newDelivered,
          status: isComplete ? "COMPLETED" : "ACTIVE",
        },
      });

      await tx.profile.update({
        where: { id: me.id },
        data: { coins: { increment: reward } },
      });

      await tx.transaction.create({
        data: {
          profileId: me.id,
          delta: reward,
          kind: "EARN",
          orderId,
          actionId: action.id,
        },
      });
    });
  } catch {
    // Swallow — revalidation will reflect the current state to the user.
  }

  revalidatePath("/earn");
  revalidatePath("/");
}
