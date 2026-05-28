"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useFormStatus } from "react-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  HeartAddIcon,
  EyeIcon,
  AtIcon,
  Link01Icon,
  Coins01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";

import { createOrder } from "./actions";
import { cn } from "@/lib/utils";

type OrderType = "FOLLOW" | "LIKE" | "VIEW";

const COST_PER_ACTION = 10;

const TYPES: {
  key: OrderType;
  label: string;
  icon: typeof UserGroupIcon;
  accent: string;
}[] = [
  { key: "FOLLOW", label: "Followers", icon: UserGroupIcon, accent: "#ec4899" },
  { key: "LIKE", label: "Likes", icon: HeartAddIcon, accent: "#f59e0b" },
  { key: "VIEW", label: "Views", icon: EyeIcon, accent: "#6366f1" },
];

const PRESETS = [10, 25, 50, 100];

interface OrderFormProps {
  balance: number;
  defaultUsername: string;
  initialError?: string;
}

export function OrderForm({
  balance,
  defaultUsername,
  initialError,
}: OrderFormProps) {
  const [type, setType] = useState<OrderType>("FOLLOW");
  const [target, setTarget] = useState(defaultUsername);
  const [quantity, setQuantity] = useState(50);

  const totalCost = useMemo(() => quantity * COST_PER_ACTION, [quantity]);
  const remaining = balance - totalCost;
  const canAfford = remaining >= 0;
  const meta = TYPES.find((t) => t.key === type)!;

  const isFollow = type === "FOLLOW";
  const targetLabel = isFollow ? "Instagram username" : "Post URL";
  const targetPlaceholder = isFollow
    ? "your_username"
    : "https://instagram.com/p/...";

  return (
    <form action={createOrder} className="flex flex-col gap-6">
      {/* Type selector */}
      <section>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">
          What you want
        </p>
        <div className="grid grid-cols-3 gap-2">
          {TYPES.map(({ key, label, icon, accent }) => {
            const isActive = type === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setType(key);
                  if (key !== "FOLLOW" && target === defaultUsername) {
                    setTarget("");
                  }
                  if (key === "FOLLOW" && !target) {
                    setTarget(defaultUsername);
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 h-[96px] rounded-2xl transition-all",
                  isActive
                    ? "text-white"
                    : "bg-white text-zinc-500 border border-zinc-100 hover:text-zinc-900",
                )}
                style={isActive ? { background: accent } : undefined}
                aria-pressed={isActive}
              >
                <HugeiconsIcon
                  icon={icon}
                  size={22}
                  color={isActive ? "white" : "#52525b"}
                  strokeWidth={2}
                />
                <span className="text-[12px] font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
        <input type="hidden" name="type" value={type} />
      </section>

      {/* Target */}
      <section>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">
          {targetLabel}
        </p>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <HugeiconsIcon
              icon={isFollow ? AtIcon : Link01Icon}
              size={16}
              color="#a1a1aa"
              strokeWidth={2}
            />
          </div>
          <input
            type={isFollow ? "text" : "url"}
            name="target"
            required
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder={targetPlaceholder}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={isFollow ? 30 : 500}
            className="w-full h-[52px] rounded-2xl bg-white border border-zinc-100 pl-10 pr-4 text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-300 transition-colors"
          />
        </div>
      </section>

      {/* Quantity */}
      <section>
        <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2 px-1">
          Quantity
        </p>
        <input
          type="number"
          name="quantity"
          min={1}
          max={10000}
          step={1}
          required
          value={quantity}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (Number.isFinite(n)) setQuantity(Math.max(1, Math.min(10000, n)));
          }}
          className="w-full h-[52px] rounded-2xl bg-white border border-zinc-100 px-5 text-[18px] font-bold text-zinc-900 tabular-nums placeholder:text-zinc-400 outline-none focus:border-zinc-300 transition-colors"
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {PRESETS.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setQuantity(n)}
              className={cn(
                "h-8 px-3 rounded-full text-[12px] font-semibold transition-colors",
                quantity === n
                  ? "bg-zinc-900 text-white"
                  : "bg-white text-zinc-500 border border-zinc-100 hover:text-zinc-900",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </section>

      {/* Cost summary */}
      <section
        className={cn(
          "rounded-2xl p-4 border",
          canAfford
            ? "bg-white border-zinc-100"
            : "bg-rose-50 border-rose-100",
        )}
      >
        <Row
          label={`${quantity.toLocaleString()} × ${COST_PER_ACTION} coins`}
          value={`${totalCost.toLocaleString()} coins`}
          bold
        />
        <div className="h-px bg-zinc-100 my-3" />
        <Row
          label="Your balance"
          value={`${balance.toLocaleString()} coins`}
          muted
        />
        <Row
          label="After this order"
          value={
            canAfford
              ? `${remaining.toLocaleString()} coins`
              : `Short by ${Math.abs(remaining).toLocaleString()}`
          }
          accent={canAfford ? "#16a34a" : "#e11d48"}
        />
      </section>

      {initialError ? (
        <p className="text-[13px] text-rose-500 text-center">
          {decodeURIComponent(initialError)}
        </p>
      ) : null}

      {canAfford ? (
        <Submit accent={meta.accent} label={`Order ${quantity} ${meta.label.toLowerCase()}`} />
      ) : (
        <Link
          href="/topup"
          className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 bg-zinc-900 text-white text-[14px] font-semibold"
        >
          <HugeiconsIcon icon={Coins01Icon} size={16} color="white" />
          Top up coins
        </Link>
      )}
    </form>
  );
}

function Submit({ accent, label }: { accent: string; label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 text-white text-[14px] font-semibold transition-opacity active:scale-[0.98] disabled:opacity-60"
      style={{ background: accent }}
    >
      <HugeiconsIcon
        icon={CheckmarkBadge01Icon}
        size={16}
        color="white"
        strokeWidth={2}
      />
      {pending ? "Creating…" : label}
    </button>
  );
}

function Row({
  label,
  value,
  bold,
  muted,
  accent,
}: {
  label: string;
  value: string;
  bold?: boolean;
  muted?: boolean;
  accent?: string;
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
          !accent && !bold && (muted ? "text-zinc-400" : "text-zinc-900"),
        )}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </span>
    </div>
  );
}
