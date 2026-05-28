import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  ChartIncreaseIcon,
  Add01Icon,
  DollarCircleIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";

import { cn } from "@/lib/utils";

type NavKey = "home" | "earn" | "new" | "topup" | "history";

interface BottomNavProps {
  active: NavKey;
}

const items: { key: NavKey; href: string; label: string; icon: typeof Home01Icon }[] = [
  { key: "home", href: "/", label: "Home", icon: Home01Icon },
  { key: "earn", href: "/earn", label: "Earn", icon: ChartIncreaseIcon },
  { key: "new", href: "/orders/new", label: "New", icon: Add01Icon },
  { key: "topup", href: "/topup", label: "Top up", icon: DollarCircleIcon },
  { key: "history", href: "/history", label: "History", icon: Clock01Icon },
];

export function BottomNav({ active }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 flex justify-center pb-[max(env(safe-area-inset-bottom),12px)] pt-2 px-4 pointer-events-none"
      aria-label="Primary"
    >
      <div
        className="pointer-events-auto w-full max-w-[400px] bg-white rounded-full px-2 py-2 flex items-center justify-between"
        style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
      >
        {items.map(({ key, href, label, icon }) => {
          const isActive = key === active;
          const isCenter = key === "new";

          if (isCenter) {
            return (
              <Link
                key={key}
                href={href}
                aria-label={label}
                className="flex items-center justify-center w-12 h-12 rounded-full bg-zinc-900 text-white -mt-1 transition-transform active:scale-95"
              >
                <HugeiconsIcon icon={icon} size={20} color="white" strokeWidth={2.5} />
              </Link>
            );
          }

          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 w-14 h-12 rounded-full",
                isActive ? "text-zinc-900" : "text-zinc-400",
              )}
            >
              <HugeiconsIcon
                icon={icon}
                size={18}
                color="currentColor"
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span
                className={cn(
                  "text-[10px]",
                  isActive ? "font-semibold" : "font-medium",
                )}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
