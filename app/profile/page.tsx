import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Settings01Icon,
  DollarCircleIcon,
  Shield01Icon,
  Logout01Icon,
  InstagramIcon,
  ArrowUpRight01Icon,
  Coins01Icon,
  UserGroupIcon,
  ChartIncreaseIcon,
} from "@hugeicons/core-free-icons";

import { signOut } from "@/app/auth/actions";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const [orderCount, actionCount, earnedAgg, spentAgg] = await Promise.all([
    prisma.order.count({ where: { profileId: me.id } }),
    prisma.action.count({ where: { actorId: me.id } }),
    prisma.transaction.aggregate({
      where: { profileId: me.id, delta: { gt: 0 } },
      _sum: { delta: true },
    }),
    prisma.transaction.aggregate({
      where: { profileId: me.id, delta: { lt: 0 } },
      _sum: { delta: true },
    }),
  ]);

  const earned = earnedAgg._sum.delta ?? 0;
  const spent = Math.abs(spentAgg._sum.delta ?? 0);

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "—";

  const memberSince = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(me.createdAt);

  return (
    <div
      className="min-h-svh p-5"
      style={{
        backgroundColor: "#F4F4F5",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 140px)",
      }}
    >
      <div className="mx-auto w-full max-w-[400px] flex flex-col gap-5">
        {/* Top header */}
        <header className="flex items-center justify-between pt-2">
          <div>
            <p className="text-[12px] text-zinc-400 font-semibold uppercase tracking-widest">
              Profile
            </p>
            <h1 className="text-[24px] font-bold text-zinc-900 mt-0.5 leading-tight">
              Your account
            </h1>
          </div>
          <Link
            href="/settings"
            aria-label="Settings"
            className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center hover:bg-zinc-50 transition-colors"
          >
            <HugeiconsIcon icon={Settings01Icon} size={18} color="#18181b" />
          </Link>
        </header>

        {/* Identity card */}
        <section className="rounded-3xl bg-zinc-900 p-6 text-white flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-white text-zinc-900 font-bold text-[30px] flex items-center justify-center mb-3">
            {me.instagramUsername.charAt(0).toUpperCase()}
          </div>
          <p className="text-[18px] font-bold tracking-tight">
            @{me.instagramUsername}
          </p>
          <p className="text-[12px] text-zinc-500 mt-1">{email}</p>
          <p className="text-[11px] text-zinc-500 mt-3 tracking-wide">
            Member since {memberSince}
          </p>
          <a
            href={`https://instagram.com/${me.instagramUsername}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full bg-white/10 border border-white/15 text-white text-[13px] font-semibold transition-transform active:scale-[0.97]"
          >
            <HugeiconsIcon icon={InstagramIcon} size={14} color="white" />
            View on Instagram
            <HugeiconsIcon
              icon={ArrowUpRight01Icon}
              size={13}
              color="white"
              strokeWidth={2.5}
            />
          </a>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2">
          <StatCard
            label="Balance"
            value={me.coins}
            icon={Coins01Icon}
            accent="#18181b"
          />
          <StatCard
            label="Earned"
            value={earned}
            icon={ChartIncreaseIcon}
            accent="#16a34a"
            prefix="+"
          />
          <StatCard
            label="Spent"
            value={spent}
            icon={UserGroupIcon}
            accent="#ec4899"
            prefix="−"
          />
        </section>

        {/* Activity strip */}
        <section className="rounded-2xl bg-white border border-zinc-100 px-5 py-4 flex items-center justify-between">
          <div className="flex flex-col leading-tight">
            <p className="text-[20px] font-bold text-zinc-900 tabular-nums">
              {orderCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
              Orders placed
            </p>
          </div>
          <div className="h-10 w-px bg-zinc-100" />
          <div className="flex flex-col leading-tight">
            <p className="text-[20px] font-bold text-zinc-900 tabular-nums">
              {actionCount.toLocaleString()}
            </p>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
              Actions done
            </p>
          </div>
          <div className="h-10 w-px bg-zinc-100" />
          <div className="flex flex-col leading-tight">
            <p className="text-[20px] font-bold text-zinc-900 tabular-nums">
              {(earned > 0
                ? Math.round((earned / Math.max(earned + spent, 1)) * 100)
                : 0)}
              %
            </p>
            <p className="text-[11px] text-zinc-400 font-medium uppercase tracking-wider">
              Earn ratio
            </p>
          </div>
        </section>

        {/* Quick links */}
        <section className="rounded-2xl bg-white border border-zinc-100 overflow-hidden">
          <Row
            href="/settings"
            label="Account settings"
            sub="Edit username, email"
            icon={Settings01Icon}
          />
          <Row
            href="/topup"
            label="Buy coins"
            sub="Top up your balance"
            icon={DollarCircleIcon}
            divider
          />
          <Row
            href="/legal/terms"
            label="Legal"
            sub="Terms, Privacy, Refunds"
            icon={Shield01Icon}
            divider
          />
        </section>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-white border border-zinc-100 text-zinc-700 text-[14px] font-semibold hover:bg-zinc-50 transition-colors"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} color="currentColor" />
            Sign out
          </button>
        </form>

        <p className="text-center text-[11px] text-zinc-400 mt-1">
          InstaBoost · v0.1.0
        </p>
      </div>

      <BottomNav active="profile" />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: typeof Coins01Icon;
  accent: string;
  prefix?: string;
}

function StatCard({ label, value, icon, accent, prefix }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-zinc-100 p-3 flex flex-col gap-2",
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}14` }}
        >
          <HugeiconsIcon icon={icon} size={13} color={accent} />
        </div>
      </div>
      <div className="leading-tight">
        <p
          className="text-[18px] font-bold tabular-nums"
          style={{ color: accent }}
        >
          {prefix ?? ""}
          {value.toLocaleString()}
        </p>
        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
}

interface RowProps {
  href: string;
  label: string;
  sub: string;
  icon: typeof Settings01Icon;
  divider?: boolean;
}

function Row({ href, label, sub, icon, divider }: RowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5 hover:bg-zinc-50 transition-colors",
        divider && "border-t border-zinc-100",
      )}
    >
      <div className="w-9 h-9 rounded-xl bg-zinc-100 flex items-center justify-center">
        <HugeiconsIcon icon={icon} size={15} color="#52525b" />
      </div>
      <div className="flex-1 leading-tight min-w-0">
        <p className="text-[14px] font-semibold text-zinc-900 truncate">
          {label}
        </p>
        <p className="text-[11px] text-zinc-400 truncate">{sub}</p>
      </div>
      <span className="text-zinc-300 text-lg leading-none">›</span>
    </Link>
  );
}
