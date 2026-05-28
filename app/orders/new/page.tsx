import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Coins01Icon,
} from "@hugeicons/core-free-icons";

import { OrderForm } from "./order-form";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

interface NewOrderPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function NewOrderPage({
  searchParams,
}: NewOrderPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const { error } = await searchParams;

  return (
    <div
      className={"min-h-svh p-5"}
      style={{
        backgroundColor: "#F4F4F5",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 140px)",
      }}
    >
      <div className="mx-auto w-full max-w-[400px] flex flex-col gap-5">
        {/* Top bar */}
        <header className="flex items-center justify-between pt-2">
          <Link
            href="/"
            aria-label="Back"
            className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:bg-zinc-50"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={18}
              color="#18181b"
              strokeWidth={2}
            />
          </Link>
          <div className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-white border border-zinc-100">
            <HugeiconsIcon icon={Coins01Icon} size={14} color="#18181b" />
            <span className="text-[13px] font-semibold text-zinc-900 tabular-nums">
              {me.coins.toLocaleString("en-US")}
            </span>
          </div>
        </header>

        {/* Title */}
        <div className="px-1">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest">
            New order
          </p>
          <h1 className="text-[24px] font-bold text-zinc-900 mt-0.5 leading-tight">
            Boost your Instagram
          </h1>
          <p className="text-[13px] text-zinc-500 mt-1.5">
            Pick what you want, set the quantity, and we&rsquo;ll route real users
            to do it.
          </p>
        </div>

        <OrderForm
          balance={me.coins}
          defaultUsername={me.instagramUsername}
          initialError={error}
        />
      </div>

      <BottomNav active="new" />
    </div>
  );
}
