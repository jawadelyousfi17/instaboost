"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  HeartAddIcon,
  EyeIcon,
  ArrowUpRight01Icon,
  ImageUpload01Icon,
  ImageDoneIcon,
  Timer01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import type { Prisma } from "@prisma/client";

import { fulfillOrder } from "./actions";
import { cn } from "@/lib/utils";

const OPEN_DELAY_MS = 6000;

type OrderWithProfile = Prisma.OrderGetPayload<{
  include: { profile: { select: { instagramUsername: true } } };
}>;

const META = {
  FOLLOW: { verb: "Follow", icon: UserGroupIcon, accent: "#ec4899", action: "following" },
  LIKE: { verb: "Like", icon: HeartAddIcon, accent: "#f59e0b", action: "liking" },
  VIEW: { verb: "View", icon: EyeIcon, accent: "#6366f1", action: "viewing" },
} as const;

function buildIgUrl(order: OrderWithProfile) {
  if (order.type === "FOLLOW") {
    return `https://instagram.com/${order.target.replace(/^@/, "")}`;
  }
  if (order.target.startsWith("http")) return order.target;
  return `https://instagram.com/p/${order.target}`;
}

interface EarnCardProps {
  order: OrderWithProfile;
}

export function EarnCard({ order }: EarnCardProps) {
  const meta = META[order.type];
  const igUrl = useMemo(() => buildIgUrl(order), [order]);

  const [opened, setOpened] = useState(false);
  const [remaining, setRemaining] = useState(OPEN_DELAY_MS / 1000);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const handleOpen = () => {
    window.open(igUrl, "_blank", "noopener,noreferrer");
    setOpened(true);
    setRemaining(OPEN_DELAY_MS / 1000);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return 0;
        }
        return r - 1;
      });
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.set("orderId", order.id);
    startTransition(async () => {
      await fulfillOrder(formData);
    });
  };

  const ready = opened && remaining === 0;
  const target =
    order.type === "FOLLOW"
      ? `@${order.target.replace(/^@/, "")}`
      : "this post";

  return (
    <article className="snap-center shrink-0 w-[calc(100vw-40px)] max-w-[360px] rounded-3xl bg-white border border-zinc-100 p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
            style={{ background: `${meta.accent}1A` }}
          >
            <HugeiconsIcon icon={meta.icon} size={22} color={meta.accent} />
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-[15px] font-bold text-zinc-900 truncate">
              {meta.verb} {target}
            </p>
            <p className="text-[11px] text-zinc-400 mt-0.5 truncate">
              from @{order.profile.instagramUsername}
            </p>
          </div>
        </div>
        <div
          className="shrink-0 rounded-full px-3 py-1.5"
          style={{ background: `${meta.accent}1A` }}
        >
          <span
            className="text-[13px] font-bold tabular-nums"
            style={{ color: meta.accent }}
          >
            +{order.rewardPerAction}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-4 flex flex-col gap-1">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400">
          Instructions
        </p>
        <p className="text-[13px] text-zinc-700 leading-relaxed">
          {order.type === "FOLLOW"
            ? `Open Instagram, follow @${order.target.replace(/^@/, "")}, then come back.`
            : order.type === "LIKE"
              ? "Open the post on Instagram, double-tap to like it, then come back."
              : "Open the post on Instagram, watch for a few seconds, then come back."}
        </p>
      </div>

      {/* Step 1 */}
      {!opened && (
        <button
          type="button"
          onClick={handleOpen}
          className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 text-white text-[14px] font-semibold transition-transform active:scale-[0.98]"
          style={{ background: meta.accent }}
        >
          Open in Instagram
          <HugeiconsIcon
            icon={ArrowUpRight01Icon}
            size={16}
            color="white"
            strokeWidth={2.5}
          />
        </button>
      )}

      {/* Step 2 — waiting */}
      {opened && !ready && (
        <div className="rounded-2xl bg-zinc-100 p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: "white" }}
          >
            <HugeiconsIcon icon={Timer01Icon} size={18} color="#52525b" />
          </div>
          <div className="leading-tight">
            <p className="text-[13px] font-semibold text-zinc-900">
              Still {meta.action} on Instagram?
            </p>
            <p className="text-[11px] text-zinc-500 mt-0.5 tabular-nums">
              Confirm in {remaining}s…
            </p>
          </div>
        </div>
      )}

      {/* Step 3 — ready */}
      {ready && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              "w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 text-[13px] font-semibold border-2 border-dashed transition-colors",
              screenshot
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900",
            )}
          >
            <HugeiconsIcon
              icon={screenshot ? ImageDoneIcon : ImageUpload01Icon}
              size={16}
              color="currentColor"
            />
            {screenshot ? "Screenshot attached" : "Upload screenshot as proof"}
          </button>

          <button
            type="submit"
            disabled={!screenshot || pending}
            className="w-full h-[54px] rounded-2xl flex items-center justify-center gap-2 text-white text-[14px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
            style={{ background: "#18181b" }}
          >
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={16}
              color="white"
              strokeWidth={2}
            />
            {pending ? "Saving…" : `I did it · +${order.rewardPerAction}`}
          </button>
        </form>
      )}
    </article>
  );
}
