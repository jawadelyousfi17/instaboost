import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Coins01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";
import type { OrderType } from "@prisma/client";

import { EarnCard } from "./earn-card";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const TABS = [
  { key: "all", label: "All" },
  { key: "follow", label: "Followers" },
  { key: "like", label: "Likes" },
  { key: "view", label: "Views" },
] as const;

interface EarnPageProps {
  searchParams: Promise<{ type?: string }>;
}

export default async function EarnPage({ searchParams }: EarnPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const { type } = await searchParams;
  const activeType = (type ?? "all").toLowerCase();
  const typeFilter: { type?: OrderType } =
    activeType === "follow" || activeType === "like" || activeType === "view"
      ? { type: activeType.toUpperCase() as OrderType }
      : {};

  const orders = await prisma.order.findMany({
    where: {
      status: "ACTIVE",
      profileId: { not: me.id },
      actions: { none: { actorId: me.id } },
      ...typeFilter,
    },
    include: {
      profile: { select: { instagramUsername: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div
      className={"min-h-svh p-5"}
      style={{
        backgroundColor: "#F4F4F5",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 140px)",
      }}
    >
      <div className="mx-auto w-full max-w-[400px] flex flex-col gap-5">
        {/* Top */}
        <header className="flex items-center justify-between pt-2">
          <div className="leading-tight">
            <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest">
              Earn
            </p>
            <h1 className="text-[22px] font-bold text-zinc-900 mt-0.5">
              Available actions
            </h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white border border-zinc-100"
            aria-label="Coin balance"
          >
            <HugeiconsIcon icon={Coins01Icon} size={14} color="#18181b" />
            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums">
              {me.coins.toLocaleString("en-US")}
            </span>
          </Link>
        </header>

        {/* Tabs */}
        <nav className="flex gap-2 overflow-x-auto -mx-1 px-1 no-scrollbar">
          {TABS.map(({ key, label }) => {
            const isActive = activeType === key;
            return (
              <Link
                key={key}
                href={key === "all" ? "/earn" : `/earn?type=${key}`}
                className={cn(
                  "h-9 px-4 rounded-full flex items-center text-[13px] font-medium transition-colors shrink-0",
                  isActive
                    ? "bg-zinc-900 text-white"
                    : "bg-white text-zinc-500 border border-zinc-100 hover:text-zinc-900",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {orders.length === 0 ? (
          <EmptyEarn />
        ) : (
          <>
            <p className="text-[11px] text-zinc-400 px-1 -mb-2">
              Swipe to browse — {orders.length} available
            </p>
            <div
              className="-mx-5 px-5 flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-5 no-scrollbar"
              style={{
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
              }}
            >
              {orders.map((order) => (
                <EarnCard key={order.id} order={order} />
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav active="earn" />
    </div>
  );
}

function EmptyEarn() {
  return (
    <div className="rounded-2xl bg-white border border-zinc-100 p-8 flex flex-col items-center text-center gap-3 mt-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-zinc-100">
        <HugeiconsIcon icon={Rocket01Icon} size={26} color="#18181b" />
      </div>
      <div>
        <p className="text-[15px] font-semibold text-zinc-900">
          You&rsquo;re all caught up
        </p>
        <p className="text-[12px] text-zinc-400 mt-0.5 max-w-[240px]">
          No actions to do right now. Check back in a few minutes.
        </p>
      </div>
    </div>
  );
}
