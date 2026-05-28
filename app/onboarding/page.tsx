import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  CheckmarkCircle01Icon,
  Coins01Icon,
  UserCheck01Icon,
  InformationCircleIcon,
  AtIcon,
} from "@hugeicons/core-free-icons";

import { saveInstagramUsername } from "./actions";
import { SubmitButton } from "@/components/submit-button";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

interface OnboardingPageProps {
  searchParams: Promise<{ error?: string }>;
}

const benefits = [
  {
    icon: Coins01Icon,
    text: "Start with 100 free coins",
  },
  {
    icon: UserCheck01Icon,
    text: "Real users only — no bots",
  },
  {
    icon: CheckmarkCircle01Icon,
    text: "Free forever, no credit card",
  },
] as const;

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) redirect("/login");

  const existing = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (existing) redirect("/");

  const { error } = await searchParams;

  return (
    <div
      className={"min-h-svh flex items-center justify-center p-5"}
      style={{ backgroundColor: "#EBEBEB" }}
    >
      <div className="w-full max-w-[340px]">
        <div
          className="overflow-hidden rounded-[28px] bg-white"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          {/* Hero */}
          <div
            className="relative flex flex-col items-center justify-center gap-3 px-8 py-9 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
            }}
          >
            {/* Soft depth orbs */}
            <div
              className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />
            <div
              className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: "rgba(255,255,255,0.07)" }}
            />

            <div
              className="relative flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <HugeiconsIcon icon={InstagramIcon} size={28} color="white" />
            </div>

            <div className="relative text-center">
              <p
                className="text-[11px] font-semibold tracking-widest uppercase mb-1"
                style={{ color: "rgba(255,255,255,0.6)" }}
              >
                Step 1 of 1
              </p>
              <h1 className="text-[22px] font-bold text-white leading-tight tracking-tight">
                Connect your Instagram
              </h1>
              <p
                className="text-[13px] mt-1.5 leading-snug"
                style={{ color: "rgba(255,255,255,0.72)" }}
              >
                This is the account that will grow.
              </p>
            </div>
          </div>

          {/* Form body */}
          <div className="px-6 py-7">
            <form
              action={saveInstagramUsername}
              className="flex flex-col gap-3"
            >
              {/* Input */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <HugeiconsIcon
                    icon={AtIcon}
                    size={16}
                    color="#a1a1aa"
                    strokeWidth={2}
                  />
                </div>
                <input
                  type="text"
                  name="username"
                  placeholder="your_username"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={30}
                  required
                  className="w-full h-[52px] rounded-2xl bg-zinc-100 pl-9 pr-4 text-[15px] font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:ring-2 focus:ring-pink-400/40 transition-shadow"
                />
              </div>

              {/* Error */}
              {error ? (
                <p className="text-[12px] text-red-500 px-1">
                  {decodeURIComponent(error)}
                </p>
              ) : null}

              {/* Private account tip */}
              <div className="flex items-start gap-2 px-1">
                <div className="mt-0.5 shrink-0">
                  <HugeiconsIcon
                    icon={InformationCircleIcon}
                    size={14}
                    color="#a1a1aa"
                  />
                </div>
                <p className="text-[12px] text-zinc-400 leading-snug">
                  Account must be <span className="font-medium text-zinc-500">public</span> to receive engagement.
                </p>
              </div>

              {/* CTA */}
              <SubmitButton
                label="Continue"
                loadingLabel="Saving…"
                className="w-full h-[52px] rounded-2xl text-white text-[14px] font-semibold mt-1 disabled:opacity-60 transition-opacity hover:opacity-90 active:scale-[0.98]"
                style={{
                  background:
                    "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
                  boxShadow: "0 4px 16px rgba(238, 42, 123, 0.28)",
                }}
              />
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-zinc-100" />
              <span className="text-[11px] text-zinc-300 font-medium">
                WHAT YOU GET
              </span>
              <div className="flex-1 h-px bg-zinc-100" />
            </div>

            {/* Benefits */}
            <ul className="flex flex-col gap-3">
              {benefits.map(({ icon, text }) => (
                <li key={text} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-8 h-8 rounded-xl shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(249,206,52,0.15) 0%, rgba(238,42,123,0.15) 100%)",
                    }}
                  >
                    <HugeiconsIcon icon={icon} size={15} color="#ee2a7b" strokeWidth={2} />
                  </div>
                  <span className="text-[13px] text-zinc-600 font-medium">
                    {text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
