import { redirect } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  InstagramIcon,
  GoogleIcon as GoogleHugeIcon,
} from "@hugeicons/core-free-icons";

import { signInWithGoogle } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (data?.claims) redirect("/");

  const { error } = await searchParams;

  return (
    <div
      className="min-h-svh flex items-center justify-center p-5"
      style={{ backgroundColor: "#EBEBEB" }}
    >
      <div className="w-full max-w-[340px]">
        <div
          className="overflow-hidden rounded-[28px] bg-white"
          style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}
        >
          {/* Hero */}
          <div
            className="flex flex-col items-center justify-center gap-4 px-8 py-10"
            style={{
              background:
                "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
            }}
          >
            <div
              className="flex items-center justify-center w-14 h-14 rounded-2xl"
              style={{ background: "rgba(255,255,255,0.2)" }}
            >
              <HugeiconsIcon icon={InstagramIcon} size={28} color="white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                InstaBoost
              </h1>
              <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                Grow your Instagram for free
              </p>
            </div>
          </div>

          {/* Sign-in */}
          <div className="px-7 py-8">
            <p className="text-[13px] text-zinc-400 text-center mb-6">
              Sign in to start exchanging followers, likes &amp; views with real users.
            </p>

            <form action={signInWithGoogle}>
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2.5 rounded-full h-[52px] text-white text-[14px] font-semibold"
                style={{
                  background:
                    "linear-gradient(135deg, #f9ce34 0%, #ee2a7b 50%, #6228d7 100%)",
                  boxShadow: "0 4px 16px rgba(238, 42, 123, 0.3)",
                }}
              >
                <HugeiconsIcon icon={GoogleHugeIcon} size={18} color="white" />
                Continue with Google
              </button>
            </form>

            {error ? (
              <p className="mt-3 text-center text-[13px] text-red-500">
                {decodeURIComponent(error)}
              </p>
            ) : null}

            <p className="mt-5 text-center text-[11px] text-zinc-400">
              By continuing you agree to our{" "}
              <a href="/legal/terms" className="underline underline-offset-2 hover:text-zinc-700">
                Terms
              </a>{" "}
              &amp;{" "}
              <a href="/legal/privacy" className="underline underline-offset-2 hover:text-zinc-700">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
