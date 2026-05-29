"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  LockIcon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";

import { processTopup, processPaygateTopup } from "./actions";
import { TOPUP_PACKAGES, type TopupPrice } from "./packages";
import { cn } from "@/lib/utils";

const PACKAGES: {
  price: TopupPrice;
  coins: number;
  followers: number;
  badge?: "popular" | "best";
}[] = (Object.entries(TOPUP_PACKAGES) as [TopupPrice, number][])
  .map(([price, coins]) => ({
    price,
    coins,
    followers: Math.floor(coins / 10),
    badge:
      price === "20" ? ("popular" as const) : price === "100" ? ("best" as const) : undefined,
  }));

export function TopupForm() {
  const [selected, setSelected] = useState<TopupPrice>("20");
  const pkg = PACKAGES.find((p) => p.price === selected)!;

  return (
    <form action={processPaygateTopup} className="flex flex-col gap-5">
      <input type="hidden" name="price" value={selected} />

      <div className="grid grid-cols-2 gap-2.5">
        {PACKAGES.map((p) => {
          const isActive = p.price === selected;
          return (
            <button
              key={p.price}
              type="button"
              onClick={() => setSelected(p.price)}
              className={cn(
                "relative rounded-2xl p-4 text-left transition-all",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "bg-white border border-zinc-100 text-zinc-900 hover:border-zinc-200",
              )}
              aria-pressed={isActive}
            >
              {p.badge ? (
                <span
                  className={cn(
                    "absolute -top-2 right-3 flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase",
                    p.badge === "popular"
                      ? "bg-pink-500 text-white"
                      : "bg-amber-400 text-amber-950",
                  )}
                >
                  {p.badge === "popular" ? (
                    <StarIcon />
                  ) : null}
                  {p.badge === "popular" ? "Popular" : "Best deal"}
                </span>
              ) : null}

              <div className="flex items-baseline gap-1">
                <span className="text-[20px] font-bold tracking-tight">
                  ${p.price}
                </span>
                {isActive && (
                  <span className="ml-auto">
                    <HugeiconsIcon
                      icon={CheckmarkBadge01Icon}
                      size={16}
                      color="white"
                    />
                  </span>
                )}
              </div>
              <p
                className={cn(
                  "text-[13px] font-semibold mt-1 tabular-nums",
                  isActive ? "text-white" : "text-zinc-900",
                )}
              >
                {p.coins.toLocaleString()} coins
              </p>
              <p
                className={cn(
                  "text-[11px] mt-0.5 flex items-center gap-1",
                  isActive ? "text-white/60" : "text-zinc-400",
                )}
              >
                ≈ {p.followers.toLocaleString()} followers
              </p>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      <section className="rounded-2xl bg-white border border-zinc-100 p-4 flex flex-col gap-2">
        <Row label="Package" value={`$${pkg.price} USD`} />
        <Row
          label="You receive"
          value={`${pkg.coins.toLocaleString()} coins`}
          bold
        />
        <Row
          label="Or about"
          value={`${pkg.followers.toLocaleString()} followers`}
          muted
        />
      </section>

      {/* CTAs — two payment methods, same selected package.
          Form default action is PayGate; Rise is the secondary path. */}
      <div className="flex flex-col gap-2.5">
        <PayButton price={pkg.price} />
        <RiseButton />
      </div>

      <div className="flex items-center justify-center gap-1.5 text-[11px] text-zinc-400">
        <HugeiconsIcon icon={LockIcon} size={11} color="#a1a1aa" />
        Payments are processed securely
      </div>
    </form>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="currentColor">
      <path d="M6 0l1.5 4.5H12l-3.6 2.7L9.9 12 6 9 2.1 12l1.5-4.8L0 4.5h4.5L6 0z" />
    </svg>
  );
}

/**
 * Primary checkout. Uses the form's default action (PayGate.to), sending the
 * buyer to a hosted card / crypto / Apple Pay / Google Pay / bank checkout.
 */
function PayButton({ price }: { price: TopupPrice }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 bg-zinc-900 text-white text-[14px] font-semibold transition-opacity active:scale-[0.98] disabled:opacity-60"
    >
      <HugeiconsIcon icon={UserGroupIcon} size={16} color="white" />
      {pending ? "Processing…" : `Pay $${price} now`}
    </button>
  );
}

/**
 * Secondary checkout via the Rise store. Overrides the form action through
 * `formAction` so the same selected package is paid via Rise instead.
 */
function RiseButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      formAction={processTopup}
      disabled={pending}
      className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-900 text-[14px] font-semibold transition-opacity active:scale-[0.98] disabled:opacity-60"
    >
      <HugeiconsIcon icon={LockIcon} size={16} color="#18181b" />
      {pending ? "Processing…" : "Pay with Rise store"}
    </button>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span
        className={cn(
          "text-[13px]",
          muted ? "text-zinc-400" : "text-zinc-600",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "text-[13px] tabular-nums",
          bold ? "font-bold text-zinc-900" : "font-semibold",
          muted ? "text-zinc-400" : "text-zinc-900",
        )}
      >
        {value}
      </span>
    </div>
  );
}
