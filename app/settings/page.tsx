import { redirect } from "next/navigation";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Coins01Icon,
  UserCircleIcon,
  MailIcon,
  Mail01Icon,
  Edit01Icon,
  Shield01Icon,
  FileLockIcon,
  InvoiceIcon,
  Logout01Icon,
  CheckmarkBadge01Icon,
  AtIcon,
} from "@hugeicons/core-free-icons";

import { signOut } from "@/app/auth/actions";
import { updateInstagramUsername } from "./actions";
import { DeleteAccountButton } from "./delete-account-button";
import { SubmitButton } from "@/components/submit-button";
import { BottomNav } from "@/components/bottom-nav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";

interface SettingsPageProps {
  searchParams: Promise<{ error?: string; ok?: string }>;
}

export default async function SettingsPage({ searchParams }: SettingsPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data?.claims) redirect("/login");

  const me = await prisma.profile.findUnique({
    where: { userId: data.claims.sub },
  });
  if (!me) redirect("/onboarding");

  const email =
    typeof data.claims.email === "string" ? data.claims.email : "—";
  const { error, ok } = await searchParams;

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
            className="w-10 h-10 rounded-full bg-white border border-zinc-100 flex items-center justify-center"
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
            Settings
          </p>
          <h1 className="text-[24px] font-bold text-zinc-900 mt-0.5 leading-tight">
            Your account
          </h1>
        </div>

        {/* Identity */}
        <section className="rounded-2xl bg-white border border-zinc-100 p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-zinc-900 text-white font-bold text-[16px] flex items-center justify-center">
            {me.instagramUsername.charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-[15px] font-semibold text-zinc-900 truncate">
              @{me.instagramUsername}
            </p>
            <p className="text-[12px] text-zinc-400 truncate">{email}</p>
          </div>
        </section>

        {/* Edit username */}
        <section className="rounded-2xl bg-white border border-zinc-100 p-5">
          <div className="flex items-center gap-2 mb-3">
            <HugeiconsIcon icon={Edit01Icon} size={14} color="#18181b" />
            <h2 className="text-[14px] font-semibold text-zinc-900">
              Instagram username
            </h2>
          </div>
          <form
            action={updateInstagramUsername}
            className="flex flex-col gap-2"
          >
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <HugeiconsIcon icon={AtIcon} size={15} color="#a1a1aa" />
              </div>
              <input
                type="text"
                name="username"
                defaultValue={me.instagramUsername}
                required
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={30}
                className="w-full h-[48px] rounded-2xl bg-zinc-50 border border-zinc-100 pl-10 pr-4 text-[14px] font-medium text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-300"
              />
            </div>
            <SubmitButton
              label="Save"
              loadingLabel="Saving…"
              className="h-11 rounded-full bg-zinc-900 text-white text-[13px] font-semibold disabled:opacity-60"
            />
          </form>

          {ok ? (
            <p className="flex items-center justify-center gap-1.5 mt-3 text-[12px] text-emerald-600 font-medium">
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={12}
                color="#059669"
              />
              Saved
            </p>
          ) : null}
          {error ? (
            <p className="mt-3 text-[12px] text-rose-500 text-center">
              {decodeURIComponent(error)}
            </p>
          ) : null}
        </section>

        {/* Email (read-only) */}
        <section className="rounded-2xl bg-white border border-zinc-100 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
            <HugeiconsIcon icon={MailIcon} size={15} color="#52525b" />
          </div>
          <div className="leading-tight min-w-0 flex-1">
            <p className="text-[12px] text-zinc-400">Email</p>
            <p className="text-[13px] font-medium text-zinc-900 truncate">
              {email}
            </p>
          </div>
          <span className="text-[11px] text-zinc-400">via Google</span>
        </section>

        {/* Legal links */}
        <section className="rounded-2xl bg-white border border-zinc-100 overflow-hidden">
          <LegalRow
            href="/legal/terms"
            label="Terms of Service"
            icon={InvoiceIcon}
          />
          <LegalRow
            href="/legal/privacy"
            label="Privacy Policy"
            icon={Shield01Icon}
            divider
          />
          <LegalRow
            href="/legal/refund"
            label="Refund Policy"
            icon={FileLockIcon}
            divider
          />
          <LegalRow
            href="/legal/contact"
            label="Contact us"
            icon={Mail01Icon}
            divider
          />
        </section>

        {/* Sign out */}
        <form action={signOut}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 h-12 rounded-2xl bg-white border border-zinc-100 text-zinc-900 text-[13px] font-semibold hover:bg-zinc-50"
          >
            <HugeiconsIcon icon={Logout01Icon} size={14} color="currentColor" />
            Sign out
          </button>
        </form>

        {/* Delete */}
        <DeleteAccountButton />

        <p className="text-center text-[11px] text-zinc-400 mt-2">
          v0.1.0 · Made with care
        </p>
      </div>

      <BottomNav active="home" />
    </div>
  );
}

interface LegalRowProps {
  href: string;
  label: string;
  icon: typeof UserCircleIcon;
  divider?: boolean;
}

function LegalRow({ href, label, icon, divider }: LegalRowProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-3.5",
        divider && "border-t border-zinc-100",
      )}
    >
      <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
        <HugeiconsIcon icon={icon} size={14} color="#52525b" />
      </div>
      <span className="text-[13px] font-medium text-zinc-900 flex-1">
        {label}
      </span>
      <span className="text-zinc-300">›</span>
    </Link>
  );
}
