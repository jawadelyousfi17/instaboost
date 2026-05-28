import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface LegalShellProps {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
}

export function LegalShell({
  eyebrow,
  title,
  updated,
  children,
}: LegalShellProps) {
  return (
    <div
      className="min-h-svh p-5"
      style={{
        backgroundColor: "#F4F4F5",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 40px)",
      }}
    >
      <div className="mx-auto w-full max-w-[680px] flex flex-col gap-5">
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
        </header>

        <div className="px-1">
          <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-widest">
            {eyebrow}
          </p>
          <h1 className="text-[28px] font-bold text-zinc-900 mt-0.5 leading-tight">
            {title}
          </h1>
          <p className="text-[12px] text-zinc-400 mt-2">Last updated: {updated}</p>
        </div>

        <article className="rounded-2xl bg-white border border-zinc-100 p-6 sm:p-8 prose-legal">
          {children}
        </article>

        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12px] text-zinc-400 py-4">
          <Link href="/legal/terms" className="hover:text-zinc-900">
            Terms
          </Link>
          <span className="opacity-40">·</span>
          <Link href="/legal/privacy" className="hover:text-zinc-900">
            Privacy
          </Link>
          <span className="opacity-40">·</span>
          <Link href="/legal/refund" className="hover:text-zinc-900">
            Refunds
          </Link>
          <span className="opacity-40">·</span>
          <Link href="/legal/contact" className="hover:text-zinc-900">
            Contact
          </Link>
        </nav>
      </div>
    </div>
  );
}
