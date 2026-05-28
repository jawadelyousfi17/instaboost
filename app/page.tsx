import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  ChartIncreaseIcon,
  DollarCircleIcon,
  Notification03Icon,
  Coins01Icon,
  UserGroupIcon,
  HeartAddIcon,
  EyeIcon,
  MoreHorizontalIcon,
  Logout01Icon,
  Rocket01Icon,
} from "@hugeicons/core-free-icons";

import { signOut } from "@/app/auth/actions";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

const ORDER_TYPE_META = {
  FOLLOW: { label: "Followers", icon: UserGroupIcon, accent: "#ec4899" },
  LIKE: { label: "Likes", icon: HeartAddIcon, accent: "#f59e0b" },
  VIEW: { label: "Views", icon: EyeIcon, accent: "#6366f1" },
} as const;

function formatNum(n: number) {
  return n.toLocaleString("en-US");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const profile = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
    include: {
      orders: {
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });

  if (!profile) redirect("/onboarding");

  return (
    <div
      className="min-h-svh p-5"
      style={{
        backgroundColor: "#F4F4F5",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 140px)",
      }}
    >
      <div className="mx-auto w-full max-w-[400px] flex flex-col gap-5">
        {/* ── Top bar ── */}
        <header className="flex items-center justify-between pt-2 pb-1">
          <Link href="/settings" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-900 text-white font-semibold text-[15px]">
              {profile.instagramUsername.charAt(0).toUpperCase()}
            </div>
            <div className="leading-tight">
              <p className="text-[12px] text-zinc-400 font-medium">
                Welcome back
              </p>
              <p className="text-[15px] font-semibold text-zinc-900 group-hover:underline">
                @{profile.instagramUsername}
              </p>
            </div>
          </Link>
          <button
            type="button"
            className="relative w-10 h-10 rounded-full bg-white flex items-center justify-center border border-zinc-100"
          >
            <HugeiconsIcon
              icon={Notification03Icon}
              size={18}
              color="#27272a"
            />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-pink-500" />
          </button>
        </header>

        {/* ── Balance card ── */}
        <section className="rounded-[28px] bg-zinc-900 p-6 text-white">
          <div className="flex items-center gap-2 mb-2.5">
            <HugeiconsIcon icon={Coins01Icon} size={15} color="#a1a1aa" />
            <p className="text-[13px] font-medium tracking-wide text-zinc-400">
              Coin balance
            </p>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-[48px] font-bold leading-none tracking-tight">
              {formatNum(profile.coins)}
            </p>
            <p className="text-[15px] font-medium text-zinc-500">coins</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-6">
            <Link
              href="/topup"
              className="flex items-center justify-center gap-2 h-12 rounded-full bg-white text-zinc-900 text-[14px] font-semibold transition-transform active:scale-[0.97]"
            >
              <HugeiconsIcon icon={DollarCircleIcon} size={17} color="#18181b" />
              Top up
            </Link>
            <Link
              href="/earn"
              className="flex items-center justify-center gap-2 h-12 rounded-full bg-white/10 text-white text-[14px] font-semibold border border-white/15 transition-transform active:scale-[0.97]"
            >
              <HugeiconsIcon icon={ChartIncreaseIcon} size={17} color="white" />
              Earn
            </Link>
          </div>
        </section>

        {/* ── My orders ── */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[15px] font-semibold text-zinc-900">
              My orders
            </h2>
            <Link
              href="/orders"
              className="text-[12px] font-medium text-zinc-500 hover:text-zinc-700"
            >
              See all
            </Link>
          </div>

          {profile.orders.length === 0 ? (
            <EmptyOrders />
          ) : (
            <div className="flex flex-col gap-2.5">
              {profile.orders.map((order) => (
                <OrderCard
                  key={order.id}
                  type={order.type}
                  target={order.target}
                  delivered={order.quantityDelivered}
                  requested={order.quantityRequested}
                />
              ))}
            </div>
          )}
        </section>

        {/* ── Recent activity ── */}
        <section className="flex flex-col gap-3 mt-1">
          <h2 className="text-[15px] font-semibold text-zinc-900 px-1">
            Recent activity
          </h2>
          {profile.transactions.length === 0 ? (
            <div className="rounded-2xl bg-white border border-zinc-100 px-4 py-5 text-center">
              <p className="text-[13px] text-zinc-400">
                Your activity will show up here.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl bg-white border border-zinc-100 overflow-hidden">
              {profile.transactions.map((tx, i) => {
                const positive = tx.delta > 0;
                return (
                  <div
                    key={tx.id}
                    className={cn(
                      "flex items-center justify-between px-4 py-3",
                      i !== profile.transactions.length - 1 &&
                        "border-b border-zinc-100",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center",
                          positive ? "bg-emerald-50" : "bg-zinc-100",
                        )}
                      >
                        <HugeiconsIcon
                          icon={
                            tx.kind === "EARN"
                              ? ChartIncreaseIcon
                              : tx.kind === "TOPUP"
                                ? DollarCircleIcon
                                : tx.kind === "REFUND"
                                  ? Coins01Icon
                                  : Rocket01Icon
                          }
                          size={16}
                          color={positive ? "#059669" : "#52525b"}
                        />
                      </div>
                      <div className="leading-tight">
                        <p className="text-[13px] font-medium text-zinc-900">
                          {txLabel(tx.kind)}
                        </p>
                        <p className="text-[11px] text-zinc-400">
                          {formatRelative(tx.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p
                      className={cn(
                        "text-[14px] font-semibold tabular-nums",
                        positive ? "text-emerald-600" : "text-zinc-900",
                      )}
                    >
                      {positive ? "+" : ""}
                      {tx.delta}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── Sign out ── */}
        <form action={signOut} className="mt-1">
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 text-[12px] font-medium text-zinc-400 hover:text-zinc-600"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} color="currentColor" />
            Sign out
          </button>
        </form>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

function EmptyOrders() {
  return (
    <div className="rounded-2xl bg-white border border-zinc-100 p-6 flex flex-col items-center text-center gap-3">
      <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-zinc-100">
        <HugeiconsIcon icon={Rocket01Icon} size={22} color="#18181b" />
      </div>
      <div>
        <p className="text-[14px] font-semibold text-zinc-900">
          No active orders yet
        </p>
        <p className="text-[12px] text-zinc-400 mt-0.5">
          Place your first order to start growing.
        </p>
      </div>
      <Link
        href="/orders/new"
        className="mt-1 inline-flex items-center justify-center h-10 px-5 rounded-full bg-zinc-900 text-white text-[13px] font-semibold"
      >
        <HugeiconsIcon icon={Add01Icon} size={14} color="white" />
        <span className="ml-1.5">Create order</span>
      </Link>
    </div>
  );
}

interface OrderCardProps {
  type: "FOLLOW" | "LIKE" | "VIEW";
  target: string;
  delivered: number;
  requested: number;
}

function OrderCard({ type, target, delivered, requested }: OrderCardProps) {
  const meta = ORDER_TYPE_META[type];
  const pct = requested > 0 ? Math.min(100, Math.round((delivered / requested) * 100)) : 0;

  return (
    <div className="rounded-2xl bg-white border border-zinc-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: `${meta.accent}1A` }}
          >
            <HugeiconsIcon icon={meta.icon} size={18} color={meta.accent} />
          </div>
          <div className="leading-tight">
            <p className="text-[14px] font-semibold text-zinc-900">
              {meta.label}
            </p>
            <p className="text-[12px] text-zinc-400 truncate max-w-[160px]">
              {target.startsWith("http") ? target : `@${target}`}
            </p>
          </div>
        </div>
        <button type="button" className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-zinc-100">
          <HugeiconsIcon icon={MoreHorizontalIcon} size={16} color="#a1a1aa" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[11px] text-zinc-400 font-medium tabular-nums">
          {formatNum(delivered)} / {formatNum(requested)} delivered
        </p>
        <p className="text-[11px] font-semibold tabular-nums" style={{ color: meta.accent }}>
          {pct}%
        </p>
      </div>
      <div className="h-1.5 rounded-full bg-zinc-100 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{ width: `${pct}%`, background: meta.accent }}
        />
      </div>
    </div>
  );
}

function txLabel(kind: "EARN" | "SPEND" | "TOPUP" | "REFUND") {
  switch (kind) {
    case "EARN":
      return "Earned from follow";
    case "SPEND":
      return "Order placed";
    case "TOPUP":
      return "Coins purchased";
    case "REFUND":
      return "Refund";
  }
}

function formatRelative(d: Date) {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return `${days}d ago`;
}
